import { useState } from "react";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(null);
  const [showResend, setShowResend] = useState(false);

  function resetMessage() {
    setMessage(null);
    setShowResend(false);
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setFullName("");
    setEmail("");
    setPassword("");
    resetMessage();
  }

  async function resendConfirmationEmail() {
    if (!email) {
      setMessage({
        type: "error",
        title: "Email manquant",
        text: "Entre ton adresse e-mail pour recevoir un nouveau lien.",
      });
      return;
    }

    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    if (error) {
      setMessage({
        type: "error",
        title: "Envoi impossible",
        text: error.message,
      });
    } else {
      setMessage({
        type: "success",
        title: "Email renvoyé",
        text: "Un nouveau lien de confirmation vient d’être envoyé.",
      });
    }

    setResending(false);
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
            emailRedirectTo: window.location.origin + "/login",
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
          title: "Compte créé",
          text: "Vérifie ta boîte mail et confirme ton adresse avant de te connecter.",
        });

        setShowResend(true);
        setPassword("");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const isEmailNotConfirmed =
          error.message?.toLowerCase().includes("email not confirmed") ||
          error.message?.toLowerCase().includes("not confirmed");

        setMessage({
          type: "error",
          title: isEmailNotConfirmed ? "Email non vérifié" : "Connexion impossible",
          text: isEmailNotConfirmed
            ? "Tu dois confirmer ton adresse e-mail avant de pouvoir accéder à Trackly."
            : "Email ou mot de passe incorrect.",
        });

        if (isEmailNotConfirmed) {
          setShowResend(true);
        }

        return;
      }

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();

        setMessage({
          type: "error",
          title: "Email non vérifié",
          text: "Confirme ton adresse e-mail avant de te connecter.",
        });

        setShowResend(true);
        return;
      }

      setMessage({
        type: "success",
        title: "Connexion réussie",
        text: "Chargement de ton espace Trackly...",
      });

      setTimeout(() => {
        onLogin();
      }, 800);
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
          <img src="/logo/logo.png" alt="Trackly Logo" className="brand-logo" />
        </div>

        <h1>{isRegister ? "Crée ton compte" : "Connecte-toi à ton dashboard"}</h1>

        <p>
          {isRegister
            ? "Crée ton compte, puis valide ton adresse e-mail pour accéder à Trackly."
            : "Connecte-toi avec une adresse e-mail vérifiée."}
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

        {showResend && (
          <button
            type="button"
            className="resend-email-btn"
            onClick={resendConfirmationEmail}
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 size={18} className="spinner" />
                Envoi...
              </>
            ) : (
              <>
                <MailCheck size={18} />
                Renvoyer l’e-mail de confirmation
              </>
            )}
          </button>
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
          {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <span onClick={switchMode}>
            {isRegister ? "Se connecter" : "Créer un compte"}
          </span>
        </p>
      </section>
    </main>
  );
}