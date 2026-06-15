import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function resetMessage() {
    setMessage(null);
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setFullName("");
    setEmail("");
    setPassword("");
    resetMessage();
  }

  async function handleAuth() {
    setLoading(true);
    resetMessage();

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setMessage({
            type: "error",
            title: "Création impossible",
            text: error.message,
          });
          return;
        }

        setMessage({
          type: "success",
          title: "Compte créé avec succès",
          text: "Tu peux maintenant te connecter à ton dashboard.",
        });

        setTimeout(() => {
          setIsRegister(false);
          setPassword("");
          setMessage(null);
        }, 1800);

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({
          type: "error",
          title: "Connexion impossible",
          text: "Email ou mot de passe incorrect.",
        });
        return;
      }

      if (data.user) {
        setMessage({
          type: "success",
          title: "Connexion réussie",
          text: "Chargement de ton espace Trackly...",
        });

        setTimeout(() => {
          onLogin();
        }, 800);
      }
    } catch (error) {
      setMessage({
        type: "error",
        title: "Erreur inattendue",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <img
            src="/logo/logo.png"
            alt="Trackly Logo"
            className="brand-logo"
          />
        </div>

        <h1>
          {isRegister
            ? "Crée ton compte"
            : "Connecte-toi à ton dashboard"}
        </h1>

        <p>
          {isRegister
            ? "Commence à suivre tes ventes, tes bénéfices et tes objectifs."
            : "Suis tes ventes, tes bénéfices et l’évolution de ton business."}
        </p>

        {message && (
          <div className={`auth-message ${message.type}`}>
            <div className="auth-message-icon">
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
            </div>

            <div>
              <strong>{message.title}</strong>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
        >
          {isRegister && (
            <input
              type="text"
              placeholder="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Chargement...
              </>
            ) : isRegister ? (
              "Créer mon compte"
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="switch">
          {isRegister
            ? "Déjà un compte ?"
            : "Pas encore de compte ?"}{" "}

          <span onClick={switchMode}>
            {isRegister
              ? "Se connecter"
              : "Créer un compte"}
          </span>
        </p>
      </section>
    </main>
  );
}