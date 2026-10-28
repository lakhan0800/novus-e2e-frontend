import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function SettingsPage() {
  const { user, account } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/api/account/invitations", { email: inviteEmail });
    // Fires only after the API accepts the invitation. Never send the invitee email (PII).
    window.pendo?.track("teammate_invited", {
      accountPlan: account?.plan ?? "unknown",
      seats: account?.seats ?? 0,
      inviterRole: user?.role ?? "unknown",
    });
    setMessage(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  const upgrade = async () => {
    await api.post("/api/account/upgrade", { plan: "team" });
    // Conversion milestone: fires only after the upgrade request succeeds.
    window.pendo?.track("plan_upgraded", {
      previousPlan: account?.plan ?? "unknown",
      newPlan: "team",
      seats: account?.seats ?? 0,
      userRole: user?.role ?? "unknown",
    });
    setMessage("Upgraded to the Team plan");
  };

  return (
    <section>
      <h1>Settings</h1>
      <h2>Plan</h2>
      <p>
        {account?.name} is on the <strong>{account?.plan}</strong> plan with {account?.seats} seats.
      </p>
      {account?.plan === "free" && (
        <button id="upgrade-plan-button" type="button" onClick={() => void upgrade()}>
          Upgrade to Team
        </button>
      )}
      <h2>Invite a teammate</h2>
      <form className="inline-form" onSubmit={(event) => void invite(event)}>
        <input
          id="invite-email-input"
          type="email"
          value={inviteEmail}
          onChange={(event) => setInviteEmail(event.target.value)}
          placeholder="teammate@company.com"
        />
        <button id="send-invite-button" type="submit">
          Send invite
        </button>
      </form>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}
