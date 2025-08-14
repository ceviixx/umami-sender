'use client'

import { useI18n } from "@/locales/I18nContext";
import { useEffect, useState } from 'react'
import { fetchTemplatePreview, fetchTemplates } from '@/lib/api/templates'
import { Template } from '@/types'
import EmptyState from '@/components/EmptyState'
import NetworkError from "@/components/NetworkError";
import PageHeader from '@/components/navigation/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { showSuccess, showError } from "@/lib/toast";
import { EyeIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import CardList from "@/components/cardlist/CardList";
import TemplatePreviewModal from '@/components/TemplatePreviewModal'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string>("")
  const [currentTemplateType, setCurrentTemplateType] = useState<string | null>(null)
  const { locale } = useI18n()
  const [networkError, setHasNetworkError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((error) => {
        setHasNetworkError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const openModal = (templateType: string) => {
    setCurrentTemplateType(templateType);
    fetchTemplatePreview(templateType)
      .then((html) => {
        setModalContent(html);
        setIsModalOpen(true);
      })
      .catch((error) => showError(locale.api_messages[error as 'DATA_ERROR'] || error))
  };

  const handleRefresh = (templateType: string) => {
    fetchTemplatePreview(templateType)
      .then((html) => {
        setModalContent(html);
        showSuccess(locale.ui.preview_refreshed);
      })
      .catch((error) => showError(locale.api_messages[error as 'DATA_ERROR'] || error))
  };

  if (loading) { return <LoadingSpinner title={locale.pages.templates} /> }
  if (networkError) { return <NetworkError page={locale.pages.jobs} message={networkError} /> }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader title={locale.pages.templates} />

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <CardList
          items={templates}
          keyField={(item) => item.id}
          title={(item) => `${locale.enums.sender_report_template_type[item.sender_type as "EMAIL_SUMMARY"] || item.sender_type}`}
          subtitle={(item) => (
            <span className="">
              {item.sender_type.includes("EMAIL") && <>{locale.ui.mail}</>}
              {item.sender_type.includes("EMAIL") && item.sender_type.includes("WEBHOOK") && (
                <span className="mx-1 text-gray-400">•</span>
              )}
              {item.sender_type.includes("WEBHOOK") && <>{locale.ui.webhook}</>}
            </span>
          )}
          rightSlot={(item) => (
            <button
              onClick={() => openModal(item.sender_type)}
              aria-label={locale?.buttons.create || "Create"}
              title={locale?.buttons.create || "Create"}
              className="group/button inline-flex h-9 w-9 items-center justify-center rounded-full
                         bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm
                         border border-gray-200/70 dark:border-gray-800/60
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-100/70 dark:hover:bg-gray-800/60
                         transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              <EyeIcon className="h-5 w-5 group-hover transition-transform" aria-hidden="true" />
            </button>
          )}
        />
      )}
      
      <TemplatePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={modalContent}
        templateType={currentTemplateType ?? ''}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
