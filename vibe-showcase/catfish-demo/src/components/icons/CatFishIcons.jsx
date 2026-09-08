import React from 'react'

/**
 * 猫&鱼 原创 IP 图标系统
 * 风格：圆润、简单、低饱和、手绘感
 * 小猫代表陪伴、守护
 * 小鱼代表思念、连接
 */

// 主 Logo - 猫和鱼的组合
export const CatFishLogo = ({ size = 120, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 小猫身体 */}
    <ellipse cx="48" cy="72" rx="32" ry="28" fill="#F6B26B" opacity="0.9"/>
    {/* 小猫耳朵 */}
    <path d="M28 52 L22 36 L38 48 Z" fill="#F6B26B"/>
    <path d="M68 52 L74 36 L58 48 Z" fill="#F6B26B"/>
    <path d="M30 49 L27 41 L36 47 Z" fill="#FF9F8B" opacity="0.6"/>
    <path d="M66 49 L69 41 L60 47 Z" fill="#FF9F8B" opacity="0.6"/>
    {/* 小猫眼睛 - 闭着的幸福眼 */}
    <path d="M38 66 Q42 62 46 66" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M52 66 Q56 62 60 66" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* 小猫鼻子 */}
    <ellipse cx="49" cy="73" rx="2.5" ry="1.5" fill="#FF9F8B"/>
    {/* 小猫嘴巴 - 微笑 */}
    <path d="M49 75 Q45 79 43 77" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M49 75 Q53 79 55 77" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* 小猫腮红 */}
    <circle cx="36" cy="74" r="4" fill="#FF9F8B" opacity="0.3"/>
    <circle cx="62" cy="74" r="4" fill="#FF9F8B" opacity="0.3"/>

    {/* 小鱼 - 在猫旁边 */}
    <path d="M82 80 Q96 72 108 80 Q96 88 82 80 Z" fill="#A8DADC"/>
    {/* 鱼尾巴 */}
    <path d="M108 80 L116 74 L116 86 Z" fill="#A8DADC"/>
    {/* 鱼眼睛 */}
    <circle cx="90" cy="78" r="2" fill="#4A4A4A"/>
    <circle cx="90.5" cy="77.5" r="0.6" fill="#FFFFFF"/>
    {/* 鱼鳞纹理 */}
    <path d="M96 76 Q99 78 96 80" stroke="#7BB8BC" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M100 76 Q103 78 100 80" stroke="#7BB8BC" strokeWidth="1" fill="none" strokeLinecap="round"/>

    {/* 小气泡 - 连接感 */}
    <circle cx="72" cy="50" r="3" fill="#A8DADC" opacity="0.4"/>
    <circle cx="76" cy="42" r="2" fill="#A8DADC" opacity="0.3"/>
    <circle cx="80" cy="36" r="1.5" fill="#A8DADC" opacity="0.2"/>
  </svg>
)

// 小猫图标 - 单独
export const CatIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="28" rx="16" ry="14" fill="#F6B26B"/>
    <path d="M12 18 L8 8 L18 15 Z" fill="#F6B26B"/>
    <path d="M36 18 L40 8 L30 15 Z" fill="#F6B26B"/>
    <path d="M13 16 L11 11 L17 15 Z" fill="#FF9F8B" opacity="0.5"/>
    <path d="M35 16 L37 11 L31 15 Z" fill="#FF9F8B" opacity="0.5"/>
    <path d="M18 26 Q20 23 22 26" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M26 26 Q28 23 30 26" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <ellipse cx="24" cy="30" rx="1.5" ry="1" fill="#FF9F8B"/>
    <path d="M24 31 Q22 33 21 32" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <path d="M24 31 Q26 33 27 32" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round" fill="none"/>
    <circle cx="16" cy="31" r="2.5" fill="#FF9F8B" opacity="0.3"/>
    <circle cx="32" cy="31" r="2.5" fill="#FF9F8B" opacity="0.3"/>
  </svg>
)

// 小鱼图标 - 单独
export const FishIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 24 Q24 14 38 24 Q24 34 10 24 Z" fill="#A8DADC"/>
    <path d="M38 24 L46 18 L46 30 Z" fill="#A8DADC"/>
    <circle cx="18" cy="22" r="2" fill="#4A4A4A"/>
    <circle cx="18.5" cy="21.5" r="0.5" fill="#FFFFFF"/>
    <path d="M28 20 Q31 22 28 24" stroke="#7BB8BC" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M32 20 Q35 22 32 24" stroke="#7BB8BC" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <circle cx="6" cy="20" r="2" fill="#A8DADC" opacity="0.3"/>
    <circle cx="4" cy="26" r="1.5" fill="#A8DADC" opacity="0.2"/>
  </svg>
)

