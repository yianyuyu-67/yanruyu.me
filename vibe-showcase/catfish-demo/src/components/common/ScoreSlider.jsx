import React, { useRef, useCallback } from 'react'

/**
 * 拖动式评分条（替代星星）
 * - 默认 0~10 分，step=0.5（即支持 4.5、7.5 这种半分）
 * - 拖动圆点或直接点进度条即可打分，松手吸附到最近的 0.5 档
 * - 右侧实时显示当前分数（带 /max 提示）
 * - 支持键盘左右方向键 ±step
 */
export default function ScoreSlider({
  value = 0,
  onChange,
  max = 10,
  step = 0.5,
  color = '#FFB800',
  trackColor = '#F0E6DC',
  readOnly = false
}) {
  const trackRef = useRef(null)

  const clampSnap = useCallback((raw) => {
    const snapped = Math.round(raw / step) * step
    const clamped = Math.max(0, Math.min(max, snapped))
    // 消除浮点误差（如 4.4999999 -> 4.5）
    return Math.round(clamped * 100) / 100
  }, [max, step])

  const setFromClientX = useCallback((clientX) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = (clientX - rect.left) / rect.width
    const next = clampSnap(ratio * max)
    if (next !== value) onChange(next)
  }, [clampSnap, max, onChange, value])

  const handlePointerDown = useCallback((e) => {
    if (readOnly || !onChange) return
    e.preventDefault()
    setFromClientX(e.clientX)
    const move = (ev) => setFromClientX(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, [setFromClientX, readOnly, onChange])

  const handleKeyDown = useCallback((e) => {
    if (readOnly || !onChange) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(clampSnap(value - step))
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(clampSnap(value + step))
    }
  }, [clampSnap, value, step, onChange, readOnly])

  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0

  // 刻度圆点：整数档位大圆点 + 半分档位小圆点
  const ticks = []
  for (let v = 0; v <= max + 1e-9; v += step) {
    const val = Math.round(v * 100) / 100
    const isHalf = Math.abs(val - Math.round(val)) > 1e-9
    ticks.push({ val, isHalf })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        tabIndex={readOnly ? -1 : 0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          position: 'relative',
          flex: 1,
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          cursor: readOnly ? 'default' : 'pointer',
          touchAction: 'none',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* 轨道底色 */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '8px',
          borderRadius: '9999px', background: trackColor
        }} />
        {/* 已选填充 */}
        <div style={{
          position: 'absolute', left: 0, width: `${pct}%`, height: '8px',
          borderRadius: '9999px', background: color,
          transition: 'width 0.04s linear'
        }} />
        {/* 刻度圆点（代表可选择的分数档位） */}
        {ticks.map(({ val, isHalf }) => {
          const left = (val / max) * 100
          const active = val <= value + 1e-9
          const size = isHalf ? 3 : 6
          return (
            <span key={val} style={{
              position: 'absolute',
              left: `${left}%`,
              top: '50%',
              width: size, height: size,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: active ? '#FFFFFF' : 'rgba(139,111,71,0.30)',
              boxShadow: active ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              pointerEvents: 'none'
            }} />
          )
        })}

        {/* 拖动手柄 */}
        <div style={{
          position: 'absolute',
          left: `calc(${pct}% - 11px)`,
          width: '22px', height: '22px', borderRadius: '50%',
          background: '#FFFFFF', border: `3px solid ${color}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* 实时分数 */}
      <span style={{
        display: 'inline-flex', alignItems: 'baseline', gap: '1px',
        fontSize: '13px', fontWeight: '700', color,
        minWidth: '46px', justifyContent: 'flex-end'
      }}>
        <span>{value.toFixed(1)}</span>
        <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--color-text-tertiary)' }}>/{max}</span>
      </span>
    </div>
  )
}
