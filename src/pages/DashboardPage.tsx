import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface Summary {
  openTasks: number;
  dueThisWeek: number;
  recentProjects: { id: string; name: string }[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    void api.get<Summary>("/api/dashboard").then(setSummary);
  }, []);

  return (
    <section>
      <h1>Welcome back, {user?.fullName}</h1>
      <div className="stats">
        <div className="stat-card">
          <span className="stat-value">{summary?.openTasks ?? "-"}</span>
          <span className="stat-label">Open tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{summary?.dueThisWeek ?? "-"}</span>
          <span className="stat-label">Due this week</span>
        </div>
      </div>
      <h2>Recent projects</h2>
      <ul>
        {summary?.recentProjects.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
      <Link id="dashboard-new-project" className="button-primary" to="/projects?new=1">
        New project
      </Link>
    </section>
  );
}
