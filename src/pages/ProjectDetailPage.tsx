import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { pendo } from "../analytics/pendo";
import { api } from "../api/client";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface ProjectDetail {
  id: string;
  name: string;
  tasks: Task[];
}

// Module level so each completion is reported once per session, even if Complete is clicked
// again before the list re-renders (the API accepts repeat completions of the same task).
const reportedCompletedTaskIds = new Set<string>();

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    void api.get<ProjectDetail>(`/api/projects/${projectId}`).then(setProject);
  }, [projectId]);

  const addTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!project) return;
    const task = await api.post<Task>(`/api/projects/${project.id}/tasks`, { title });
    setProject({ ...project, tasks: [...project.tasks, task] });
    // `project.tasks` does not include the new task yet, and new tasks are always created open.
    pendo.track("task_created", {
      projectId: project.id,
      taskId: task.id,
      taskCount: project.tasks.length + 1,
      openTaskCount: project.tasks.filter((t) => !t.done).length + 1,
      isFirstTask: project.tasks.length === 0,
    });
    setTitle("");
  };

  const completeTask = async (taskId: string) => {
    if (!project) return;
    await api.post(`/api/projects/${project.id}/tasks/${taskId}/complete`, {});
    setProject({
      ...project,
      tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, done: true } : task)),
    });
    if (reportedCompletedTaskIds.has(taskId)) return;
    reportedCompletedTaskIds.add(taskId);
    const remainingOpenTasks = project.tasks.filter((t) => !t.done && t.id !== taskId).length;
    pendo.track("task_completed", {
      projectId: project.id,
      taskId,
      totalTasks: project.tasks.length,
      remainingOpenTasks,
      allTasksCompleted: remainingOpenTasks === 0,
    });
  };

  if (!project) return <p>Loading…</p>;

  return (
    <section>
      <h1>{project.name}</h1>
      <form className="inline-form" onSubmit={(event) => void addTask(event)}>
        <input
          id="task-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New task"
        />
        <button id="add-task-button" type="submit">
          Add task
        </button>
      </form>
      <ul className="task-list">
        {project.tasks.map((task) => (
          <li key={task.id} className={task.done ? "task done" : "task"}>
            {task.title}
            {!task.done && (
              <button
                className="complete-task-button"
                type="button"
                onClick={() => void completeTask(task.id)}
              >
                Complete
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
