'use client';

import { useState } from 'react';
import type { TeamSummary } from '../types/metrics';
import { DashboardStatsCardGroup, ViewPanel } from './ui';
import MetricsTable, { TableColumn } from './ui/MetricsTable';
import type { VoidCallback } from '../types/events';

interface UniqueTeamsViewProps {
  teams: TeamSummary[];
  onBack: VoidCallback;
}

type SortField =
  | 'team_name'
  | 'user_count'
  | 'total_user_initiated_interactions'
  | 'total_code_generation_activities'
  | 'total_code_acceptance_activities'
  | 'total_loc_added'
  | 'total_loc_deleted'
  | 'total_loc_suggested_to_add'
  | 'days_active';

export default function UniqueTeamsView({ teams, onBack }: UniqueTeamsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('total_user_initiated_interactions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredTeams = searchQuery
    ? teams.filter((t) => t.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : teams;

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
        : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
    }
    const aNum = aVal as number;
    const bNum = bVal as number;
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const handleSort = (field: string) => {
    const f = field as SortField;
    if (sortField === f) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(f);
      setSortDirection('desc');
    }
  };

  const tableSortState = { field: sortField as string, direction: sortDirection };

  const headerBaseClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
  const valueCellClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

  const columns: TableColumn<TeamSummary>[] = [
    {
      id: 'team_name',
      header: 'Team Name',
      sortable: true,
      headerClassName: `${headerBaseClass} w-1/4`,
      className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',
      accessor: 'team_name',
    },
    {
      id: 'user_count',
      header: 'Users',
      sortable: true,
      accessor: 'user_count',
      headerClassName: `${headerBaseClass} w-1/12`,
      className: valueCellClass,
    },
    {
      id: 'total_user_initiated_interactions',
      header: 'User Interactions',
      sortable: true,
      accessor: 'total_user_initiated_interactions',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'total_code_generation_activities',
      header: 'Code Generation',
      sortable: true,
      accessor: 'total_code_generation_activities',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'total_code_acceptance_activities',
      header: 'Code Acceptance',
      sortable: true,
      accessor: 'total_code_acceptance_activities',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'total_loc_added',
      header: 'LOC Added',
      sortable: true,
      accessor: 'total_loc_added',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'total_loc_deleted',
      header: 'LOC Deleted',
      sortable: true,
      accessor: 'total_loc_deleted',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'total_loc_suggested_to_add',
      header: 'Suggested Add',
      sortable: true,
      accessor: 'total_loc_suggested_to_add',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'days_active',
      header: 'Days Active',
      sortable: true,
      accessor: 'days_active',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: valueCellClass,
    },
    {
      id: 'features_used',
      header: 'Features Used',
      headerClassName: `${headerBaseClass} w-1/8`,
      className: 'px-6 py-4 whitespace-nowrap',
      renderCell: (team) => (
        <div className="flex flex-wrap gap-1">
          {team.chat_users > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Chat
            </span>
          )}
          {team.agent_users > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Agent
            </span>
          )}
          {team.cli_users > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              CLI
            </span>
          )}
        </div>
      ),
    },
  ];

  const totalInteractions = teams.reduce((sum, t) => sum + t.total_user_initiated_interactions, 0);
  const totalGeneration = teams.reduce((sum, t) => sum + t.total_code_generation_activities, 0);
  const totalAcceptance = teams.reduce((sum, t) => sum + t.total_code_acceptance_activities, 0);
  const totalUsers = teams.reduce((sum, t) => sum + t.user_count, 0);

  const summaryCards = [
    { value: teams.length, label: 'Total Teams', accent: 'teal' as const },
    { value: totalUsers, label: 'Total Users', accent: 'blue' as const },
    { value: totalInteractions, label: 'Total Interactions', accent: 'green' as const },
    { value: totalGeneration, label: 'Code Generation', accent: 'purple' as const },
    { value: totalAcceptance, label: 'Code Acceptance', accent: 'orange' as const },
  ];

  return (
    <ViewPanel
      headerProps={{
        title: 'Unique Teams',
        onBack,
      }}
      contentClassName="space-y-6"
    >
      <DashboardStatsCardGroup
        className="mb-6"
        columns={{ base: 2, md: 3, lg: 5 }}
        gapClassName="gap-4"
        items={summaryCards}
      />

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="mb-4">
          <label htmlFor="teamSearch" className="block text-sm font-medium text-gray-700 mb-2">
            Search by team name
          </label>
          <input
            id="teamSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Start typing a team name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <MetricsTable<TeamSummary>
            data={sortedTeams}
            columns={columns}
            sortState={tableSortState}
            onSortChange={({ field }) => handleSort(field)}
            rowClassName={() => 'hover:bg-gray-50 transition-colors'}
            tableClassName="w-full divide-y divide-gray-200"
            theadClassName="bg-gray-50"
          />
        </div>

        {teams.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No team data available. Upload a teams lookup CSV to see team data.</p>
          </div>
        )}
      </div>
    </ViewPanel>
  );
}
