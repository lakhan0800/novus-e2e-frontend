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
    } catch {
      // Credentials were rejected; the "Invalid email or password" error is shown.
      trackEvent("Sign-in failed", { login_method: "password" });
      setError("Invalid email or password");
      return;
    }
    // The API returned a user and account session; send the user to the Dashboard.
    trackEvent("Signed in", { login_method: "password" });
    navigate("/");
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
