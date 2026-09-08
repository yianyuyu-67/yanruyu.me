import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FoodRecordIcon, RankingIcon, ListIcon } from '../../components/icons/CatFishIcons'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'

const items = [
  {
    path: '/food/records',
    title: '美食记录',
    subtitle: '吃饭留痕',
    icon: FoodRecordIcon,
    iconBg: 'linear-gradient(135deg, #FFE8D0, #FFD8C2)',
    accent: 'var(--color-cat)'
  },
  {
    path: '/food/ranking',
    title: '美食排行榜',
    subtitle: '厨神争霸赛',
    icon: RankingIcon,
    iconBg: 'linear-gradient(135deg, #FFF3DA, #FFE0A8)',
    accent: 'var(--color-star)'
  },
  {
    path: '/food/wish',
    title: '想吃清单',
    subtitle: '下次去吃这些吧',
    icon: ListIcon,
    iconBg: 'linear-gradient(135deg, #D6EBEC, #A8DADC)',
    accent: 'var(--color-fish)'
  }
]

export default function FoodPage() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div className="theme-food" style={{ padding: '0 20px' }}>
        <div style={{
          paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
          paddingBottom: '20px'
        }}>
          <div className="eyebrow" style={{ marginBottom: '4px' }}>FOOD DIARY</div>
          <h1 className="serif" style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px'
          }}>
            小猫吃鱼
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            喜欢就是在一起吃很多很多饭
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
                  className="dashed-card"
                  style={{
                    width: '100%',
                    padding: '18px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: item.iconBg,
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
