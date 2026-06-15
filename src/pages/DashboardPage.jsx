import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Save,
  Pencil,
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

export default function DashboardPage({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);

  const [goalForm, setGoalForm] = useState({
    revenue_goal: "",
    profit_goal: "",
    sales_goal: "",
    month: new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    }),
  });

  async function fetchTransactions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: true });

    if (!error) setTransactions(data || []);
    else console.error(error);

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
    }

    setLoadingGoals(false);
  }

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, []);

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
      alert(response.error.message);
    } else {
      await fetchGoals();
      setIsEditingGoals(false);
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
      alert(error.message);
      return;
    }

    await fetchTransactions();
  }

  function editTransaction(transaction) {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  }

  function closeModal() {
    setSelectedTransaction(null);
    setModalOpen(false);
  }

  const stats = useMemo(() => {
    const revenue = transactions.reduce((acc, item) => acc + Number(item.revenue || 0), 0);
    const expenses = transactions.reduce((acc, item) => acc + Number(item.expenses || 0), 0);
    const profit = transactions.reduce((acc, item) => acc + Number(item.profit || 0), 0);
    const sales = transactions.reduce((acc, item) => acc + Number(item.sales_count || 0), 0);
    const averageOrder = sales > 0 ? revenue / sales : 0;

    return { revenue, expenses, profit, sales, averageOrder };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};

    transactions.forEach((item) => {
      const date = new Date(item.transaction_date);
      const month = date.toLocaleDateString("fr-FR", { month: "short" });

      if (!months[month]) {
        months[month] = { month, revenue: 0, expenses: 0, profit: 0, sales: 0 };
      }

      months[month].revenue += Number(item.revenue || 0);
      months[month].expenses += Number(item.expenses || 0);
      months[month].profit += Number(item.profit || 0);
      months[month].sales += Number(item.sales_count || 0);
    });

    return Object.values(months);
  }, [transactions]);

  const sourcesData = useMemo(() => {
    const totalRevenue = transactions.reduce(
      (acc, item) => acc + Number(item.revenue || 0),
      0
    );

    const sources = {};

    transactions.forEach((item) => {
      sources[item.business_type] =
        (sources[item.business_type] || 0) + Number(item.revenue || 0);
    });

    return Object.entries(sources).map(([name, value]) => ({
      name,
      value: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
    }));
  }, [transactions]);

  const revenueTransactions = transactions.filter(
    (item) => Number(item.revenue || 0) > 0
  );

  const expenseTransactions = transactions.filter(
    (item) => Number(item.expenses || 0) > 0
  );

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
      text: "Gère tes données, ajoute une vente et prépare ton espace business.",
    },
  };

  function getProgress(current, goal) {
    if (!goal || Number(goal) <= 0) return 0;
    return Math.min(Math.round((Number(current) / Number(goal)) * 100), 100);
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

  function renderContent() {
    if (loading) {
      return (
        <div className="panel empty-panel">
          <h3>Chargement des données...</h3>
        </div>
      );
    }

    if (activePage === "goals") {
      return renderGoalsPage();
    }

    if (transactions.length === 0 && activePage !== "settings") {
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

    if (activePage === "revenues") {
      return (
        <>
          <StatsCards stats={stats} />
          <section className="dashboard-grid main-grid">
            <RevenueChart data={monthlyData} />
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
          <section className="insight-grid">
            <div className="panel insight-card">
              <Wallet size={22} />
              <span>Dépenses totales</span>
              <strong>{formatCurrency(stats.expenses)}</strong>
            </div>

            <div className="panel insight-card">
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

    if (activePage === "settings") {
      return (
        <section className="settings-grid">
          <div className="panel settings-panel">
            <div className="panel-header">
              <div>
                <h3>Ajouter une vente</h3>
                <p>Ajoute manuellement une transaction pour alimenter ton dashboard.</p>
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
                <span>Utilisateur</span>
                <strong>{user.email}</strong>
              </div>

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
                <strong className="positive-text">Connecté</strong>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <>
        <StatsCards stats={stats} />

        <section className="dashboard-grid main-grid">
          <RevenueChart data={monthlyData} />
          <RevenueSources data={sourcesData} />
        </section>

        <section className="dashboard-grid bottom-grid">
          <TransactionsTable
            transactions={transactions}
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

      {modalOpen && (
        <AddTransactionModal
          user={user}
          transactionToEdit={selectedTransaction}
          onClose={closeModal}
          onSaved={fetchTransactions}
        />
      )}
    </main>
  );
}