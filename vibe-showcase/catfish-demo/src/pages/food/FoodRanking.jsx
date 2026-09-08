import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { foodApi } from '../../lib/supabase'
import { totalScore, FOOD_CATEGORIES } from '../../lib/foodScore'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'
import PageHeader from '../../components/common/PageHeader'
import StarRating from '../../components/common/StarRating'
import { EmptyState, LoadingState } from '../../components/common/States'

export default function FoodRanking() {
  const [catFilter, setCatFilter] = useState('all')
  const [sortType, setSortType] = useState('rating')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState(null)

  const loadRanking = useCallback(async () => {
    setLoading(true)
    try {
      const data = await foodApi.getAll()
      setRecords(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRanking()
  }, [loadRanking])

  // 按店名聚合：总分仅取两人都打的记录（totalScore != null）
  const aggregated = (() => {
    const filtered = catFilter === 'all'
      ? records
      : records.filter((r) => (r.category || 'restaurant') === catFilter)
    const map = new Map()
    for (const r of filtered) {
      const name = r.restaurant_name
      if (!map.has(name)) {
        map.set(name, { name, totals: [], lastDate: r.date, category: r.category || 'restaurant' })
      }
      const e = map.get(name)
      const t = totalScore(r)
      if (t != null) e.totals.push(t)
      if (new Date(r.date) > new Date(e.lastDate)) e.lastDate = r.date
    }
    const list = Array.from(map.values()).map((e) => ({
      name: e.name,
      avgRating: e.totals.length ? e.totals.reduce((a, b) => a + b, 0) / e.totals.length : 0,
      count: e.totals.length,
      lastDate: e.lastDate,
      category: e.category,
      hasScore: e.totals.length > 0
    }))
    list.sort((a, b) => {
      if (sortType === 'rating') return (b.avgRating - a.avgRating) || (b.count - a.count)
      return (b.count - a.count) || (b.avgRating - a.avgRating)
    })
    return list
  })()

  // 蛋糕榜二级：某蛋糕店下不同款式（cake_style）的评分与次数
  const cakeStyleDetail = useMemo(() => {
    if (catFilter !== 'cake' || !selectedShop) return []
    const shopRecords = records.filter(
      (r) => (r.category || 'restaurant') === 'cake' && r.restaurant_name === selectedShop
    )
    const map = new Map()
    for (const r of shopRecords) {
      const style = r.cake_style && r.cake_style.trim() ? r.cake_style.trim() : '（未填款式）'
      if (!map.has(style)) map.set(style, { style, totals: [], lastDate: r.date })
      const e = map.get(style)
      const t = totalScore(r)
      if (t != null) e.totals.push(t)
      if (new Date(r.date) > new Date(e.lastDate)) e.lastDate = r.date
    }
    const list = Array.from(map.values()).map((e) => ({
      style: e.style,
      avgRating: e.totals.length ? e.totals.reduce((a, b) => a + b, 0) / e.totals.length : 0,
      count: e.totals.length,
      lastDate: e.lastDate,
      hasScore: e.totals.length > 0
    }))
    list.sort((a, b) => {
      if (sortType === 'rating') return (b.avgRating - a.avgRating) || (b.count - a.count)
      return (b.count - a.count) || (b.avgRating - a.avgRating)
    })
    return list
  }, [records, catFilter, selectedShop, sortType])

  return (
    <PageTransition>
      <div className="theme-food" style={{ padding: '0 20px' }}>
        <PageHeader title="美食排行榜" subtitle="厨神争霸赛" />

        {/* 分类 tab */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '12px',
          background: '#FFFFFF', padding: '4px', borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(255, 159, 139, 0.06)', overflowX: 'auto'
        }}>
          <CatTab active={catFilter === 'all'} onClick={() => { setCatFilter('all'); setSelectedShop(null) }}>总榜</CatTab>
          {Object.entries(FOOD_CATEGORIES).map(([key, meta]) => (
            <CatTab key={key} active={catFilter === key} onClick={() => { setCatFilter(key); setSelectedShop(null) }}>
              {meta.emoji} {meta.label}
            </CatTab>
          ))}
        </div>

        {/* 排序方式 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <SortButton active={sortType === 'rating'} onClick={() => setSortType('rating')}>按评分</SortButton>
          <SortButton active={sortType === 'count'} onClick={() => setSortType('count')}>按次数</SortButton>
        </div>

        {selectedShop && catFilter === 'cake' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <motion.button
              onClick={() => setSelectedShop(null)}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                background: '#FFFFFF', border: '1.5px solid #F0E6DC',
                borderRadius: '12px', padding: '6px 12px',
                fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500'
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>‹</span> 返回
            </motion.button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--coffee-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedShop}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>蛋糕款式明细</div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingState count={4} />
        ) : (catFilter === 'cake' && selectedShop)
          ? (cakeStyleDetail.length === 0
              ? <EmptyState message="这家店还没有可排名的蛋糕记录" />
              : <StaggerContainer>
                  {cakeStyleDetail.map((item, index) => (
                    <StaggerItem key={item.style}>
                      <CakeStyleCard item={item} index={index} type={sortType} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>)
          : aggregated.length === 0
            ? <EmptyState message="这个分类还没有可排名的美食记录" />
            : <StaggerContainer>
                {aggregated.map((item, index) => (
                  <StaggerItem key={item.name}>
                    <RankingCard
                      item={item}
                      index={index}
                      type={sortType}
                      onSelect={catFilter === 'cake' ? () => setSelectedShop(item.name) : undefined}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
        }
      </div>
    </PageTransition>
  )
}

function CatTab({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        flex: '0 0 auto',
        height: '40px',
        padding: '0 14px',
        borderRadius: '12px',
        background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent',
        color: active ? '#FFFFFF' : 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s'
      }}
    >
      {children}
    </motion.button>
  )
}

function SortButton({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        flex: 1,
        height: '36px',
        borderRadius: '12px',
        border: `1.5px solid ${active ? 'var(--color-accent)' : '#F0E6DC'}`,
        background: active ? 'var(--peach)' : '#FFFFFF',
        color: active ? 'var(--coffee-dark)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: active ? '600' : '400'
      }}
    >
      {children}
    </motion.button>
  )
}

function RankBadge({ rank }) {
  const isMedal = rank <= 3
  const fills = ['#FFB800', '#C7C7CC', '#D4884A']
  const fill = fills[rank - 1]

  return (
    <div style={{
      width: isMedal ? '44px' : '36px',
      height: isMedal ? '44px' : '36px',
      borderRadius: '12px',
      background: isMedal ? `${fill}18` : '#F5EDE5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {isMedal ? (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="14" fill={fill} />
          <text x="18" y="22" fontSize="14" fill="#FFFFFF" textAnchor="middle" fontWeight="700">{rank}</text>
        </svg>
      ) : (
        <span style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-text-secondary)'
        }}>{rank}</span>
      )}
    </div>
  )
}

function RankingCard({ item, index, type, onSelect }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <motion.div
      onClick={onSelect}
      whileTap={{ scale: onSelect ? 0.98 : 1 }}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: onSelect ? 'pointer' : 'default',
        boxShadow: '0 2px 16px rgba(255, 159, 139, 0.06)'
      }}
    >
      <RankBadge rank={index + 1} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)',
          marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {item.name}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!onSelect && (
            <span style={{
              fontSize: '10px', color: 'var(--coffee-dark)', background: 'var(--peach-light)',
              borderRadius: '9999px', padding: '1px 7px'
            }}>
              {FOOD_CATEGORIES[item.category]?.label || '餐厅'}
            </span>
          )}
          {type === 'rating' ? (
            item.hasScore ? (
              <>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <StarRating value={item.avgRating} readOnly size={12} allowHalf />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-star)', fontWeight: '600' }}>{item.avgRating.toFixed(1)}</span>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>待双人评分</span>
            )
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>最近: {formatDate(item.lastDate)}</span>
          )}
        </div>
      </div>

      {/* Count */}
      {onSelect ? (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>吃过</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-cat)' }}>
              {item.count}次
            </p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
            <path d="M9 6l6 6-6 6" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>吃过</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-cat)' }}>
            {item.count}次
          </p>
        </div>
      )}
    </motion.div>
  )
}

function CakeStyleCard({ item, index, type }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 2px 16px rgba(255, 159, 139, 0.06)'
      }}
    >
      <RankBadge rank={index + 1} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)',
          marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {item.style}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {type === 'rating' ? (
            item.hasScore ? (
              <>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <StarRating value={item.avgRating} readOnly size={12} allowHalf />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-star)', fontWeight: '600' }}>{item.avgRating.toFixed(1)}</span>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>待双人评分</span>
            )
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>最近: {formatDate(item.lastDate)}</span>
          )}
        </div>
      </div>

      {/* Count */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>吃过</p>
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-cat)' }}>
          {item.count}次
        </p>
      </div>
    </motion.div>
  )
}
