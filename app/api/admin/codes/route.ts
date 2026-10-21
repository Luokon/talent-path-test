import { env } from "cloudflare:workers";
import { cleanCode, database, hash, json, randomCode } from "../../_utils";

export async function POST(request: Request) {
  try {
    const supplied = request.headers.get("x-admin-key") ?? "";
    if (!env.ADMIN_KEY || supplied !== env.ADMIN_KEY) return json({ error: "管理密码不正确" }, 401);
    const body = await request.json();
    const quantity = Math.min(100, Math.max(1, Number(body.quantity) || 1));
    const maxUses = Math.min(10, Math.max(1, Number(body.maxUses) || 1));
    const label = String(body.label ?? "").trim().slice(0, 60) || null;
    const db = database();
    const codes: string[] = [];
    for (let i = 0; i < quantity; i += 1) {
      const code = randomCode();
      await db.prepare("INSERT INTO redemption_codes (code_hash, label, max_uses, used_count, created_at) VALUES (?1, ?2, ?3, 0, ?4)")
        .bind(await hash(cleanCode(code)), label, maxUses, Date.now()).run();
      codes.push(code);
    }
    return json({ codes });
  } catch {
    return json({ error: "生成失败，请稍后重试" }, 500);
  }
}
