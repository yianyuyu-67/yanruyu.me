import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CatFishLogo } from '../icons/CatFishIcons'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.show
}

const toastMessages = [
  '这一份回忆收藏成功啦',
  '又一个美好瞬间被保存了',
  '记录成功，猫和鱼都很开心',
  '这份记忆已存入小盒子',
  '收藏成功，继续创造回忆吧'
]

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const show = useCallback((message) => {
    const msg = message || toastMessages[Math.floor(Math.random() * toastMessages.length)]
    setToast({ id: Date.now(), message: msg })
    setTimeout(() => setToast(null), 2200)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              bottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '9999px',
              boxShadow: '0 8px 32px rgba(255, 159, 139, 0.2)',
              border: '1px solid rgba(255, 216, 194, 0.3)',
              maxWidth: '90vw'
            }}
          >
            <CatFishLogo size={36} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap'
            }}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}
