/**
 * 猫&鱼 应用配置
 * 恋爱开始日期作为系统固定配置
 */

// 恋爱开始日期 - 固定值，方便未来修改
export const RELATIONSHIP_START_DATE = '2026-01-05'

/**
 * 计算在一起的天数
 * @param {string} startDate - ISO 日期字符串，默认使用配置值
 * @returns {number} 天数
 */
export function getDaysTogether(startDate = RELATIONSHIP_START_DATE) {
  const start = new Date(startDate)
  const now = new Date()
  // 重置时间部分，只比较日期
  start.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = now - start
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

/**
 * 格式化日期为中文显示
 * 2026-01-06 → 2026年1月6日
 */
export function formatDateCN(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化日期为简洁显示
 * 2026-01-06 → 2026.01.06
 */
export function formatDateDot(dateStr) {
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${m}.${day}`
}
