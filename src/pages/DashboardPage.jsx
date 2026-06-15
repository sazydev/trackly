import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Save,
  Pencil,
  Crown,
  ShieldCheck,
  Calendar,
  Mail,
  CreditCard,
  ExternalLink,
  BadgeEuro,
  Repeat,
  LockKeyhole,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import RevenueSources from "../components/dashboard/RevenueSources";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import TransactionsTable from "../components/dashboard/TransactionsTable";
import PerformancePanel from "../components/dashboard/PerformancePanel";
import { formatCurrency } from "../data/dashboardData";

const dateFilterOptions = [
  { value: "all", label: "Tout" },
  { value: "today", label: "Aujourd’hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "month", label: "Ce mois-ci" },
  { value: "year", label: "Cette année" },
  { value: "custom", label: "Personnalisé" },
];

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function getDateRange(filter, customStart, customEnd) {
  const now = new Date();
  let start = null;
  let end = endOfDay(now);

  if (filter === "today") {
    start = startOfDay(now);
  }

  if (filter === "7d") {
    start = startOfDay(now);
    start.setDate(start.getDate() - 6);
  }

  if (filter === "30d") {
    start = startOfDay(now);
    start.setDate(start.getDate() - 29);
  }

  if (filter === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (filter === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  }

  if (filter === "custom") {
    start = customStart ? startOfDay(new Date(customStart)) : null;
    end = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now);
  }

  return { start, end };
}

function getFilterLabel(filter, customStart, customEnd) {
  if (filter === "custom") {
    if (customStart && customEnd) {
      return `Du ${new Date(customStart).toLocaleDateString("fr-FR")} au ${new Date(
        customEnd
      ).toLocaleDateString("fr-FR")}`;
    }

    return "Période personnalisée";
  }

  return dateFilterOptions.find((option) => option.value === filter)?.label || "Période";
}

export default function DashboardPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const [dateFilter, setDateFilter] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [toast, setToast] = useState(null);

  const [goalForm, setGoalForm] = useState({
    revenue_goal: "",
    profit_goal: "",
    sales_goal: "",
    month: new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    }),
  });

  function showToast(type, message) {
    setToast({ type, message });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  }

  async function fetchTransactions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: true });

    if (!error) setTransactions(data || []);
    else {
      console.error(error);
      showToast("error", "Impossible de charger les transactions.");
    }

    setLoading(false);
  }

  async function fetchGoals() {
    setLoadingGoals(true);

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setGoals(data);

      if (data) {
        setGoalForm({
          revenue_goal: data.revenue_goal || "",
          profit_goal: data.profit_goal || "",
          sales_goal: data.sales_goal || "",
          month: data.month || "",
        });
      }
    } else {
      console.error(error);
      showToast("error", "Impossible de charger les objectifs.");
    }

    setLoadingGoals(false);
  }

  async function fetchSubscription() {
    setLoadingSubscription(true);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error) setSubscription(data);
    else {
      console.error(error);
      showToast("error", "Impossible de charger l’abonnement.");
    }

    setLoadingSubscription(false);
  }

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
    fetchSubscription();
  }, []);

  function formatDate(date) {
    if (!date) return "Synchronisation en cours";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getSubscriptionLabel(status) {
    if (status === "active") return "Actif";
    if (status === "pending") return "En attente";
    if (status === "past_due") return "Paiement en retard";
    if (status === "canceled") return "Annulé";
    return "Inactif";
  }

  function getSubscriptionClass(status) {
    if (status === "active") return "positive-text";
    if (status === "pending") return "warning-text";
    return "negative-text";
  }

  async function openCustomerPortal() {
    if (!subscription?.stripe_customer_id) {
      showToast("error", "Aucun abonnement Stripe actif trouvé pour ce compte.");
      return;
    }

    try {
      setPortalLoading(true);

      const response = await fetch("/.netlify/functions/create-customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || "Impossible d’ouvrir le portail Stripe.");
      }

      if (!data.url) {
        throw new Error("URL Stripe Portal manquante.");
      }

      window.location.href = data.url;
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleSaveGoals(e) {
    e.preventDefault();
    setSavingGoals(true);

    const payload = {
      user_id: user.id,
      revenue_goal: Number(goalForm.revenue_goal || 0),
      profit_goal: Number(goalForm.profit_goal || 0),
      sales_goal: Number(goalForm.sales_goal || 0),
      month: goalForm.month,
    };

    const response = goals?.id
      ? await supabase
          .from("goals")
          .update(payload)
          .eq("id", goals.id)
          .eq("user_id", user.id)
          .select()
          .single()
      : await supabase.from("goals").insert(payload).select().single();

    if (response.error) {
      showToast("error", response.error.message);
    } else {
      await fetchGoals();
      setIsEditingGoals(false);
      showToast("success", "Objectifs enregistrés avec succès.");
    }

    setSavingGoals(false);
  }

  async function deleteTransaction(transaction) {
    const confirmDelete = window.confirm(`Supprimer "${transaction.title}" ?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transaction.id)
      .eq("user_id", user.id);

    if (error) {
      showToast("error", error.message);
      return;
    }

    await fetchTransactions();
    showToast("success", "Transaction supprimée avec succès.");
  }

  function editTransaction(transaction) {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  }

  function closeModal() {
    setSelectedTransaction(null);
    setModalOpen(false);
  }

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange(dateFilter, customStart, customEnd);

    return transactions.filter((item) => {
      if (!item.transaction_date) return false;

      const transactionDate = new Date(item.transaction_date);
      if (start && transactionDate < start) return false;
      if (end && transactionDate > end) return false;

      return true;
    });
  }, [transactions, dateFilter, customStart, customEnd]);

  const stats = useMemo(() => {
    const revenue = filteredTransactions.reduce(
      (acc, item) => acc + Number(item.revenue || 0),
      0
    );
    const expenses = filteredTransactions.reduce(
      (acc, item) => acc + Number(item.expenses || 0),
      0
    );
    const profit = filteredTransactions.reduce(
      (acc, item) => acc + Number(item.profit || 0),
      0
    );
    const sales = filteredTransactions.reduce(
      (acc, item) => acc + Number(item.sales_count || 0),
      0
    );
    const averageOrder = sales > 0 ? revenue / sales : 0;

    return { revenue, expenses, profit, sales, averageOrder };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const months = {};

    filteredTransactions.forEach((item) => {
      const date = new Date(item.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = date.toLocaleDateString("fr-FR", {
        month: "short",
        year: dateFilter === "year" || dateFilter === "all" ? "2-digit" : undefined,
      });

      if (!months[key]) {
        months[key] = { month, revenue: 0, expenses: 0, profit: 0, sales: 0, key };
      }

      months[key].revenue += Number(item.revenue || 0);
      months[key].expenses += Number(item.expenses || 0);
      months[key].profit += Number(item.profit || 0);
      months[key].sales += Number(item.sales_count || 0);
    });

    return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredTransactions, dateFilter]);

  const sourcesData = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce(
      (acc, item) => acc + Number(item.revenue || 0),
      0
    );

    const sources = {};

    filteredTransactions.forEach((item) => {
      sources[item.business_type] =
        (sources[item.business_type] || 0) + Number(item.revenue || 0);
    });

    return Object.entries(sources).map(([name, value]) => ({
      name,
      value: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
    }));
  }, [filteredTransactions]);

  const revenueTransactions = filteredTransactions.filter(
    (item) => Number(item.revenue || 0) > 0
  );

  const expenseTransactions = filteredTransactions.filter(
    (item) => Number(item.expenses || 0) > 0
  );

  const periodLabel = getFilterLabel(dateFilter, customStart, customEnd);

  const pageTitles = {
    dashboard: {
      eyebrow: "Business overview",
      title: "Vue globale de ton business",
      text: "Suivi automatique de tes ventes, bénéfices, dépenses et performances.",
    },
    revenues: {
      eyebrow: "Revenue analytics",
      title: "Analyse de tes revenus",
      text: "Vue détaillée de ton chiffre d’affaires et de tes sources de revenus.",
    },
    expenses: {
      eyebrow: "Expenses tracking",
      title: "Suivi de tes dépenses",
      text: "Contrôle tes coûts, tes investissements et tes sorties d’argent.",
    },
    goals: {
      eyebrow: "Growth targets",
      title: "Objectifs business",
      text: "Définis tes objectifs et suis ta progression automatiquement.",
    },
    settings: {
      eyebrow: "Workspace settings",
      title: "Paramètres Trackly",
      text: "Gère tes données, ton abonnement et ton espace business.",
    },
  };

  function getProgress(current, goal) {
    if (!goal || Number(goal) <= 0) return 0;
    return Math.min(Math.round((Number(current) / Number(goal)) * 100), 100);
  }

  function renderDateFilters() {
    if (!["dashboard", "revenues", "expenses"].includes(activePage)) return null;

    return (
      <div className="date-filter-card">
        <div className="date-filter-title">
          <Filter size={17} />
          <span>{periodLabel}</span>
        </div>

        <div className="date-filter-actions">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={dateFilter === option.value ? "active" : ""}
              onClick={() => setDateFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dateFilter === "custom" && (
          <div className="custom-date-row">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>
    );
  }

  function renderSkeleton() {
    return (
      <div className="skeleton-page">
        <section className="stats-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="stat-card skeleton-card" key={item}>
              <div className="skeleton skeleton-icon"></div>
              <div className="skeleton skeleton-line small"></div>
              <div className="skeleton skeleton-line large"></div>
              <div className="skeleton skeleton-line medium"></div>
            </div>
          ))}
        </section>

        <section className="dashboard-grid main-grid">
          <div className="panel skeleton-panel"></div>
          <div className="panel skeleton-panel"></div>
        </section>
      </div>
    );
  }

  function renderGoalsPage() {
    if (loadingGoals) {
      return (
        <div className="panel empty-panel">
          <h3>Chargement des objectifs...</h3>
        </div>
      );
    }

    const hasGoals = goals && !isEditingGoals;

    if (!hasGoals) {
      return (
        <section className="panel goals-form-panel">
          <div className="panel-header">
            <div>
              <h3>{goals ? "Modifier tes objectifs" : "Créer tes objectifs"}</h3>
              <p>
                Renseigne tes objectifs. Trackly comparera automatiquement tes
                résultats réels avec ce que tu vises.
              </p>
            </div>
          </div>

          <form className="goals-form" onSubmit={handleSaveGoals}>
            <div className="form-group">
              <label>Période</label>
              <input
                type="text"
                value={goalForm.month}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, month: e.target.value })
                }
                placeholder="Mai 2026"
                required
              />
            </div>

            <div className="form-group">
              <label>Objectif chiffre d’affaires</label>
              <input
                type="number"
                value={goalForm.revenue_goal}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, revenue_goal: e.target.value })
                }
                placeholder="Ex : 10000"
              />
            </div>

            <div className="form-group">
              <label>Objectif bénéfice net</label>
              <input
                type="number"
                value={goalForm.profit_goal}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, profit_goal: e.target.value })
                }
                placeholder="Ex : 5000"
              />
            </div>

            <div className="form-group">
              <label>Objectif ventes</label>
              <input
                type="number"
                value={goalForm.sales_goal}
                onChange={(e) =>
                  setGoalForm({ ...goalForm, sales_goal: e.target.value })
                }
                placeholder="Ex : 120"
              />
            </div>

            <button type="submit" disabled={savingGoals}>
              <Save size={18} />
              {savingGoals ? "Enregistrement..." : "Enregistrer les objectifs"}
            </button>
          </form>
        </section>
      );
    }

    const revenueProgress = getProgress(stats.revenue, goals.revenue_goal);
    const profitProgress = getProgress(stats.profit, goals.profit_goal);
    const salesProgress = getProgress(stats.sales, goals.sales_goal);

    return (
      <>
        <section className="dashboard-grid goals-grid">
          <div className="panel goal-panel premium-goal-card">
            <div className="panel-header">
              <div>
                <h3>Chiffre d’affaires</h3>
                <p>Objectif pour {goals.month}</p>
              </div>
              <span>{revenueProgress}%</span>
            </div>

            <div className="goal-big">
              <Target size={34} />
              <strong>{revenueProgress}%</strong>
              <span>
                {formatCurrency(stats.revenue)} / {formatCurrency(goals.revenue_goal)}
              </span>
            </div>

            <div className="progress-bar">
              <span style={{ width: `${revenueProgress}%` }}></span>
            </div>
          </div>

          <div className="panel goal-panel premium-goal-card">
            <div className="panel-header">
              <div>
                <h3>Bénéfice net</h3>
                <p>Objectif pour {goals.month}</p>
              </div>
              <span>{profitProgress}%</span>
            </div>

            <div className="goal-big">
              <TrendingUp size={34} />
              <strong>{profitProgress}%</strong>
              <span>
                {formatCurrency(stats.profit)} / {formatCurrency(goals.profit_goal)}
              </span>
            </div>

            <div className="progress-bar">
              <span style={{ width: `${profitProgress}%` }}></span>
            </div>
          </div>

          <div className="panel goal-panel premium-goal-card">
            <div className="panel-header">
              <div>
                <h3>Ventes</h3>
                <p>Objectif pour {goals.month}</p>
              </div>
              <span>{salesProgress}%</span>
            </div>

            <div className="goal-big">
              <Wallet size={34} />
              <strong>{salesProgress}%</strong>
              <span>
                {stats.sales} / {goals.sales_goal} ventes
              </span>
            </div>

            <div className="progress-bar">
              <span style={{ width: `${salesProgress}%` }}></span>
            </div>
          </div>
        </section>

        <button className="ghost-btn edit-goals-btn" onClick={() => setIsEditingGoals(true)}>
          <Pencil size={17} />
          Modifier mes objectifs
        </button>
      </>
    );
  }

  function renderSettingsPage() {
    return (
      <section className="settings-page">
        <section className="settings-hero panel">
          <div className="settings-avatar">
            {(user.user_metadata?.full_name || user.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <span className="eyebrow">Compte Trackly</span>
            <h3>{user.user_metadata?.full_name || "Utilisateur Trackly"}</h3>
            <p>{user.email}</p>
          </div>

          <div className="account-status">
            <ShieldCheck size={18} />
            Compte sécurisé
          </div>
        </section>

        <section className="settings-grid">
          <div className="panel settings-panel subscription-panel">
            <div className="panel-header">
              <div>
                <h3>Mon abonnement</h3>
                <p>Gère ton accès Trackly Pro et ton paiement.</p>
              </div>

              <div className="subscription-icon">
                <Crown size={22} />
              </div>
            </div>

            {loadingSubscription ? (
              <div className="mini-empty">Chargement de l’abonnement...</div>
            ) : (
              <>
                <div className="subscription-plan-card">
                  <div>
                    <span>Plan actuel</span>
                    <strong>Trackly Pro</strong>
                  </div>

                  <p className={getSubscriptionClass(subscription?.status)}>
                    {getSubscriptionLabel(subscription?.status)}
                  </p>
                </div>

                <div className="settings-list">
                  <div>
                    <span>
                      <CreditCard size={16} />
                      Statut
                    </span>
                    <strong className={getSubscriptionClass(subscription?.status)}>
                      {getSubscriptionLabel(subscription?.status)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      <Calendar size={16} />
                      Prochain paiement
                    </span>
                    <strong>{formatDate(subscription?.current_period_end)}</strong>
                  </div>

                  <div>
                    <span>
                      <Mail size={16} />
                      Email de facturation
                    </span>
                    <strong>{user.email}</strong>
                  </div>

                  <div>
                    <span>
                      <BadgeEuro size={16} />
                      Tarif
                    </span>
                    <strong>9,99 € / mois</strong>
                  </div>

                  <div>
                    <span>
                      <Calendar size={16} />
                      Abonné depuis
                    </span>
                    <strong>{formatDate(subscription?.created_at)}</strong>
                  </div>

                  <div>
                    <span>
                      <Repeat size={16} />
                      Renouvellement
                    </span>
                    <strong className="positive-text">Automatique</strong>
                  </div>

                  <div>
                    <span>
                      <LockKeyhole size={16} />
                      Paiement
                    </span>
                    <strong className="positive-text">Sécurisé via Stripe</strong>
                  </div>
                </div>

                <button
                  className="add-btn settings-add-btn billing-btn"
                  onClick={openCustomerPortal}
                  disabled={portalLoading || !subscription?.stripe_customer_id}
                >
                  <ExternalLink size={18} />
                  {portalLoading ? "Ouverture..." : "Gérer mon abonnement"}
                </button>
              </>
            )}
          </div>

          <div className="panel settings-panel">
            <div className="panel-header">
              <div>
                <h3>Informations du compte</h3>
                <p>Résumé de ton espace utilisateur Trackly.</p>
              </div>
            </div>

            <div className="settings-list">
              <div>
                <span>
                  <Mail size={16} />
                  Email
                </span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>
                  <Calendar size={16} />
                  Compte créé le
                </span>
                <strong>{formatDate(user.created_at)}</strong>
              </div>

              <div>
                <span>
                  <ShieldCheck size={16} />
                  Sécurité
                </span>
                <strong className="positive-text">Compte protégé</strong>
              </div>

              <div>
                <span>
                  <CreditCard size={16} />
                  Accès dashboard
                </span>
                <strong className="positive-text">Autorisé</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-grid">
          <div className="panel settings-panel">
            <div className="panel-header">
              <div>
                <h3>Ajouter une vente</h3>
                <p>Ajoute une transaction pour alimenter automatiquement ton dashboard.</p>
              </div>
            </div>

            <button className="add-btn settings-add-btn" onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              Ajouter une vente
            </button>
          </div>

          <div className="panel settings-panel">
            <div className="panel-header">
              <div>
                <h3>État de la base</h3>
                <p>Données synchronisées avec Supabase.</p>
              </div>
            </div>

            <div className="settings-list">
              <div>
                <span>Transactions</span>
                <strong>{transactions.length}</strong>
              </div>

              <div>
                <span>Objectifs</span>
                <strong>{goals ? "Définis" : "Non définis"}</strong>
              </div>

              <div>
                <span>Statut</span>
                <strong className="positive-text">Synchronisé</strong>
              </div>
            </div>
          </div>
        </section>
      </section>
    );
  }

  function renderContent() {
    if (loading) {
      return renderSkeleton();
    }

    if (activePage === "goals") {
      return renderGoalsPage();
    }

    if (activePage === "settings") {
      return renderSettingsPage();
    }

    if (transactions.length === 0) {
      return (
        <div className="panel empty-panel">
          <h3>Aucune donnée pour le moment</h3>
          <p>
            Va dans Paramètres pour ajouter ta première vente. Ton dashboard se
            générera automatiquement ensuite.
          </p>
          <button className="add-btn" onClick={() => setActivePage("settings")}>
            Ouvrir les paramètres
          </button>
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <>
          {renderDateFilters()}
          <div className="panel empty-panel">
            <h3>Aucune donnée sur cette période</h3>
            <p>Change la période ou ajoute une nouvelle transaction.</p>
            <button className="add-btn" onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              Ajouter une vente
            </button>
          </div>
        </>
      );
    }

    if (activePage === "revenues") {
      return (
        <>
          {renderDateFilters()}
          <StatsCards stats={stats} periodLabel={periodLabel} />
          <section className="dashboard-grid main-grid">
            <RevenueChart data={monthlyData} periodLabel={periodLabel} />
            <RevenueSources data={sourcesData} />
          </section>
          <TransactionsTable
            full
            transactions={revenueTransactions}
            title="Transactions de revenus"
            onEdit={editTransaction}
            onDelete={deleteTransaction}
          />
        </>
      );
    }

    if (activePage === "expenses") {
      return (
        <>
          {renderDateFilters()}
          <section className="insight-grid">
            <div className="panel insight-card premium-appear">
              <Wallet size={22} />
              <span>Dépenses totales</span>
              <strong>{formatCurrency(stats.expenses)}</strong>
            </div>

            <div className="panel insight-card premium-appear">
              <TrendingDown size={22} />
              <span>Bénéfice après dépenses</span>
              <strong>{formatCurrency(stats.profit - stats.expenses)}</strong>
            </div>
          </section>

          <TransactionsTable
            full
            transactions={expenseTransactions}
            title="Dépenses enregistrées"
            onEdit={editTransaction}
            onDelete={deleteTransaction}
          />
        </>
      );
    }

    return (
      <>
        {renderDateFilters()}
        <StatsCards stats={stats} periodLabel={periodLabel} />

        <section className="dashboard-grid main-grid">
          <RevenueChart data={monthlyData} periodLabel={periodLabel} />
          <RevenueSources data={sourcesData} />
        </section>

        <section className="dashboard-grid bottom-grid">
          <TransactionsTable
            transactions={filteredTransactions}
            onEdit={editTransaction}
            onDelete={deleteTransaction}
          />

          <PerformancePanel stats={stats} />
        </section>
      </>
    );
  }

  return (
    <main className="dashboard-page">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">{pageTitles[activePage].eyebrow}</span>
            <h1>{pageTitles[activePage].title}</h1>
            <p>{pageTitles[activePage].text}</p>
          </div>
        </header>

        {renderContent()}
      </section>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {modalOpen && (
        <AddTransactionModal
          user={user}
          transactionToEdit={selectedTransaction}
          onClose={closeModal}
          onSaved={fetchTransactions}
          onToast={showToast}
        />
      )}
    </main>
  );
}
