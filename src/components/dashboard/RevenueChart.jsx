import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }) {
  return (
    <div className="panel revenue-panel">
      <div className="panel-header">
        <div>
          <h3>Évolution du chiffre d’affaires</h3>
          <p>Revenus, dépenses et bénéfices sur les 6 derniers mois.</p>
        </div>

        <span>6 mois</span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />

            <Tooltip
              contentStyle={{
                background: "#0b0b0f",
                border: "1px solid #262626",
                borderRadius: "14px",
                color: "white",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="url(#revenueGradient)"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}