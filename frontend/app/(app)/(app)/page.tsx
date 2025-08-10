'use client'

import { useI18n } from "@/locales/I18nContext";
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  fetchStats,
  fetchStatsLogs
} from '@/lib/api/stats'
import JobChart from '@/components/JobChart';
import NetworkError from "@/components/NetworkError";

import {
  BriefcaseIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon
} from '@heroicons/react/20/solid'

export default function Dashboard() {
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
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.dashboard}
      />

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3">
        <DashboardTile
          loading={loading}
          label={locale.pages.umami}
          value={stats?.umami}
          icon={<ChartBarIcon className="text-blue-400 w-12 h-12" />}
          dest="umami"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.jobs}
          value={stats?.jobs}
          icon={<BriefcaseIcon className="text-blue-400 w-12 h-12" />}
          dest="jobs"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.mailer}
          value={stats?.senders}
          icon={<PaperAirplaneIcon className="text-blue-400 w-12 h-12" />}
          dest="mailers"
        />
        <DashboardTile
          loading={loading}
          label={locale.pages.webhook}
          value={stats?.webhooks}
          icon={<PuzzlePieceIcon className="text-blue-400 w-12 h-12" />}
          dest="webhooks"
        />
      </div>

      <div className="pt-10">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col justify-between">
          <JobChart jobData={logStats} />
        </div>
      </div>
    </div>
  )
}

function DashboardTile({ loading, label, value, icon, dest }: { loading: boolean; label: string; value?: number | string; icon: any; dest: string; }) {
  return (
    <Link href={dest}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
          {icon}
          <span className="text-4xl font-bold text-primary-700 dark:text-primary-400">
            {loading ? (<p>-</p>) : value}
          </span>
        </div>
        <div className="mt-auto text-gray-600 dark:text-gray-400 text-sm font-bold">
          {label}
        </div>
      </div>
    </Link>
  )
}