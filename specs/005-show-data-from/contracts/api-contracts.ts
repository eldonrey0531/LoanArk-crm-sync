// API Contracts for Email Verification Data Display Feature
// This file defines the exact request/response contracts for all API interactions

export interface ApiContracts {
  supabase: SupabaseApiContracts;
  hubspot: HubSpotApiContracts;
  comparison: ComparisonApiContracts;
}

// Supabase API Contracts
export interface SupabaseApiContracts {
  // Fetch contacts with email verification data
  fetchContacts: {
    request: SupabaseContactsRequest;
    response: SupabaseContactsResponse;
  };

  // Fetch individual contact
  fetchContact: {
    request: SupabaseContactRequest;
    response: SupabaseContactResponse;
  };
}

// HubSpot API Contracts
export interface HubSpotApiContracts {
  // Fetch contacts from HubSpot
  fetchContacts: {
    request: HubSpotContactsRequest;
    response: HubSpotContactsResponse;
  };

  // Fetch individual contact
  fetchContact: {
    request: HubSpotContactRequest;
    response: HubSpotContactResponse;
  };
}

// Comparison API Contracts
export interface ComparisonApiContracts {
  // Fetch side-by-side comparison data
  fetchComparison: {
    request: ComparisonRequest;
    response: ComparisonResponse;
  };
}

// Request Interfaces
export interface SupabaseContactsRequest {
  page?: number;
  page_size?: number;
  filter_verified?: boolean;
  search?: string;
  sort_by?: 'name' | 'email' | 'created_at' | 'email_verification_status';
  sort_order?: 'asc' | 'desc';
}

export interface SupabaseContactRequest {
  id: number;
}

export interface HubSpotContactsRequest {
  after?: string;
  limit?: number;
  properties?: string[];
  filterGroups?: HubSpotFilterGroup[];
}

export interface HubSpotContactRequest {
  contactId: string;
  properties?: string[];
}

export interface ComparisonRequest {
  page?: number;
  page_size?: number;
  filter_status?: 'all' | 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  search?: string;
}

// Response Interfaces
export interface SupabaseContactsResponse {
  success: boolean;
  data: SupabaseContact[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
  error?: string;
}

export interface SupabaseContactResponse {
  success: boolean;
  data: SupabaseContact | null;
  error?: string;
}

export interface HubSpotContactsResponse {
  success: boolean;
  data: HubSpotContact[];
  pagination: {
    next_after?: string;
    has_more: boolean;
  };
  error?: string;
}

export interface HubSpotContactResponse {
  success: boolean;
  data: HubSpotContact | null;
  error?: string;
}

export interface ComparisonResponse {
  success: boolean;
  data: ContactComparison[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_matched: number;
    total_supabase_only: number;
    total_hubspot_only: number;
    total_mismatches: number;
  };
  error?: string;
}

// Data Models
export interface SupabaseContact {
  id: number;
  name: string;
  email: string;
  email_verification_status: string | null;
  hs_object_id: string;
  created_at: string;
  updated_at: string;
}

export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    email_verification_status?: string;
    hs_object_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactComparison {
  id: string;
  supabase: SupabaseContact | null;
  hubspot: HubSpotContact | null;
  match_status: 'matched' | 'supabase_only' | 'hubspot_only' | 'mismatch';
  differences: ContactDifference[];
  last_sync?: string;
}

export interface ContactDifference {
  field: string;
  supabase_value: any;
  hubspot_value: any;
  severity: 'info' | 'warning' | 'error';
}

// HubSpot Filter Types
export interface HubSpotFilterGroup {
  filters: HubSpotFilter[];
}

export interface HubSpotFilter {
  propertyName: string;
  operator: 'EQ' | 'NEQ' | 'LT' | 'GT' | 'LTE' | 'GTE' | 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY';
  value?: any;
}

// Error Types
export interface ApiError {
  type: 'network' | 'auth' | 'validation' | 'server' | 'rate_limit';
  message: string;
  details?: any;
  retryable: boolean;
  retry_after?: number;
}

// Validation Rules
export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  email_verification_status: {
    allowedValues: ['verified', 'unverified', 'pending', 'failed', null],
    nullable: true
  },
  page: {
    min: 1,
    max: 1000
  },
  page_size: {
    min: 10,
    max: 200,
    default: 50
  }
} as const;

// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API Endpoints
export const ApiEndpoints = {
  supabase: {
    contacts: '/api/supabase/contacts',
    contact: (id: number) => `/api/supabase/contacts/${id}`
  },
  hubspot: {
    contacts: '/api/hubspot/contacts',
    contact: (id: string) => `/api/hubspot/contacts/${id}`
  },
  comparison: {
    data: '/api/comparison/email-verification'
  }
} as const;

// Rate Limiting
export const RateLimits = {
  supabase: {
    requests_per_minute: 60,
    burst_limit: 10
  },
  hubspot: {
    requests_per_minute: 100,
    burst_limit: 20
  }
} as const;

// Cache Configuration
export const CacheConfig = {
  comparison_data: {
    ttl: 5 * 60 * 1000, // 5 minutes
    max_age: 10 * 60 * 1000 // 10 minutes
  },
  individual_contacts: {
    ttl: 15 * 60 * 1000, // 15 minutes
    max_age: 30 * 60 * 1000 // 30 minutes
  }
} as const;