import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PaymentSuccessPage({ user }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Synchronisation de ton abonnement...");

  useEffect(() => {
    let attempts = 0;
    let timeoutId;

    async function checkSubscription() {
      attempts += 1;

      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.status === "active") {
        setMessage("Abonnement activé. Redirection vers le dashboard...");

        timeoutId = setTimeout(() => {
          navigate("/app");
        }, 800);

        return;
      }

      if (attempts >= 10) {
        setMessage(
          "Paiement reçu, mais la synchronisation prend un peu de temps. Redirection..."
        );

        timeoutId = setTimeout(() => {
          navigate("/subscribe");
        }, 2500);

        return;
      }

      timeoutId = setTimeout(checkSubscription, 1500);
    }

    checkSubscription();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user.id, navigate]);

  return (
    <main className="subscribe-page">
      <section className="subscribe-card">
        <div className="subscribe-badge">
          <CheckCircle size={18} />
          Paiement validé
        </div>

        <h1>Activation de Trackly Pro...</h1>

        <p>{message}</p>

        <div className="subscribe-footer">
          <Loader2 size={16} className="spinner" />
          Vérification sécurisée avec Stripe et Supabase.
        </div>
      </section>
    </main>
  );
}