export type SessionItem = {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

type GroupedSessions = { label: string; sessions: SessionItem[] }[];

export function groupSessionsByDate(sessions: SessionItem[]): GroupedSessions {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, SessionItem[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  for (const session of sessions) {
    const date = new Date(session.updatedAt);
    if (date >= today) groups["Today"]!.push(session);
    else if (date >= yesterday) groups["Yesterday"]!.push(session);
    else if (date >= weekAgo) groups["Previous 7 Days"]!.push(session);
    else groups["Older"]!.push(session);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, sessions: items }));
}
