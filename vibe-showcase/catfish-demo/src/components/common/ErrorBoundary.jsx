import React from 'react'

// 全局错误边界：捕获子树渲染期抛出的错误，
// 避免单点异常导致整棵 React 树被卸载而永久白屏。
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || '未知错误' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' })
    if (this.props.onReset) this.props.onReset()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, message: '' })
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = '#/'
      window.location.pathname = '/'
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            textAlign: 'center',
            background: 'var(--color-bg, #FFF7E8)',
            color: 'var(--color-text-primary, #5A4632)'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>😿</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            页面出了点小问题
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary, #9B8B7A)', marginBottom: '20px', maxWidth: '280px' }}>
            别担心，你的数据还在。可以重试，或回到首页重新开始。
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleRetry}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '22px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF9F8B, #8B6F47)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '22px',
                border: '1.5px solid #F0E6DC',
                background: '#FFFFFF',
                color: '#8B6F47',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              回首页
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#B8A892', marginTop: '16px', wordBreak: 'break-all', maxWidth: '300px' }}>
            {this.state.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
