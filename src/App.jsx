import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import SubscribePage from "./pages/SubscribePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PixelSnow from "./components/ui/PixelSnow";
import CustomCursor from "./components/ui/CustomCursor";

export default function App() {
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  async function fetchSubscription(userId) {
    setLoadingSubscription(true);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error(error);
      setSubscription(null);
    } else {
      setSubscription(data);
    }

    setLoadingSubscription(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);

      if (data.session?.user) {
        await fetchSubscription(data.session.user.id);
      }

      setLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setSubscription(null);
  }

  const hasActiveSubscription = subscription?.status === "active";

  if (loadingSession || loadingSubscription) {
    return (
      <>
        <PixelSnow />
        <CustomCursor />
        <main className="auth-page">
          <section className="auth-card">
            <p>Chargement de Trackly...</p>
          </section>
        </main>
      </>
    );
  }

  return (
    <BrowserRouter>
      <PixelSnow />
      <CustomCursor />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={session ? <Navigate to="/app" /> : <AuthPage />}
        />

        <Route
          path="/subscribe"
          element={
            session ? (
              hasActiveSubscription ? (
                <Navigate to="/app" />
              ) : (
                <SubscribePage user={session.user} onLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/payment-success"
          element={
            session ? (
              <PaymentSuccessPage user={session.user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/app"
          element={
            session ? (
              hasActiveSubscription ? (
                <DashboardPage user={session.user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/subscribe" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}