import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"];

export default function TopProductsChart({ data = [] }) {
  return (
    <div className="h-[220px] min-h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + "k" : v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            tick={{ fontSize: 11, fill: "#44403c" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`₹${value?.toLocaleString()}`, "Revenue"]}
          />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
