import {
  TrendingUp,
  Wallet,
  BarChart3,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "../../data/dashboardData";

export default function StatsCards({ stats, periodLabel = "Période sélectionnée" }) {
  return (
    <section className="stats-grid premium-appear">
      <div className="stat-card">
        <div className="stat-icon blue">
          <CreditCard size={20} />
        </div>
        <span>Chiffre d’affaires</span>
        <h2>{formatCurrency(stats.revenue)}</h2>
        <p className="positive">
          <BarChart3 size={16} />
          {periodLabel}
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <TrendingUp size={20} />
        </div>
        <span>Bénéfices nets</span>
        <h2>{formatCurrency(stats.profit)}</h2>
        <p className="positive">
          <BarChart3 size={16} />
          Calcul automatique
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <ShoppingCart size={20} />
        </div>
        <span>Ventes totales</span>
        <h2>{stats.sales}</h2>
        <p className="positive">
          <BarChart3 size={16} />
          Transactions filtrées
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon red">
          <Wallet size={20} />
        </div>
        <span>Dépenses</span>
        <h2>{formatCurrency(stats.expenses)}</h2>
        <p className="negative">
          <BarChart3 size={16} />
          Coûts enregistrés
        </p>
      </div>
    </section>
  );
}
