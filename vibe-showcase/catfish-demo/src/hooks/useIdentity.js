import { useState, useCallback } from 'react'

const IDENTITY_KEY = 'catfish_identity'

/**
 * 身份管理 hook
 * 小猫 (cat) / 小鱼 (fish)
 * 保存在 localStorage，第一次进入 App 时选择
 */
export function useIdentity() {
  const [identity, setIdentityState] = useState(() => {
    return localStorage.getItem(IDENTITY_KEY) || ''
  })

  const setIdentity = useCallback((id) => {
    localStorage.setItem(IDENTITY_KEY, id)
    setIdentityState(id)
  }, [])

  const clearIdentity = useCallback(() => {
    localStorage.removeItem(IDENTITY_KEY)
    setIdentityState('')
  }, [])

  return { identity, setIdentity, clearIdentity }
}
