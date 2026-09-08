// 云端留言板 API —— Cloudflare Pages Functions + D1
// - 公开 GET  ：只返回 status = approved 的留言
// - 公开 POST ：新留言一律落库为 pending（待审核），带 IP 哈希限流
// - 管理操作  ：同路径 POST + x-admin-token 头，与环境变量 ADMIN_TOKEN 比对；
//               密钥只存在于服务端环境变量，绝不进前端代码
// 表结构惰性初始化，无需手动跑 SQL。

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  color TEXT NOT NULL DEFAULT 'yellow',
  rotation REAL NOT NULL DEFAULT 0,
  position TEXT NOT NULL DEFAULT '{"x":50,"y":50}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending',
  ip_hash TEXT
);`;

const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'orange'];
const ROTATIONS = [-3, 2, -1, 3, -2, 1];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function ipHash(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const data = new TextEncoder().encode(`${ip}::yda-note-salt`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkToken(request, env) {
  const given = request.headers.get('x-admin-token') || '';
  return Boolean(env.ADMIN_TOKEN) && given === env.ADMIN_TOKEN;
}

export async function onRequestGet({ env }) {
  const db = env.DB;
  if (!db) return json({ ok: false, error: 'db-not-bound' }, 500);
  await db.exec(CREATE_TABLE);
  const { results } = await db
    .prepare("SELECT id, text, visibility, color, rotation, position, created_at FROM messages WHERE status = 'approved' ORDER BY id DESC LIMIT 200")
    .all();
  const messages = (results || []).map(row => ({
    id: row.id,
    text: row.text,
    visibility: row.visibility,
    color: row.color,
    rotation: Number(row.rotation) || 0,
    position: safePosition(row.position),
    createdAt: row.created_at
  }));
  return json({ ok: true, messages });
}

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  if (!db) return json({ ok: false, error: 'db-not-bound' }, 500);
  await db.exec(CREATE_TABLE);

  let body = {};
  try { body = await request.json(); } catch { body = {}; }

  // ── 管理通道 ──
  if (checkToken(request, env)) {
    const action = body.adminAction;
    if (action === 'list') {
      const { results } = await db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 500').all();
      return json({ ok: true, messages: results || [] });
    }
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ ok: false, error: 'bad-id' }, 400);
    if (action === 'approve') { await db.prepare('UPDATE messages SET status = ? WHERE id = ?').bind('approved', id).run(); return json({ ok: true }); }
    if (action === 'reject') { await db.prepare('UPDATE messages SET status = ? WHERE id = ?').bind('rejected', id).run(); return json({ ok: true }); }
    if (action === 'delete') { await db.prepare('DELETE FROM messages WHERE id = ?').bind(id).run(); return json({ ok: true }); }
    return json({ ok: false, error: 'bad-action' }, 400);
  }

  // ── 公开投稿通道 ──
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) return json({ ok: false, error: 'empty' }, 400);
  if ([...text].length > 200) return json({ ok: false, error: 'too-long' }, 400);
  const visibility = body.visibility === 'private' ? 'private' : 'public';
  const color = NOTE_COLORS.includes(body.color) ? body.color : 'yellow';
  const rotation = ROTATIONS.includes(Number(body.rotation)) ? Number(body.rotation) : 0;
  const position = {
    x: Math.min(88, Math.max(6, Number(body.position?.x) || 50)),
    y: Math.min(86, Math.max(7, Number(body.position?.y) || 50))
  };

  const hash = await ipHash(request);
  const recent = await db
    .prepare("SELECT COUNT(*) AS c FROM messages WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')")
    .bind(hash)
    .first();
  if (recent && recent.c >= 5) return json({ ok: false, error: 'rate-limited' }, 429);

  const result = await db
    .prepare('INSERT INTO messages (text, visibility, color, rotation, position, status, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(text, visibility, color, rotation, JSON.stringify(position), 'pending', hash)
    .run();
  return json({ ok: true, id: result?.meta?.last_row_id ?? null, status: 'pending' });
}

function safePosition(raw) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { x: Math.min(88, Math.max(6, Number(value?.x) || 50)), y: Math.min(86, Math.max(7, Number(value?.y) || 50)) };
  } catch {
    return { x: 50, y: 50 };
  }
}
