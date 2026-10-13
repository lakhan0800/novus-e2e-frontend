import { useState, type FormEvent } from "react";
import { pendo } from "../analytics/pendo";
import { api } from "../api/client";
import { useAuth, type Account } from "../auth/AuthContext";

// Module level so each upgrade is reported once per session. AuthContext's account is not
// refreshed after an upgrade, so the upgrade button stays visible and can be clicked again.
const reportedPlanUpgrades = new Set<string>();

/** Domain part of an email address, so the full address is never sent to Pendo. */
function getEmailDomain(email: string): string | undefined {
  const at = email.lastIndexOf("@");
  return at === -1 ? undefined : email.slice(at + 1).toLowerCase();
}

export function SettingsPage() {
  const { user, account } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/api/account/invitations", { email: inviteEmail });
    setMessage(`Invitation sent to ${inviteEmail}`);
    pendo.track("teammate_invited", {
      inviteeEmailDomain: getEmailDomain(inviteEmail),
      inviterRole: user?.role,
      accountPlan: account?.plan,
      accountSeats: account?.seats,
    });
    setInviteEmail("");
  };

  const upgrade = async () => {
    const previousPlan = account?.plan;
    const previousSeats = account?.seats;
    // The new values come from the response, since AuthContext's account is not refreshed.
    const upgraded = await api.post<Account>("/api/account/upgrade", { plan: "team" });
    setMessage("Upgraded to the Team plan");
    const upgradeKey = `${upgraded.id}:${upgraded.plan}`;
    if (reportedPlanUpgrades.has(upgradeKey)) return;
    reportedPlanUpgrades.add(upgradeKey);
    pendo.track("plan_upgraded", {
      previousPlan,
      newPlan: upgraded.plan,
      previousSeats,
      newSeats: upgraded.seats,
      upgradedByRole: user?.role,
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