// 美食记录图标 - 小猫拿着筷子
export const FoodRecordIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="30" rx="14" ry="12" fill="#FFD8C2"/>
    <path d="M14 22 L11 13 L19 19 Z" fill="#FFD8C2"/>
    <path d="M34 22 L37 13 L29 19 Z" fill="#FFD8C2"/>
    <path d="M15 20 L13 16 L18 19 Z" fill="#FF9F8B" opacity="0.4"/>
    <path d="M33 20 L35 16 L30 19 Z" fill="#FF9F8B" opacity="0.4"/>
    <path d="M18 28 Q20 26 22 28" stroke="#4A4A4A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M26 28 Q28 26 30 28" stroke="#4A4A4A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <ellipse cx="24" cy="32" rx="1.2" ry="0.8" fill="#FF9F8B"/>
    <path d="M24 33 Q22 34.5 21 34" stroke="#4A4A4A" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    <path d="M24 33 Q26 34.5 27 34" stroke="#4A4A4A" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    {/* 碗 */}
    <path d="M16 40 Q24 44 32 40 L30 42 Q24 45 18 42 Z" fill="#F6B26B" opacity="0.7"/>
  </svg>
)

// 排行榜图标
export const RankingIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="26" width="8" height="14" rx="3" fill="#FFD8C2"/>
    <rect x="20" y="18" width="8" height="22" rx="3" fill="#FF9F8B"/>
    <rect x="32" y="22" width="8" height="18" rx="3" fill="#F6B26B"/>
    <circle cx="24" cy="13" r="5" fill="#FFB800"/>
    <path d="M21 11 L24 8 L27 11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M24 8 L24 14" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

// 清单图标
export const ListIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="28" height="32" rx="6" fill="#FFFFFF" stroke="#FFD8C2" strokeWidth="2"/>
    <path d="M16 18 L18 20 L22 16" stroke="#F6B26B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="25" y1="18" x2="34" y2="18" stroke="#C8C8C8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 28 L18 30 L22 26" stroke="#F6B26B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="25" y1="28" x2="34" y2="28" stroke="#C8C8C8" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 电影图标
export const MovieIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="24" rx="4" fill="#A8DADC"/>
    <rect x="8" y="12" width="32" height="6" rx="4" fill="#7BB8BC"/>
    <circle cx="14" cy="15" r="1.5" fill="#FFFFFF"/>
    <circle cx="20" cy="15" r="1.5" fill="#FFFFFF"/>
    <circle cx="26" cy="15" r="1.5" fill="#FFFFFF"/>
    <circle cx="32" cy="15" r="1.5" fill="#FFFFFF"/>
    <circle cx="38" cy="15" r="1.5" fill="#FFFFFF"/>
    {/* 播放按钮 */}
    <circle cx="24" cy="27" r="6" fill="#FFFFFF" opacity="0.9"/>
    <path d="M22 24 L28 27 L22 30 Z" fill="#FF9F8B"/>
  </svg>
)

// 旅行图标
export const TravelIcon = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 地球 */}
    <circle cx="24" cy="24" r="16" fill="#A8DADC"/>
    <path d="M10 22 Q18 18 24 22 Q30 26 38 22" stroke="#7BB8BC" strokeWidth="1.5" fill="none"/>
    <path d="M10 26 Q18 22 24 26 Q30 30 38 26" stroke="#7BB8BC" strokeWidth="1.5" fill="none"/>
    <ellipse cx="24" cy="24" rx="6" ry="16" stroke="#7BB8BC" strokeWidth="1.5" fill="none"/>
    <line x1="8" y1="24" x2="40" y2="24" stroke="#7BB8BC" strokeWidth="1.5"/>
    {/* 小飞机 */}
    <path d="M30 14 L36 10 L38 14 L34 18 Z" fill="#FF9F8B"/>
    <path d="M34 18 L36 16 L40 20 L38 22 Z" fill="#FFD8C2"/>
  </svg>
)

