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
import { 
  ChevronLeftIcon,
  ChevronRightIcon
 } from '@heroicons/react/20/solid';
import CheckboxPicker from "@/components/CheckboxPicker";
import {
  createJob,
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
    sender_id: number | null;
    host_id: number | null;
    website_id: string;
    report_type: string;
    summary_items: string[];
    report_id: string | null;
    frequency: string;
    day: number | null;
    execution_time: string;
    email_recipients: string[];
    webhook_recipients: number[];
    is_active: boolean;
  }>({
    name: '',
    sender_id: null,
    host_id: null,
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

  const WEEKDAYS = [
    { value: 0, label: locale.weekdays.monday },
    { value: 1, label: locale.weekdays.tuesday },
    { value: 2, label: locale.weekdays.wednesday },
    { value: 3, label: locale.weekdays.thursday },
    { value: 4, label: locale.weekdays.friday },
    { value: 5, label: locale.weekdays.saturday },
    { value: 6, label: locale.weekdays.sunday },
  ]
  
  
  const [selectedOptions, setSelectedOptions] = useState([]);
  const options = [
    { value: 'stats', label: locale.enums.metrics.stats },
    { value: 'url', label: locale.enums.metrics.url },
    { value: 'referrer', label: locale.enums.metrics.referrer },
    { value: 'channel', label: locale.enums.metrics.channel },
    { value: 'browser', label: locale.enums.metrics.browser },
    { value: 'os', label: locale.enums.metrics.os },
    { value: 'device', label: locale.enums.metrics.device },
    { value: 'country', label: locale.enums.metrics.country },
    { value: 'region', label: locale.enums.metrics.region },
    { value: 'city', label: locale.enums.metrics.city },
    { value: 'language', label: locale.enums.metrics.language },
    { value: 'screen', label: locale.enums.metrics.screen },
    { value: 'event', label: locale.enums.metrics.event },
    { value: 'query', label: locale.enums.metrics.query },
    { value: 'host', label: locale.enums.metrics.host },
    { value: 'tag', label: locale.enums.metrics.tag },
  ];


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string, value: any }
  ) => {
    if ('target' in e) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      const { name, value } = e;

      setForm((prev) => {
        const updated = { ...prev };

        if (name === 'summary_items') {
          // Wert ist hier vermutlich ein Array
          if (value.length > 10) return prev; // Auswahl ignorieren, wenn mehr als 10
          updated.summary_items = value;
          return updated;
        }

        updated[name] = value;

        // Typwechsel-Logik
        if (name === 'report_type') {
          if (value === 'report') {
            updated.summary_items = [];
          } else if (value === 'summary') {
            updated.report_id = null;
          }
        }

        if (name === 'frequency') {
          updated.day = 0;
        }

        return updated;
      });
    }
  };




  useEffect(() => {
    fetchUmamis().then(setInstances)
    fetchWebhooks().then(setWebhookOptions)
    fetchMailers().then(setSenders)
    fetchTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    if (!form.host_id) return
    setWebsites([])
    const loadWebsites = async () => {
      try {
        const websites = await fetchWebsitesByUmami(Number(form.host_id))
        setWebsites(websites)
        //setError(null)
      } catch (err) {
        setWebsites([])
        //setError('Websites konnten nicht geladen werden.')
      }
    }
    loadWebsites()
  }, [form.host_id])


  useEffect(() => {
    const loadReports = async () => {
      if (form.report_type !== 'report' || !form.website_id) return;

      setReportsLoading(true);
      try {
        const result = await fetchReportsByWebsite(Number(form.host_id), form.website_id);
        setReports(result);
      } catch (error) {
        console.error('Fehler beim Laden der Reports:', error);
        setReports([]);
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
  }, [form.report_type, form.website_id]);


  const next = () => setActive((prev) => Math.min(prev + 1, sections.length - 1));
  const back = () => setActive((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
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
        form.host_id !== null &&
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

    return false; // Fallback: ungültig
  };


  useEffect(() => {
    setIsStepValid(validateForm());
  }, [form, active]);




  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title={locale.ui.create} />

      {/* Wizard Navigation */}
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <div className="flex space-x-4">
          {sections.map((label, i) => (
            <>
            {i >= active ? (
              <div
                key={i}
                className={`text-sm font-medium px-2 pb-1 border-b-2 ${
                  active === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                }`}
              >
                {label}
              </div>
            ) : (
              <button
                key={i}
                className={`text-sm font-medium px-2 pb-1 border-b-2 hover:text-blue-600 ${
                  active === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
                }`}
                onClick={() => setActive(i)}
              >
                {label}
              </button>
            )}
            
            </>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {active > 0 && (
            <button
              onClick={back}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-100 text-gray-600 text-bold"
            >
              <ChevronLeftIcon className="text-gray-600 w-5 h-5" />
            </button>
          )}
          <button
            onClick={next}
            className={`p-2 rounded-full ${
              isStepValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isStepValid || active >= sections.length - 1}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

      {/* Wizard Content */}
      <div className="space-y-4">
        {active === 0 && (
          <>
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
                value={form.host_id}
                onChange={(value) => handleChange({ name: 'host_id', value })}
                options={instances.map(i => ({ value: Number(i.id), label: i.name }))}
                placeholder={locale.forms.placeholders.choose_umami}
              />

              {form.host_id && (
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
            
          </>
        )}

        {active === 1 && (
          <>
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
                options={options}
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
                options={reports.map(w => ({ value: w.id, label: w.name + ' - '  + w.type }))}
                placeholder={reports.length ? locale.forms.placeholders.choose_report : locale.forms.placeholders.loading}
                disabled={!reports.length}
              />
            )}
          </>
        )}

        {active === 2 && (
          <>
            {senders.length > 0 && (
              <>
                <SelectBox
                  label={locale.forms.labels.email_sender}
                  value={form.sender_id}
                  onChange={(value) => setForm(prev => ({ ...prev, sender_id: value }))}
                  options={senders.map(s => ({ value: String(s.id), label: s.name }))}
                  placeholder={locale.forms.placeholders.choose_sender}
                  canClear={true}
                />
                {form.sender_id && (
                  <ListInput
                    label={locale.forms.labels.email_recipients}
                    value={form.email_recipients}
                    onChange={(emails) => setForm(prev => ({ ...prev, email_recipients: emails }))}
                    placeholder={form.email_recipients.length > 0 ? '' : "anna@example.com, max@example.org"}
                    disabled={!form.sender_id}
                  />
                )}

                <hr />

                <MultiSelectListbox
                  label={locale.forms.labels.webhook_recipients}
                  options={webhookOptions}
                  selected={form.webhook_recipients}
                  onChange={(newSelected) => setForm(prev => ({ ...prev, webhook_recipients: newSelected }))}
                  placeholder={locale.forms.placeholders.choose_webhook}
                />
              </>
            )}
          </>
        )}

        {active === 3 && (
          <>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.name}</p>
              <p>{form.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.umami}</p>
              <p>{form.host_id}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.website}</p>
              <p>{form.website_id}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.frequency}</p>
              <p>{form.frequency}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.execution_time}</p>
              <p>{form.execution_time}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{locale.forms.labels.type}</p>
              <p>{form.report_type}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">{'locale.forms.labels.'}</p>
              <p>{form.summary_items.join(', ')}</p>
            </div>



            {/*<pre className="text-sm bg-gray-100 p-4 rounded">{JSON.stringify(form, null, 2)}</pre>*/}
            
            <FormButtons 
              cancelLabel={locale.buttons.cancel}
              saveLabel={locale.buttons.save}
              disabled={!form.host_id || !form.website_id || (form.frequency === 'weekly' && !form.day)}
            />
          </>
        )}
      </div>

      </form>
    </div>
  );
}
