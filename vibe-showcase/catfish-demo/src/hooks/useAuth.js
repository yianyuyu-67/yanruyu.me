import { useState, useRef, useEffect } from 'react'

const SECRET_ANSWER = 'demo'   // 演示构建：真实验证码已移除（demo-boot 预置已验证状态，正常流程走不到这里）
const STORAGE_KEY = 'catfish_auth'

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const verify = (answer) => {
    if (answer === SECRET_ANSWER) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthed(false)
  }

  return { isAuthed, verify, logout }
}
