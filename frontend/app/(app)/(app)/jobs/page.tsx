'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { fetchJobs, deleteJob, updateJobStatus, runJob } from '@/lib/api/jobs'
import { MailerJob } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CardList from "@/components/cardlist/CardList";
import { PaperAirplaneIcon, PuzzlePieceIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation'
import { showError, showSuccess } from "@/lib/toast";
import Container from "@/components/layout/Container";

export default function JobsPage() {
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
      .then(() => {
        setJobs(prev => prev.filter(w => w.id !== deleteId))
      })
      .catch((error) => {
        showError(error.message)
      })
      .finally(() => {
        setDeleteId(null)
      })
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

  const handleRunJob = async (jobId: string) => {
    try {
      const res = await runJob(jobId)
      showSuccess(locale.messages.job_started)
    } catch (error: any) {
      const message = error.message
      showError(locale.api_messages[message as 'DATA_ERROR'] || message)
    }
  }

  if (loading) { return <LoadingSpinner title={locale.pages.jobs} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <Container>
      <PageHeader
        title={locale.pages.jobs}
        href='/jobs/new'
      />

      {jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={jobs}
          keyField={(item) => item.id}
          title={(item) => item.name}
          subtitle={(item) => `${locale.forms.labels.frequency}: ${frequencyMap[item.frequency] ?? 'Unknown'} | ${locale.forms.labels.type}: ${locale.enums.job_content_type[item.report_type as 'summary' | 'report'] ?? item.report_type}` }
          badge={(item) => item.is_active ? locale.common.active : locale.common.inactive}
          badgeTone={(item) => item.is_active ? "success" : "warning"}
          rightSlot={(item) => (
            <>
              <div className="flex text-gray-600 gap-1 text-sm">
                {item.mailer_id && (<PaperAirplaneIcon className="text-gray-400 w-4 h-4" title={locale.ui.mail} />)}
                {item.webhook_recipients.length > 0 && (<PuzzlePieceIcon className="text-gray-400 w-4 h-4" title={locale.ui.webhook} />)}
              </div>
              <ContextMenu
                items={[
                  {
                    title: locale.buttons.edit,
                    action: () => router.push(`/jobs/${item.id}`),
                    tone: 'default',
                  },
                  {
                    title: locale.buttons.logs,
                    action: () => router.push(`/jobs/${item.id}/logs`),
                    tone: 'default',
                  },
                  {
                    title: locale.buttons.execute_now,
                    action: () => handleRunJob(item.id),
                    tone: 'default',
                  },
                  {
                    title:
                      item.is_active
                        ? (locale.buttons.deactivate)
                        : (locale.buttons.activate),
                    action: () => handleToggleStatus(item.id),
                    tone: item.is_active ? 'warning' : 'success',
                    disabled: pendingToggle.has(item.id),
                  },
                  {
                    title: locale.buttons.delete,
                    action: () => setDeleteId(item.id),
                    tone: 'danger',
                  },
                ]}
              />
            </>
          )}
        />
      )}
      <ConfirmDelete
        open={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Container>
  )
}
