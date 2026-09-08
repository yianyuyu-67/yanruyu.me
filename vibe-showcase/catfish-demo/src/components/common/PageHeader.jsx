import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BackIcon } from '../icons/CatFishIcons'

export default function PageHeader({ title, subtitle, eyebrow, showBack = true }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        paddingBottom: '12px',
        paddingHorizontal: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(139, 111, 71, 0.08)',
            flexShrink: 0
          }}
        >
          <BackIcon size={20} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        {eyebrow && (
          <div className="eyebrow" style={{ marginBottom: '2px' }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
          fontFamily: eyebrow ? 'var(--font-serif)' : 'inherit'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginTop: '2px'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
