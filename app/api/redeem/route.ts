import { cleanCode, database, hash, json, randomToken } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = cleanCode(body.code);
    if (code.length < 8) return json({ error: "请输入完整兑换码" }, 400);
    const db = database();
    const record = await db.prepare("SELECT id, max_uses, used_count, disabled_at FROM redemption_codes WHERE code_hash = ?1")
      .bind(await hash(code)).first<{ id: number; max_uses: number; used_count: number; disabled_at: number | null }>();
    if (!record || record.disabled_at) return json({ error: "兑换码无效，请核对后重试" }, 404);
    if (record.used_count >= record.max_uses) return json({ error: "该兑换码的使用次数已用完" }, 409);
    const token = randomToken();
    const claimed = await db.prepare("UPDATE redemption_codes SET used_count = used_count + 1 WHERE id = ?1 AND used_count < max_uses AND disabled_at IS NULL").bind(record.id).run();
    if (!claimed.meta.changes) return json({ error: "该兑换码的使用次数已用完" }, 409);
    await db.prepare("INSERT INTO test_sessions (token_hash, code_id, created_at) VALUES (?1, ?2, ?3)").bind(await hash(token), record.id, Date.now()).run();
    return json({ token });
  } catch {
    return json({ error: "暂时无法验证，请稍后再试" }, 500);
  }
}
