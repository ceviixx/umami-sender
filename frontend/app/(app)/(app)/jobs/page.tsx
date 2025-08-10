'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import {
  fetchJobs,
  deleteJob,
  updateJobStatus,
} from '@/lib/api/jobs'
import { MailerJob } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardItem from "@/components/CardItem";

import {
  PaperAirplaneIcon,
  PuzzlePieceIcon
} from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation'

export default function MailerPage() {
  const [jobs, setJobs] = useState<MailerJob[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteJob(deleteId)
      setDeleteId(null)
      setJobs(prev => prev.filter(w => w.id !== deleteId))
    }
  }

  const frequencyMap = {
    hourly: locale.enums.frequency.hourly,
    daily: locale.enums.frequency.daily,
    weekly: locale.enums.frequency.weekly,
    monthly: locale.enums.frequency.monthly,
    yearly: locale.enums.frequency.yearly
  };

  const [pendingToggle, setPendingToggle] = useState<Set<string>>(new Set())
  const handleToggleStatus = async (jobId: string) => {
    setPendingToggle(prev => new Set(prev).add(jobId))

    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, is_active: !j.is_active } : j))
    )

    try {
      const { is_active } = await updateJobStatus(jobId, !jobs.find(j => j.id === jobId)?.is_active)
      setJobs(prev =>
        prev.map(j => (j.id === jobId ? { ...j, is_active } : j))
      )
    } catch (e: any) {
      setJobs(prev =>
        prev.map(j => (j.id === jobId ? { ...j, is_active: !j.is_active } : j))
      )
      setHasNetworkError(e?.message || 'Toggle failed')
    } finally {
      setPendingToggle(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.jobs} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.jobs}
        href='/jobs/new'
      />

      {jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {jobs.map(job => (
            <CardItem
              key={job.id}
              rightSlot={
                <>
                  <div className="flex text-gray-600 gap-1 text-sm">
                    {job.mailer_id && (<PaperAirplaneIcon className="text-gray-400 w-4 h-4" title={locale.ui.mail} />)}
                    {job.webhook_recipients.length > 0 && (<PuzzlePieceIcon className="text-gray-400 w-4 h-4" title={locale.ui.webhook} />)}
                  </div>
                  <ContextMenu
                    items={[
                      {
                        title: locale.buttons.edit,
                        action: () => router.push(`/jobs/${job.id}`),
                        tone: 'default',
                      },
                      {
                        title: locale.buttons.logs,
                        action: () => router.push(`/jobs/${job.id}/logs`),
                        tone: 'default',
                      },
                      {
                        title:
                          job.is_active
                            ? (locale.buttons.deactivate)
                            : (locale.buttons.activate),
                        action: () => handleToggleStatus(job.id),
                        tone: job.is_active ? 'warning' : 'success',
                        disabled: pendingToggle.has(job.id),
                      },
                      {
                        title: locale.buttons.delete,
                        action: () => setDeleteId(job.id),
                        tone: 'danger',
                      },
                    ]}
                  />
                </>
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${job.is_active ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                ></span>
                <div>
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-gray-600 text-sm">
                    {locale.forms.labels.frequency}: {frequencyMap[job.frequency] || 'Unknown'} | {locale.forms.labels.type}: {locale.enums.job_content_type[job.report_type as 'summary' | 'report'] || job.report_type}
                  </div>
                </div>
              </div>
            </CardItem>
          ))}
          <ConfirmDelete
            open={deleteId !== null}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        </ul>
      )}
    </div>
  )
}
