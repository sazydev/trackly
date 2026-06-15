import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const colors = ["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b"];

export default function RevenueSources({ data }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>Répartition</h3>
          <p>Sources de revenus.</p>
        </div>
      </div>

      <div className="pie-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "#0b0b0f",
                border: "1px solid #262626",
                borderRadius: "14px",
                color: "white",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="source-list">
        {data.map((source, index) => (
          <div key={source.name}>
            <span style={{ background: colors[index] }}></span>
            <p>{source.name}</p>
            <strong>{source.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}