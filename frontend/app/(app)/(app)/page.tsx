'use client'

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchStats, fetchStatsLogs } from '@/lib/api/stats'
import JobChart from '@/components/JobChart';
import NetworkError from "@/components/NetworkError";
import { BriefcaseIcon, ChartBarIcon, PaperAirplaneIcon, PuzzlePieceIcon } from '@heroicons/react/20/solid'

export default function DashboardPage() {
  const [stats, setStats] = useState<null | {
    senders: number | string;
    umami: number | string;
    jobs: number | string;
    webhooks: number | string;
  }>(null);
  const [logStats, setLogStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setHasNetworkError(null)

    Promise.all([
      fetchStats().then(setStats),
      fetchStatsLogs().then(setLogStats),
    ])
      .catch(error => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) { return <LoadingSpinner title={locale.pages.dashboard} /> }
  if (networkError) { return <NetworkError page={locale.pages.dashboard} message={networkError} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={locale.pages.dashboard} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardTile
          loading={loading}
          label={locale.pages.umami}
          value={stats?.umami}
          icon={<ChartBarIcon className="w-5 h-5" />}
          dest="umami"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.jobs}
          value={stats?.jobs}
          icon={<BriefcaseIcon className="w-5 h-5" />}
          dest="jobs"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.mailer}
          value={stats?.senders}
          icon={<PaperAirplaneIcon className="w-5 h-5" />}
          dest="mailers"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.webhook}
          value={stats?.webhooks}
          icon={<PuzzlePieceIcon className="w-5 h-5" />}
          dest="webhooks"
        />
      </div>

      <div className="pt-8">
        <section className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
          <div className="">
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/30 p-3 sm:p-4">
              <JobChart jobData={logStats} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function DashboardTile({
  loading,
  label,
  value,
  icon,
  dest
}: {
  loading: boolean;
  label: string;
  value?: number | string;
  icon: React.ReactNode;
  dest: string;
}) {
  return (
    <Link href={dest} className="group focus:outline-none">
      <div
        className="rounded-2xl border border-gray-200/70 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/40
                   backdrop-blur-sm p-5 h-32 flex flex-col justify-between
                   transition hover:border-gray-300 dark:hover:border-gray-700
                   focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center justify-center rounded-xl
                           bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300
                           ring-1 ring-inset ring-blue-200/60 dark:ring-blue-800/60
                           w-9 h-9 group-hover:scale-105 transition">
            {icon}
          </span>

          <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {loading ? (
              <span className="inline-block h-7 w-12 rounded bg-gray-200/70 dark:bg-gray-800/60 animate-pulse" />
            ) : (
              value
            )}
          </span>
        </div>
        
        <div className="mt-auto text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {label}
        </div>
      </div>
    </Link>
  )
}
