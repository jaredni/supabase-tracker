"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TaskTable } from "@/components/task-table";
import { TaskForm } from "@/components/task-form";
import { supabase } from "@/lib/supabase";
import type { Task, TaskWithFtes, Fte } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithFtes[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!tasksData) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Collect unique FTE IDs
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

    setTasks(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function handleEdit(task: TaskWithFtes) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function handleDelete(task: TaskWithFtes) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    fetchTasks();
  }

  function handleNew() {
    setEditingTask(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all tasks.
          </p>
        </div>
        <Button onClick={handleNew}>+ New Task</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading tasks...
        </div>
      ) : (
        <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <TaskForm
        task={editingTask}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchTasks}
      />
    </div>
  );
}
