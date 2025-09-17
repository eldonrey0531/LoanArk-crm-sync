// netlify/functions/email-verification-records.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).json({ message: 'CORS preflight response' });
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`
      }
    });
    return;
  }

  try {
    // Parse query parameters
    const queryParams = req.query || {};

    // Pagination parameters
    const page = parseInt(queryParams.page) || 1;
    const limit = Math.min(parseInt(queryParams.limit) || 50, 1000); // Max 1000 records
    const offset = (page - 1) * limit;

    // Filter parameters
    const statusFilter = queryParams.status ? queryParams.status.split(',') : null;
    const dateFrom = queryParams.dateFrom;
    const dateTo = queryParams.dateTo;

    // Build query
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .not('email_verification_status', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (statusFilter && statusFilter.length > 0) {
      query = query.in('email_verification_status', statusFilter);
    }

    // Apply date range filter if provided
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Execute query
    const { data: records, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);

      
res.status(500).json({
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch email verification records',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}`
          }
        })
      };
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Transform records to match API contract
    const transformedRecords = (records || []).map(record => ({
      id: record.id,
      name: record.name,
      email: record.email,
      hs_object_id: record.hs_object_id,
      email_verification_status: record.email_verification_status,
      created_at: record.created_at,
      updated_at: record.updated_at
    }));

    // Return successful response
    
res.status(500).json({
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          records: transformedRecords,
          pagination: {
            page,
            limit,
            total: count,
            totalPages,
            hasNextPage,
            hasPreviousPage
          },
          metadata: {
            filteredCount: transformedRecords.length,
            lastUpdated: new Date().toISOString()
          }
        }
      })
    };

  } catch (error) {
    console.error('Unexpected error:', error);

    
res.status(500).json({
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      })
    };
  }
};