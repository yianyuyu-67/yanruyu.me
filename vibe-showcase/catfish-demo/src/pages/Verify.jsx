import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VerifyPage({ onVerify }) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500)
  }, [])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (answer === 'demo') {   // 演示构建：真实验证码已移除
      onVerify(answer)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => {
        setAnswer('')
        setError(false)
      }, 1500)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, var(--color-bg) 0%, #FFE8DC 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating bubbles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(246, 178, 107, 0.08)' : 'rgba(168, 218, 220, 0.08)',
            width: `${40 + i * 20}px`,
            height: `${40 + i * 20}px`,
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5
          }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
        style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="./assets/avatar-cat.png"
            alt=""
            style={{
              width: '88px',
              height: '88px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #FFFFFF',
              boxShadow: '0 4px 16px rgba(246, 178, 107, 0.25)',
              marginRight: '-18px',
              zIndex: 1
            }}
          />
          <img
            src="./assets/avatar-fish.png"
            alt=""
            style={{
              width: '88px',
              height: '88px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #FFFFFF',
              boxShadow: '0 4px 16px rgba(168, 218, 220, 0.3)'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}
      >
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
          letterSpacing: '2px'
        }}>
          猫&鱼
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          letterSpacing: '1px'
        }}>
          两个人共同保存生活回忆的小空间
        </p>
      </motion.div>

      {/* Input */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0
        }}
        transition={{
          opacity: { delay: 0.7, duration: 0.4 },
          y: { delay: 0.7, duration: 0.4 },
          x: { duration: 0.5 }
        }}
        style={{
          width: '100%',
          maxWidth: '280px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          请输入我们的秘密答案
        </p>
        <button
          type="button"
          onClick={() => setShowHint(v => !v)}
          style={{
            display: 'block',
            margin: '-8px auto 16px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent)',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '0.5px'
          }}
        >
          {showHint ? '收起密码提示 ▲' : '密码提示 ›'}
        </button>
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                overflow: 'hidden',
                marginBottom: '4px'
              }}
            >
              <div style={{
                background: 'rgba(255, 216, 194, 0.25)',
                border: '1px dashed var(--color-accent)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                lineHeight: 1.6
              }}>
                易安予鱼家族祖传密码构成方式
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value.replace(/\D/g, ''))
            setError(false)
          }}
          maxLength={6}
          placeholder="······"
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            border: `2px solid ${error ? '#E8857A' : 'var(--color-primary)'}`,
            background: '#FFFFFF',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '8px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            boxShadow: error ? '0 0 0 4px rgba(232, 133, 122, 0.1)' : '0 4px 16px rgba(255, 159, 139, 0.08)'
          }}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: '12px',
                color: '#E8857A',
                textAlign: 'center',
                marginTop: '12px'
              }}
            >
              答案不对哦，再想想？
            </motion.p>
          )}
        </AnimatePresence>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={answer.length < 6}
          style={{
            width: '100%',
            height: '50px',
            borderRadius: '25px',
            border: 'none',
            background: answer.length >= 6
              ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
              : '#F0E6DC',
            color: answer.length >= 6 ? '#FFFFFF' : 'var(--color-text-tertiary)',
            fontSize: '15px',
            fontWeight: '600',
            marginTop: '20px',
            cursor: answer.length >= 6 ? 'pointer' : 'default',
            transition: 'background 0.3s, color 0.3s',
            boxShadow: answer.length >= 6 ? '0 8px 24px rgba(255, 159, 139, 0.3)' : 'none'
          }}
        >
          进入我们的小空间
        </motion.button>
      </motion.form>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.5px'
        }}
      >
        猫陪着鱼 · 一起保存每一个小瞬间
      </motion.p>
    </div>
  )
}
