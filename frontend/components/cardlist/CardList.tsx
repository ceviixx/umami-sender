'use client'

import React from 'react'
import CardItem from './CardItem'
import clsx from 'clsx'

type Accessor<T, R = React.ReactNode> =
  | keyof T
  | string
  | ((item: T) => R)

type KeyAccessor<T> =
  | keyof T
  | ((item: T, idx: number) => React.Key)

type IconAccessor<T> =
  | ((item: T) => React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined)

type HrefAccessor<T>  = (item: T) => string | undefined
type SlotAccessor<T>  = (item: T) => React.ReactNode

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger'
type ToneAccessor<T> =
  | BadgeTone
  | ((item: T) => BadgeTone)
  | string
  | ((item: T) => string)

function getByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

function resolve<T, R = React.ReactNode>(item: T, acc?: Accessor<T, R>) {
  if (!acc) return undefined as unknown as R
  if (typeof acc === 'function') return (acc as any)(item)
  if (typeof acc === 'string') return getByPath(item, acc) as R
  return (item as any)[acc as keyof T] as R
}

function resolveTone<T>(item: T, tone?: ToneAccessor<T>): BadgeTone | undefined {
  if (!tone) return undefined
  const val = typeof tone === 'function' ? (tone as any)(item) : tone
  switch (String(val)) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'skipped': return 'warning'
    case 'danger':  return 'danger'
    case 'failed':  return 'danger'
    default:        return 'neutral'
  }
}

export type CardListProps<T> = {
  items: T[]
  keyField?: KeyAccessor<T>

  title: Accessor<T>
  subtitle?: Accessor<T>

  badge?: Accessor<T>
  badgeTone?: ToneAccessor<T>

  icon?: IconAccessor<T>
  href?: HrefAccessor<T>
  rightSlot?: SlotAccessor<T>

  className?: string
  listClassName?: string
  emptyState?: React.ReactNode
}

export default function CardList<T>({
  items,
  keyField,
  title,
  subtitle,
  badge,
  badgeTone,
  icon,
  href,
  rightSlot,
  className,
  listClassName = 'space-y-3',
  emptyState = null,
}: CardListProps<T>) {
  if (!items?.length) return emptyState

  return (
    <ul className={clsx(listClassName, className)}>
      {items.map((item, idx) => {
        const key =
          typeof keyField === 'function'
            ? keyField(item, idx)
            : keyField
            ? (item as any)[keyField as keyof T]
            : (item as any).id ?? idx

        const IconCmp = icon?.(item)

        return (
          <CardItem
            key={key}
            title={resolve(item, title)}
            subtitle={resolve(item, subtitle)}
            badge={resolve(item, badge)}
            badgeTone={resolveTone(item, badgeTone)}
            icon={IconCmp}
            href={href?.(item)}
            rightSlot={rightSlot?.(item)}
          />
        )
      })}
    </ul>
  )
}
