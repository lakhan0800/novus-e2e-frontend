import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { trackProjectObjectEvent } from "../analytics/objectEvents";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface Project {
  id: string;
  name: string;
  taskCount: number;
  status?: string;
}

export function ProjectsPage() {
  const { account } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    void api.get<Project[]>("/api/projects").then(setProjects);
  }, []);

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    const project = await api.post<Project>("/api/projects", { name });
    trackProjectObjectEvent("project_created", {
      projectId: project.id,
      accountId: account?.id,
      projectStatus: project.status ?? "draft",
    });
    setProjects([project, ...projects]);
    setName("");
  };

  return (
    <section>
      <h1>Projects</h1>
      <form className="inline-form" onSubmit={(event) => void createProject(event)}>
        <input
          id="project-name-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
        />
        <button id="create-project-button" type="submit">
          Create project
        </button>
      </form>
      <table className="projects-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
              </td>
              <td>{project.taskCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
