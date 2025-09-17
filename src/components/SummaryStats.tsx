// src/components/SummaryStats.tsx

/**
 * Summary Statistics Component
 *
 * Displays summary statistics and data visualization for the comparison data.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Import types
import { SummaryStatsProps } from '@/types/emailVerificationDataDisplay';

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  summary,
  totalRecords,
  showPercentages = true,
  compact = false,
  className
}) => {
  // Calculate statistics from summary data
  const stats = React.useMemo(() => {
    if (!summary) {
      return {
        total: totalRecords || 0,
        matched: 0,
        supabaseOnly: 0,
        hubspotOnly: 0,
        mismatches: 0,
        matchPercentage: 0,
        mismatchPercentage: 0
      };
    }

    const total = totalRecords || 0;
    const matched = summary.total_matched;
    const supabaseOnly = summary.total_supabase_only;
    const hubspotOnly = summary.total_hubspot_only;
    const mismatches = summary.total_mismatches;

    const matchPercentage = total > 0 ? Math.round((matched / total) * 100) : 0;
    const mismatchPercentage = total > 0 ? Math.round(((supabaseOnly + hubspotOnly + mismatches) / total) * 100) : 0;

    return {
      total,
      matched,
      supabaseOnly,
      hubspotOnly,
      mismatches,
      matchPercentage,
      mismatchPercentage
    };
  }, [summary, totalRecords]);

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Total contacts in comparison'
    },
    {
      title: 'Matched',
      value: stats.matched,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Contacts with matching data'
    },
    {
      title: 'Supabase Only',
      value: stats.supabaseOnly,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Contacts only in Supabase'
    },
    {
      title: 'HubSpot Only',
      value: stats.hubspotOnly,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Contacts only in HubSpot'
    },
    {
      title: 'Mismatches',
      value: stats.mismatches,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Contacts with data differences'
    }
  ];

  return (
    <div className={className}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-1 rounded ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Synchronization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Match Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Match Rate</span>
                <Badge variant="secondary" className="text-green-700 bg-green-50">
                  {stats.matchPercentage}%
                </Badge>
              </div>
              <Progress value={stats.matchPercentage} className="h-2" />
            </div>

            {/* Mismatch Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Issues to Resolve</span>
                <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                  {stats.mismatchPercentage}%
                </Badge>
              </div>
              <Progress value={stats.mismatchPercentage} className="h-2" />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {stats.matched}
                </div>
                <div className="text-sm text-muted-foreground">Synced</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {stats.supabaseOnly + stats.hubspotOnly}
                </div>
                <div className="text-sm text-muted-foreground">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {stats.mismatches}
                </div>
                <div className="text-sm text-muted-foreground">Conflicts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(stats.supabaseOnly > 0 || stats.hubspotOnly > 0 || stats.mismatches > 0) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.supabaseOnly > 0 && (
                <Badge variant="outline" className="text-orange-700 border-orange-200">
                  {stats.supabaseOnly} contacts need HubSpot sync
                </Badge>
              )}
              {stats.hubspotOnly > 0 && (
                <Badge variant="outline" className="text-red-700 border-red-200">
                  {stats.hubspotOnly} contacts need Supabase sync
                </Badge>
              )}
              {stats.mismatches > 0 && (
                <Badge variant="outline" className="text-purple-700 border-purple-200">
                  {stats.mismatches} conflicts need resolution
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};