/* 展示页演示引导脚本（仅存在于演示构建，真实项目不含此文件）
   职责：
   1. 首次进入时向 localStorage 写入全套虚构种子数据（应用未配置 Supabase 时自动走本地存储）
   2. 预置身份与已验证状态，让演示直接进入首页
   3. 监听展示壳的 vibe:reset / vibe:demo-step 消息 → 重置数据或驱动演示交互 */
(function () {
  var FLAG = 'catfish_demo_v1';
  var DATA_KEYS = [
    'catfish_food_records', 'catfish_movie_records', 'catfish_travel_records',
    'catfish_wish_food', 'catfish_wish_travel', 'catfish_meal_comments'
  ];

  function seed() {
    // 美食记录：三个分类各一条，维度分对齐 foodScore.js 的权重（餐厅 环境2/口味4/服务1.5/性价比2.5；外卖 包装3/口味6/性价比1；蛋糕 外观4/口味4/性价比2）
    var food = [
      {
        id: 'demo-food-1', restaurant_name: '云边咖啡馆', date: '2026-08-02', category: 'restaurant',
        cat_scores: { env: 9, taste: 8, service: 9, value: 8 },
        fish_scores: { env: 8, taste: 9, service: 8, value: 9 },
        rating_cat: 8.4, rating_fish: 8.7, rating: null, photo_url: null,
        note: '靠窗的位置能看到梧桐树，提拉米苏是现做的。', cake_style: null,
        created_at: '2026-08-02T12:30:00.000Z'
      },
      {
        id: 'demo-food-2', restaurant_name: '巷口小龙虾', date: '2026-07-18', category: 'takeout',
        cat_scores: { pack: 8, taste: 9, value: 7 },
        fish_scores: { pack: 9, taste: 8, value: 8 },
        rating_cat: 8.5, rating_fish: 8.3, rating: null, photo_url: null,
        note: '夏夜限定，剥虾大赛的冠军是我。', cake_style: null,
        created_at: '2026-07-18T20:00:00.000Z'
      },
      {
        id: 'demo-food-3', restaurant_name: '栗子蛋糕', date: '2026-08-15', category: 'cake',
        cat_scores: { look: 10, taste: 9, value: 8 },
        fish_scores: { look: 9, taste: 10, value: 7 },
        rating_cat: 9.2, rating_fish: 9.0, rating: null, photo_url: null,
        note: '生日月的第一块蛋糕。', cake_style: '秋日限定',
        created_at: '2026-08-15T15:00:00.000Z'
      }
    ];

    // 电影记录（10 分制双人评分）
    var movies = [
      {
        id: 'demo-movie-1', movie_name: '星际邮差', date: '2026-08-10', location: '和平影城',
        photo_url: null, note: '散场时很多人都没走，片尾曲太好听了。',
        rating_cat: 9, rating_fish: 8, created_at: '2026-08-10T22:00:00.000Z'
      },
      {
        id: 'demo-movie-2', movie_name: '海边的一周', date: '2026-07-05', location: '家里投影',
        photo_url: null, note: '边看边干掉两包薯片。',
        rating_cat: 7, rating_fish: 8, created_at: '2026-07-05T21:30:00.000Z'
      }
    ];

    // 旅行记录（已去）
    var travel = [
      {
        id: 'demo-travel-1', location: '青岛', date: '2026-05-01', photo_url: null,
        note: '第一次一起看海。', created_at: '2026-05-01T18:00:00.000Z'
      },
      {
        id: 'demo-travel-2', location: '安吉', date: '2026-04-12', photo_url: null,
        note: '竹林里信号很差，是最好的事。', created_at: '2026-04-12T16:00:00.000Z'
      }
    ];

    // 想吃 / 想去清单
    var wishFood = [
      { id: 'demo-wf-1', name: '那家很火的酸汤火锅', status: 'pending', completed_at: null, created_at: '2026-08-12T10:00:00.000Z' },
      { id: 'demo-wf-2', name: '校门口的烤冷面（双蛋）', status: 'pending', completed_at: null, created_at: '2026-07-20T10:00:00.000Z' }
    ];
    var wishTravel = [
      { id: 'demo-wt-1', location: '厦门', note: '要在环岛路骑单车', status: 'pending', completed_at: null, created_at: '2026-08-01T10:00:00.000Z' },
      { id: 'demo-wt-2', location: '敦煌', note: '看一次银河', status: 'pending', completed_at: null, created_at: '2026-06-15T10:00:00.000Z' }
    ];

    // 美食留言（挂在 demo-food-1 下）
    var comments = [
      { id: 'demo-mc-1', meal_id: 'demo-food-1', author: 'fish', content: '下次还来！试试他们家的桂花拿铁', created_at: '2026-08-02T13:00:00.000Z' }
    ];

    var data = {};
    data.catfish_food_records = JSON.stringify(food);
    data.catfish_movie_records = JSON.stringify(movies);
    data.catfish_travel_records = JSON.stringify(travel);
    data.catfish_wish_food = JSON.stringify(wishFood);
    data.catfish_wish_travel = JSON.stringify(wishTravel);
    data.catfish_meal_comments = JSON.stringify(comments);
    for (var k in data) localStorage.setItem(k, data[k]);

    // 演示直接进首页：预置身份与已验证（均为演示值）
    localStorage.setItem('catfish_identity', 'cat');
    localStorage.setItem('catfish_auth', 'true');
    localStorage.setItem(FLAG, '1');
  }

  function reset() {
    DATA_KEYS.forEach(function (k) { localStorage.removeItem(k); });
    localStorage.removeItem('catfish_identity');
    localStorage.removeItem('catfish_auth');
    localStorage.removeItem(FLAG);
    seed();
    // Always restart guided playback from the app home route, even when the
    // visitor was previously exploring a nested HashRouter page.
    if (location.hash !== '#/') location.hash = '#/';
    location.reload();
  }

  if (!localStorage.getItem(FLAG)) seed();

  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.type === 'vibe:reset') { reset(); return; }
    if (e.data.type === 'vibe:demo-step' && e.data.selector) {
      var tries = 0;
      var run = function () {
        var el = null;
        try { el = document.querySelector(e.data.selector); } catch (_) {}
        if (!el && ++tries < 24) { setTimeout(run, 250); return; }
        if (el && e.data.action === 'click') el.click();
        try { e.source && e.source.postMessage({ type: 'vibe:demo-acted', selector: e.data.selector }, '*'); } catch (_) {}
      };
      run();
    }
  });
})();
