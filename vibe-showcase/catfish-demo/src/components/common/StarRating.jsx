import React from 'react'
import { StarIcon } from '../icons/CatFishIcons'

/**
 * 星级评分
 * - value: 支持小数（0.5 步进），用于半星显示
 * - allowHalf: 开启后点击星星左半选 .5，右半选整星
 * - color: 填充颜色（默认金 #FFB800；可传身份色让小猫/小鱼评分各自着色）
 */
export default function StarRating({ value = 5, onChange, size = 18, readOnly = false, allowHalf = false, color }) {
  const handleClick = (star, e) => {
    if (readOnly || !onChange) return
    let val = star
    if (allowHalf && e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      if (x < rect.width / 2) val = star - 0.5
    }
    onChange(Math.max(0.5, val))
  }

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)))
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={(e) => handleClick(star, e)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: 0,
              lineHeight: 0,
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseDown={(e) => { if (!readOnly) e.currentTarget.style.transform = 'scale(0.85)' }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <StarIcon size={size} filled={false} />
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${fill * 100}%`,
              overflow: 'hidden',
              pointerEvents: 'none',
              display: 'block'
            }}>
              <StarIcon size={size} filled={true} color={color} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
