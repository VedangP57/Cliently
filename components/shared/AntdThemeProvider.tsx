'use client'

import { useEffect, useState } from 'react'
import { App, ConfigProvider, theme as antdTheme } from 'antd'

const lightTheme = {
  token: {
    colorPrimary: '#5e5cc5',
    fontFamily: 'Avenir LT Pro',
    borderRadius: 6,
    zIndexPopupBase: 2000,
    colorBgMask: 'rgba(0, 0, 0, 0.3)',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
  },
  components: {
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#111827',
      headerSplitColor: '#e6e6e6',
      cellPaddingBlock: 12,
      cellPaddingBlockSM: 8,
      rowHoverBg: '#f0f1fb',
      rowSelectedBg: '#e8ebfa',
      rowSelectedHoverBg: '#dde0f7',
      borderColor: '#e6e6e6',
    },
    Select: {
      optionActiveBg: '#f1f5f9',
      optionSelectedBg: '#e2e8f0',
    },
    Input: {
      activeBorderColor: '#5e5cc5',
      hoverBorderColor: '#94a3b8',
    },
  },
}

const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: '#5e5cc5',
    zIndexPopupBase: 2000,
    colorInfo: '#5e5cc5',
    colorLink: '#5e5cc5',
    colorLinkHover: '#7a78d4',
    colorLinkActive: '#4a48a8',
    fontFamily: 'Avenir LT Pro',
    borderRadius: 6,
    colorBgMask: 'rgba(0, 0, 0, 0.6)',
    colorBgContainer: '#1a1a1a',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#0a0a0a',
    colorText: '#f2f2f2',
    colorTextSecondary: '#a3a3a3',
    colorBorder: '#292929',
    colorBorderSecondary: '#1f1f1f',
  },
  components: {
    Table: {
      headerBg: '#1f1f1f',
      headerColor: '#f2f2f2',
      headerSplitColor: '#333333',
      cellPaddingBlock: 12,
      cellPaddingBlockSM: 8,
      rowHoverBg: '#1f1f1f',
      rowSelectedBg: '#1f1f1f',
      rowSelectedHoverBg: '#292929',
      borderColor: '#292929',
      colorBgContainer: '#1a1a1a',
    },
    Select: {
      optionActiveBg: '#1f1f1f',
      optionSelectedBg: '#292929',
      selectorBg: '#1a1a1a',
      colorBorder: '#292929',
    },
    Input: {
      activeBorderColor: '#5e5cc5',
      hoverBorderColor: '#a3a3a3',
      colorBgContainer: '#1a1a1a',
      colorBorder: '#292929',
    },
    Button: {
      colorBgContainer: '#1f1f1f',
      primaryColor: '#ffffff',
      defaultBg: '#1f1f1f',
      defaultBorderColor: '#292929',
    },
    Checkbox: {
      colorPrimary: '#5e5cc5',
      colorPrimaryHover: '#7a78d4',
    },
    Pagination: {
      colorPrimary: '#5e5cc5',
      colorPrimaryHover: '#7a78d4',
    },
  },
}

export function AntdThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    const checkDark = () => {
      setIsDark(root.classList.contains('dark'))
    }

    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <App>{children}</App>
    </ConfigProvider>
  )
}
