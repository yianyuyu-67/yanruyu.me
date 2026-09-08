import React from 'react'
import { motion } from 'framer-motion'
import { EmptyStateIcon } from '../icons/CatFishIcons'

export function EmptyState({ message = '还没有记录，快来添加吧' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px'
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <EmptyStateIcon size={120} />
      </motion.div>
      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-tertiary)',
        textAlign: 'center'
      }}>
        {message}
      </p>
    </motion.div>
  )
}

export function LoadingState({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="dashed-card" style={{ marginBottom: 0 }}>
          <div style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* 左侧小图占位（80×80） */}
            <div className="skeleton" style={{
              width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0
            }} />
            {/* 右侧文本占位 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="skeleton" style={{ height: '15px', width: '70%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '12px', width: '45%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message = '出了点小问题，请稍后重试', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px'
      }}
    >
      <p style={{ fontSize: '14px', color: '#E8857A' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'var(--color-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          重新加载
        </button>
      )}
    </motion.div>
  )
}
