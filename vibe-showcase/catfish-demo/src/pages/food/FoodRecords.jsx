import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { foodApi } from '../../lib/supabase'
import { useIdentity } from '../../hooks/useIdentity'
import { useToast } from '../../components/common/Toast'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'
import PageHeader from '../../components/common/PageHeader'
import ScoreSlider from '../../components/common/ScoreSlider'
import PhotoUpload from '../../components/common/PhotoUpload'
import { CommentSection } from '../../components/common/CommentSection'
import { PlusIcon, StarIcon, CloseIcon, CameraIcon } from '../../components/icons/CatFishIcons'
import { EmptyState, LoadingState, ErrorState } from '../../components/common/States'
import {
  FOOD_CATEGORIES, CATEGORY_ORDER, getDims,
  personAvg, personDone, totalScore, buildScoresObject, weightedAvg
} from '../../lib/foodScore'

export default function FoodRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [supplementRecord, setSupplementRecord] = useState(null)
  const { identity } = useIdentity()
  const toast = useToast()

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await foodApi.getAll()
      setRecords(data || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleDelete = async (id) => {
    try {
      await foodApi.remove(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      toast('回忆已移除')
    } catch (err) {
      alert('删除失败，请重试')
    }
  }

  const handleAdd = async (formData) => {
    try {
      const newRecord = await foodApi.create(formData)
      setRecords(prev => [newRecord, ...prev])
      setShowForm(false)
      toast()
    } catch (err) {
      alert('保存失败，请重试')
    }
  }

  // 美食表单内部分人提交时同步到列表，不关闭弹窗
  const handleUpsert = (rec) => {
    setRecords(prev => {
      const exists = prev.some(r => r.id === rec.id)
      return exists ? prev.map(r => (r.id === rec.id ? rec : r)) : [rec, ...prev]
    })
  }

  const handleSupplement = async (id, fields) => {
    try {
      const updated = await foodApi.update(id, fields)
      setRecords(prev => prev.map(r => (r.id === id ? updated : r)))
    } catch (err) {
      alert('保存失败，请重试')
    }
  }

  return (
    <PageTransition>
      <div className="theme-food" style={{ padding: '0 20px' }}>
        <PageHeader eyebrow="FOOD DIARY" title="我们的美食手账" subtitle="一起吃过的每一餐" />

        {loading ? (
          <LoadingState count={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadRecords} />
        ) : records.length === 0 ? (
          <EmptyState message="还没有美食记录，快来添加第一餐吧" />
        ) : (
          <StaggerContainer>
            {records.map((record) => (
              <StaggerItem key={record.id} data-demo="record">
                <FoodCard
                  record={record}
                  onDelete={() => handleDelete(record.id)}
                  onEdit={() => setEditingRecord(record)}
                  onSupplement={() => setSupplementRecord(record)}
                  identity={identity}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Floating Add Button */}
        <motion.button
          data-demo="add"
          onClick={() => setShowForm(true)}
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

        {/* Add Form Modal */}
        <AnimatePresence>
          {showForm && (
            <FoodFormModal
              onUpsert={handleUpsert}
              onClose={() => setShowForm(false)}
              identity={identity}
            />
          )}
        </AnimatePresence>

        {/* Edit Form Modal */}
        <AnimatePresence>
          {editingRecord && (
            <FoodFormModal
              record={editingRecord}
              onUpsert={handleUpsert}
              onClose={() => setEditingRecord(null)}
              identity={identity}
            />
          )}
        </AnimatePresence>

        {/* Supplement Score Modal */}
        <AnimatePresence>
          {supplementRecord && (
            <SupplementScoreModal
              record={supplementRecord}
              onSubmit={handleSupplement}
              onClose={() => setSupplementRecord(null)}
              identity={identity}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

function FoodCard({ record, onDelete, onEdit, onSupplement, identity }) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${week}`
  }

  const catAvg = personAvg(record, 'cat')
  const fishAvg = personAvg(record, 'fish')
  const catText = typeof catAvg === 'number' ? catAvg.toFixed(1) : '待评分'
  const fishText = typeof fishAvg === 'number' ? fishAvg.toFixed(1) : '待评分'
  const total = totalScore(record)
  const catMeta = FOOD_CATEGORIES[record.category] || FOOD_CATEGORIES.restaurant

  const canSupplement = identity && !personDone(record, identity)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      className="dashed-card"
      style={{ position: 'relative', marginBottom: '14px', overflow: 'hidden' }}
    >
      {/* 左滑后露出的编辑/删除背景层 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 1
        }}
      >
        <div
          style={{
            width: '140px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDeleteOpen(false); onEdit() }}
            style={{
              flex: 1,
              width: '100%',
              background: '#8B6F47',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('确定要删除这条美食回忆吗？')) {
                onDelete()
              }
            }}
            style={{
              flex: 1,
              width: '100%',
              background: 'var(--color-danger)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            删除
          </button>
        </div>
      </div>

      {/* 可拖拽的前景卡片 */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(e, info) => {
          if (info.offset.x < -60) {
            setDeleteOpen(true)
          } else {
            setDeleteOpen(false)
          }
        }}
        animate={{ x: deleteOpen ? -140 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{ position: 'relative', zIndex: 2, background: 'var(--color-card)', touchAction: 'pan-y' }}
        onClick={() => setDeleteOpen(false)}
      >
      {/* 横排：左侧小图 + 右侧内容 */}
      <div style={{ padding: '14px', display: 'flex', gap: '12px' }}>
        {/* 左侧小图（80×80） */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--color-bg-alt)',
          flexShrink: 0
        }}>
          {record.photo_url ? (
            <img
              src={record.photo_url}
              alt={record.restaurant_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--peach-light), var(--color-bg-alt))'
            }}>
              <CameraIcon size={28} color="#C8A98C" />
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'
              }}>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {record.restaurant_name}
                </h3>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '10px', color: 'var(--coffee-dark)',
                  background: 'var(--peach-light)', borderRadius: '9999px',
                  padding: '2px 8px', flexShrink: 0
                }}>
                  <span>{catMeta.emoji}</span>
                  <span>{catMeta.label}</span>
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                {formatDate(record.date)}
              </p>
              {record.category === 'cake' && record.cake_style && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  款式：{record.cake_style}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '10px', fontWeight: '500' }}>
                <span style={{ color: 'var(--color-cat)' }}>小猫 {catText}</span>
                <span style={{ color: 'var(--color-fish)' }}>小鱼 {fishText}</span>
              </div>
            </div>
            {/* 右上角评分徽章 / 去打分按钮 */}
            {canSupplement ? (
              <button
                onClick={(e) => { e.stopPropagation(); onSupplement() }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--peach)',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  color: 'var(--coffee-dark)',
                  fontSize: '10px',
                  fontWeight: '600',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <StarIcon size={11} filled />
                <span>去打分</span>
              </button>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: total != null ? 'var(--peach)' : 'var(--color-bg-alt)',
                borderRadius: '8px',
                padding: '3px 8px',
                color: total != null ? 'var(--coffee-dark)' : 'var(--color-text-tertiary)',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                {total != null ? (
                  <>{<StarIcon size={11} filled />}{total.toFixed(1)}</>
                ) : (
                  '待双人评分'
                )}
              </div>
            )}
          </div>

          {record.note && (
            <p style={{
              fontSize: '12px',
              color: 'var(--on-primary)',
              lineHeight: 1.5,
              marginTop: '8px',
              padding: '8px 10px',
              background: 'var(--peach-light)',
              borderRadius: '10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {record.note}
            </p>
          )}
        </div>
      </div>

      {/* 我们的留言（默认折叠，点击展开） */}
      <div style={{ padding: '0 14px 14px' }}>
        <CommentSection mealId={record.id} identity={identity} collapsible />
      </div>
      </motion.div>
    </motion.div>
  )
}

function FoodFormModal({ record, onUpsert, onClose, identity }) {
  const isEdit = !!record
  const initialRef = record

  const [restaurantName, setRestaurantName] = useState(record?.restaurant_name || '')
  const [date, setDate] = useState(
    record?.date
      ? new Date(record.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [category, setCategory] = useState(record?.category || 'restaurant')
  const [recordRef, setRecordRef] = useState(record || null)
  const [photoUrl, setPhotoUrl] = useState(record?.photo_url || '')
  const [note, setNote] = useState(record?.note || '')
  const [cakeStyle, setCakeStyle] = useState(record?.cake_style || '')
  const [scorer, setScorer] = useState(identity === 'fish' ? 'fish' : 'cat')
  const [ratingsByScorer, setRatingsByScorer] = useState(() => {
    if (record) {
      return {
        cat: { ...(record.cat_scores || {}) },
        fish: { ...(record.fish_scores || {}) }
      }
    }
    return { cat: {}, fish: {} }
  })
  const ratings = ratingsByScorer[scorer] || {}
  const [saving, setSaving] = useState(false)

  // 历史餐厅名（打字时联想）：打开弹窗时拉一次全部记录，取去重后的餐厅名
  const allNamesRef = useRef([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const nameTimerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await foodApi.getAll()
        if (cancelled) return
        const names = []
        const seen = new Set()
        list.forEach((r) => {
          const n = r.restaurant_name
          if (n && !seen.has(n)) {
            seen.add(n)
            names.push(n)
          }
        })
        allNamesRef.current = names
      } catch (e) {
        console.error('[food load names]', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleNameChange = (e) => {
    const val = e.target.value
    setRestaurantName(val)
    const q = val.trim().toLowerCase()
    if (!q) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const matches = allNamesRef.current
      .filter((n) => {
        const nl = n.toLowerCase()
        return nl.includes(q) && nl !== q
      })
      .slice(0, 8)
    setSuggestions(matches)
    setShowSuggestions(matches.length > 0)
  }

  const pickName = (name) => {
    setRestaurantName(name)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // 评分保存：编辑已有记录时点星星立即保存该身份分数；新增记录不写库，分数留在本地，等「完成」统一创建
  const recordRefRef = useRef(recordRef)
  recordRefRef.current = recordRef
  const ratingsByScorerRef = useRef(ratingsByScorer)
  ratingsByScorerRef.current = ratingsByScorer
  const savingRef = useRef(false)
  const pendingSaveRef = useRef(null)

  const dims = getDims(category)

  const switchScorer = (next) => {
    setScorer(next)
  }

  // 仅当记录已存在（编辑模式）时，点星星把当前身份维度分即时写库；新记录（recordRef 为空）不写，分数暂存本地
  const saveScore = useCallback(async (who, scoresObj) => {
    if (!recordRefRef.current || !recordRefRef.current.id) return
    if (savingRef.current) {
      pendingSaveRef.current = { who, scoresObj }
      return
    }
    savingRef.current = true
    try {
      const scoreAvg = weightedAvg(dims, scoresObj)
      const patch = who === 'cat'
        ? { cat_scores: scoresObj, rating_cat: scoreAvg }
        : { fish_scores: scoresObj, rating_fish: scoreAvg }
      const rec = await foodApi.update(recordRefRef.current.id, patch)
      recordRefRef.current = rec
      setRecordRef(rec)
      onUpsert(rec)
    } catch (err) {
      console.error('[food saveScore]', err)
      alert('保存失败，请重试')
    } finally {
      savingRef.current = false
      if (pendingSaveRef.current) {
        const p = pendingSaveRef.current
        pendingSaveRef.current = null
        saveScore(p.who, p.scoresObj)
      }
    }
  }, [onUpsert])

  const handleFinish = async () => {
    if (!restaurantName.trim()) {
      alert('请输入餐厅名称')
      return
    }
    setSaving(true)
    try {
      if (!recordRef) {
        // 新增：分数一直留在本地（ratingsByScorer），点「完成」才创建记录并带上双人分数
        const catObj = buildScoresObject(dims, ratingsByScorer.cat)
        const fishObj = buildScoresObject(dims, ratingsByScorer.fish)
        const rec = await foodApi.create({
          restaurant_name: restaurantName.trim(),
          date,
          category,
          cat_scores: Object.keys(catObj).length ? catObj : null,
          fish_scores: Object.keys(fishObj).length ? fishObj : null,
          rating_cat: Object.keys(catObj).length ? weightedAvg(dims, catObj) : null,
          rating_fish: Object.keys(fishObj).length ? weightedAvg(dims, fishObj) : null,
          rating: null,
          photo_url: photoUrl,
          note: note.trim() || null,
          cake_style: category === 'cake' ? (cakeStyle.trim() || null) : null
        })
        setRecordRef(rec)
        onUpsert(rec)
      } else {
        // 编辑已有记录：同步基础信息（分数已在编辑时点星星时即时保存）
        const rec = await foodApi.update(recordRef.id, {
          restaurant_name: restaurantName.trim(),
          date,
          category,
          photo_url: photoUrl,
          note: note.trim() || null,
          cake_style: category === 'cake' ? (cakeStyle.trim() || null) : null
        })
        setRecordRef(rec)
        onUpsert(rec)
      }
      onClose()
    } catch (err) {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const scorerMeta = {
    cat: { label: '小猫', color: '#F6B26B', bg: '#FFF8F1', text: '#D49142' },
    fish: { label: '小鱼', color: '#A8DADC', bg: '#F1FAFB', text: '#5A9FA3' }
  }[scorer]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-bg)',
          borderRadius: '28px 28px 0 0',
          padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '88vh',
          overflowY: 'auto',
          zIndex: 201
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            {isEdit ? '编辑美食记录' : '添加美食记录'}
          </h2>
          <button
            onClick={onClose}
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

        <div>
          {/* Photo Upload */}
          <div style={{ marginBottom: '16px' }}>
            <PhotoUpload onPhotoChange={setPhotoUrl} photoUrl={photoUrl} module="food" />
          </div>

          {/* Restaurant Name */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={labelStyle}>餐厅名称</label>
            <input
              type="text"
              value={restaurantName}
              onChange={handleNameChange}
              onFocus={() => {
                const q = restaurantName.trim().toLowerCase()
                if (q) {
                  const matches = allNamesRef.current
                    .filter((n) => {
                      const nl = n.toLowerCase()
                      return nl.includes(q) && nl !== q
                    })
                    .slice(0, 8)
                  if (matches.length) {
                    setSuggestions(matches)
                    setShowSuggestions(true)
                  }
                }
              }}
              onBlur={() => {
                nameTimerRef.current = setTimeout(() => setShowSuggestions(false), 150)
              }}
              placeholder="今天吃了什么？"
              maxLength={50}
              style={inputStyle}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #F0E6DC',
                boxShadow: '0 8px 24px rgba(139, 111, 71, 0.12)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickName(name)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: '1px solid #F6F0E8',
                      background: 'transparent',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FBF6EF' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>用餐日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>分类标签</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {CATEGORY_ORDER.map((key) => {
                const meta = FOOD_CATEGORIES[key]
                const active = category === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setCategory(key); if (!recordRefRef.current?.id) setRatingsByScorer({ cat: {}, fish: {} }) }}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '14px',
                      border: `1.5px solid ${active ? 'var(--color-accent)' : '#F0E6DC'}`,
                      background: active ? 'var(--peach)' : '#FFFFFF',
                      color: active ? 'var(--coffee-dark)' : 'var(--color-text-secondary)',
                      fontSize: '14px',
                      fontWeight: active ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 蛋糕款式：仅蛋糕分类显示 */}
          {category === 'cake' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>蛋糕款式</label>
              <input
                type="text"
                value={cakeStyle}
                onChange={(e) => setCakeStyle(e.target.value)}
                placeholder="例如：草莓奶油 / 芝士蛋糕"
                maxLength={50}
                style={inputStyle}
              />
            </div>
          )}

          {/* 双人评分：切换小猫/小鱼（新增和编辑都可用，编辑即重新评分） */}
          {(
            <div style={{ marginBottom: '18px' }}>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>双人评分（可切换身份）</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <ScorerButton active={scorer === 'cat'} onClick={() => switchScorer('cat')} label="小猫评" color="#F6B26B" />
                <ScorerButton active={scorer === 'fish'} onClick={() => switchScorer('fish')} label="小鱼评" color="#A8DADC" />
              </div>
              <div style={{
                borderRadius: '16px',
                border: `1.5px solid ${scorerMeta.color}`,
                background: scorerMeta.bg,
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {dims.map((dim) => (
                  <div key={dim.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {dim.label}
                      <span style={{
                        fontSize: '10px', fontWeight: '600', color: 'var(--color-text-tertiary)',
                        background: 'var(--color-bg-alt)', borderRadius: '9999px', padding: '1px 6px', whiteSpace: 'nowrap'
                      }}>权重 {dim.weight}</span>
                    </span>
                    <ScoreSlider
                      value={ratings[dim.key] || 0}
                      onChange={(score) => {
                        const current = ratingsByScorerRef.current[scorer] || {}
                        const nextIdentity = { ...current, [dim.key]: score }
                        const nextAll = { ...ratingsByScorerRef.current, [scorer]: nextIdentity }
                        ratingsByScorerRef.current = nextAll
                        setRatingsByScorer(nextAll)
                        // 仅编辑已有记录立即保存；新记录等「完成」
                        if (recordRefRef.current?.id) {
                          saveScore(scorer, nextIdentity)
                        }
                      }}
                      color={scorerMeta.color}
                    />
                  </div>
                ))}
              </div>
              <p style={{
                marginTop: '12px', fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center'
              }}>
                {isEdit ? '可重新评分，修改会即时保存' : '点亮星星记录分数，点「完成」后这条记录才会出现'}
              </p>
            </div>
          )}

          {/* Note */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>一句话记录</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天的感受..."
              maxLength={200}
              rows={3}
              style={{ ...inputStyle, padding: '12px 16px', resize: 'none' }}
            />
          </div>

          {/* 完成 / 保存 */}
          <motion.button
            type="button"
            data-demo="save"
            onClick={handleFinish}
            disabled={saving}
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
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 159, 139, 0.3)',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? '保存中...' : (isEdit ? '保存修改' : '完成')}
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}

function SupplementScoreModal({ record, onSubmit, onClose, identity }) {
  const who = identity === 'fish' ? 'fish' : 'cat'
  const dims = getDims(record.category)
  const existing = (who === 'cat' ? record.cat_scores : record.fish_scores) || {}
  const [ratings, setRatings] = useState(() => {
    const init = {}
    dims.forEach((d) => { if (typeof existing[d.key] === 'number') init[d.key] = existing[d.key] })
    return init
  })
  const [saving, setSaving] = useState(false)
  const latestRatingsRef = useRef(ratings)
  latestRatingsRef.current = ratings
  const savingRef = useRef(false)
  const whoMeta = who === 'cat'
    ? { label: '小猫', color: '#F6B26B' }
    : { label: '小鱼', color: '#A8DADC' }

  // 记录已存在，点击星星即补评并保存
  const persist = useCallback(async () => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      while (true) {
        const scoresObj = buildScoresObject(dims, latestRatingsRef.current)
        if (!Object.keys(scoresObj).length) break
        const scoreAvg = weightedAvg(dims, scoresObj)
        const patch = who === 'cat'
          ? { cat_scores: scoresObj, rating_cat: scoreAvg }
          : { fish_scores: scoresObj, rating_fish: scoreAvg }
        await onSubmit(record.id, patch)
        const after = buildScoresObject(dims, latestRatingsRef.current)
        if (JSON.stringify(after) === JSON.stringify(scoresObj)) break
      }
    } catch (err) {
      console.error('[supplement persist]', err)
      alert('保存失败，请重试')
    } finally {
      savingRef.current = false
    }
  }, [dims, who, record.id, onSubmit])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
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
          maxHeight: '88vh', overflowY: 'auto', zIndex: 201
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            {who === 'cat' ? '小猫' : '小鱼'}来打分
          </h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={18} />
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}>
          {record.restaurant_name} · {FOOD_CATEGORIES[record.category]?.label || '餐厅'}
        </p>

        <div style={{
          borderRadius: '16px', border: '1.5px solid #F0E6DC', background: '#FFFFFF',
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px'
        }}>
            {dims.map((dim) => (
              <div key={dim.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {dim.label}
                  <span style={{
                    fontSize: '10px', fontWeight: '600', color: 'var(--color-text-tertiary)',
                    background: 'var(--color-bg-alt)', borderRadius: '9999px', padding: '1px 6px', whiteSpace: 'nowrap'
                  }}>权重 {dim.weight}</span>
                </span>
                <ScoreSlider
                  value={ratings[dim.key] || 0}
                  onChange={(score) => {
                    const next = { ...ratings, [dim.key]: score }
                    setRatings(next)
                    latestRatingsRef.current = next
                    persist()
                  }}
                  color={whoMeta.color}
                />
              </div>
            ))}
          </div>

          <p style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
            点亮星星即自动保存 ✓
          </p>

          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', height: '52px', borderRadius: '26px', border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#FFFFFF', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 159, 139, 0.3)'
            }}
          >
            完成
          </motion.button>
      </motion.div>
    </>
  )
}

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: '500', color: '#6B6B6B', marginBottom: '8px'
}
const inputStyle = {
  width: '100%', height: '48px', padding: '0 16px', borderRadius: '16px',
  border: '1.5px solid #F0E6DC', background: '#FFFFFF', fontSize: '15px',
  color: 'var(--color-text-primary)', outline: 'none'
}

function ScorerButton({ active, onClick, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: '44px',
        borderRadius: '14px',
        border: `1.5px solid ${active ? color : '#F0E6DC'}`,
        background: active ? `${color}22` : '#FFFFFF',
        color: active ? color : 'var(--color-text-secondary)',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity: active ? 1 : 0.4 }} />
      <span>{label}</span>
    </button>
  )
}
