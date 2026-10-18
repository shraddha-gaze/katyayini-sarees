import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import SareeArt from "@/components/SareeArt";
import { useShop } from "@/context/ShopContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { inr } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return product.images[0] ? (
    <img src={product.images[0]} alt={`${product.name} ${product.colour} Banarasi saree`} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  ) : (
    <SareeArt art={product.art} className={`h-full w-full ${className}`} label={`${product.name}, ${product.colour} Banarasi saree`} />
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { isWished, toggleWishlist } = useShop();
  const { categories } = useCatalogue();
  const category = categories.find((c) => c.slug === product.category);
  const wished = isWished(product.id);

  return (
    <article className="group">
      <div className="relative">
        <Link to={`/saree/${product.slug}`} className="block">
          <div className="arch aspect-[4/5] overflow-hidden border-[6px] border-cream-dark bg-cream-dark">
            <ProductImage product={product} className="transition duration-500 group-hover:scale-105" />
          </div>
        </Link>
        {product.badge && (
          <span className="absolute left-1/2 top-[10%] -translate-x-1/2 bg-sindoor px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest2 text-cream-light ring-1 ring-cream-light/60">
            {product.badge}
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute left-1/2 top-[10%] -translate-x-1/2 bg-ink px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest2 text-cream-light">
            Sold out
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream-light/95 shadow-sm transition hover:scale-105"
        >
          <Heart className={`h-5 w-5 ${wished ? "fill-sindoor text-sindoor" : "text-sindoor"}`} />
        </button>
      </div>
      <Link to={`/saree/${product.slug}`} className="mt-5 block text-center">
        <p className="label">
          {category?.name ?? product.category} · {product.colour}
        </p>
        <h3 className="mt-2 text-3xl">{product.name}</h3>
        <p className="mt-1 text-sindoor">
          {inr(product.price)}
          {product.mrp > product.price && <span className="ml-2 text-sm text-ink-soft line-through">{inr(product.mrp)}</span>}
        </p>
      </Link>
    </article>
  );
}
