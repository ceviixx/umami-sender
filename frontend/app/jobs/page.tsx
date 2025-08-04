'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import {
  fetchJobs,
  deleteJob,
} from '@/lib/api/jobs'
import { MailerJob } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import ContextMenu from '@/components/ContextMenu'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

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

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<number | null>(null)
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

  if (loading) { return <LoadingSpinner title={locale.pages.jobs} /> }

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
            
            <li key={job.id} className="border rounded p-3 flex justify-between bg-white">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    job.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></span>

                <div>
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-gray-600 text-sm">
                    {locale.forms.labels.frequency}: {frequencyMap[job.frequency] || 'Unknown'} | {locale.forms.labels.type}: {locale.enums.job_content_type[job.report_type as 'summary' | 'report'] || job.report_type}

                  </div>
                  
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex text-gray-600 gap-1 text-sm">
                  {job.sender_id && (<PaperAirplaneIcon className="text-gray-400 w-4 h-4" title={locale.ui.mail} />)}
                  {job.webhook_recipients.length > 0 && (<PuzzlePieceIcon className="text-gray-400 w-4 h-4" title={locale.ui.webhook} />)}
                </div>

                <ContextMenu
                  onEdit={() => router.push(`/jobs/${job.id}`)}
                  onDelete={() => setDeleteId(job.id)}
                />
              </div>
                
            </li>

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
