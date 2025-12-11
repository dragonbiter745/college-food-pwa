import MenuPage from "./features/student/MenuPage";
import VendorLogin from "./features/vendor/VendorLogin";
import Dashboard from "./features/vendor/Dashboard";
import StudentLogin from "./features/student/StudentLogin";
import OrderHistory from "./features/student/OrderHistory";
import TrackOrder from "./features/student/TrackOrder";

import { CartProvider } from "./context/CartContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import InstallPrompt from "./components/InstallPrompt";

import CartDrawer from "./components/CartDrawer";
import { supabase } from "./lib/supabase";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession(data.session)
    );

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }: any) =>
    session ? children : <Navigate to="/" replace />;

  return (
    <BrowserRouter>
      <CartProvider>
        {/* GLOBAL COMPONENTS (NOT INSIDE ROUTES) */}
        <InstallPrompt />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        <Routes>

          {/* STUDENT FLOW */}
          <Route
            path="/"
            element={
              session ? (
                <MenuPage openCart={() => setCartOpen(true)} />
              ) : (
                <StudentLogin />
              )
            }
          />

          <Route
            path="/track"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* VENDOR FLOW */}
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor" element={<Dashboard />} />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
