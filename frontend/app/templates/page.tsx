'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  fetchTemplates, 
  deleteTemplate 
} from '@/lib/api/templates'
import { Template } from '@/types'
import ConfirmDelete from '@/components/ConfirmDelete'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ContextMenu from "@/components/ContextMenu";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@headlessui/react";
import { 
  PlayIcon
} from '@heroicons/react/20/solid'

export default function SettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { locale } = useI18n()

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false))
  }, [])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteTemplate(simplifySenderType(deleteId));
        setTemplates(prev => 
          prev.map(template => 
            template.sender_type === deleteId
              ? { ...template, html: null, json: null }
              : template
          )
        );
        showSuccess('Template erfolgreich gelöscht');
      } catch (err) {
        showError('Fehler beim Löschen des Templates');
      }

      setDeleteId(null);
    }
  };



  const senderTypeOptions = [
    { label: 'Email', value: 'EMAIL' },
    { label: 'Webhook Discord', value: 'WEBHOOK_DISCORD' },
    { label: 'Webhook Slack', value: 'WEBHOOK_SLACK' },
    { label: 'Webhook MS Teams', value: 'WEBHOOK_MS_TEAMS' },
    { label: 'Webhook Mattermost', value: 'WEBHOOK_MATTERMOST' },
    { label: 'Webhook Custom', value: 'WEBHOOK_CUSTOM' },
  ];

  const getSenderTypeLabel = (value: string) => {
    const match = senderTypeOptions.find(option => option.value === value);
    return match ? match.label : value; // fallback auf value, falls nichts gefunden wird
  };

  const simplifySenderType = (fullType: string) => {
    return fullType.replace(/^WEBHOOK_/, '').toLowerCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title={locale.pages.templates}
      />

      {loading && <LoadingSpinner />}

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {templates.map(t => (
            <div key={t.sender_type} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="font-bold">
                  {getSenderTypeLabel(t.sender_type)}
                </span>
                
                <span className="text-secondary">
                  {t.json || t.html ? (
                    <ContextMenu
                      onEdit={() => router.push(`/templates/${simplifySenderType(t.sender_type)}/setup`)}
                      onDelete={() => setDeleteId(t.sender_type)} // Setze deleteId
                    />
                  ) : (
                    <Button
                      onClick={() => router.push(`/templates/${simplifySenderType(t.sender_type)}/setup`)}
                      className="w-5 h-5 m-2 rounded-full border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white flex items-center justify-center transition"
                      title={locale.ui.setup} 
                    >
                      <PlayIcon className="w-4 h-4" />
                    </Button>
                  )}
                </span>
              </div>
              <div className="mt-auto text-gray-600 text-sm">{t.description}</div>
            </div>
          ))}
          <ConfirmDelete
            open={deleteId !== null}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        </div>
      )}
    </div>
  )
}

