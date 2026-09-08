import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CameraIcon, CloseIcon } from '../icons/CatFishIcons'

export default function PhotoUpload({ onPhotoChange, photoUrl, module = 'food' }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 本地预览
    const reader = new FileReader()
    reader.onload = (ev) => setLocalPreview(ev.target.result)
    reader.readAsDataURL(file)

    // 上传
    setUploading(true)
    try {
      const { uploadImage } = await import('../../lib/supabase')
      const url = await uploadImage(file, module)
      onPhotoChange(url)
    } catch (err) {
      console.error('Upload error:', err)
      alert('图片上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setLocalPreview(null)
    onPhotoChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const displayUrl = photoUrl || localPreview

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <AnimatePresence mode="wait">
        {displayUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#F5EDE5'
            }}
          >
            <img
              src={displayUrl}
              alt="预览"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CloseIcon size={18} color="#FFFFFF" />
            </button>
            {uploading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid var(--color-primary)',
                  borderTopColor: 'var(--color-accent)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: '16px',
              border: '2px dashed var(--color-primary)',
              background: 'var(--color-bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
          >
            <CameraIcon size={32} color="var(--color-accent)" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>添加照片</span>
          </motion.button>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
