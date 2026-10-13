import type { Account, User } from "../auth/AuthContext";

/** Sends the signed-in user and their account to Pendo. pendo.initialize runs once in main.tsx. */
export function identifyPendoVisitor(user: User, account: Account) {
  pendo.identify({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      accountId: account.id,
      createdAt: user.createdAt,
    },
    account: {
      id: account.id,
      name: account.name,
      plan: account.plan,
      seats: account.seats,
    },
  });
}
