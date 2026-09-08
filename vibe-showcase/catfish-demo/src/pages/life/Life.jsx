import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MovieIcon, TravelIcon } from '../../components/icons/CatFishIcons'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'

const items = [
  {
    path: '/life/movies',
    title: '电影打卡',
    subtitle: '记录一起看的电影',
    icon: MovieIcon,
    bg: 'linear-gradient(135deg, var(--color-fish-light) 0%, #D0E8EA 100%)',
    accent: 'var(--color-fish)'
  },
  {
    path: '/life/travel',
    title: '旅行',
    subtitle: '一起去过的地方和想去的地方',
    icon: TravelIcon,
    bg: 'linear-gradient(135deg, #FFF5EE 0%, #FFE8DC 100%)',
    accent: 'var(--color-cat)'
  }
]

export default function LifePage() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
          paddingBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px'
          }}>
            小猫钓鱼
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            记录一起经历的生活
          </p>
        </div>

        <StaggerContainer>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <StaggerItem key={item.path}>
                <motion.button
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    borderRadius: '24px',
                    background: item.bg,
                    padding: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 4px 16px rgba(255, 159, 139, 0.06)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={36} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '17px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      marginBottom: '2px'
                    }}>
                      {item.title}
                    </h2>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 5 L13 10 L7 15" stroke={item.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}
