import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  Gauge,
  Layers3,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Tracke tous tes revenus",
    text: "Suis ton chiffre d’affaires, tes bénéfices, tes ventes réalisées et ton panier moyen depuis un seul dashboard.",
  },
  {
    icon: Wallet,
    title: "Ajoute tes dépenses",
    text: "Publicités, outils, abonnements, fournisseurs : garde une vision claire de ce qui sort réellement.",
  },
  {
    icon: Target,
    title: "Fixe tes objectifs",
    text: "Définis tes objectifs de revenus, de bénéfices et de ventes, puis suis ta progression automatiquement.",
  },
  {
    icon: Layers3,
    title: "Gère plusieurs business",
    text: "E-commerce, agence web, affiliation, SaaS, freelance : centralise tout au même endroit.",
  },
  {
    icon: Gauge,
    title: "Analyse ton panier moyen",
    text: "Identifie la valeur moyenne de tes ventes et comprends comment augmenter ta rentabilité.",
  },
  {
    icon: Timer,
    title: "Gagne du temps",
    text: "Fini les calculs à la main et les fichiers Excel éparpillés. Trackly fait le suivi pour toi.",
  },
];

const benefits = [
  "Centralise tes revenus et dépenses",
  "Comprends où part ton argent",
  "Suis tes objectifs en temps réel",
  "Prends de meilleures décisions",
];

