import { Activity, Target, Users } from "lucide-react";
import { formatCurrency } from "../../data/dashboardData";

export default function PerformancePanel({ stats }) {
  const goal = 100000;
  const progress = Math.min(Math.round((stats.revenue / goal) * 100), 100);

  return (
    <section className="panel performance-panel">
      <div className="panel-header">
        <div>
          <h3>Performance</h3>
          <p>Indicateurs calculés automatiquement.</p>
        </div>
      </div>

      <div className="performance-list">
        <div>
          <span>
            <Activity size={18} />
            Panier moyen
          </span>
          <strong>{formatCurrency(stats.averageOrder)}</strong>
        </div>

        <div>
          <span>
            <Users size={18} />
            Ventes enregistrées
          </span>
          <strong>{stats.sales}</strong>
        </div>

        <div>
          <span>
            <Target size={18} />
            Objectif mensuel
          </span>
          <strong>{progress}%</strong>
        </div>
      </div>

      <div className="progress-box">
        <div>
          <span>Objectif CA</span>
          <strong>{formatCurrency(stats.revenue)} / {formatCurrency(goal)}</strong>
        </div>

        <div className="progress-bar">
          <span style={{ width: `${progress}%` }}></span>
        </div>
      </div>
    </section>
  );
}