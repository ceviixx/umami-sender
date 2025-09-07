'use client'

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from "@/components/LoadingSpinner";
import NetworkError from "@/components/NetworkError";
import JobChart from '@/components/JobChart';
import { fetchDashboard } from '@/lib/api/dashboard'
import {
  BriefcaseIcon, ChartBarIcon, PaperAirplaneIcon, PuzzlePieceIcon,
  ExclamationTriangleIcon, ClockIcon, ArrowTrendingDownIcon, CpuChipIcon,
  ArchiveBoxIcon
} from '@heroicons/react/20/solid'
import Container from "@/components/layout/Container";
import type { DashboardResponse } from '@/lib/api/dashboard'


export default function DashboardPage() {
  const { locale } = useI18n()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [networkError, setHasNetworkError] = useState<string | null>(null)
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setHasNetworkError(null)
        const data = await fetchDashboard()
        setDashboard(data)
      } catch (e: any) {
        setHasNetworkError(e?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <LoadingSpinner title={locale.pages.dashboard} />
  if (networkError) return <NetworkError page={locale.pages.dashboard} message={networkError} />
  if (!dashboard) return null;

  // Stats aus dashboard.stats
  const stats = dashboard.stats;
  // Runs, Jobs, ProblemJobs, Instances aus dashboard
  const recentRuns = dashboard.last_runs || [];
  const instances = dashboard.instances || [];
  const problemJobs = dashboard.problem_jobs || [];
  const nextRuns = dashboard.next_runs || [];

  // Alert: failed/success aus stats
  const last7Failed = stats?.failed_last_7_days ?? 0;
  const successRate = stats?.success_rate_last_7_days ?? 0;

  return (
    <Container>
      <PageHeader title={locale.pages.dashboard} />
      
      {last7Failed > 0 && (
        <div role="alert" className="mb-6 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-900/20 p-4 flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset ring-amber-200/60 dark:ring-amber-900/50">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </span>
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <div className="font-semibold">{locale.dashboard.issues.title}</div>
            <div className="opacity-90">{locale.dashboard.issues.subtitle.replace('{successRate}', `${successRate}`).replace('{last7Failed}', `${last7Failed}`)}</div>
            <div className="mt-2">
              <Link href="/account/system/logs" className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-amber-300/70 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
                {locale.dashboard.issues.viewLogs}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label={locale.pages.umami} value={stats?.umami} icon={<ChartBarIcon className="w-5 h-5" />} href="umami" />
        <KpiTile label={locale.pages.jobs} value={stats?.jobs} icon={<BriefcaseIcon className="w-5 h-5" />} href="jobs" />
        <KpiTile label={locale.pages.mailer} value={stats?.mailer} icon={<PaperAirplaneIcon className="w-5 h-5" />} href="mailers" />
        <KpiTile label={locale.pages.webhook} value={stats?.webhook} icon={<PuzzlePieceIcon className="w-5 h-5" />} href="webhooks" />
      </div>

      {/* JobChart kann nur angezeigt werden, wenn dashboard.logs vorhanden ist */}
      <section className="mt-8 rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40 shadow-sm">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <h2 className="text-sm font-semibold">{locale.dashboard.job_activity}</h2>
          <RangePicker value={range} onChange={setRange} />
        </div>
        <div className="rounded-b-2xl border-t border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/30 p-3 sm:p-4">
          <JobChart
            key={range}
            jobData={dashboard.activity || []}
            range={range}
          />
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={locale.dashboard.last_runs} icon={<ArchiveBoxIcon className="w-4 h-4" />} action={<Link href="/account/system/logs" className="text-xs underline">{'{Alle}'}</Link>}>
          <ul className="divide-y divide-gray-200/70 dark:divide-gray-800/60">
            {padTo(recentRuns, 3).map((r, idx) =>
              r ? (
                <li key={r.name + r.start} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs opacity-70 flex gap-2">
                      <span>{r.start ? new Date(r.start).toLocaleString() : ''}</span>
                      <span>•</span>
                      <span>{r.duration_ms} ms</span>
                    </div>
                  </div>
                  <StatusPill status={r.status as 'success'} />
                </li>
              ) : (
                <SkeletonListRow key={`skeleton-${idx}`} />
              )
            )}
          </ul>
        </Card>

        <Card title={locale.dashboard.next_runs} icon={<ClockIcon className="w-4 h-4" />}>
          <ul className="divide-y divide-gray-200/70 dark:divide-gray-800/60">
            {padTo(nextRuns, 3).map((j, idx) =>
              j ? (
                <li key={j.name + j.next_run} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{j.name}</div>
                    <div className="text-xs opacity-70">
                      {j.next_run ? new Date(j.next_run).toLocaleString() : ''}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-gray-50 text-gray-700 ring-gray-200/70 dark:bg-gray-900/30 dark:text-gray-300 dark:ring-gray-800/50">
                    {locale.enums.frequency[j.type as "daily"]}
                  </span>
                </li>
              ) : (
                <SkeletonListRow key={`skeleton-${idx}`} />
              )
            )}
          </ul>
        </Card>

        <Card title={locale.dashboard.problem_jobs} icon={<ArrowTrendingDownIcon className="w-4 h-4" />}>
          <ul className="divide-y divide-gray-200/70 dark:divide-gray-800/60">
            {padTo(problemJobs, 3).map((p, idx) =>
              p ? (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs opacity-70 truncate">{p.errors}</div>
                  </div>
                  {/* Details-Link ggf. anpassen, falls p.id = job_id */}
                  <Link href={`/jobs/${p.id}/logs`} className="text-xs underline">Details</Link>
                </li>
              ) : (
                <SkeletonListRow key={`skeleton-${idx}`} />
              )
            )}
          </ul>
        </Card>

        <Card title={locale.dashboard.instance_status} icon={<CpuChipIcon className="w-4 h-4" />}>
          <ul className="divide-y divide-gray-200/70 dark:divide-gray-800/60">
            {padTo(instances, 3).map((i, idx) =>
              i ? (
                <li key={i.name + idx} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-xs opacity-70">
                      {i.type === 'cloud' ? 'Cloud' : 'Self-hosted'}
                    </div>
                  </div>
                  <StatusPill status={(i.is_healthy ? 'healthy' : 'unhealthy') as 'success'} />
                </li>
              ) : (
                <SkeletonListRow key={`skeleton-${idx}`} />
              )
            )}
          </ul>
        </Card>

      </div>
    </Container>
  )
}



function padTo<T>(items: T[], count: number) {
  const limited = items.slice(0, count);
  const skeletonsNeeded = Math.max(0, count - limited.length);
  return [...limited, ...Array(skeletonsNeeded).fill(null)] as (T | null)[];
}

function KpiTile({ label, value, icon, href }: { label: string; value?: number | string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group focus:outline-none">
      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40
                      backdrop-blur-sm p-5 h-32 flex flex-col justify-between transition
                      hover:border-gray-300 dark:hover:border-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500/70">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-inset ring-blue-200/60 dark:ring-blue-800/60 w-9 h-9 group-hover:scale-105 transition">
            {icon}
          </span>
          <span className="text-3xl font-bold tracking-tight tabular-nums">{value ?? '—'}</span>
        </div>
        <div className="mt-auto text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
      </div>
    </Link>
  )
}

function Card({ title, children, icon, action }: { title: string; children: React.ReactNode; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40 shadow-sm">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="rounded-b-2xl border-t border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/30 p-3 sm:p-3">
        {children}
      </div>
    </section>
  )
}

function StatusPill({ status }: { status: 'success' | 'failed' | 'skipped' | 'warning' | 'healthy' | 'unhealthy' }) {
  const map = {
    success: 'bg-green-50 text-green-700 ring-green-200/70 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800/50',
    failed: 'bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800/50',
    skipped: 'bg-gray-50 text-gray-700 ring-gray-200/70 dark:bg-gray-900/30 dark:text-gray-300 dark:ring-gray-800/50',
    warning: 'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-800/50',
    healthy: 'bg-green-50 text-green-700 ring-green-200/70 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800/50',
    unhealthy: 'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-800/50',
  } as const
  return <span className={`text-[10px] px-2 py-1 rounded ring-1 ring-inset ${map[status]}`}>{status}</span>
}


function RangePicker({ value, onChange }: { value: '7d' | '30d' | '90d'; onChange: (v: '7d' | '30d' | '90d') => void }) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200/70 dark:border-gray-800/60 overflow-hidden" role="tablist" aria-label="Chart range">
      {(['7d', '30d', '90d']).map(k => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k as '7d' | '30d' | '90d')}
          className={[
            "px-3 py-1.5 text-xs font-medium transition",
            value === k ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          ].join(' ')}
        >
          {k.toUpperCase()}
        </button>
      ))}
    </div>
  )
}


function SkeletonListRow() {
  return (
    <li className="py-3 flex items-center justify-between">
      <div className="min-w-0 w-full">
        <div className="h-4 w-40 rounded bg-gray-200/20 dark:bg-gray-800/10" />
        <div className="mt-1 h-3 w-24 rounded bg-gray-200/20 dark:bg-gray-800/10" />
      </div>
      <div className="ml-4 h-5 w-16 rounded bg-gray-200/20 dark:bg-gray-800/10" />
    </li>
  );
}