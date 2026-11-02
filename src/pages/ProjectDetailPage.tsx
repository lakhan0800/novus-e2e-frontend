import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { trackProjectObjectEvent } from "../analytics/objectEvents";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

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

export function ProjectDetailPage() {
  const { account } = useAuth();
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
    setTitle("");
  };

  const completeTask = async (taskId: string) => {
    if (!project) return;
    await api.post(`/api/projects/${project.id}/tasks/${taskId}/complete`, {});
    trackProjectObjectEvent("task_completed", {
      projectId: project.id,
      accountId: account?.id,
      taskId,
    });
    setProject({
      ...project,
      tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, done: true } : task)),
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
