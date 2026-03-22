"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TaskStatusPieChart } from "@/components/task-status-pie-chart";
import { CompletionGauge } from "@/components/completion-gauge";
import { TaskTable } from "@/components/task-table";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus, TaskWithFtes, Fte } from "@/lib/types";

interface StatusCounts {
  new: number;
  ongoing: number;
  on_hold: number;
  completed: number;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  ongoing: "Ongoing",
  on_hold: "On Hold",
};

export default function DashboardPage() {
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithFtes[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchCounts = useCallback(async () => {
    const { data } = await supabase.rpc("get_task_status_counts");
    if (data && data.length > 0) {
      setCounts(data[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const fetchTasksByStatus = useCallback(async (status: TaskStatus | null) => {
    if (!status) {
      setFilteredTasks([]);
      return;
    }
    setTasksLoading(true);

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (!tasksData) {
      setFilteredTasks([]);
      setTasksLoading(false);
      return;
    }

    const fteIds = new Set<number>();
    for (const t of tasksData) {
      if (t.requestor) fteIds.add(t.requestor);
      if (t.assignee) fteIds.add(t.assignee);
    }

    let ftesMap: Record<number, Fte> = {};
    if (fteIds.size > 0) {
      const { data: ftesData } = await supabase
        .from("ftes")
        .select("*")
        .in("id", Array.from(fteIds));
      if (ftesData) {
        ftesMap = Object.fromEntries(ftesData.map((f) => [f.id, f]));
      }
    }

    const enriched: TaskWithFtes[] = tasksData.map((t) => ({
      ...t,
      requestor_fte: t.requestor ? ftesMap[t.requestor] ?? null : null,
      assignee_fte: t.assignee ? ftesMap[t.assignee] ?? null : null,
    }));

    setFilteredTasks(enriched);
    setTasksLoading(false);
  }, []);

  function handleStatusClick(status: TaskStatus | null) {
    setSelectedStatus(status);
    fetchTasksByStatus(status);
  }

  function handleEdit(task: TaskWithFtes) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function handleDelete(task: TaskWithFtes) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    fetchCounts();
    fetchTasksByStatus(selectedStatus);
  }

  function handleSaved() {
    fetchCounts();
    fetchTasksByStatus(selectedStatus);
  }

  const total = counts
    ? counts.new + counts.ongoing + counts.on_hold + counts.completed
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading dashboard...
        </div>
      ) : counts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
              <TaskStatusPieChart
                counts={counts}
                activeStatus={selectedStatus}
                onStatusClick={handleStatusClick}
              />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Completion Rate</h2>
              <CompletionGauge completed={counts.completed} total={total} />
            </div>
          </div>

          {selectedStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {STATUS_LABELS[selectedStatus] ?? selectedStatus} Tasks
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusClick(null)}
                >
                  Clear filter ✕
                </Button>
              </div>

              {tasksLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading tasks...
                </div>
              ) : (
                <TaskTable
                  tasks={filteredTasks}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}

          <TaskForm
            task={editingTask}
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={handleSaved}
          />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No data available.
        </div>
      )}
    </div>
  );
}
