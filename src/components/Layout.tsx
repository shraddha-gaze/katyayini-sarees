import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useShop } from "@/context/ShopContext";
import { isDemo } from "@/lib/supabase";

export default function Layout() {
  const { pathname } = useLocation();
  const { toast } = useShop();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      {toast && (
        <div role="status" className="fixed left-1/2 top-24 z-50 -translate-x-1/2 bg-ink px-5 py-3 text-sm text-cream-light shadow-lg">
          {toast}
        </div>
      )}
      {isDemo && (
        <div className="bg-ink py-1 text-center text-[11px] text-cream/70">
          Demo mode: sample data stored in this browser. Add Supabase keys in .env to go live.
        </div>
      )}
    </div>
  );
}
