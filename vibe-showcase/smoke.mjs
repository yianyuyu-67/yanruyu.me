/* 冒烟测试：同一次调用内起服务器 + 直连托管浏览器 CDP 做真实交互验证 */
import { spawn } from 'node:child_process';

const CDP_HTTP = 'http://127.0.0.1:19542';
const URL_ = 'http://127.0.0.1:4820/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn(process.execPath, ['server.js'], { cwd: import.meta.dirname, stdio: 'ignore' });
await sleep(800);

const ok = [], fail = [];
const check = (name, cond, extra = '') =>
  (cond ? ok : fail).push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);

try {
  const list = await (await fetch(`${CDP_HTTP}/json/list`)).json();
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let mid = 0; const pend = new Map(); const pageErrors = [];
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++mid; pend.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) {
      const { res, rej } = pend.get(m.id); pend.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      pageErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
  };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable'); await send('Runtime.enable');

  const evalJs = async expr =>
    (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }))?.result?.value;

  await send('Page.navigate', { url: URL_ });
  await sleep(1600);

  /* 1. 基础：同源 iframe + 渲染 */
  const base = await evalJs(`(() => {
    const f = document.getElementById('appFrame');
    const d = f && f.contentDocument;
    if (!d) return { same: false };
    return {
      same: true,
      days: d.getElementById('days').textContent.trim(),
      add: !!d.querySelector('[data-demo="add"]'),
      recs: d.querySelectorAll('[data-demo="record"]').length,
    };
  })()`);
  check('iframe 同源可达', base?.same === true, JSON.stringify(base));
  check('天数渲染', /\d+\s*天/.test(base?.days || ''), base?.days);
  check('种子记录 3 条', base?.recs === 3, `got ${base?.recs}`);

  /* 2. 演示模式：第 1 步高亮首页 */
  await evalJs(`startDemo()`);
  await sleep(1500);
  const demo = await evalJs(`(() => ({
    cap: document.getElementById('demoCaption').style.display,
    text: document.getElementById('capText').textContent,
    finger: document.getElementById('finger').style.display,
    exit: !!document.getElementById('btnExit'),
    step: stepIdx,
  }))()`);
  check('演示模式启动', demo?.cap === 'block' && demo?.step === 0 && demo?.exit === true, JSON.stringify(demo));

  /* 3. 受信点击：推进一步到 FAB，再真实点击 FAB */
  await evalJs(`document.getElementById('capNext').click()`); // 下一步（字幕按钮是真实 DOM 可直接点）
  await sleep(1300);
  // 找 FAB 在视口中的坐标（iframe 内元素 rect + screen 偏移，含缩放）
  const fabPos = await evalJs(`(() => {
    const f = document.getElementById('appFrame');
    const el = f.contentDocument.querySelector('[data-demo="add"]');
    el.scrollIntoView({block:'center'});
    const r = el.getBoundingClientRect();
    const s = document.querySelector('.screen').getBoundingClientRect(); const k = s.width/390; return { x: s.left + (r.left + r.width/2)*k, y: s.top + (r.top + r.height/2)*k };
  })()`);
  // 用 CDP 受信鼠标事件走完整 pointer 管线
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: fabPos.x, y: fabPos.y, button: 'left', clickCount: 1 });
    await sleep(120);
  }
  await sleep(400);
  const addOpen = await evalJs(`document.getElementById('appFrame').contentDocument.getElementById('addMask').classList.contains('open')`);
  check('受信点击 FAB → 新建弹层', addOpen === true);

  /* 4. 填写并保存 */
  await evalJs(`(() => {
    const d = document.getElementById('appFrame').contentDocument;
    const t = d.getElementById('fTitle'), n = d.getElementById('fNote');
    t.value = '冒烟测试记录'; t.dispatchEvent(new Event('input', {bubbles:true}));
    n.value = '自动测试写入'; n.dispatchEvent(new Event('input', {bubbles:true}));
  })()`);
  const savePos = await evalJs(`(() => {
    const r = document.getElementById('appFrame').contentDocument.querySelector('[data-demo="save"]').getBoundingClientRect();
    const s = document.querySelector('.screen').getBoundingClientRect(); const k = s.width/390; return { x: s.left + (r.left + r.width/2)*k, y: s.top + (r.top + r.height/2)*k };
  })()`);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x: savePos.x, y: savePos.y, button: 'left', clickCount: 1 });
    await sleep(120);
  }
  await sleep(500);
  const afterSave = await evalJs(`(() => {
    const d = document.getElementById('appFrame').contentDocument;
    return {
      count: d.querySelectorAll('[data-demo="record"]').length,
      view: d.getElementById('viewTimeline').style.display === '',
      stored: JSON.parse(d.defaultView.localStorage.getItem('vibe_demo_v1')).some(r => r.title === '冒烟测试记录'),
    };
  })()`);
  check('保存后写入 localStorage', afterSave?.stored === true);
  check('保存后跳时间线 + 4 条', afterSave?.view === true && afterSave?.count === 4, JSON.stringify(afterSave));

  /* 5. 长按 600ms → 操作面板（验证 500ms 长按桥 + 演示步进） */
  const recPos = await evalJs(`(() => {
    const r = document.getElementById('appFrame').contentDocument.querySelector('[data-demo="record"]').getBoundingClientRect();
    const s = document.querySelector('.screen').getBoundingClientRect(); const k = s.width/390; return { x: s.left + (r.left + r.width/2)*k, y: s.top + (r.top + r.height/2)*k };
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: recPos.x, y: recPos.y, button: 'left', clickCount: 1 });
  await sleep(700);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: recPos.x, y: recPos.y, button: 'left', clickCount: 1 });
  await sleep(300);
  const lp = await evalJs(`document.getElementById('appFrame').contentDocument.getElementById('actMask').classList.contains('open')`);
  check('长按 600ms → 操作面板', lp === true);

  /* 6. 重置演示数据 */
  await evalJs(`resetApp()`); await sleep(600);
  const resetOk = await evalJs(`(() => {
    const d = document.getElementById('appFrame').contentDocument;
    return JSON.parse(d.defaultView.localStorage.getItem('vibe_demo_v1')).length;
  })()`);
  check('重置回种子 3 条', resetOk === 3, `got ${resetOk}`);

  /* 7. 截图留档 */
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const { writeFileSync } = await import('node:fs');
  writeFileSync(new URL('./vibe-smoke.png', import.meta.url), Buffer.from(shot.data, 'base64'));

  check('无页面 JS 异常', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));

  await send('Page.navigate', { url: 'about:blank' });
  ws.close();
} catch (e) {
  fail.push('FAIL 测试框架异常 | ' + e.message);
} finally {
  server.kill();
}
console.log([...ok, ...fail].join('\n'));
console.log(fail.length ? `\n${fail.length} 项失败` : '\n全部通过');
process.exit(fail.length ? 1 : 0);
