import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "../../data/dashboardData";

export default function StatsCards({ stats }) {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">
          <CreditCard size={20} />
        </div>
        <span>Chiffre d’affaires</span>
        <h2>{formatCurrency(stats.revenue)}</h2>
        <p className="positive">
          <ArrowUpRight size={16} />
          +18.4% ce mois-ci
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <TrendingUp size={20} />
        </div>
        <span>Bénéfices nets</span>
        <h2>{formatCurrency(stats.profit)}</h2>
        <p className="positive">
          <ArrowUpRight size={16} />
          +12.8% ce mois-ci
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <ShoppingCart size={20} />
        </div>
        <span>Ventes totales</span>
        <h2>{stats.sales}</h2>
        <p className="positive">
          <ArrowUpRight size={16} />
          +64 ventes
        </p>
      </div>

      <div className="stat-card">
        <div className="stat-icon red">
          <Wallet size={20} />
        </div>
        <span>Dépenses</span>
        <h2>{formatCurrency(stats.expenses)}</h2>
        <p className="negative">
          <ArrowDownRight size={16} />
          +6.2% ce mois-ci
        </p>
      </div>
    </section>
  );
}