import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/food', label: '美食' },
  { path: '/life', label: '生活' }
]

const iconMap = {
  '/': './assets/nav-home.png',
  '/food': './assets/nav-food.png',
  '/life': './assets/nav-life.png'
}

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        background: location.pathname === '/' ? 'transparent' : '#CCE0F5',
        borderTop: 'none'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 12px'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 16px',
                borderRadius: '14px',
                transition: 'background 0.2s',
                background: isActive ? 'rgba(181, 139, 107, 0.12)' : 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <img
                src={iconMap[item.path]}
                alt={item.label}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  opacity: isActive ? 1 : 0.55,
                  transition: 'opacity 0.2s, transform 0.2s',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}
