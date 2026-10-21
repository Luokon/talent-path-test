import { database, hash, json } from "../_utils";

export async function POST(request: Request) {
  try {
    const { token, complete } = await request.json();
    if (typeof token !== "string" || token.length < 32) return json({ valid: false }, 400);
    const db = database();
    const tokenHash = await hash(token);
    const session = await db.prepare("SELECT id, completed_at FROM test_sessions WHERE token_hash = ?1").bind(tokenHash).first<{ id: number; completed_at: number | null }>();
    if (!session) return json({ valid: false }, 404);
    if (complete && !session.completed_at) await db.prepare("UPDATE test_sessions SET completed_at = ?1 WHERE id = ?2").bind(Date.now(), session.id).run();
    return json({ valid: true, completed: Boolean(session.completed_at || complete) });
  } catch {
    return json({ valid: false }, 500);
  }
}
