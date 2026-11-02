import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../analytics/trackEvent";
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
    } catch (loginError) {
      setError("Invalid email or password");
      // Login API rejected the credentials; the form shows "Invalid email or password".
      trackEvent("Sign-in failed", {
        failure_reason:
          loginError instanceof Error ? loginError.message.substring(0, 100) : "unknown",
      });
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
