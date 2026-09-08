// 美食评分：分类 + 维度 + 双人打分 的配置与计算
// category: restaurant(餐厅) / takeout(外卖) / cake(蛋糕)
// 每个分类有固定的评分维度；每个维度由小猫(cat)和小鱼(fish)各自打分

export const FOOD_CATEGORIES = {
  restaurant: {
    label: '餐厅',
    emoji: '🍽️',
    dims: [
      { key: 'env', label: '环境', weight: 2 },
      { key: 'taste', label: '口味', weight: 4 },
      { key: 'service', label: '服务', weight: 1.5 },
      { key: 'value', label: '性价比', weight: 2.5 }
    ]
  },
  takeout: {
    label: '外卖',
    emoji: '🥡',
    dims: [
      { key: 'pack', label: '包装', weight: 3 },
      { key: 'taste', label: '口味', weight: 6 },
      { key: 'value', label: '性价比', weight: 1 }
    ]
  },
  cake: {
    label: '蛋糕',
    emoji: '🍰',
    dims: [
      { key: 'look', label: '外观', weight: 4 },
      { key: 'taste', label: '口味', weight: 4 },
      { key: 'value', label: '性价比', weight: 2 }
    ]
  }
}

// 评分满分（分制）：10 分制，5 颗星，每颗星 = 2 分，半星 = 1 分
export const MAX_SCORE = 10
export const STAR_COUNT = 5
// 分制数值 <-> 星星数 互转
export const scoreToStars = (score) => (typeof score === 'number' ? score / 2 : 0)
export const starsToScore = (stars) => Math.round(stars * 2)

export const CATEGORY_ORDER = ['restaurant', 'takeout', 'cake']

export function getCategoryMeta(category) {
  return FOOD_CATEGORIES[category] || FOOD_CATEGORIES.restaurant
}

export function getDims(category) {
  return getCategoryMeta(category).dims
}

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

// 某人的维度分对象（优先新结构 cat_scores/fish_scores，旧记录无则返回 null）
function getScores(record, who) {
  if (!record) return null
  const raw = who === 'cat' ? record.cat_scores : record.fish_scores
  if (isPlainObject(raw) && Object.keys(raw).length > 0) return raw
  return null
}

// 某人是否已评分（新结构有维度分，或旧记录有 rating_cat/rating_fish 兼容值）
export function personDone(record, who) {
  if (!record) return false
  if (getScores(record, who)) return true
  const legacy = who === 'cat' ? record.rating_cat : record.rating_fish
  return typeof legacy === 'number'
}

// 某人各维度加权平均分（旧记录回退到 rating_cat/rating_fish）
export function personAvg(record, who) {
  if (!record) return null
  const scores = getScores(record, who)
  if (scores) {
    const w = weightedAvg(getDims(record.category), scores)
    if (w != null) return w
  }
  const legacy = who === 'cat' ? record.rating_cat : record.rating_fish
  return typeof legacy === 'number' ? legacy : null
}

// 总分：两人都打才出分（按用户约定：等两人都打才显示总分）
export function totalScore(record) {
  if (!record) return null
  const catDone = personDone(record, 'cat')
  const fishDone = personDone(record, 'fish')
  if (!catDone || !fishDone) return null
  const catAvg = personAvg(record, 'cat')
  const fishAvg = personAvg(record, 'fish')
  if (catAvg == null || fishAvg == null) return null
  return (catAvg + fishAvg) / 2
}

// 加权平均：每个维度有 weight，结果 = Σ(分×权重) / Σ(权重)，只统计已打分的维度
export function weightedAvg(dims, scores) {
  if (!dims || !scores) return null
  let wsum = 0
  let vsum = 0
  dims.forEach((d) => {
    const v = scores[d.key]
    if (typeof v === 'number') {
      const w = typeof d.weight === 'number' ? d.weight : 1
      vsum += v * w
      wsum += w
    }
  })
  if (!wsum) return null
  return vsum / wsum
}

// 把维度评分数组构造成 {key: value} 对象（过滤掉未打分维度）
export function buildScoresObject(dims, ratings) {
  const obj = {}
  dims.forEach((d) => {
    const v = ratings[d.key]
    if (typeof v === 'number') obj[d.key] = v
  })
  return obj
}
