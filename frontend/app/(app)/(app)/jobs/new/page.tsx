'use client';

import { useI18n } from "@/locales/I18nContext";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import TextInput from '@/components/TextInput'
import SelectBox from '@/components/SelectBox'
import MultiSelectListbox from "@/components/MultiSelectListbox";
import ListInput from "@/components/ListInput";
import TimePicker from "@/components/TimePicker";
import FormButtons from "@/components/FormButtons";
import { UmamiInstance, Website, Sender, WebhookRecipient, Template } from '@/types'
import CheckboxPicker from "@/components/CheckboxPicker";
import {
  createJob
} from '@/lib/api/jobs'
import {
  fetchUmamis,
  fetchWebsitesByUmami,
  fetchReportsByWebsite
} from '@/lib/api/umami'
import {
  fetchMailers
} from '@/lib/api/mailers'
import {
  fetchWebhooks
} from '@/lib/api/webhook'
import {
  fetchTemplates
} from '@/lib/api/templates'
import { useWeekdays, useOptions } from '@/lib/constants'

export default function Jobs_New() {
  const router = useRouter()
  const { locale } = useI18n();

  const sections = [
    locale.ui.general,
    locale.ui.config,
    locale.ui.recipients,
    locale.ui.overview
  ];

  const [isStepValid, setIsStepValid] = useState(false);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<{
    name: string;
    mailer_id: string | null;
    umami_id: string | null;
    website_id: string;
    report_type: string;
    summary_items: string[];
    report_id: string | null;
    frequency: string;
    day: number | null;
    execution_time: string;
    email_recipients: string[];
    webhook_recipients: string[];
    is_active: boolean;
  }>({
    name: '',
    mailer_id: null,
    umami_id: null,
    website_id: '',
    report_type: 'summary',
    summary_items: [],
    report_id: null,
    frequency: 'daily',
    day: null,
    execution_time: '08:00',
    email_recipients: [],
    webhook_recipients: [],
    is_active: true
  });

  const [reportsLoading, setReportsLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([])
  const [senders, setSenders] = useState<Sender[]>([])
  const [webhookOptions, setWebhookOptions] = useState<WebhookRecipient[]>([])
  const [instances, setInstances] = useState<UmamiInstance[]>([])
  const [websites, setWebsites] = useState<Website[]>([])

  const WEEKDAYS = useWeekdays()


  const [selectedOptions, setSelectedOptions] = useState([]);
  const SUMMARYOPTIONS = useOptions()


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string, value: any }
  ) => {
    let name: string;
    let value: any;

    if ('target' in e) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }

    const numericFields = ['mailer_id', 'day'];
    if (numericFields.includes(name)) {
      value = value !== null && value !== '' ? Number(value) : null;
    }

    const stringFields = ['name', 'frequency', 'report_type', 'execution_time', 'website_id', 'report_id'];
    if (stringFields.includes(name)) {
      value = value ?? '';
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'report_type') {
        if (value === 'report') {
          updated.summary_items = [];
        } else if (value === 'summary') {
          updated.report_id = null;
        }
      }

      if (name === 'website_id' && prev.report_type === 'report') {
        updated.report_id = null;
      }

      if (name === 'frequency') {
        updated.day = 0;
      }

      if (name === 'umami_id') {
        updated.website_id = '';
        updated.report_id = null;
      }

      if (name === 'summary_items') {
        if (Array.isArray(value) && value.length > 10) return prev;
      }

      return updated;
    });
  };

  useEffect(() => {
    fetchUmamis().then(setInstances)
    fetchWebhooks().then(setWebhookOptions)
    fetchMailers().then(setSenders)
    fetchTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    if (!form.umami_id) return
    setWebsites([])
    const loadWebsites = async () => {
      try {
        const websites = await fetchWebsitesByUmami(form.umami_id ?? '')
        setWebsites(websites)
      } catch (err) {
        setWebsites([])
      }
    }
    loadWebsites()
  }, [form.umami_id])


  useEffect(() => {
    const loadReports = async () => {
      if (form.report_type !== 'report' || !form.website_id) return;

      setReportsLoading(true);
      try {
        const result = await fetchReportsByWebsite(form.umami_id ?? '', form.website_id);
        setReports(result);
      } catch (error) {
        setReports([]);
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
  }, [form.report_type, form.website_id]);


  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting form:', form);
    e.preventDefault()

    const emailList = form.email_recipients
      .filter(Boolean)

    await createJob(form)
    router.push('/jobs')
  }


  const validateForm = (step: number = active): boolean => {
    if (step === 0) {
      return (
        form.name.trim() !== '' &&
        form.umami_id !== null &&
        form.website_id !== '' &&
        form.frequency !== '' &&
        form.execution_time !== '' &&
        (form.frequency !== 'weekly' || form.day !== null) &&
        (form.frequency !== 'monthly' || form.day !== null)
      );
    }

    if (step === 1) {
      return (
        form.report_type !== '' &&
        (form.report_type === 'summary' ? form.summary_items.length > 0 : true) &&
        (form.report_type === 'report' ? form.report_id !== null : true)
      );
    }

    if (step === 2) {
      return true;
    }

    if (step === 3) {
      return true;
    }

    return false;
  };


  useEffect(() => {
    setIsStepValid(validateForm());
  }, [form, active]);



  const isValidGeneral = validateForm(0);
  const isValidConfig = isValidGeneral && validateForm(1);
  const isValidRecipients = isValidConfig && validateForm(2);
  const isValidOverview = isValidRecipients && validateForm(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <PageHeader title={locale.ui.create} />

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Section: Allgemein */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">{locale.ui.general}</h2>

          <TextInput
            label={locale.forms.labels.name}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={locale.forms.labels.name}
          />

          <div className="flex items-center gap-2">
            <SelectBox
              label={locale.forms.labels.umami}
              value={form.umami_id}
              onChange={(value) => handleChange({ name: 'umami_id', value })}
              options={instances.map(i => ({ value: i.id, label: i.name }))}
              placeholder={locale.forms.placeholders.choose_umami}
            />

            {form.umami_id && (
              <SelectBox
                label={locale.forms.labels.website}
                value={form.website_id}
                onChange={(value) => handleChange({ name: 'website_id', value })}
                options={websites.map(w => ({ value: w.id, label: w.name }))}
                placeholder={websites.length ? locale.forms.placeholders.choose_website : locale.forms.placeholders.loading}
                disabled={!websites.length}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <SelectBox
              label={locale.forms.labels.frequency}
              value={form.frequency}
              onChange={(value) => handleChange({ name: 'frequency', value })}
              options={[
                { value: 'daily', label: locale.enums.frequency.daily },
                { value: 'weekly', label: locale.enums.frequency.weekly },
                { value: 'monthly', label: locale.enums.frequency.monthly },
              ]}
            />

            {form.frequency === 'weekly' && (
              <SelectBox
                label={locale.forms.labels.weekday}
                value={form.day}
                onChange={(value) => handleChange({ name: 'day', value })}
                options={WEEKDAYS.map(day => ({
                  value: String(day.value),
                  label: day.label
                }))}
                placeholder={locale.forms.placeholders.choose_weekday}
              />
            )}

            {form.frequency === 'monthly' && (
              <SelectBox
                label={locale.forms.labels.day}
                value={form.day}
                onChange={(value) => handleChange({ name: 'day', value })}
                options={Array.from({ length: 31 }, (_, i) => ({
                  value: String(i + 1),
                  label: String(i + 1)
                }))}
                placeholder={locale.forms.placeholders.choose_day}
              />
            )}

            <TimePicker
              label={locale.forms.labels.execution_time}
              value={form.execution_time}
              onChange={(newTime) => handleChange({ name: 'execution_time', value: newTime })}
            />
          </div>
        </section>

        {/* Section: Config */}
        {isValidGeneral && (
          <section className="space-y-6">
            <h2 className="text-lg">{locale.ui.config}</h2>

            <SelectBox
              label={locale.forms.labels.type}
              value={form.report_type}
              onChange={(value) => handleChange({ name: 'report_type', value })}
              options={[
                { value: 'summary', label: locale.enums.job_content_type.summary },
                { value: 'report', label: locale.enums.job_content_type.report },
              ]}
            />

            {form.report_type === 'summary' && (
              <>
                <CheckboxPicker
                  name="summary_items"
                  options={SUMMARYOPTIONS}
                  selectedOptions={form.summary_items}
                  onChange={handleChange}
                />
                {form.summary_items.length >= 10 && (
                  <p className="text-sm text-red-500">
                    {locale.forms.errors.max_items.replace('{max}', '10')}
                  </p>
                )}
              </>
            )}

            {form.report_type === 'report' && (
              <SelectBox
                label={locale.forms.labels.report}
                value={form.report_id}
                onChange={(value) => handleChange({ name: 'report_id', value })}
                options={reports.map(w => ({ value: w.id, label: w.name + ' - ' + w.type }))}
                placeholder={reports.length ? locale.forms.placeholders.choose_report : locale.forms.placeholders.loading}
                disabled={!reports.length}
              />
            )}
          </section>
        )}

        {/* Section: Recipients */}
        {isValidConfig && (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">{locale.ui.recipients}</h2>

            {senders.length == 0 && webhookOptions.length == 0 && (
              <p className="text-sm text-gray-500">
                {'locale.forms.placeholders.no_senders_or_webhooks'}
              </p>
            )}

            {senders.length > 0 && (
              <>
                <SelectBox
                  label={locale.forms.labels.email_sender}
                  value={form.mailer_id}
                  onChange={(value) =>
                    setForm(prev => ({
                      ...prev,
                      mailer_id: value ? value : null
                    }))
                  }
                  options={senders.map(s => ({ value: String(s.id), label: s.name }))}
                  placeholder={locale.forms.placeholders.choose_sender}
                  canClear={true}
                />

                {form.mailer_id && (
                  <ListInput
                    label={locale.forms.labels.email_recipients}
                    value={form.email_recipients}
                    onChange={(emails) => setForm(prev => ({ ...prev, email_recipients: emails }))}
                    placeholder={form.email_recipients.length > 0 ? '' : "anna@example.com, max@example.org"}
                    disabled={!form.mailer_id}
                  />
                )}
              </>
            )}

            {webhookOptions.length > 0 && (
              <MultiSelectListbox
                label={locale.forms.labels.webhook_recipients}
                options={webhookOptions}
                selected={form.webhook_recipients}
                onChange={(newSelected) => setForm(prev => ({ ...prev, webhook_recipients: newSelected }))}
                placeholder={locale.forms.placeholders.choose_webhook}
              />
            )}
          </section>
        )}

        {/* Section: Overview + Submit */}
        {isValidRecipients && (
          <>
            <div className="flex justify-end">
              <FormButtons
                cancelLabel={locale.buttons.cancel}
                saveLabel={locale.buttons.save}
                disabled={!form.umami_id || !form.website_id || (form.frequency === 'weekly' && !form.day)}
              />
            </div>
          </>
        )}
      </form>
    </div>
  );

}