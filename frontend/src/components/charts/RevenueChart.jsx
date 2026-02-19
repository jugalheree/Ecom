import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = {
  primary: "#0d9488",
  primaryLight: "rgba(13, 148, 136, 0.2)",
  grid: "#e7e5e4",
};

export default function RevenueChart({ data = [], dataKey = "revenue", name = "Revenue" }) {
  return (
    <div className="h-[240px] min-h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={240}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#78716c" }}
            axisLine={{ stroke: "#d6d3d1" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#78716c" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + "k" : v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`₹${value?.toLocaleString()}`, name]}
            labelStyle={{ color: "#44403c" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