// 相机图标
export const CameraIcon = ({ size = 24, className = '', color = '#9B9B9B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9 Q3 7 5 7 L7 7 L8 5 L16 5 L17 7 L19 7 Q21 7 21 9 L21 17 Q21 19 19 19 L5 19 Q3 19 3 17 Z" fill={color} opacity="0.15"/>
    <path d="M3 9 Q3 7 5 7 L7 7 L8 5 L16 5 L17 7 L19 7 Q21 7 21 9 L21 17 Q21 19 19 19 L5 19 Q3 19 3 17 Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="13" r="1.5" fill={color}/>
  </svg>
)

// 星星图标
export const StarIcon = ({ size = 20, filled = true, color = '#FFB800', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2 L12.4 7.2 L18 8 L14 12 L15 17.6 L10 15 L5 17.6 L6 12 L2 8 L7.6 7.2 Z"
      fill={filled ? color : 'none'}
      stroke={filled ? color : '#E0E0E0'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

// 返回箭头
export const BackIcon = ({ size = 24, className = '', color = '#4A4A4A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M15 6 L9 12 L15 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

// 添加图标
export const PlusIcon = ({ size = 24, className = '', color = '#FF9F8B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill={color}/>
    <path d="M12 7 L12 17 M7 12 L17 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 删除图标
export const TrashIcon = ({ size = 20, className = '', color = '#E8857A' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6 L16 6 M7 6 L7 4 Q7 3 8 3 L12 3 Q13 3 13 4 L13 6 M6 6 L7 16 Q7 17 8 17 L12 17 Q13 17 13 16 L14 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

// 心形图标 - 用于底部导航首页
export const HomeIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21 Q4 15 4 9 Q4 5 8 5 Q10 5 12 7 Q14 5 16 5 Q20 5 20 9 Q20 15 12 21 Z"
      fill={active ? '#FF9F8B' : 'none'}
      stroke={active ? '#FF9F8B' : '#C8C8C8'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

// 鱼骨图标 - 用于底部导航小猫吃鱼
export const CatFoodNavIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="8" ry="6" fill={active ? '#F6B26B' : 'none'} stroke={active ? '#F6B26B' : '#C8C8C8'} strokeWidth="1.5"/>
    <path d="M6 10 L10 12 L6 14 M10 9 L14 12 L10 15 M14 10 L18 12 L14 14" stroke={active ? '#F6B26B' : '#C8C8C8'} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </svg>
)

// 鱼竿图标 - 用于底部导航小猫钓鱼
export const CatFishNavIcon = ({ size = 24, className = '', active = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4 L18 16" stroke={active ? '#A8DADC' : '#C8C8C8'} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 16 Q19 14 20 16 Q19 18 18 16" fill={active ? '#A8DADC' : 'none'} stroke={active ? '#A8DADC' : '#C8C8C8'} strokeWidth="1.5"/>
    <path d="M16 18 Q20 16 22 18 Q20 20 16 18" fill={active ? '#A8DADC' : 'none'} stroke={active ? '#A8DADC' : '#C8C8C8'} strokeWidth="1.5"/>
  </svg>
)

// 关闭图标
export const CloseIcon = ({ size = 24, className = '', color = '#9B9B9B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 确认/对勾图标
export const CheckIcon = ({ size = 20, className = '', color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10 L8 14 L16 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

// 空状态猫鱼图标
export const EmptyStateIcon = ({ size = 120, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 睡觉的小猫 */}
    <ellipse cx="50" cy="70" rx="28" ry="20" fill="#F6B26B" opacity="0.6"/>
    <path d="M30 56 L26 46 L38 54 Z" fill="#F6B26B" opacity="0.6"/>
    <path d="M70 56 L74 46 L62 54 Z" fill="#F6B26B" opacity="0.6"/>
    {/* 闭眼 */}
    <path d="M38 64 Q42 62 46 64" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M54 64 Q58 62 62 64" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Zzz */}
    <text x="80" y="40" fontSize="14" fill="#C8C8C8" fontFamily="sans-serif" fontWeight="300">z</text>
    <text x="86" y="32" fontSize="12" fill="#C8C8C8" fontFamily="sans-serif" fontWeight="300">z</text>
    <text x="91" y="26" fontSize="10" fill="#C8C8C8" fontFamily="sans-serif" fontWeight="300">z</text>
    {/* 小鱼在旁边等 */}
    <path d="M80 80 Q90 74 100 80 Q90 86 80 80 Z" fill="#A8DADC" opacity="0.4"/>
    <path d="M100 80 L106 76 L106 84 Z" fill="#A8DADC" opacity="0.4"/>
  </svg>
)
