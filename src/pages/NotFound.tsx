import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page could not be found." path="/404" noindex />
      <section className="dotted-bg py-28 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl">This thread has come loose</h1>
        <p className="mt-4 text-ink-soft">The page you're looking for isn't here.</p>
        <Link to="/sarees" className="btn-primary mt-8">Browse sarees</Link>
      </section>
    </>
  );
}
