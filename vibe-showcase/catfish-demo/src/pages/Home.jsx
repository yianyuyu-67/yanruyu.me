import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getDaysTogether, formatDateDot, RELATIONSHIP_START_DATE } from '../lib/config'
import { wishFoodApi, wishTravelApi } from '../lib/supabase'

export default function HomePage() {
  const navigate = useNavigate()
  const [days, setDays] = useState(0)
  const [wishes, setWishes] = useState([])
  const [wishIndex, setWishIndex] = useState(0)
  const ticketRef = useRef(null)

  useEffect(() => {
    setDays(getDaysTogether())
    Promise.all([
      wishFoodApi.getAll().catch(() => []),
      wishTravelApi.getAll().catch(() => [])
    ]).then(([wishFood, wishTravel]) => {
      const pending = [
        ...(wishFood || [])
          .filter(i => i.status === 'pending')
          .map(i => ({ ...i, kind: 'food', prefix: '想吃', name: i.name || '未命名美食' })),
        ...(wishTravel || [])
          .filter(i => i.status === 'pending')
          .map(i => ({ ...i, kind: 'travel', prefix: '想去', name: i.location || i.name || '未命名地点' }))
      ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setWishes(pending)
    })
  }, [])

  // 记日数字点击循环切换显示格式：天 → 年+月 → 月+天 → 周+天（不到一年跳过「年+月」）
  const [dateView, setDateView] = useState('days')
  const cycleDateView = () => {
    const order = days >= 365 ? ['days', 'yrs', 'mths', 'wks'] : ['days', 'mths', 'wks']
    const idx = order.indexOf(dateView)
    setDateView(order[(idx + 1) % order.length])
  }
  const years = Math.floor(days / 365)
  const monthsForYrs = Math.floor((days - years * 365) / 30)
  const totalMonths = Math.floor(days / 30)
  const remDaysAfterMonths = days - totalMonths * 30
  const weeks = Math.floor(days / 7)
  const remDaysAfterWeeks = days - weeks * 7

  const renderDateValue = () => {
    const big = {
      fontFamily: '"Caveat", "Bradley Hand", "Comic Sans MS", cursive',
      fontSize: 'clamp(84px, 26vw, 170px)',
      fontWeight: '700',
      color: '#C97C3E',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.5px',
      transform: 'translateY(-4px)'
    }
    const small = {
      fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
      fontSize: 'clamp(24px, 7vw, 44px)',
      color: '#C97C3E',
      fontWeight: '600',
      marginLeft: '6px',
      transform: 'translateY(-4px)'
    }
    switch (dateView) {
      case 'yrs':
        return (<><span style={big}>{years}</span><span style={small}>年</span><span style={big}>{monthsForYrs}</span><span style={small}>个月</span></>)
      case 'mths':
        return (<><span style={big}>{totalMonths}</span><span style={small}>个月</span><span style={big}>{remDaysAfterMonths}</span><span style={small}>天</span></>)
      case 'wks':
        return (<><span style={big}>{weeks}</span><span style={small}>周</span><span style={big}>{remDaysAfterWeeks}</span><span style={small}>天</span></>)
      case 'days':
      default:
        return (<><span style={big}>{days}</span><span style={small}>天</span></>)
    }
  }

  const handleDragEnd = (e, info) => {
    if (wishes.length <= 1) return
    const threshold = 40
    if (info.offset.x < -threshold && wishIndex < wishes.length - 1) {
      setWishIndex(wishIndex + 1)
    } else if (info.offset.x > threshold && wishIndex > 0) {
      setWishIndex(wishIndex - 1)
    }
  }

  const currentWish = wishes[wishIndex]

  const formatWishDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
      return (
        <>
          <span style={{ fontSize: 'clamp(18px, 5vw, 22px)', lineHeight: 1.1 }}>{y}</span>
          <span style={{ fontSize: 'clamp(15px, 4vw, 18px)', lineHeight: 1.1 }}>{m}/{day}</span>
        </>
      )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      backgroundImage: 'url(./assets/home-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center 90%',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden'
    }}>
      {/* since */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '1.5%',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
            fontSize: 'clamp(12px, 3.4vw, 15px)',
            color: '#D27B00',
            letterSpacing: '1px'
          }}
        >
          since {formatDateDot(RELATIONSHIP_START_DATE)}
        </motion.div>
      </div>

      {/* 天数数字 */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '15%',
        transform: 'translateY(-50%)',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div
            onClick={cycleDateView}
            style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', cursor: 'pointer', flexWrap: 'wrap' }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={dateView}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 140, damping: 12 }}
                style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', flexWrap: 'wrap', gap: '2px' }}
              >
                {renderDateValue()}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 语录 */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '26%',
        transform: 'translateY(-50%)',
        textAlign: 'center'
      }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
            fontSize: 'clamp(11px, 3.6vw, 15px)',
            color: '#C17B1B',
            letterSpacing: '0.5px',
            margin: 0
          }}
        >
          和你一起，永远做小孩！
        </motion.p>
      </div>

      {/* 美食入口 */}
      <motion.button
        data-demo="food-card"
        onClick={() => navigate('/food')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'absolute',
          left: '11.8%',
          top: '60.5%',
          width: '33.8%',
          aspectRatio: '274 / 160',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        aria-label="美食"
      >
        <img src="./assets/home-food.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </motion.button>

      {/* 生活入口 */}
      <motion.button
        onClick={() => navigate('/life')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'absolute',
          left: '54.2%',
          top: '60.5%',
          width: '33.8%',
          aspectRatio: '279 / 160',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        aria-label="生活"
      >
        <img src="./assets/home-life.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </motion.button>

      {/* 票根愿望卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ position: 'absolute', left: '11.7%', top: '73%', width: '76.5%', aspectRatio: '597 / 228' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={wishIndex}
            ref={ticketRef}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            onClick={() => navigate(currentWish?.kind === 'food' ? '/food/wish' : '/life/wish-travel')}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              cursor: 'pointer'
            }}
          >
            {/* 票根背景图（自带棕色底 + 左右半圆缺口 + 中间虚线） */}
            <img
              src="./assets/home-ticket.png"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
            />

            {/* 左侧内容区（标题靠顶 + 副标题居中） */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '3%',
              width: '64%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 12px 0'
            }}>
              <div style={{
                fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
                fontSize: 'clamp(17px, 5.2vw, 23px)',
                fontWeight: '600',
                color: '#FFF3E3',
                letterSpacing: '0.5px'
              }}>
                下次一定！
              </div>
              {currentWish ? (
                <div style={{
                  position: 'absolute',
                  top: '52%',
                  left: 0,
                  right: 0,
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
                  fontSize: 'clamp(13px, 4.2vw, 17px)',
                  color: 'rgba(255,243,227,0.92)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 12px'
                }}>
                  {currentWish.prefix}{currentWish.name}
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: '52%',
                  left: 0,
                  right: 0,
                  transform: 'translateY(-50%)',
                  textAlign: 'center',
                  fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
                  fontSize: 'clamp(12px, 3.6vw, 15px)',
                  color: 'rgba(255,243,227,0.7)'
                }}>
                  愿望清单还空空的～
                </div>
              )}
            </div>

            {/* 右侧日期区（紧靠竖线下方） */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: '12%',
              width: '26%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontFamily: '"Caveat", "ZCOOL KuaiLe", cursive',
              color: '#FFF3E3',
              paddingBottom: '12px'
            }}>
              {currentWish ? formatWishDate(currentWish.created_at) : (
                <span style={{ fontSize: '12px' }}>--</span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