export default function LandingPage() {
  return (
    <main className="landing-page-v2">
      <nav className="landing-v2-nav">
        <Link to="/" className="landing-v2-logo">
          <img src="/logo/logo.png" alt="Trackly" />
        </Link>

        <div className="landing-v2-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#why">Pourquoi Trackly</a>
          <a href="#pricing">Tarifs</a>
          <a href="#security">Sécurité</a>
        </div>

        <div className="landing-v2-actions">
          <Link to="/login" className="landing-v2-login">
            Connexion
          </Link>

          <Link to="/login" className="landing-v2-btn small">
            Accéder à Trackly
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>

      <section className="landing-v2-hero">
        <div className="hero-copy">
          <div className="landing-v2-badge">
            <Sparkles size={16} />
            Le dashboard tout-en-un pour ton business
          </div>

          <h1>
            Pilote ton business.
            <span> Augmente tes profits.</span>
          </h1>

          <p>
            Trackly centralise tes revenus, dépenses, bénéfices, objectifs,
            ventes réalisées et panier moyen dans un dashboard clair, moderne
            et automatisé.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="landing-v2-btn">
              Accéder au dashboard
              <ArrowRight size={18} />
            </Link>

            <a href="#features" className="landing-v2-btn ghost">
              Voir les fonctionnalités
            </a>
          </div>

          <div className="hero-proof">
            <div className="proof-avatars">
              <span>M</span>
              <span>T</span>
              <span>S</span>
            </div>

            <div>
              <strong>+ de clarté sur tes chiffres</strong>
              <p>Un seul endroit pour savoir si ton business avance vraiment.</p>
            </div>
          </div>
        </div>

        <div id="demo" className="hero-dashboard-frame">
          <div className="dashboard-glow"></div>

          <div className="dashboard-screen-card">
            <div className="screen-top">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <img
              src="/images/dashboard-preview.png"
              alt="Aperçu du dashboard Trackly"
              className="dashboard-preview-img"
            />
          </div>
        </div>
      </section>

      <section className="trusted-strip">
        <span>Compatible avec ton activité</span>
        <div>
          <strong>E-commerce</strong>
          <strong>Agence Web</strong>
          <strong>Freelance</strong>
          <strong>Affiliation</strong>
          <strong>SaaS</strong>
          <strong>Services</strong>
        </div>
      </section>

      <section id="features" className="landing-v2-section">
        <div className="section-heading">
          <span className="section-kicker">Fonctionnalités</span>
          <h2>Tout ce qu’il te faut pour suivre ton activité.</h2>
          <p>
            Trackly transforme tes chiffres bruts en informations utiles pour
            t’aider à gagner du temps, éviter les erreurs et prendre de
            meilleures décisions.
          </p>
        </div>

        <div className="landing-v2-features">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="landing-feature-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={24} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="why" className="landing-v2-section split-section">
        <div className="split-copy">
          <span className="section-kicker">Pourquoi Trackly ?</span>
          <h2>Arrête de gérer ton business à l’aveugle.</h2>
          <p>
            Quand tes revenus, tes dépenses et tes objectifs sont éparpillés,
            tu perds du temps et tu prends de moins bonnes décisions. Trackly te
            donne une vision claire de ce qui marche et de ce qui coûte trop
            cher.
          </p>

          <div className="benefits-list">
            {benefits.map((benefit) => (
              <div key={benefit}>
                <Check size={17} />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="profit-card">
          <div className="profit-card-icon">
            <PiggyBank size={28} />
          </div>

          <span>Gain estimé</span>
          <strong>+21%</strong>
          <p>
            de rentabilité en moyenne grâce à une meilleure visibilité sur tes
            chiffres, tes dépenses et tes objectifs.
          </p>

          <div className="profit-bars">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="landing-v2-banner">
        <div>
          <span className="section-kicker">Décision rapide</span>
          <h2>Tu sais enfin où tu gagnes et où tu perds de l’argent.</h2>
          <p>
            Revenus, dépenses, ventes, panier moyen, objectifs : tout est clair
            en quelques secondes.
          </p>
        </div>

        <Link to="/login" className="landing-v2-btn">
          Créer mon compte
          <ArrowRight size={18} />
        </Link>
      </section>

      <section id="pricing" className="landing-v2-section pricing-v2">
        <div className="section-heading">
          <span className="section-kicker">Tarif simple</span>
          <h2>Un seul plan. Tout compris.</h2>
          <p>
            Pas besoin de 15 formules compliquées. Trackly Pro te donne accès à
            tout ce qu’il faut pour suivre ton business.
          </p>
        </div>

        <div className="pricing-v2-card">
          <div className="pricing-top">
            <div>
              <h3>Trackly Pro</h3>
              <p>Pour entrepreneurs, freelances, agences et e-commerce.</p>
            </div>

            <div className="pricing-badge">Populaire</div>
          </div>

          <div className="pricing-price">
            9,99 €
            <span>/ mois</span>
          </div>

          <div className="pricing-items">
            <div>
              <Check size={17} />
              Revenus illimités
            </div>
            <div>
              <Check size={17} />
              Dépenses illimitées
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
              Statistiques avancées
            </div>
            <div>
              <Check size={17} />
              Données sécurisées
            </div>
          </div>

          <Link to="/login" className="landing-v2-btn full">
            Accéder à mon dashboard
            <Zap size={18} />
          </Link>
        </div>
      </section>

      <section id="security" className="landing-v2-section security-section">
        <div className="security-card">
          <ShieldCheck size={34} />
          <h2>Tes données restent séparées et protégées.</h2>
          <p>
            Chaque utilisateur accède uniquement à ses propres transactions,
            objectifs et informations. Trackly est pensé pour un usage SaaS
            sérieux avec authentification, comptes privés et sécurité côté base
            de données.
          </p>
        </div>

        <div className="security-mini-grid">
          <div>
            <Lock size={22} />
            <strong>Comptes privés</strong>
            <span>Chaque espace est lié à son utilisateur.</span>
          </div>

          <div>
            <CreditCard size={22} />
            <strong>Prêt pour abonnement</strong>
            <span>La base est prête pour un système de paiement.</span>
          </div>

          <div>
            <BarChart3 size={22} />
            <strong>Données utiles</strong>
            <span>Des chiffres lisibles pour décider plus vite.</span>
          </div>
        </div>
      </section>

      <section className="landing-final-v2">
        <h2>Prêt à reprendre le contrôle de tes chiffres ?</h2>
        <p>
          Crée ton compte, ajoute tes premières ventes et laisse Trackly
          transformer tes données en dashboard clair.
        </p>

        <Link to="/login" className="landing-v2-btn">
          Accéder à Trackly
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}