"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { TaskStatus } from "@/lib/types";

interface StatusCounts {
  new: number;
  ongoing: number;
  on_hold: number;
}

interface TaskStatusPieChartProps {
  counts: StatusCounts;
  activeStatus?: TaskStatus | null;
  onStatusClick?: (status: TaskStatus | null) => void;
}

const STATUS_KEYS: TaskStatus[] = ["new", "ongoing", "on_hold"];
const COLORS = ["#f97316", "#facc15", "#94a3b8"]; // orange, yellow, slate

export function TaskStatusPieChart({
  counts,
  activeStatus,
  onStatusClick,
}: TaskStatusPieChartProps) {
  const data = [
    { name: "New", key: "new" as TaskStatus, value: counts.new },
    { name: "Ongoing", key: "ongoing" as TaskStatus, value: counts.ongoing },
    { name: "On Hold", key: "on_hold" as TaskStatus, value: counts.on_hold },
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No active tasks
      </div>
    );
  }

  function handleClick(_: unknown, index: number) {
    if (!onStatusClick) return;
    const clickedStatus = STATUS_KEYS[index];
    onStatusClick(activeStatus === clickedStatus ? null : clickedStatus);
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          cornerRadius={5}
          dataKey="value"
          stroke="none"
          onClick={handleClick}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              opacity={activeStatus && activeStatus !== entry.key ? 0.35 : 1}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value: string) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
