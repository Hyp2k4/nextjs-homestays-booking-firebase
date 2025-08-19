"use client"

import * as React from "react"
import {
    BarChart as ReBarChart,
    LineChart as ReLineChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts"
import { cn } from "@/lib/utils"

// Đổi tên các component từ recharts để tránh xung đột
type ChartProps = {
    data: any[]
    className?: string
    config?: {
        [key: string]: {
            label?: string
            color?: string
        }
    }
}

export function BarChart({ data, className, config }: ChartProps) {
    return (
        <div className={cn("w-full h-[400px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#666" }}
                        axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                        tick={{ fill: "#666" }}
                        axisLine={{ stroke: "#ccc" }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                        }}
                    />
                    <Legend />
                    {Object.keys(config || {}).map((key) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={config?.[key]?.color || "#8884d8"}
                            name={config?.[key]?.label || key}
                        />
                    ))}
                </ReBarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function LineChart({ data, className, config }: ChartProps) {
    return (
        <div className={cn("w-full h-[400px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#666" }}
                        axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                        tick={{ fill: "#666" }}
                        axisLine={{ stroke: "#ccc" }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                        }}
                    />
                    <Legend />
                    {Object.keys(config || {}).map((key) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={config?.[key]?.color || "#8884d8"}
                            name={config?.[key]?.label || key}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    ))}
                </ReLineChart>
            </ResponsiveContainer>
        </div>
    )
}