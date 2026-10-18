import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { whatsappLink } from "@/lib/format";

function Page({ title, path, description, children }: { title: string; path: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <Seo title={title} description={description} path={path} />
      <section className="dotted-bg py-14 text-center">
        <h1 className="text-5xl sm:text-6xl">{title}</h1>
        <div className="rule" />
      </section>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 leading-relaxed text-ink-soft sm:px-6 [&_h2]:mt-10 [&_h2]:text-3xl">
        {children}
      </div>
    </>
  );
}

export function About() {
  return (
    <Page title="Our story" path="/about" description="Katyayini brings handwoven Banarasi sarees straight from weaver families in Varanasi to you.">
      <p>
        Katyayini began in the lanes of Varanasi, where the clack of pit looms has filled the air for centuries. We work directly with
        weaver families in Madanpura, Lallapura and Sarai Mohana, so more of what you pay reaches the hands that weave.
      </p>
      <p>
        Every listing tells you exactly what you're buying: the fabric, the kind of zari, and whether it was woven on a handloom or a
        powerloom. No guesswork, no inflated claims.
      </p>
      <h2>Why the name?</h2>
      <p>Katyayini is a form of Durga, worshipped in Navratri. Her colours, saffron and sindoor, run through everything we make.</p>
      <Link to="/sarees" className="btn-primary">Explore the catalogue</Link>
    </Page>
  );
}

export function Contact() {
  return (
    <Page title="Contact us" path="/contact" description="Reach Katyayini Banaras on WhatsApp or email for help choosing a saree, order updates and returns.">
      <p>The fastest way to reach us is WhatsApp. Send a photo of the look you love, your budget and the occasion, and we'll suggest sarees.</p>
      <a href={whatsappLink("Namaste Katyayini! I have a question.")} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1EBE5A]">
        <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
      </a>
      <h2>Email</h2>
      <p>hello@katyayini.in. We reply within one working day.</p>
      <h2>Visit</h2>
      <p>By appointment, near Dashashwamedh Ghat, Varanasi, Uttar Pradesh.</p>
    </Page>
  );
}

export function ShippingReturns() {
  return (
    <Page title="Shipping & returns" path="/shipping-returns" description="Free insured shipping across India, dispatch in 1 to 2 days, and 7-day returns on unused sarees.">
      <h2>Shipping</h2>
      <p>Free, insured shipping across India. Orders are dispatched from Varanasi within 1 to 2 working days and usually arrive in 4 to 7 days.</p>
      <h2>Returns</h2>
      <p>
        Unused sarees with tags intact can be returned within 7 days of delivery. Message us on WhatsApp with your order number to start a
        return. Sarees with stitched blouses or fall/pico work cannot be returned.
      </p>
      <h2>Cash on delivery</h2>
      <p>Available on orders up to ₹25,000.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy policy" path="/privacy" description="How Katyayini Banaras collects, uses and protects your personal information.">
      <p>We collect only what we need to fulfil your order: your name, email, phone number and delivery address.</p>
      <p>We never sell your data. Payment details are handled by our payment provider and never stored on our servers.</p>
      <p>Messages to our chat assistant are used to answer your question and improve our recommendations.</p>
      <p>To have your account deleted, email hello@katyayini.in.</p>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms of use" path="/terms" description="Terms for shopping at Katyayini Banaras.">
      <p>Handwoven sarees may show small irregularities in weave and colour. These are the mark of the loom, not defects.</p>
      <p>Colours may look slightly different on screen depending on your device.</p>
      <p>Prices are in Indian Rupees and include applicable taxes.</p>
    </Page>
  );
}
