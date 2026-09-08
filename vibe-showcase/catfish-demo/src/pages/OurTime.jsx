import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../components/common/PageHeader'
import { CatFishLogo, FoodRecordIcon, MovieIcon, TravelIcon } from '../components/icons/CatFishIcons'
import { RELATIONSHIP_START_DATE, getDaysTogether, formatDateCN } from '../lib/config'
import { foodApi, movieApi, travelApi, wishFoodApi, wishTravelApi } from '../lib/supabase'

export default function OurTime() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ food: 0, movie: 0, travel: 0, wishFood: 0, wishTravel: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      foodApi.getAll().catch(() => []),
      movieApi.getAll().catch(() => []),
      travelApi.getAll().catch(() => []),
      wishFoodApi.getAll().catch(() => []),
      wishTravelApi.getAll().catch(() => [])
    ]).then(([food, movie, travel, wishFood, wishTravel]) => {
      setCounts({
        food: food.length,
        movie: movie.length,
        travel: travel.length,
        wishFood: (wishFood || []).filter(i => i.status === 'completed').length,
        wishTravel: (wishTravel || []).filter(i => i.status === 'completed').length
      })
      setLoading(false)
    })
  }, [])

  const days = getDaysTogether()
  const totalMemories = counts.food + counts.movie + counts.travel
  const totalWishes = counts.wishFood + counts.wishTravel

  return (
    <div style={{ padding: '0 20px' }}>
      <PageHeader title="我们的时间" onBack={() => navigate('/')} />

      {/* 主卡片 - 渐变背景 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-primary) 100%)',
          borderRadius: '32px',
          padding: '36px 24px',
          marginTop: '16px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(255, 159, 139, 0.15)'
        }}
      >
        {/* 装饰圆 */}
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)'
        }} />
        <div style={{
          position: 'absolute', left: '-15px', bottom: '-15px',
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)'
        }} />

        {/* 猫鱼插画 */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative', zIndex: 1, marginBottom: '16px' }}
        >
          <CatFishLogo size={100} />
        </motion.div>

        <p style={{
          fontSize: '15px', color: 'var(--color-on-primary)', fontWeight: '500',
          position: 'relative', zIndex: 1
        }}>
          我们已经一起
        </p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 12 }}
          style={{
            fontSize: '64px', fontWeight: '800', color: 'var(--color-accent)',
            lineHeight: 1.1, margin: '4px 0',
            position: 'relative', zIndex: 1,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {days}
        </motion.div>

        <p style={{
          fontSize: '18px', color: 'var(--color-on-primary)', fontWeight: '600',
          position: 'relative', zIndex: 1, marginBottom: '12px'
        }}>
          天
        </p>

        <p style={{
          fontSize: '13px', color: 'var(--color-on-primary-light)',
          position: 'relative', zIndex: 1
        }}>
          从 {formatDateCN(RELATIONSHIP_START_DATE)} 开始
        </p>
      </motion.div>

      {/* 累计回忆 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ marginTop: '20px' }}
      >
        <h3 style={{
          fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)',
          marginBottom: '14px', paddingLeft: '4px'
        }}>
          累计创造
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatCard
            icon={<FoodRecordIcon size={36} />}
            label="美食记录"
            count={counts.food}
            color="var(--color-cat)"
            delay={0.3}
            loading={loading}
          />
          <StatCard
            icon={<MovieIcon size={36} />}
            label="电影记录"
            count={counts.movie}
            color="var(--color-fish)"
            delay={0.4}
            loading={loading}
          />
          <StatCard
            icon={<TravelIcon size={36} />}
            label="旅行记录"
            count={counts.travel}
            color="var(--color-primary)"
            delay={0.5}
            loading={loading}
          />
        </div>
      </motion.div>

      {/* 实现的小愿望 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{ marginTop: '20px' }}
      >
        <h3 style={{
          fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)',
          marginBottom: '14px', paddingLeft: '4px'
        }}>
          实现的小愿望
        </h3>

        <div style={{ display: 'flex', gap: '12px' }}>
          <WishStatCard
            label="一起吃过"
            count={counts.wishFood}
            color="var(--color-primary)"
            delay={0.65}
            loading={loading}
          />
          <WishStatCard
            label="一起去过"
            count={counts.wishTravel}
            color="var(--color-fish)"
            delay={0.7}
            loading={loading}
          />
        </div>

        {totalWishes > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              textAlign: 'center',
              marginTop: '14px',
              padding: '12px',
              background: 'linear-gradient(135deg, var(--color-bg), var(--color-primary))',
              borderRadius: '16px'
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--color-on-primary)', fontWeight: '500' }}>
              我们已经完成{' '}
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-accent)' }}>
                {totalWishes}
              </span>
              {' '}个小愿望
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* 总结语 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        style={{
          textAlign: 'center',
          marginTop: '28px',
          padding: '0 12px'
        }}
      >
        <p style={{
          fontSize: '14px', color: 'var(--color-on-primary)', fontWeight: '500',
          lineHeight: 1.8
        }}>
          {days} 天，{totalMemories} 段回忆，{totalWishes} 个小愿望
        </p>
        <p style={{
          fontSize: '12px', color: 'var(--color-text-tertiary)',
          marginTop: '6px', lineHeight: 1.6
        }}>
          猫陪着鱼，一起走过的每一天
        </p>
      </motion.div>
    </div>
  )
}

function StatCard({ icon, label, count, color, delay, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '16px',
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</p>
        <p style={{
          fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)',
          marginTop: '2px'
        }}>
          {loading ? '...' : count}
          <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--color-text-tertiary)', marginLeft: '4px' }}>次</span>
        </p>
      </div>
    </motion.div>
  )
}

function WishStatCard({ label, count, color, delay, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{
        flex: 1,
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '16px 12px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px'
      }}>
        <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
          <path d="M6 1 L7 4.5 L10.5 6 L7 7.5 L6 11 L5 7.5 L1.5 6 L5 4.5 Z" fill={color}/>
        </svg>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{label}</p>
      <p style={{
        fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)'
      }}>
        {loading ? '...' : count}
        <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--color-text-tertiary)', marginLeft: '3px' }}>个</span>
      </p>
    </motion.div>
  )
}
