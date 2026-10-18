import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { categories as seedCategories, products as seedProducts } from "@/data/catalogue";
import * as api from "@/lib/api";
import type { Category, Product } from "@/lib/types";

interface CatalogueState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  reload: () => Promise<void>;
}

const CatalogueContext = createContext<CatalogueState | null>(null);

// Starts from the bundled sample catalogue so prerendered HTML has real content,
// then swaps in live data from Supabase (or the demo store) in the browser.
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.getProducts(), api.getCategories()]);
      setProducts(p);
      if (c.length) setCategories(c);
    } catch (e) {
      console.error("Could not load catalogue", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return <CatalogueContext.Provider value={{ products, categories, loading, reload }}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue() {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error("useCatalogue must be used inside CatalogueProvider");
  return ctx;
}
