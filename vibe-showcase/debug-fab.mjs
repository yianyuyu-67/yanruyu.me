/* 诊断：＋ 按钮点击为何没开表单 */
import { spawn } from 'node:child_process';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const server = spawn(process.execPath, ['server.js'], { cwd: import.meta.dirname, stdio: 'ignore' });
server.unref();
await sleep(800);
const list = await (await fetch('http://127.0.0.1:19542/json/list')).json();
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
let mid = 0; const pend = new Map();
const send = (m, p = {}) => new Promise(res => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
await new Promise(r => ws.onopen = r);
const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (r?.exceptionDetails) console.log('EV-ERR:', (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 200)); return r?.result?.value; };
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:4820/?t=' + Date.now() });
await sleep(3000);

/* 手动走到美食记录页 */
console.log('walk:', JSON.stringify(await ev(`(async () => {
  const out = [];
  const d0 = document.getElementById('appFrame').contentDocument;
  const card = d0.querySelector('[data-demo="food-card"]');
  const s = document.querySelector('.screen').getBoundingClientRect();
  const k = s.width / 390;
  const click = (el) => {
    const r = el.getBoundingClientRect();
    const x = s.left + (r.left + r.width/2) * k, y = s.top + (r.top + r.height/2) * k;
    return { x, y };
  };
  globalThis.__pos1 = click(card);
  return { pos1: globalThis.__pos1 };
})()`)));
for (const type of ['mousePressed', 'mouseReleased']) {
  const p = await ev(`globalThis.__pos1`);
  await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
  await sleep(160);
}
await sleep(900);
await ev(`(async () => {
  const d = document.getElementById('appFrame').contentDocument;
  const entry = d.querySelector('.dashed-card');
  const s = document.querySelector('.screen').getBoundingClientRect();
  const k = s.width / 390;
  const r = entry.getBoundingClientRect();
  globalThis.__pos2 = { x: s.left + (r.left + r.width/2) * k, y: s.top + (r.top + r.height/2) * k };
})()`);
for (const type of ['mousePressed', 'mouseReleased']) {
  const p = await ev(`globalThis.__pos2`);
  await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
  await sleep(160);
}
await sleep(900);

/* 现在在美食记录页：先等 3 秒让动画彻底结束，再采样 fab 位置 */
await sleep(3000);
console.log('fab rect 采样:', JSON.stringify(await ev(`(async () => {
  const d = document.getElementById('appFrame').contentDocument;
  const out = [];
  for (let i = 0; i < 5; i++) {
    const fab = d.querySelector('[data-demo="add"]');
    const r = fab.getBoundingClientRect();
    out.push(Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    await new Promise(r2 => setTimeout(r2, 400));
  }
  return out;
})()`)));

/* 现在在美食记录页：检查 fab 的实际状态 */
console.log('fab:', JSON.stringify(await ev(`(() => {
  const d = document.getElementById('appFrame').contentDocument;
  const fab = d.querySelector('[data-demo="add"]');
  if (!fab) return 'fab 不存在';
  const r = fab.getBoundingClientRect();
  const s = document.querySelector('.screen').getBoundingClientRect();
  const k = s.width / 390;
  const cx = s.left + (r.left + r.width/2) * k, cy = s.top + (r.top + r.height/2) * k;
  const topDocHit = document.elementFromPoint(cx, cy);
  const inIframeHit = d.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
  return {
    rect: Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top),
    vpPos: { x: Math.round(cx), y: Math.round(cy) },
    hitInIframe: inIframeHit ? inIframeHit.tagName + (inIframeHit.dataset?.demo ? ' demo=' + inIframeHit.dataset.demo : '') : 'null',
    hash: d.defaultView.location.hash,
  };
})()`)));

/* 受信点击 fab，看表单开不开 */
const p = await ev(`(() => {
  const d = document.getElementById('appFrame').contentDocument;
  const r = d.querySelector('[data-demo="add"]').getBoundingClientRect();
  const s = document.querySelector('.screen').getBoundingClientRect();
  const k = s.width / 390;
  return { x: s.left + (r.left + r.width/2) * k, y: s.top + (r.top + r.height/2) * k };
})()`);
for (const type of ['mousePressed', 'mouseReleased']) {
  await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
  await sleep(160);
}
await sleep(800);
console.log('after click:', JSON.stringify(await ev(`(() => {
  const d = document.getElementById('appFrame').contentDocument;
  const save = d.querySelector('[data-demo="save"]');
  return {
    saveExists: !!save,
    saveVisible: save ? save.getBoundingClientRect().width > 0 : false,
    saveText: save ? (save.textContent || '').trim().slice(0, 10) : null,
    hash: d.defaultView.location.hash,
  };
})()`)));

ws.close(); process.exit(0);
