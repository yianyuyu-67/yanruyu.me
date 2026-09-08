import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { movieApi } from '../../lib/supabase'
import { useIdentity } from '../../hooks/useIdentity'
import { useToast } from '../../components/common/Toast'
import PageTransition, { StaggerContainer, StaggerItem } from '../../components/common/PageTransition'
import PageHeader from '../../components/common/PageHeader'
import ScoreSlider from '../../components/common/ScoreSlider'
import PhotoUpload from '../../components/common/PhotoUpload'
import { PlusIcon, TrashIcon, CloseIcon, MovieIcon, StarIcon } from '../../components/icons/CatFishIcons'
import { EmptyState, LoadingState, ErrorState } from '../../components/common/States'

const LOCATIONS = ['电影院', '家里']

export default function MovieRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [supplementRecord, setSupplementRecord] = useState(null)
  const { identity } = useIdentity()
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await movieApi.getAll()
      setRecords(data || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try {
      await movieApi.remove(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      toast('回忆已移除')
    } catch (err) {
      alert('删除失败')
    }
  }

  // 表单内部分人提交时同步到列表，不关闭弹窗
  const handleUpsert = (rec) => {
    setRecords(prev => {
      const exists = prev.some(r => r.id === rec.id)
      return exists ? prev.map(r => (r.id === rec.id ? rec : r)) : [rec, ...prev]
    })
  }

  const handleSupplement = async (id, patch) => {
    const rec = await movieApi.update(id, patch)
    setRecords(prev => prev.map(r => (r.id === id ? rec : r)))
  }

  return (
    <PageTransition>
      <div style={{ padding: '0 20px' }}>
        <PageHeader title="电影打卡" subtitle="一起看过的电影" />

        {loading ? (
          <LoadingState count={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : records.length === 0 ? (
          <EmptyState message="还没有电影记录，快来添加第一部吧" />
        ) : (
          <StaggerContainer>
            {records.map((record) => (
              <StaggerItem key={record.id}>
                <MovieCard
                  record={record}
                  onDelete={() => handleDelete(record.id)}
                  identity={identity}
                  onSupplement={(r) => setSupplementRecord(r)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <motion.button
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'fixed',
            right: '20px',
            bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-fish), var(--color-fish-dark))',
            boxShadow: '0 8px 24px rgba(168, 218, 220, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <PlusIcon size={28} color="var(--color-fish-dark)" />
        </motion.button>

        <AnimatePresence>
          {showForm && (
            <MovieFormModal
              onUpsert={handleUpsert}
              onClose={() => setShowForm(false)}
              identity={identity}
            />
          )}
        </AnimatePresence>

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

function MovieCard({ record, onDelete, identity, onSupplement }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${week}`
  }

  // 双维度评分
  const catScore = record.rating_cat
  const fishScore = record.rating_fish
  const catDone = catScore != null
  const fishDone = fishScore != null
  const catText = catDone ? catScore.toFixed(1) : '待评分'
  const fishText = fishDone ? fishScore.toFixed(1) : '待评分'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
      className="dashed-card"
      style={{ marginBottom: '14px' }}
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
              alt={record.movie_name}
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
              background: 'linear-gradient(135deg, var(--color-fish-light), var(--color-bg-alt))'
            }}>
              <MovieIcon size={32} />
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
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {record.movie_name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  {formatDate(record.date)}
                </p>
                {record.location && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: 'var(--color-fish-dark)',
                    background: 'rgba(168, 218, 220, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {record.location}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '10px', fontWeight: '500' }}>
                <span style={{ color: 'var(--color-cat)' }}>小猫 {catText}</span>
                <span style={{ color: 'var(--color-fish)' }}>小鱼 {fishText}</span>
              </div>
            </div>
            {/* 评分徽章 / 去打分入口 */}
            {identity && !((identity === 'cat' ? catDone : fishDone)) ? (
              <button
                onClick={(e) => { e.stopPropagation(); onSupplement(record) }}
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
                background: 'var(--peach)',
                borderRadius: '8px',
                padding: '3px 8px',
                color: 'var(--coffee-dark)',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}>
                <StarIcon size={11} filled />
                {(catDone && fishDone)
                  ? (((catScore + fishScore) / 2).toFixed(1))
                  : '待双人评分'}
              </div>
            )}
          </div>

          {record.note && (
            <p style={{
              fontSize: '12px',
              color: 'var(--color-on-primary)',
              lineHeight: 1.5,
              marginTop: '8px',
              padding: '8px 10px',
              background: 'var(--color-bg-alt)',
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

      {/* 删除 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '10px',
        padding: '8px 14px 0',
        borderTop: '1px dashed var(--color-border-light)'
      }}>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'var(--color-bg-alt)',
                color: 'var(--color-text-secondary)',
                fontSize: '12px'
              }}
            >
              取消
            </button>
            <button
              onClick={onDelete}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'var(--color-danger)',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            >
              确认删除
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              color: 'var(--color-text-tertiary)',
              fontSize: '12px'
            }}
          >
            <TrashIcon size={14} />
            <span>删除</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

function MovieFormModal({ onUpsert, onClose, identity }) {
  const [movieName, setMovieName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('电影院')
  const [photoUrl, setPhotoUrl] = useState(null)
  const [note, setNote] = useState('')

  const [scorer, setScorer] = useState(identity === 'fish' ? 'fish' : 'cat')
  const [ratings, setRatings] = useState({ cat: 0, fish: 0 })
  const [touched, setTouched] = useState({ cat: false, fish: false })
  const [recordRef, setRecordRef] = useState(null)
  const [saving, setSaving] = useState(false)

  // 实时保存所需的引用（避免连点/并发导致重复创建或漏存）
  const recordRefRef = useRef(recordRef); recordRefRef.current = recordRef
  const recordObjRef = useRef(null)
  const ratingsRef = useRef(ratings); ratingsRef.current = ratings
  const touchedRef = useRef(touched); touchedRef.current = touched
  const savingRef = useRef(false)

  const scorerMeta = {
    cat: { label: '小猫', color: '#F6B26B', bg: 'rgba(246, 178, 107, 0.12)' },
    fish: { label: '小鱼', color: '#A8DADC', bg: 'rgba(168, 218, 220, 0.18)' }
  }[scorer]

  // 点击任意星星即自动保存：首评建记录，之后补评；loop 保证连点/并发下本地与远端一致
  const persist = useCallback(async () => {
    if (!movieName.trim()) { alert('请先填写电影名称'); return }
    if (savingRef.current) return
    savingRef.current = true
    try {
      while (true) {
        const cur = ratingsRef.current
        const touchedNow = touchedRef.current
        const newCat = touchedNow.cat ? cur.cat : (recordObjRef.current?.rating_cat ?? null)
        const newFish = touchedNow.fish ? cur.fish : (recordObjRef.current?.rating_fish ?? null)
        const payload = {
          movie_name: movieName.trim(),
          date,
          location,
          photo_url: photoUrl,
          note: note.trim() || null,
          rating_cat: newCat,
          rating_fish: newFish
        }
        let rec
        if (!recordRefRef.current) {
          rec = await movieApi.create(payload)
        } else {
          rec = await movieApi.update(recordRefRef.current, payload)
        }
        recordObjRef.current = rec
        recordRefRef.current = rec.id
        setRecordRef(rec.id)
        onUpsert(rec)
        if (JSON.stringify({ cat: ratingsRef.current.cat, fish: ratingsRef.current.fish }) === JSON.stringify({ cat: cur.cat, fish: cur.fish })) break
      }
    } catch (err) {
      console.error('[movie persist]', err)
      alert('保存失败：' + (err?.message || '请检查网络或刷新重试'))
    } finally {
      savingRef.current = false
    }
  }, [movieName, date, location, photoUrl, note, onUpsert])

  const handleFinish = async () => {
    if (!movieName.trim()) { alert('请输入电影名称'); return }
    setSaving(true)
    try {
      if (!recordRef) {
        const payload = {
          movie_name: movieName.trim(),
          date,
          location,
          photo_url: photoUrl,
          note: note.trim() || null,
          rating_cat: touched.cat ? ratings.cat : null,
          rating_fish: touched.fish ? ratings.fish : null
        }
        const rec = await movieApi.create(payload)
        recordObjRef.current = rec
        recordRefRef.current = rec.id
        setRecordRef(rec.id)
        onUpsert(rec)
      } else {
        const payload = {
          movie_name: movieName.trim(),
          date,
          location,
          photo_url: photoUrl,
          note: note.trim() || null,
          rating_cat: touched.cat ? ratings.cat : (recordObjRef.current?.rating_cat ?? null),
          rating_fish: touched.fish ? ratings.fish : (recordObjRef.current?.rating_fish ?? null)
        }
        const rec = await movieApi.update(recordRef, payload)
        recordObjRef.current = rec
        onUpsert(rec)
      }
      onClose()
    } catch (err) {
      console.error('[movie finish]', err)
      alert('保存失败：' + (err?.message || '请检查网络或刷新重试'))
    } finally {
      setSaving(false)
    }
  }

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
          maxHeight: '85vh',
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
            添加电影记录
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

        <div style={{ marginBottom: '16px' }}>
          <PhotoUpload onPhotoChange={setPhotoUrl} photoUrl={photoUrl} module="movie" />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#6B6B6B',
            marginBottom: '8px'
          }}>
            电影名称
          </label>
          <input
            type="text"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            placeholder="一起看了什么电影？"
            maxLength={50}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>观看日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>观看地点</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '14px',
                  border: location === loc ? '2px solid var(--color-fish)' : '1.5px solid #F0E6DC',
                  background: location === loc ? 'rgba(168, 218, 220, 0.1)' : '#FFFFFF',
                  color: location === loc ? 'var(--color-fish-dark)' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  fontWeight: location === loc ? '600' : '400'
                }}
              >
                {loc}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={LOCATIONS.includes(location) ? '' : location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="或自定义地点，如：朋友家、万达影院…"
            style={{ ...inputStyle, fontSize: '14px' }}
          />
        </div>

        {/* 评分：切换式 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>评分（小猫 / 小鱼，可点半颗星）</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <ScorerButton
              active={scorer === 'cat'}
              onClick={() => setScorer('cat')}
              label="小猫评"
              color="#F6B26B"
            />
            <ScorerButton
              active={scorer === 'fish'}
              onClick={() => setScorer('fish')}
              label="小鱼评"
              color="#A8DADC"
            />
          </div>

          <div style={{
            borderRadius: '16px',
            border: `1.5px solid ${scorerMeta.color}`,
            background: scorerMeta.bg,
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: scorerMeta.color }}>
                {scorerMeta.label}评分
              </span>
              <ScoreSlider
                value={scorer === 'cat' ? ratings.cat : ratings.fish}
                onChange={(v) => {
                  setRatings((prev) => ({ ...prev, [scorer]: v }))
                  setTouched((prev) => ({ ...prev, [scorer]: true }))
                  ratingsRef.current = { ...ratingsRef.current, [scorer]: v }
                  touchedRef.current = { ...touchedRef.current, [scorer]: true }
                  persist()
                }}
                color={scorerMeta.color}
              />
            </div>
          </div>

          <p style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#9B8B7A',
            textAlign: 'center'
          }}>
            点亮星星即自动保存 ✓
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>评价</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="电影怎么样..."
            maxLength={200}
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none' }}
          />
        </div>

        <motion.button
          type="button"
          onClick={handleFinish}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '26px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--color-fish), var(--color-fish-dark))',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 24px rgba(168, 218, 220, 0.3)',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? '保存中...' : '完成'}
        </motion.button>
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

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#6B6B6B',
  marginBottom: '8px'
}

function SupplementScoreModal({ record, onSubmit, onClose, identity }) {
  const who = identity === 'fish' ? 'fish' : 'cat'
  const existing = who === 'cat' ? record.rating_cat : record.rating_fish
  const [score, setScore] = useState(typeof existing === 'number' ? existing : 0)
  const [saving, setSaving] = useState(false)
  const scoreRef = useRef(score); scoreRef.current = score
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
        const cur = scoreRef.current
        const patch = who === 'cat' ? { rating_cat: cur } : { rating_fish: cur }
        await onSubmit(record.id, patch)
        if (scoreRef.current === cur) break
      }
    } catch (err) {
      console.error('[movie supplement persist]', err)
      alert('保存失败，请重试')
    } finally {
      savingRef.current = false
    }
  }, [who, record, onSubmit])

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
            {whoMeta.label}来打分
          </h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloseIcon size={18} />
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}>
          {record.movie_name} · {record.location || '电影院'}
        </p>

        <div style={{
          borderRadius: '16px', border: '1.5px solid #F0E6DC', background: '#FFFFFF',
          padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: whoMeta.color }}>
              {whoMeta.label}评分
            </span>
            <ScoreSlider
              value={score}
              onChange={(v) => { setScore(v); scoreRef.current = v; persist() }}
              color={whoMeta.color}
            />
          </div>
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
            background: 'linear-gradient(135deg, var(--color-fish), var(--color-fish-dark))',
            color: '#FFFFFF', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(168, 218, 220, 0.3)'
          }}
        >
          完成
        </motion.button>
      </motion.div>
    </>
  )
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
