import { useState, type FormEvent } from "react";
import { TrackEventName, trackEvent } from "../analytics/trackEvents";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function SettingsPage() {
  const { user, account } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/api/account/invitations", { email: inviteEmail });
    setMessage(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    // API created the invitation and the user sees the confirmation.
    trackEvent(TrackEventName.InvitationSent, {
      account_plan: account?.plan ?? "unknown",
      account_seats: account?.seats ?? 0,
      inviter_role: user?.role ?? "unknown",
    });
  };

  const upgrade = async () => {
    await api.post("/api/account/upgrade", { plan: "team" });
    setMessage("Upgraded to the Team plan");
    // API upgraded the account to the Team plan (revenue conversion).
    trackEvent(TrackEventName.PlanUpgraded, {
      previous_plan: account?.plan ?? "unknown",
      new_plan: "team",
      account_seats: account?.seats ?? 0,
      upgrader_role: user?.role ?? "unknown",
    });
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
