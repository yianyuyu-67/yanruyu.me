import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 身份选择组件
 * 第一次进入 App 时展示，让用户选择小猫或小鱼
 */
export default function IdentitySelect({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const handleSelect = (id) => {
    setSelected(id)
  }

  const handleConfirm = () => {
    if (!selected) return
    setConfirming(true)
    setTimeout(() => {
      onSelect(selected)
    }, 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, var(--color-bg) 0%, #FFE8DC 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        zIndex: 300,
        overflow: 'hidden'
      }}
    >
      {/* 装饰气泡 */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '8%', right: '10%', opacity: 0.12 }}
      >
        <img src="./assets/avatar-cat.png" alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ position: 'absolute', bottom: '10%', left: '8%', opacity: 0.12 }}
      >
        <img src="./assets/avatar-fish.png" alt="" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '50%' }} />
      </motion.div>

      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: '48px' }}
      >
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '8px'
        }}>
          你是哪一位呢？
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6
        }}>
          选择你的身份，开始记录属于你们的回忆
        </p>
      </motion.div>

      {/* 身份选择卡片 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* 小猫卡片 */}
        <motion.button
          onClick={() => handleSelect('cat')}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '28px 24px',
            borderRadius: '28px',
            background: selected === 'cat'
              ? 'linear-gradient(135deg, #FFF0E0, var(--color-primary-light))'
              : '#FFFFFF',
            border: selected === 'cat'
              ? '2.5px solid var(--color-cat)'
              : '2px solid #F0E6DC',
            boxShadow: selected === 'cat'
              ? '0 8px 32px rgba(246, 178, 107, 0.25)'
              : '0 4px 16px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            minWidth: '130px'
          }}
        >
            <motion.div
            animate={selected === 'cat' ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <img
              src="./assets/avatar-cat.png"
              alt=""
              style={{
                width: '72px',
                height: '72px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: selected === 'cat' ? '2.5px solid var(--color-cat)' : '2px solid #F0E6DC',
                background: '#FFFFFF'
              }}
            />
          </motion.div>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: selected === 'cat' ? '#D49142' : 'var(--color-text-secondary)'
          }}>
            小猫
          </span>
        </motion.button>

        {/* 小鱼卡片 */}
        <motion.button
          onClick={() => handleSelect('fish')}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '28px 24px',
            borderRadius: '28px',
            background: selected === 'fish'
              ? 'linear-gradient(135deg, #E0F5F6, #D0EBED)'
              : '#FFFFFF',
            border: selected === 'fish'
              ? '2.5px solid var(--color-fish)'
              : '2px solid #F0E6DC',
            boxShadow: selected === 'fish'
              ? '0 8px 32px rgba(168, 218, 220, 0.35)'
              : '0 4px 16px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            minWidth: '130px'
          }}
        >
          <motion.div
            animate={selected === 'fish' ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <img
              src="./assets/avatar-fish.png"
              alt=""
              style={{
                width: '72px',
                height: '72px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: selected === 'fish' ? '2.5px solid var(--color-fish)' : '2px solid #F0E6DC',
                background: '#FFFFFF'
              }}
            />
          </motion.div>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: selected === 'fish' ? '#5A9FA3' : 'var(--color-text-secondary)'
          }}>
            小鱼
          </span>
        </motion.button>
      </div>

      {/* 确认按钮 */}
      <AnimatePresence>
        {selected && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleConfirm}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 48px',
              borderRadius: '9999px',
              border: 'none',
              background: selected === 'cat'
                ? 'linear-gradient(135deg, var(--color-cat), var(--color-accent))'
                : 'linear-gradient(135deg, var(--color-fish), var(--color-fish-dark))',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: selected === 'cat'
                ? '0 8px 24px rgba(246, 178, 107, 0.35)'
                : '0 8px 24px rgba(168, 218, 220, 0.4)'
            }}
          >
            {confirming ? '好的~' : `我是${selected === 'cat' ? '小猫' : '小鱼'}`}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 可以后面改 */}
      <p style={{
        position: 'absolute',
        bottom: '24px',
        fontSize: '12px',
        color: 'var(--color-text-tertiary)'
      }}>
        之后可以在设置中切换身份
      </p>
    </motion.div>
  )
}
