import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wishFoodApi } from '../../lib/supabase'
import { useToast } from '../../components/common/Toast'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'
import PageHeader from '../../components/common/PageHeader'
import { PlusIcon, TrashIcon, CloseIcon, CheckIcon, CatFishLogo } from '../../components/icons/CatFishIcons'
import { EmptyState, LoadingState } from '../../components/common/States'
import { formatDateDot } from '../../lib/config'

export default function WishFood() {
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [celebrating, setCelebrating] = useState(null)
  const [kbOffset, setKbOffset] = useState(0)
  const inputRef = useRef(null)
  const toast = useToast()

  // 键盘弹出时用 visualViewport 检测高度，让弹窗上移避开键盘
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const onResize = () => {
      const h = window.innerHeight - viewport.height
      setKbOffset(h > 0 ? h : 0)
    }
    viewport.addEventListener('resize', onResize)
    viewport.addEventListener('scroll', onResize)
    return () => {
      viewport.removeEventListener('resize', onResize)
      viewport.removeEventListener('scroll', onResize)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await wishFoodApi.getAll()
      setItems(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const pendingItems = items.filter(i => i.status === 'pending')
  const completedItems = items.filter(i => i.status === 'completed')

  const handleAdd = async (e) => {
    e?.preventDefault()
    if (!newName.trim()) return
    try {
      const item = await wishFoodApi.create(newName.trim())
      setItems(prev => [item, ...prev])
      setNewName('')
      setShowAdd(false)
      toast('加入想吃清单啦')
    } catch (err) {
      alert('添加失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await wishFoodApi.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleEaten = async (id) => {
    try {
      const updated = await wishFoodApi.complete(id)
      setCelebrating(updated)
      setTimeout(() => setCelebrating(null), 1800)
      setItems(prev => prev.map(i => i.id === id ? updated : i))
    } catch (err) {
      alert('操作失败')
    }
  }

  return (
    <PageTransition>
      <div className="theme-food" style={{ padding: '0 20px' }}>
        <PageHeader eyebrow="NEXT TIME" title="想吃清单" subtitle="下次一起吃这些吧" />

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: '#FFFFFF',
          padding: '4px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(255, 159, 139, 0.06)'
        }}>
          <TabButton active={tab === 'pending'} onClick={() => setTab('pending')}>
            下次一起吃 ({pendingItems.length})
          </TabButton>
          <TabButton active={tab === 'completed'} onClick={() => setTab('completed')}>
            我们实现过 ({completedItems.length})
          </TabButton>
        </div>

        {loading ? (
          <LoadingState count={4} />
        ) : tab === 'pending' ? (
          <>
            {pendingItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  padding: '14px 12px',
                  background: 'linear-gradient(135deg, var(--color-bg), #FFE8DC)',
                  borderRadius: '16px'
                }}
              >
                <p style={{ fontSize: '14px', color: 'var(--color-on-primary)', fontWeight: '500' }}>
                  还有{' '}
                  <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-accent)' }}>
                    {pendingItems.length}
                  </span>
                  {' '}个小愿望等待实现
                </p>
              </motion.div>
            )}

            {pendingItems.length === 0 ? (
              <EmptyState message="所有小愿望都实现啦，加一些新的吧" />
            ) : (
              <StaggerContainer>
                <AnimatePresence>
                  {pendingItems.map((item) => (
                    <StaggerItem key={item.id}>
                      <WishPendingCard
                        item={item}
                        onEaten={() => handleEaten(item.id)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            )}
          </>
        ) : (
          completedItems.length === 0 ? (
            <EmptyState message="还没有实现过的小愿望，加油呀" />
          ) : (
            <StaggerContainer>
              {completedItems.map((item) => (
                <StaggerItem key={item.id}>
                  <WishCompletedCard
                    item={item}
                    onDelete={() => handleDelete(item.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )
        )}

        {/* Add Button */}
        <motion.button
          onClick={() => setShowAdd(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          style={{
            position: 'fixed',
            right: '20px',
            bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            boxShadow: '0 8px 24px rgba(255, 159, 139, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <PlusIcon size={28} />
        </motion.button>

        {/* Add Modal */}
        <AnimatePresence>
          {showAdd && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAdd(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 200
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  position: 'fixed',
                  bottom: kbOffset,
                  left: 0,
                  right: 0,
                  background: 'var(--color-bg)',
                  borderRadius: '28px 28px 0 0',
                  padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
                  zIndex: 201,
                  transition: 'bottom 0.2s ease-out'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    添加想吃清单
                  </h2>
                  <button
                    onClick={() => setShowAdd(false)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onFocus={() => {
                      setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
                    }}
                    placeholder="想吃什么？"
                    maxLength={50}
                    autoFocus
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 16px',
                      borderRadius: '16px',
                      border: '1.5px solid #F0E6DC',
                      background: '#FFFFFF',
                      fontSize: '15px',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      marginBottom: '16px'
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '26px',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 8px 24px rgba(255, 159, 139, 0.3)'
                    }}
                  >
                    加入清单
                  </motion.button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.35)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CatFishLogo size={120} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--color-accent)',
                    marginTop: '12px'
                  }}
                >
                  小愿望完成啦
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-on-primary)',
                    marginTop: '4px'
                  }}
                >
                  {celebrating.name}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

// =====================
// Tab Button
// =====================
function TabButton({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        flex: 1,
        height: '40px',
        borderRadius: '12px',
        background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent',
        color: active ? '#FFFFFF' : 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.3s',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </motion.button>
  )
}

// =====================
// Pending Wish Card
// =====================
function WishPendingCard({ item, onEaten, onDelete }) {
  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      className="dashed-card"
      style={{
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #FFF0E5, var(--color-primary-light))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <ellipse cx="10" cy="11" rx="7" ry="5" fill="var(--color-cat)" opacity="0.7"/>
          <path d="M5 8 L3 5 L7 7 Z M15 8 L17 5 L13 7 Z" fill="var(--color-cat)" opacity="0.7"/>
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '500',
          color: 'var(--color-text-primary)'
        }}>
          {item.name}
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
          {formatDateDot(item.created_at)}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={onEaten}
        style={{
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          border: 'none'
        }}
      >
        <HeartIcon size={12} />
        吃过啦
      </motion.button>

      <button
        onClick={onDelete}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: 'none',
          background: 'transparent'
        }}
      >
        <TrashIcon size={16} />
      </button>
    </motion.div>
  )
}

// =====================
// Completed Wish Card - Memory Wall Style
// =====================
function WishCompletedCard({ item, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      className="dashed-card"
      style={{
        background: 'linear-gradient(135deg, var(--color-card-alt) 0%, var(--peach-light) 100%)',
        padding: '18px 16px',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Completion badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '9999px',
        background: 'rgba(255, 159, 139, 0.15)'
      }}>
        <SparkleIcon size={12} />
        <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: '600' }}>已实现</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Cat-fish mini illustration */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="11" rx="7" ry="5" fill="var(--color-cat)" opacity="0.6"/>
            <path d="M5 8 L3 5 L7 7 Z M15 8 L17 5 L13 7 Z" fill="var(--color-cat)" opacity="0.6"/>
            <path d="M8 10 Q9 9 10 10 M11 10 Q12 9 13 10" stroke="var(--color-text-primary)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        <div style={{ flex: 1, paddingTop: '2px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#5A4035',
            marginBottom: '10px',
            paddingRight: '60px'
          }}>
            {item.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-on-primary-light)' }}>想吃</span>
              <span style={{ fontSize: '12px', color: 'var(--color-on-primary)', fontWeight: '500' }}>
                {formatDateDot(item.created_at)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SparkleIcon size={11} />
              <span style={{ fontSize: '11px', color: 'var(--color-on-primary-light)' }}>实现</span>
              <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: '600' }}>
                {item.completed_at ? formatDateDot(item.completed_at) : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete - bottom right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ padding: '4px 12px', borderRadius: '9999px', background: 'rgba(255,255,255,0.6)', color: 'var(--color-text-secondary)', fontSize: '11px', border: 'none' }}
            >
              取消
            </button>
            <button
              onClick={onDelete}
              style={{ padding: '4px 12px', borderRadius: '9999px', background: '#E8857A', color: '#FFFFFF', fontSize: '11px', border: 'none' }}
            >
              确认删除
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', color: 'var(--color-text-tertiary)', fontSize: '11px', border: 'none', background: 'transparent' }}
          >
            <TrashIcon size={12} />
            <span>删除</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// =====================
// Small inline icons
// =====================
function HeartIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 10.5 Q1.5 7.5 1.5 4.5 Q1.5 2.5 3.5 2.5 Q5 2.5 6 4 Q7 2.5 8.5 2.5 Q10.5 2.5 10.5 4.5 Q10.5 7.5 6 10.5 Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

function SparkleIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 1 L7 4.5 L10.5 6 L7 7.5 L6 11 L5 7.5 L1.5 6 L5 4.5 Z"
        fill="var(--color-accent)"
      />
    </svg>
  )
}
