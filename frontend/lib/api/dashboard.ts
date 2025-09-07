import { apiFetch } from '@/utils/api'

export const fetchDashboard = () => apiFetch('/dashboard');



// Dashboard Response Types
export type DashboardStats = {
	umami: number;
	jobs: number;
	mailer: number;
	webhook: number;
	failed_last_7_days: number;
	success_last_7_days: number;
	success_rate_last_7_days: number;
};

export type DashboardLogDetail = {
	error: string | null;
	status: string;
	channel: string;
	target_id: string | null;
};

export type DashboardJob = {
	website_id: string;
	day: number | null;
	timezone: string;
	template_type: string;
	execution_time: string;
	email_recipients: string[];
	is_active: boolean;
	umami_id: string;
	mailer_id: string;
	created_at: string;
	user_id: string;
	name: string;
	report_type: string;
	summary_items: string[];
	updated_at: string;
	report_id: string;
	webhook_recipients: string[];
	id: string;
	frequency: string;
};

export type DashboardLog = { 
    date: string; 
    success: number; 
    failed: number; 
    warning: number; 
};


export type DashboardLastRun = {
	name: string;
	start: string;
	duration_ms: number;
	status: string;
};

export type DashboardNextRun = {
	name: string;
	type: string;
	next_run: string;
};

export type DashboardProblemJob = {
	id: string;
	name: string;
	errors: string;
	last_run: string;
};

export type DashboardInstance = {
	name: string;
	type: string;
	is_healthy: boolean;
};

export type DashboardResponse = {
	stats: DashboardStats;
	activity: DashboardLog[];
	last_runs: DashboardLastRun[];
	next_runs: DashboardNextRun[];
	problem_jobs: DashboardProblemJob[];
	instances: DashboardInstance[];
};



