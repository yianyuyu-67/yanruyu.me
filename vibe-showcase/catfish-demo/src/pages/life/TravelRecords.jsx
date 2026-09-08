import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { travelApi, wishTravelApi } from '../../lib/supabase'
import { useToast } from '../../components/common/Toast'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'
import PageHeader from '../../components/common/PageHeader'
import PhotoUpload from '../../components/common/PhotoUpload'
import { PlusIcon, TrashIcon, CloseIcon, CheckIcon, CatFishLogo } from '../../components/icons/CatFishIcons'
import { EmptyState, LoadingState } from '../../components/common/States'
import { formatDateDot } from '../../lib/config'

export default function TravelRecords({ defaultTab = 'records', title = '旅行', subtitle = '一起去过的地方和想去的地方' }) {
  const [tab, setTab] = useState(defaultTab)
  const [records, setRecords] = useState([])
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showWishForm, setShowWishForm] = useState(false)
  const [celebrating, setCelebrating] = useState(null)
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [travelData, wishData] = await Promise.all([
        travelApi.getAll(),
        wishTravelApi.getAll()
      ])
      setRecords(travelData || [])
      setWishes(wishData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const pendingWishes = wishes.filter(i => i.status === 'pending')
  const completedWishes = wishes.filter(i => i.status === 'completed')

  const handleDeleteRecord = async (id) => {
    try {
      await travelApi.remove(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      toast('回忆已移除')
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleAddRecord = async (formData) => {
    try {
      const newRecord = await travelApi.create(formData)
      setRecords(prev => [newRecord, ...prev])
      setShowForm(false)
      toast()
    } catch (err) {
      alert('保存失败')
    }
  }

  const handleAddWish = async (location, note) => {
    try {
      const item = await wishTravelApi.create(location, note)
      setWishes(prev => [item, ...prev])
      setShowWishForm(false)
      toast('加入想去清单啦')
    } catch (err) {
      alert('添加失败')
    }
  }

  const handleDeleteWish = async (id) => {
    try {
      await wishTravelApi.remove(id)
      setWishes(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleVisited = async (id) => {
    try {
      const updated = await wishTravelApi.complete(id)
      setCelebrating(updated)
      setTimeout(() => setCelebrating(null), 1800)
      setWishes(prev => prev.map(i => i.id === id ? updated : i))
    } catch (err) {
      alert('操作失败')
    }
  }

  return (
    <PageTransition>
      <div style={{ padding: '0 20px' }}>
        <PageHeader title={title} subtitle={subtitle} />

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
          <TabButton active={tab === 'records'} onClick={() => setTab('records')}>
            旅行记录
          </TabButton>
          <TabButton active={tab === 'wish'} onClick={() => setTab('wish')}>
            想去旅行 ({pendingWishes.length})
          </TabButton>
        </div>

        {loading ? (
          <LoadingState count={3} />
        ) : tab === 'records' ? (
          records.length === 0 ? (
            <EmptyState message="还没有旅行记录，快来添加第一次旅行吧" />
          ) : (
            <StaggerContainer>
              {records.map((record) => (
                <StaggerItem key={record.id}>
                  <TravelCard record={record} onDelete={() => handleDeleteRecord(record.id)} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )
        ) : (
          /* ====== 想去旅行 Tab：上半部分 pending + 下半部分 completed ====== */
          <>
            {/* --- 上半部分：想去清单 --- */}
            {pendingWishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: 'center',
                  marginBottom: '16px',
                  padding: '14px 12px',
                  background: 'linear-gradient(135deg, var(--color-fish-light), #D4E8EA)',
                  borderRadius: '16px'
                }}
              >
                <p style={{ fontSize: '14px', color: '#5A8082', fontWeight: '500' }}>
                  还有{' '}
                  <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-fish-dark)' }}>
                    {pendingWishes.length}
                  </span>
                  {' '}个想去的地方
                </p>
              </motion.div>
            )}
            {pendingWishes.length === 0 && completedWishes.length === 0 ? (
              <EmptyState message="还没有想去的旅行，加一些吧" />
            ) : pendingWishes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '24px 12px',
                  color: '#B0C0C2',
                  fontSize: '13px'
                }}
              >
                所有想去的地方都去啦，加一些新的吧
              </motion.div>
            ) : (
              <StaggerContainer>
                <AnimatePresence>
                  {pendingWishes.map((item) => (
                    <StaggerItem key={item.id}>
                      <motion.div
                        layout
                        exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '20px',
                          padding: '16px',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 2px 16px rgba(255, 159, 139, 0.06)'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--color-fish-light), #D0E8EA)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="7" fill="var(--color-fish)" opacity="0.7"/>
                            <path d="M4 9 Q10 6 16 9 M4 11 Q10 8 16 11" stroke="var(--color-fish-dark)" strokeWidth="0.8" fill="none"/>
                            <ellipse cx="10" cy="10" rx="2.5" ry="7" stroke="var(--color-fish-dark)" strokeWidth="0.8" fill="none"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                            {item.location}
                          </h3>
                          {item.note && (
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              {item.note}
                            </p>
                          )}
                          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                            {formatDateDot(item.created_at)}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleVisited(item.id)}
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
                          <CheckIcon size={14} />
                          去过啦
                        </motion.button>
                        <button
                          onClick={() => handleDeleteWish(item.id)}
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
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            )}

            {/* --- 下半部分：我们去过（回忆墙） --- */}
            {completedWishes.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                {/* 分隔标题 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    padding: '0 4px'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #D4E8EA, transparent)' }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, var(--color-fish-light), #D4E8EA)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1 L7 4.5 L10.5 6 L7 7.5 L6 11 L5 7.5 L1.5 6 L5 4.5 Z" fill="var(--color-fish-dark)"/>
                    </svg>
                    <span style={{ fontSize: '13px', color: '#5A8082', fontWeight: '600' }}>
                      我们去过 ({completedWishes.length})
                    </span>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #D4E8EA, transparent)' }} />
                </motion.div>

                <StaggerContainer>
                  {completedWishes.map((item) => (
                    <StaggerItem key={item.id}>
                      <CompletedTravelCard
                        item={item}
                        onDelete={() => handleDeleteWish(item.id)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            )}
          </>
        )}

        {/* Add Button */}
        <motion.button
          onClick={() => tab === 'records' ? setShowForm(true) : setShowWishForm(true)}
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
                  {celebrating.location}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <TravelFormModal onSubmit={handleAddRecord} onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWishForm && (
            <WishTravelFormModal onSubmit={handleAddWish} onClose={() => setShowWishForm(false)} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

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
        fontSize: '14px',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.3s'
      }}
    >
      {children}
    </motion.button>
  )
}

function TravelCard({ record, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 4px 24px rgba(255, 159, 139, 0.08)'
      }}
    >
      {record.photo_url && (
        <div style={{
          width: '100%',
          aspectRatio: '4/3',
          overflow: 'hidden',
          background: '#F5EDE5',
          position: 'relative'
        }}>
          <img
            src={record.photo_url}
            alt={record.location}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          {/* Location overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: '9999px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-primary)'
            }}>
              {record.location}
            </span>
          </div>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {!record.photo_url && (
          <h3 style={{
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '4px'
          }}>
            {record.location}
          </h3>
        )}
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
          {formatDate(record.date)}
        </p>

        {record.note && (
          <p style={{
            fontSize: '14px',
            color: '#6B6B6B',
            lineHeight: 1.6,
            marginTop: '8px',
            padding: '10px 12px',
            background: 'var(--color-bg)',
            borderRadius: '12px'
          }}>
            {record.note}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '6px 16px', borderRadius: '9999px', background: '#F5EDE5', color: 'var(--color-text-secondary)', fontSize: '12px' }}
              >
                取消
              </button>
              <button
                onClick={onDelete}
                style={{ padding: '6px 16px', borderRadius: '9999px', background: '#E8857A', color: '#FFFFFF', fontSize: '12px' }}
              >
                确认删除
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', color: 'var(--color-text-tertiary)', fontSize: '12px' }}
            >
              <TrashIcon size={14} />
              <span>删除</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TravelFormModal({ onSubmit, onClose }) {
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [photoUrl, setPhotoUrl] = useState(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location.trim()) {
      alert('请输入旅行地点')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        location: location.trim(),
        date,
        photo_url: photoUrl,
        note: note.trim() || null
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 200 }}
      />
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--color-bg)', borderRadius: '28px 28px 0 0',
          padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '85vh', overflowY: 'auto', zIndex: 201
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>添加旅行记录</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <PhotoUpload onPhotoChange={setPhotoUrl} photoUrl={photoUrl} module="travel" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px' }}>旅行地点</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="去了哪里？" maxLength={50} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px' }}>旅行日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px' }}>旅行评价</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="旅行感受..." maxLength={200} rows={3} style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none' }} />
          </div>
          <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }} style={{ width: '100%', height: '52px', borderRadius: '26px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', boxShadow: '0 8px 24px rgba(255, 159, 139, 0.3)', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '保存中...' : '保存回忆'}
          </motion.button>
        </form>
      </motion.div>
    </>
  )
}

function WishTravelFormModal({ onSubmit, onClose }) {
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location.trim()) {
      alert('请输入想去的地方')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(location.trim(), note.trim() || null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 200 }} />
      <motion.div
        initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-bg)', borderRadius: '28px 28px 0 0', padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', zIndex: 201 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>添加想去旅行</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px' }}>想去的地方</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="想去哪里？" maxLength={50} autoFocus style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px' }}>备注</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="有什么想说的..." maxLength={200} rows={2} style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none' }} />
          </div>
          <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }} style={{ width: '100%', height: '52px', borderRadius: '26px', border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', boxShadow: '0 8px 24px rgba(255, 159, 139, 0.3)', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '保存中...' : '加入清单'}
          </motion.button>
        </form>
      </motion.div>
    </>
  )
}

const inputStyle = {
  width: '100%',
  height: '48px',
  padding: '0 16px',
  borderRadius: '16px',
  border: '1.5px solid #F0E6DC',
  background: '#FFFFFF',
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  outline: 'none'
}

// =====================
// Completed Travel Wish Card - Memory Wall Style
// =====================
function CompletedTravelCard({ item, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      style={{
        background: 'linear-gradient(135deg, var(--color-fish-light) 0%, #D4E8EA 100%)',
        borderRadius: '20px',
        padding: '18px 16px',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(168, 218, 220, 0.15)'
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
        background: 'rgba(123, 184, 188, 0.2)'
      }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M6 1 L7 4.5 L10.5 6 L7 7.5 L6 11 L5 7.5 L1.5 6 L5 4.5 Z" fill="var(--color-fish-dark)"/>
        </svg>
        <span style={{ fontSize: '10px', color: '#5A8082', fontWeight: '600' }}>已去过</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" fill="var(--color-fish)" opacity="0.6"/>
            <path d="M4 9 Q10 6 16 9 M4 11 Q10 8 16 11" stroke="var(--color-fish-dark)" strokeWidth="0.8" fill="none"/>
            <ellipse cx="10" cy="10" rx="2.5" ry="7" stroke="var(--color-fish-dark)" strokeWidth="0.8" fill="none"/>
          </svg>
        </div>

        <div style={{ flex: 1, paddingTop: '2px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#3A6A6E',
            marginBottom: '10px',
            paddingRight: '60px'
          }}>
            {item.location}
          </h3>

          {item.note && (
            <p style={{
              fontSize: '12px',
              color: '#5A8082',
              marginBottom: '8px',
              lineHeight: 1.5
            }}>
              {item.note}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#8AABAE' }}>想去</span>
              <span style={{ fontSize: '12px', color: '#5A8082', fontWeight: '500' }}>
                {formatDateDot(item.created_at)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 1 L7 4.5 L10.5 6 L7 7.5 L6 11 L5 7.5 L1.5 6 L5 4.5 Z" fill="var(--color-fish-dark)"/>
              </svg>
              <span style={{ fontSize: '11px', color: '#8AABAE' }}>去过</span>
              <span style={{ fontSize: '12px', color: 'var(--color-fish-dark)', fontWeight: '600' }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', color: '#A0C0C2', fontSize: '11px', border: 'none', background: 'transparent' }}
          >
            <TrashIcon size={12} />
            <span>删除</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
