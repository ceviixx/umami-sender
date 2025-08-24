'use client'

import React, { useEffect, useId, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export type EmptyStateProps = {
    rows?: number
    showOverlay?: boolean
    hint?: string
    onAdd?: () => void
    addHref?: string
    className?: string
    compact?: boolean
    overlayMode?: 'center' | 'anchor'
    anchorQuery?: string
    anchorOffset?: { x?: number; y?: number }
    icon?: React.ReactNode
    variant?: 'tooltip' | 'chip' | 'banner'
}

export default function EmptyState({
    rows = 3,
    showOverlay = true,
    hint = 'No content — tap the plus',
    onAdd,
    addHref,
    className,
    compact = false,
    overlayMode = 'anchor',
    anchorQuery = '[data-plus]',
    anchorOffset,
    icon,
    variant = 'tooltip',
}: EmptyStateProps) {
    const titleId = useId()
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    useLayoutEffect(() => {
        if (!showOverlay || overlayMode !== 'anchor') return
        const el = document.querySelector(anchorQuery) as HTMLElement | null
        if (!el) {
            setAnchorRect(null)
            return
        }
        const update = () => setAnchorRect(el.getBoundingClientRect())
        update()
        window.addEventListener('resize', update, { passive: true })
        window.addEventListener('scroll', update, { passive: true })
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update)
        }
    }, [showOverlay, overlayMode, anchorQuery])

    const rowsArray = useMemo(() => Array.from({ length: rows }), [rows])

    const OverlayIcon = () => (
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" opacity="0.5" />
            <path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )

    const CTA = ({ children }: { children: React.ReactNode }) => {
        const cls =
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-current/15 hover:ring-current/25 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-gray-950/80 transition'
        if (addHref) return (
            <a href={addHref} className={cls} onClick={onAdd}>{children}</a>
        )
        return (
            <button type="button" className={cls} onClick={onAdd}>{children}</button>
        )
    }

    const ChipOverlay = (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/80 dark:bg-gray-950/70 backdrop-blur-md ring-1 ring-inset ring-current/10 shadow px-4 py-2 flex items-center gap-2">
                {icon ?? <OverlayIcon />}
                <span className="text-sm">{hint}</span>
                {onAdd && <CTA><span>Add</span></CTA>}
            </div>
        </div>
    )

    const BannerOverlay = (
        <div className="mt-2 mb-4 flex justify-center">
            <div className="rounded-lg bg-white/80 dark:bg-gray-950/70 backdrop-blur-md ring-1 ring-inset ring-current/10 shadow px-4 py-2 flex items-center gap-2">
                {icon ?? <OverlayIcon />}
                <span className="text-sm">{hint}</span>
                {onAdd && <CTA><span>Add</span></CTA>}
            </div>
        </div>
    )

    const TooltipOverlay = mounted && anchorRect
        ? createPortal(
            <div
                style={{
                    position: 'fixed',
                    left: (anchorRect.left ?? 0) + (anchorOffset?.x ?? -12),
                    top: (anchorRect.top ?? 0) + (anchorRect.height / 2) + (anchorOffset?.y ?? 0),
                    transform: 'translate(-100%, -50%)',
                    zIndex: 50,
                }}
                className="pointer-events-auto"
            >
                <div className="rounded-lg bg-white/90 dark:bg-gray-950/80 backdrop-blur-md ring-1 ring-inset ring-current/10 shadow px-3 py-1.5 flex items-center gap-2">
                    {icon ?? <OverlayIcon />}
                    <span className="text-sm">{hint}</span>
                    {onAdd && <CTA><span>Add</span></CTA>}
                </div>
            </div>,
            document.body
        )
        : null

    const Row = ({ i }: { i: number }) => (
        <li className={'relative px-4 py-3 sm:px-5 sm:py-4 rounded-2xl ring-1 ring-gray-200/70 dark:ring-gray-800/60 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm'}>
            <div className="flex items-start gap-3">

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-40 rounded bg-gray-200/20 dark:bg-gray-800/10" />
                        <div className="ml-4 h-5 w-16 rounded bg-gray-200/20 dark:bg-gray-800/10" />
                    </div>
                    <div className="mt-1 h-3 w-24 rounded bg-gray-200/20 dark:bg-gray-800/10" />
                </div>

                <div
                    className="ml-2 flex items-center gap-2 pl-2 sm:pl-3 shrink-0 whitespace-nowrap"
                    data-row-link-ignore
                >
                    <div className="mt-1 h-3 w-24 rounded bg-gray-200/20 dark:bg-gray-800/10" />
                </div>
            </div>
        </li>
    )

    return (
        <section
            aria-labelledby={titleId}
            className={['relative text-gray-400 dark:text-gray-500', className].filter(Boolean).join(' ')}
        >
            <h2 id={titleId} className="sr-only">Empty state</h2>
            <ul className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
                {rowsArray.map((_, i) => <Row key={i} i={i} />)}
            </ul>
            {showOverlay && (
                variant === 'tooltip'
                    ? TooltipOverlay ?? ChipOverlay
                    : variant === 'chip'
                        ? ChipOverlay
                        : BannerOverlay
            )}
        </section>
    )
}
