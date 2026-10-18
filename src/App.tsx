import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CatalogueProvider } from "@/context/CatalogueContext";
import { ShopProvider } from "@/context/ShopContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Catalogue from "@/pages/Catalogue";
import Product from "@/pages/Product";
import Guide from "@/pages/Guide";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import { Account, OrderSuccess, Wishlist } from "@/pages/Account";
import { Login, Register, RequireAuth } from "@/pages/Auth";
import { About, Contact, Privacy, ShippingReturns, Terms } from "@/pages/InfoPages";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import { ProductEditor, ProductList } from "@/pages/admin/Products";
import { Customers, Orders } from "@/pages/admin/Orders";

export default function App() {
  return (
    <AuthProvider>
      <CatalogueProvider>
        <ShopProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="sarees" element={<Catalogue />} />
              <Route path="sarees/:category" element={<Catalogue />} />
              <Route path="saree/:slug" element={<Product />} />
              <Route path="guide" element={<Guide />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="shipping-returns" element={<ShippingReturns />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="order/:id" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
              <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
              <Route path="admin/login" element={<Login admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductEditor />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
            </Route>
          </Routes>
        </ShopProvider>
      </CatalogueProvider>
    </AuthProvider>
  );
}
