import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CatIcon, FishIcon, CloseIcon } from '../icons/CatFishIcons'

/**
 * 留言气泡卡片
 * 小猫：左侧，暖橙色调
 * 小鱼：右侧，蓝色调
 */
export function CommentBubble({ comment, isMe }) {
  const isCat = comment.author === 'cat'

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}.${day}`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: isCat ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '10px'
      }}
    >
      {/* 头像 */}
      <div style={{
        flexShrink: 0,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: isCat ? '#FFF0E0' : '#E0F5F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {isCat ? <CatIcon size={28} /> : <FishIcon size={28} />}
      </div>

      {/* 气泡 */}
      <div style={{
        maxWidth: '72%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCat ? 'flex-start' : 'flex-end'
      }}>
        {/* 身份标签 */}
        <span style={{
          fontSize: '11px',
          color: isCat ? '#D49142' : '#5A9FA3',
          marginBottom: '3px',
          fontWeight: '500',
          padding: '0 4px'
        }}>
          {isCat ? '小猫' : '小鱼'}
          {isMe ? ' (我)' : ''}
        </span>

        {/* 留言内容 */}
        <div style={{
          padding: '10px 14px',
          borderRadius: isCat ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
          background: isCat
            ? 'linear-gradient(135deg, #FFF5EC, #FFE8DC)'
            : 'linear-gradient(135deg, #ECF8F9, #DEF0F2)',
          border: isCat
            ? '1px solid rgba(246, 178, 107, 0.2)'
            : '1px solid rgba(168, 218, 220, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.6,
            wordBreak: 'break-word'
          }}>
            {comment.content}
          </p>
        </div>

        {/* 时间 */}
        <span style={{
          fontSize: '10px',
          color: 'var(--color-text-tertiary)',
          marginTop: '3px',
          padding: '0 4px'
        }}>
          {formatTime(comment.created_at)}
        </span>
      </div>
    </motion.div>
  )
}

/**
 * 留言输入弹窗（底部弹窗）
 */
export function CommentInput({ open, identity, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
    if (!open) {
      setText('')
    }
  }, [open])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
    onClose()
  }

  const isCat = identity === 'cat'

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
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

          {/* 底部弹窗 */}
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
              padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
              zIndex: 201
            }}
          >
            {/* 头部 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isCat ? '#FFF0E0' : '#E0F5F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCat ? <CatIcon size={24} /> : <FishIcon size={24} />}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isCat ? '#D49142' : '#5A9FA3'
                }}>
                  {isCat ? '小猫' : '小鱼'}的留言
                </span>
              </div>
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

            {/* 输入区 */}
            <form onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="想对这顿饭说点什么..."
                maxLength={200}
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: `1.5px solid ${isCat ? 'var(--color-primary-light)' : '#D0EBED'}`,
                  background: '#FFFFFF',
                  fontSize: '15px',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.6
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {text.length}/200
                </span>
                <motion.button
                  type="submit"
                  disabled={!text.trim()}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: text.trim()
                      ? (isCat
                        ? 'linear-gradient(135deg, var(--color-cat), var(--color-accent))'
                        : 'linear-gradient(135deg, var(--color-fish), var(--color-fish-dark))')
                      : '#E5DDD5',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: text.trim() ? 1 : 0.6,
                    boxShadow: text.trim()
                      ? (isCat
                        ? '0 4px 16px rgba(246, 178, 107, 0.3)'
                        : '0 4px 16px rgba(168, 218, 220, 0.35)')
                      : 'none'
                  }}
                >
                  写好啦
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // 通过 Portal 渲染到 body，避免被 FoodCard 的 overflow:hidden / motion transform 裁剪或盖住
  return createPortal(modal, document.body)
}

/**
 * 留言区域组件
 * 包含留言列表 + 添加按钮
 */
export function CommentSection({ mealId, identity, collapsible = false }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [expanded, setExpanded] = useState(!collapsible)

  // 延迟加载 import，避免循环依赖
  const loadComments = async () => {
    if (!mealId) return
    setLoading(true)
    try {
      const { mealCommentsApi } = await import('../../lib/supabase')
      const data = await mealCommentsApi.getByMealId(mealId)
      setComments(data)
    } catch (err) {
      console.error('[CommentSection] load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [mealId])

  const handleSubmit = async (content) => {
    try {
      const { mealCommentsApi } = await import('../../lib/supabase')
      const newComment = await mealCommentsApi.create(mealId, identity, content)
      setComments(prev => [...prev, newComment])
    } catch (err) {
      console.error('[CommentSection] create error:', err)
    }
  }

  const isCat = identity === 'cat'

  // 折叠态：默认收起，点击在该记录下方直接展开
  if (collapsible && !expanded) {
    const count = comments.length
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          width: '100%',
          marginTop: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '12px',
          background: '#FDFAF6',
          border: '1px dashed #F0E6DC',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          我们的留言
        </span>
        <span style={{
          fontSize: '12px',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {count > 0 ? `查看 ${count} 条 ›` : '写下第一句 ›'}
        </span>
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '14px',
      padding: '14px 12px 10px',
      background: '#FDFAF6',
      borderRadius: '16px',
      border: '1px dashed #F0E6DC'
    }}>
      {/* 区域标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        marginBottom: comments.length > 0 ? '12px' : '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.5px'
          }}>
            我们的留言
          </span>
          {comments.length > 0 && (
            <span style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              background: '#FFFFFF',
              padding: '1px 8px',
              borderRadius: '9999px'
            }}>
              {comments.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#FFFFFF',
            border: '1px solid #F0E6DC',
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer'
          }}
        >
          收起
          <span style={{ fontSize: '10px' }}>▲</span>
        </button>
      </div>

      {/* 留言列表 */}
      {comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              isMe={comment.author === identity}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            padding: '4px 4px 8px'
          }}>
            还没有留言，写下第一句吧
          </p>
        )
      )}

      {/* 添加留言按钮 */}
      <button
        onClick={() => setShowInput(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: isCat ? '#FFF0E0' : '#E0F5F6',
          border: `1px solid ${isCat ? 'rgba(246, 178, 107, 0.2)' : 'rgba(168, 218, 220, 0.3)'}`,
          fontSize: '12px',
          color: isCat ? '#D49142' : '#5A9FA3',
          fontWeight: '500',
          marginTop: '4px'
        }}
      >
        {isCat ? <CatIcon size={18} /> : <FishIcon size={18} />}
        <span>写下留言</span>
      </button>

      {/* 输入弹窗 */}
      <CommentInput
        open={showInput}
        identity={identity}
        onClose={() => setShowInput(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
