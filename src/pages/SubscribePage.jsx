import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Crown, Lock, Sparkles, Zap } from "lucide-react";

export default function SubscribePage({ user, onLogout }) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    try {
      setLoading(true);

      const response = await fetch(
        "/.netlify/functions/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur Stripe");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="subscribe-page">
      <section className="subscribe-card">
        <div className="subscribe-badge">
          <Crown size={18} />
          Abonnement requis
        </div>

        <h1>Active Trackly Pro pour accéder au dashboard.</h1>

        <p>
          Ton compte est bien créé, mais ton abonnement n’est pas encore actif.
          Une fois le paiement validé, tu auras accès au dashboard complet.
        </p>

        <div className="subscribe-user">
          <span>Compte connecté</span>
          <strong>{user.email}</strong>
        </div>

        <div className="subscribe-plan">
          <div>
            <Sparkles size={22} />
            <h3>Trackly Pro</h3>
            <p>
              Dashboard complet pour suivre tes revenus, dépenses et objectifs.
            </p>
          </div>

          <strong>
            9,99 €
            <span>/ mois</span>
          </strong>
        </div>

        <div className="subscribe-features">
          <div>
            <Check size={17} />
            Revenus et dépenses illimités
          </div>

          <div>
            <Check size={17} />
            Objectifs personnalisés
          </div>

          <div>
            <Check size={17} />
            Multi-business
          </div>

          <div>
            <Check size={17} />
            Dashboard sécurisé
          </div>
        </div>

        <button
          className="subscribe-btn"
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
        >
          <Zap size={18} />

          {loading
            ? "Redirection..."
            : "S'abonner à Trackly Pro"}
        </button>

        <div className="subscribe-footer">
          <Lock size={16} />
          Paiement sécurisé via Stripe.
        </div>

        <button
          className="ghost-btn subscribe-logout"
          onClick={onLogout}
        >
          Se déconnecter
        </button>

        <Link to="/" className="subscribe-back">
          Retour à la landing page
        </Link>
      </section>
    </main>
  );
}