export type CheckinSiteRow = {
	id: string;
	name: string;
	base_url: string;
	checkin_url?: string | null;
	token: string;
	new_api_user?: string | null;
	last_checkin_date?: string | null;
	last_checkin_status?: string | null;
	last_checkin_message?: string | null;
	last_checkin_at?: string | null;
	status: string;
	created_at?: string | null;
	updated_at?: string | null;
};

export type CheckinSiteRecord = CheckinSiteRow;
