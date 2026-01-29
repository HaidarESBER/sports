"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type ChartData = {
  date: string
  value: number
  label?: string
}

type WorkoutChartProps = {
  type: "line" | "bar" | "area"
  data: ChartData[]
  title: string
  yAxisLabel?: string
  color?: string
  isLoading?: boolean
}

export function WorkoutChart({
  type,
  data,
  title,
  yAxisLabel,
  color = "#3b82f6",
  isLoading = false,
}: WorkoutChartProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-400">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-gray-400">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 border border-gray-800 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{formatDate(label)}</p>
          <p className="text-sm text-gray-400">
            {yAxisLabel || "Valeur"}: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} label={{ value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} label={{ value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} label={{ value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}


