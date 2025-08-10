'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useI18n } from "@/locales/I18nContext";

type Props = {
  isOpen: boolean
  onClose: () => void
  content: string            // vollständiger HTML-Body (ohne <html> nötig)
  templateType: string
  onRefresh: (templateType: string) => void
  baseHref?: string          // optional, für relative Pfade in content (Bilder/CSS)
}

export default function Modal({
  isOpen,
  onClose,
  content,
  templateType,
  onRefresh,
  baseHref,
}: Props) {
  const { locale } = useI18n()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  const srcDoc = useMemo(() => {
    const base = baseHref ? `<base href="${baseHref}">` : ''
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
${base}
<meta name="viewport" content="width=device-width, initial-scale=1">

</head>
<body>
${content}
</body>
</html>`
  }, [content, baseHref])

  useEffect(() => {
    if (!isOpen) return
    const iframe = iframeRef.current
    if (!iframe) return

    const resize = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        const h = doc.documentElement.scrollHeight
        iframe.style.height = Math.min(h, 720).toString() + 'px'
      } catch { /* sandbox blockiert? dann einfach ignorieren */ }
    }

    const onLoad = () => { setIframeLoading(false); resize() }
    iframe.addEventListener('load', onLoad)
    const t = setTimeout(resize, 100)

    return () => { iframe.removeEventListener('load', onLoad); clearTimeout(t) }
  }, [isOpen, srcDoc])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50">
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {locale.ui.template_preview}
          </h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setIframeLoading(true); onRefresh(templateType) }}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-bold"
              title={locale.buttons.refresh}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-bold"
              title={locale.buttons.close}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-auto max-h-[70vh] rounded">
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin"
            srcDoc={srcDoc}
            title="Template Preview"
            className="w-full border-0"
            style={{ minHeight: 200 }}
          />
        </div>
      </div>
    </div>
  )
}
