import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getStatusCode, pendo } from "../analytics/pendo";
import { useAuth } from "../auth/AuthContext";

/** Why the API rejected a sign-in attempt, based on what backend routes/auth.ts returns. */
function getLoginFailureReason(statusCode: number | undefined): string {
  if (statusCode === undefined) return "network_error";
  // Schema validation failed, which in practice means an empty email or password.
  if (statusCode === 400) return "validation_failed";
  // No user has that email: the API does not check passwords yet, so never a wrong password.
  if (statusCode === 401) return "unknown_email";
  return statusCode >= 500 ? "server_error" : "unexpected_status";
}

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
      const statusCode = getStatusCode(err);
      // Never send the credentials themselves, only whether each field was filled in.
      pendo.track("login_failed", {
        statusCode,
        failureReason: getLoginFailureReason(statusCode),
        emailProvided: email.length > 0,
        passwordProvided: password.length > 0,
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
