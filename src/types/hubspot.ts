export interface HubSpotContact {
  hs_object_id: string;
  email: string;
  email_verification_status?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  mobilephone?: string;
  client_type_vip_status?: string;
  client_type_prospects?: string;
  address?: string;
  city?: string;
  zip?: string;
  createdate: string;
  lastmodifieddate: string;
}

export interface ContactListResponse {
  contacts: HubSpotContact[];
  total: number;
  hasMore: boolean;
}

export interface ContactQueryParams {
  limit?: number;
  offset?: number;
  properties?: string;
}