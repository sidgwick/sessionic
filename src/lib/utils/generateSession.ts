import type { Session } from '../types/extension';

export async function generateSession(session: Session) {
  const date = new Date().getTime();

  return {
    title: session.title,
    windows: session.windows,
    tabsNumber: session.tabsNumber,
    dateSaved: date,
    dateModified: date,
    id: crypto.randomUUID(),
  };
}