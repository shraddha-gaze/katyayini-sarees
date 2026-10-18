import { Link } from "react-router-dom";
import { useCatalogue } from "@/context/CatalogueContext";
import { whatsappLink } from "@/lib/format";

export default function Footer() {
  const { categories } = useCatalogue();
  return (
    <footer className="mt-24 bg-sindoor-dark text-cream">
      <div className="zigzag-border" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12" width="48" height="48" />
            <span className="font-serif text-3xl text-cream-light">Katyayini</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream/80">
            Handwoven Banarasi sarees from the looms of Kashi. Silk, zari and stories, sent from Varanasi to your doorstep.
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-sans text-xs uppercase tracking-widest2 text-zari-light">Shop</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/sarees/${c.slug}`} className="hover:text-zari-light">{c.name} Banarasi</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-sans text-xs uppercase tracking-widest2 text-zari-light">Help</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/guide" className="hover:text-zari-light">Banarasi Saree Guide</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-zari-light">Shipping &amp; Returns</Link></li>
            <li><Link to="/contact" className="hover:text-zari-light">Contact us</Link></li>
            <li><Link to="/about" className="hover:text-zari-light">Our story</Link></li>
            <li><Link to="/account" className="hover:text-zari-light">My account</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-sans text-xs uppercase tracking-widest2 text-zari-light">Talk to us</h3>
          <p className="text-sm text-cream/80">Questions about a saree, sizing or delivery? We reply on WhatsApp.</p>
          <a href={whatsappLink("Namaste Katyayini! I have a question.")} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream/60 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Katyayini Banaras. Woven in Varanasi.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-cream">Privacy</Link>
            <Link to="/terms" className="hover:text-cream">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
