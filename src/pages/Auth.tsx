import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { resendConfirmation, sendPasswordReset } from "@/lib/api";
import { isDemo } from "@/lib/supabase";

function AuthShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="dotted-bg flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="arch w-full max-w-md border-2 border-sindoor bg-cream-light px-8 pb-10 pt-20 sm:px-12">
        <p className="eyebrow text-center">{eyebrow}</p>
        <h1 className="mt-3 text-center text-4xl">{title}</h1>
        <div className="rule mb-8" />
        {children}
      </div>
    </section>
  );
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Please try again.");

export function Login({ admin = false }: { admin?: boolean }) {
  const { signIn, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && !busy) {
    if (admin && user.profile.role === "admin") return <Navigate to="/admin" replace />;
    if (!admin) return <Navigate to={from ?? "/account"} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await signIn(email.trim(), password);
      if (admin && u.profile.role !== "admin") {
        await signOut();
        setError("This account does not have admin access.");
        return;
      }
      navigate(admin ? "/admin" : from ?? "/account", { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setInfo("");
    try {
      await resendConfirmation(email.trim());
      setError("");
      setInfo("Confirmation email sent. Click the link in it, then sign in.");
    } catch (err) {
      setError(errorText(err));
    }
  };

  const forgot = async () => {
    setError("");
    setInfo("");
    if (!email) return setError("Enter your email first, then tap “Forgot password”.");
    try {
      await sendPasswordReset(email.trim());
      setInfo("Check your inbox for a link to reset your password.");
    } catch (err) {
      setError(errorText(err));
    }
  };

  return (
    <>
      <Seo title={admin ? "Admin sign in" : "Sign in"} description="Sign in to your Katyayini account." path={admin ? "/admin/login" : "/login"} noindex />
      <AuthShell title={admin ? "Admin sign in" : "Welcome back"} eyebrow={admin ? "Katyayini atelier" : "Your account"}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="label">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" />
          </label>
          {error && <p role="alert" className="text-sm text-sindoor">{error}</p>}
          {/email not confirmed/i.test(error) && (
            <p className="text-sm text-ink-soft">
              Click the link in the email we sent you (check spam too).{" "}
              <button type="button" onClick={resend} className="text-sindoor underline">Send it again</button>
            </p>
          )}
          {info && <p role="status" className="text-sm text-ink-soft">{info}</p>}
          <button type="submit" disabled={busy} className={`${admin ? "btn-maroon" : "btn-primary"} w-full`}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {!admin && (
          <div className="mt-6 space-y-2 text-center text-sm">
            <button onClick={forgot} className="text-ink-soft underline hover:text-sindoor">Forgot password?</button>
            <p>
              New to Katyayini? <Link to="/register" state={{ from }} className="text-sindoor underline">Create an account</Link>
            </p>
          </div>
        )}
        {isDemo && <p className="mt-6 text-center text-xs text-ink-soft">Demo mode: sign-in details are in README.md.</p>}
      </AuthShell>
    </>
  );
}

export function Register() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={from ?? "/account"} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const u = await signUp(form.name.trim(), form.email.trim(), form.password);
      if (u) navigate(from ?? "/account", { replace: true });
      else setDone(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <>
      <Seo title="Create an account" description="Create your Katyayini account." path="/register" noindex />
      <AuthShell title="Create account" eyebrow="Join Katyayini">
        {done ? (
          <p className="text-center text-ink-soft">
            We've sent a confirmation link to <strong>{form.email}</strong>. Click it, then <Link to="/login" className="text-sindoor underline">sign in</Link>.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="label">Full name</span>
              <input required autoComplete="name" className="input mt-1" {...field("name")} />
            </label>
            <label className="block">
              <span className="label">Email</span>
              <input type="email" required autoComplete="email" className="input mt-1" {...field("email")} />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input type="password" required autoComplete="new-password" minLength={8} className="input mt-1" {...field("password")} />
            </label>
            <label className="block">
              <span className="label">Confirm password</span>
              <input type="password" required autoComplete="new-password" className="input mt-1" {...field("confirm")} />
            </label>
            {error && <p role="alert" className="text-sm text-sindoor">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? "Creating…" : "Create account"}</button>
            <p className="text-center text-sm">
              Already have an account? <Link to="/login" className="text-sindoor underline">Sign in</Link>
            </p>
          </form>
        )}
      </AuthShell>
    </>
  );
}

export function RequireAuth({ children, role }: { children: React.ReactNode; role?: "admin" }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-32 text-center text-ink-soft">Loading…</div>;
  if (!user) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} state={{ from: location.pathname }} replace />;
  if (role === "admin" && user.profile.role !== "admin") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
