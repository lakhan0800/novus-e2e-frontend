import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const status = err instanceof Error ? /failed with (\d+)/.exec(err.message)?.[1] : undefined;
      // Login rejected: the "Invalid email or password" error is shown.
      window.pendo?.track("Sign in failed", {
        http_status: status ? Number(status) : 0,
        invalid_credentials: status === "401",
      });
      setError("Invalid email or password");
    }
  };

  return (
    <form className="login-form" onSubmit={(event) => void submit(event)}>
      <h1>Sign in to Taskly</h1>
      <label>
        Email
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button id="login-submit" type="submit">
        Sign in
      </button>
    </form>
  );
}
