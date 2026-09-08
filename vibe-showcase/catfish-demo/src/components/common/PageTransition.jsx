import React from 'react'
import { motion } from 'framer-motion'

// Page transition wrapper - fade + translateY (iOS style)
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for list items
export function StaggerContainer({ children, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: delay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger item（展示页补丁：透传 data-* 标记给引导演示用）
export function StaggerItem({ children, ...rest }) {
  return (
    <motion.div
      {...rest}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 200, damping: 20 }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Swipe to delete wrapper
export function SwipeToDelete({ children, onDelete, threshold = 80 }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (info.offset.x < -threshold) {
          onDelete()
        }
      }}
      whileDrag={{ scale: 0.98 }}
      style={{ position: 'relative' }}
    >
      {children}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        <span style={{ color: '#E8857A', fontSize: '13px', fontWeight: '500' }}>删除</span>
      </motion.div>
    </motion.div>
  )
}
