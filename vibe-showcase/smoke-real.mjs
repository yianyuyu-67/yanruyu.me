/* 真实应用全流程验收：演示模式 6 步推进 + 受信点击 + 数据复位 */
import { spawn } from 'node:child_process';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const server = spawn(process.execPath, ['server.js'], { cwd: import.meta.dirname, stdio: 'ignore' });
server.unref();
await sleep(800);

const list = await (await fetch('http://127.0.0.1:19542/json/list')).json();
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
let mid = 0; const pend = new Map(); const errors = [];
const send = (m, p = {}) => new Promise(res => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 120));
};
await new Promise(r => ws.onopen = r);
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }))?.result?.value;
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:4820/?t=' + Date.now() });
await sleep(3000);

const ok = [], fail = [];
const check = (name, cond, extra = '') => (cond ? ok : fail).push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);

/* 等待 iframe 内选择器出现（SPA 渲染需要时间） */
async function waitSel(sel, timeoutMs = 8000, nth = 0) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const found = await ev(`(() => {
      const d = document.getElementById('appFrame').contentDocument;
      const el = d.querySelectorAll('${sel}')[${nth}];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      // 页面切换动画期间元素可能被临时拖出视口（transform 使 fixed 失效），必须等它进屏
      if (r.width <= 0 || r.top < 0 || r.bottom > 844 || r.left < 0 || r.right > 390) return 'out-of-view';
      const s = document.querySelector('.screen').getBoundingClientRect();
      const k = s.width / 390;
      return { x: s.left + (r.left + r.width/2) * k, y: s.top + (r.top + r.height/2) * k };
    })()`);
    if (found) return found;
    await sleep(350);
  }
  return null;
}
/* 受信点击 */
async function clickSel(sel, nth = 0) {
  const pos = await waitSel(sel, 8000, nth);
  if (!pos) return false;
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await sleep(160);
  }
  await sleep(600);
  return true;
}
/* 等待演示引擎状态 */
async function waitStep(step, timeoutMs = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const st = await ev(`({ step: stepIdx, finger: document.getElementById('finger').style.display })`);
    if (st?.step >= step && st?.finger === 'block') return true;
    await sleep(350);
  }
  return false;
}

/* 1. 应用本体 */
const base = await ev(`(() => {
  const d = document.getElementById('appFrame').contentDocument;
  return {
    days: (d.body.innerText.match(/\\d+\\s*天/) || [null])[0],
    ticket: !!d.querySelector('img[src*="home-ticket"]'),
    foodCard: !!d.querySelector('[data-demo="food-card"]'),
  };
})()`);
check('应用启动 + 天数渲染', !!base?.days && /\d/.test(base.days), String(base?.days).replace(/\n/g, ' '));
check('票根愿望卡在', base?.ticket === true);
check('food-card 标记生效', base?.foodCard === true);

/* 2. 演示模式逐步推进（点击后引擎会自动前进，step 断言用 >=） */
await ev(`startDemo()`);
check('演示启动，第 1 步高亮（票根卡）', await waitStep(0));
check('推进到第 2 步（美食卡高亮）', await (async () => { await ev(`document.getElementById('capNext').click()`); return waitStep(1); })());
check('受信点击美食卡 → 进入 /food', await clickSel('[data-demo="food-card"]'));
check('自动前进到第 3 步 + 点击美食记录入口', await (async () => { await waitStep(2); return clickSel('.dashed-card'); })());
check('自动前进到第 4 步（记录卡高亮）', await (async () => { await waitStep(3); const recs = await ev(`document.getElementById('appFrame').contentDocument.querySelectorAll('[data-demo="record"]').length`); globalThis.__recs = recs; return recs >= 3; })());
check('推进到第 5 步（＋ 按钮高亮）', await (async () => { await ev(`document.getElementById('capNext').click()`); return waitStep(4); })());
await sleep(2500);   // 等 framer 页面切换动画彻底结束（transform 祖先会让 fixed 短暂失效）
const clickedAdd = await clickSel('[data-demo="add"]');
check('种子记录卡 ≥3', (globalThis.__recs ?? 0) >= 3, 'got ' + globalThis.__recs);
check('自动前进到第 6 步（完成按钮高亮）', await waitStep(5));
const formOpen = await ev(`(() => {
  const d = document.getElementById('appFrame').contentDocument;
  const el = d.querySelector('[data-demo="save"]');
  return !!el && el.getBoundingClientRect().width > 0;
})()`);
check('受信点击 ＋ → 表单打开（完成按钮出现）', clickedAdd && formOpen);
/* 截图 */
const shot = await send('Page.captureScreenshot', { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(new URL('./vibe-real-final.png', import.meta.url), Buffer.from(shot.data, 'base64'));

/* 3. 重置 */
await ev(`resetApp()`); await sleep(3000);
const afterReset = await ev(`(() => {
  const w = document.getElementById('appFrame').contentWindow;
  const auth = w.localStorage.getItem('catfish_auth');
  const food = JSON.parse(w.localStorage.getItem('catfish_food_records') || '[]');
  return { auth, foodCount: food.length, first: food[0]?.restaurant_name };
})()`);
check('复位后 auth=true + 3 条种子', afterReset?.auth === 'true' && afterReset?.foodCount === 3, JSON.stringify(afterReset));

check('无页面 JS 异常', errors.length === 0, errors.join(' | ').slice(0, 300));

console.log([...ok, ...fail].join('\n'));
console.log(fail.length ? `\n${fail.length} 项失败` : '\n全部通过');
ws.close(); process.exit(fail.length ? 1 : 0);
