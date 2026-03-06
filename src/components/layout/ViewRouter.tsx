'use client';

import React, { useEffect, useState } from 'react';
import { VIEW_MODES } from '../../types/navigation';
import type { UserDetailedMetrics } from '../../types/aggregatedMetrics';
import { useNavigation } from '../../state/NavigationContext';
import { useMetrics } from '../MetricsContext';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useTeamLookup } from '../TeamLookupContext';
import { terminateWorker, computeUserDetailsInWorker } from '../../workers/metricsWorkerClient';
import { computeTeamSummaries } from '../../utils/teamSummaryUtils';
import { FileUploadArea } from '../features/file-upload';
import { OverviewDashboard } from '../features/overview';
import UniqueUsersView from '../UniqueUsersView';
import UniqueTeamsView from '../UniqueTeamsView';
import UserDetailsView from '../UserDetailsView';
import LanguagesView from '../LanguagesView';
import IDEView from '../IDEView';
import CopilotImpactView from '../CopilotImpactView';
import PRUUsageAnalysisView from '../PRUUsageAnalysisView';
import CopilotAdoptionView from '../CopilotAdoptionView';
import ModelDetailsView from '../ModelDetailsView';
import ExecutiveSummaryView from '../ExecutiveSummaryView';

const ViewRouter: React.FC = () => {
  const { 
    hasData, enterpriseName, aggregatedMetrics,
    isLoading, error, resetMetrics
  } = useMetrics();
  const { 
    currentView, selectedUser, selectedModel,
    navigateTo, selectUser, selectModel, clearSelectedModel, resetNavigation
  } = useNavigation();
  const { handleFileUpload, handleSampleLoad, handleAnalyze, stagedFiles, clearStagedFiles, uploadProgress } = useFileUpload();
  const { teamLookup } = useTeamLookup();

  const [userDetails, setUserDetails] = useState<UserDetailedMetrics | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);

  useEffect(() => {
    setUserDetails(null);
    setUserDetailsLoading(false);
    setLoadedUserId(null);
  }, [aggregatedMetrics]);

  useEffect(() => {
    if (currentView === VIEW_MODES.USER_DETAILS && selectedUser && loadedUserId !== selectedUser.id) {
      setUserDetailsLoading(true);
      setUserDetails(null);
      computeUserDetailsInWorker(selectedUser.id)
        .then(details => {
          setUserDetails(details);
          setLoadedUserId(selectedUser.id);
          setUserDetailsLoading(false);
        })
        .catch(() => {
          setUserDetailsLoading(false);
          navigateTo(VIEW_MODES.USERS);
        });
    }
  }, [currentView, selectedUser, loadedUserId, navigateTo]);

  useEffect(() => {
    return () => { terminateWorker(); };
  }, []);

  const resetData = () => {
    terminateWorker();
    resetMetrics();
    resetNavigation();
  };

  const handleUserClick = (userLogin: string, userId: number) => {
    selectUser({ login: userLogin, id: userId });
  };

  if (error && hasData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to process metrics</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={resetData}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <FileUploadArea
        onFileUpload={handleFileUpload}
        onSampleLoad={handleSampleLoad}
        onAnalyze={handleAnalyze}
        stagedFiles={stagedFiles}
        onClearStaged={clearStagedFiles}
        isLoading={isLoading}
        error={error}
        uploadProgress={uploadProgress}
      />
    );
  }

  if (isLoading || !aggregatedMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Processing metrics...</p>
        </div>
      </div>
    );
  }

  const { 
    stats, 
    userSummaries: rawUserSummaries, 
    engagementData, 
    chatUsersData, 
    chatRequestsData, 
    languageStats,
    modelUsageData,
    featureAdoptionData,
    pruAnalysisData,
    agentModeHeatmapData,
    modelFeatureDistributionData,
    agentImpactData,
    codeCompletionImpactData,
    editModeImpactData,
    inlineModeImpactData,
    askModeImpactData,
    cliImpactData,
    planModeImpactData,
    joinedImpactData,
    ideStats,
    multiIDEUsersCount,
    totalUniqueIDEUsers,
    pluginVersionData,
    languageFeatureImpactData,
    dailyLanguageGenerationsData,
    dailyLanguageLocData,
    modelBreakdownData,
  } = aggregatedMetrics;

  const userSummaries = rawUserSummaries.map((u) => ({
    ...u,
    team: teamLookup.get(u.user_login),
  }));

  const teamSummaries = computeTeamSummaries(userSummaries);
  const uniqueTeams = new Set(userSummaries.map((u) => u.team).filter(Boolean)).size;

  switch (currentView) {
    case VIEW_MODES.EXECUTIVE_SUMMARY:
      return (
        <ExecutiveSummaryView
          stats={stats}
          enterpriseName={enterpriseName}
          joinedImpactData={joinedImpactData}
          modelUsageData={modelUsageData}
          agentImpactData={agentImpactData}
          codeCompletionImpactData={codeCompletionImpactData}
          featureAdoptionData={featureAdoptionData}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.LANGUAGES:
      return (
        <LanguagesView
          languages={languageStats}
          languageFeatureImpactData={languageFeatureImpactData}
          dailyLanguageGenerationsData={dailyLanguageGenerationsData}
          dailyLanguageLocData={dailyLanguageLocData}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.IDES:
      return (
        <IDEView 
          ideStats={ideStats}
          multiIDEUsersCount={multiIDEUsersCount}
          totalUniqueIDEUsers={totalUniqueIDEUsers}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)} 
        />
      );

    case VIEW_MODES.COPILOT_IMPACT:
      return (
        <CopilotImpactView
          agentImpactData={agentImpactData}
          codeCompletionImpactData={codeCompletionImpactData}
          editModeImpactData={editModeImpactData}
          inlineModeImpactData={inlineModeImpactData}
          askModeImpactData={askModeImpactData}
          cliImpactData={cliImpactData}
          planModeImpactData={planModeImpactData}
          joinedImpactData={joinedImpactData}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.PRU_USAGE:
      return (
        <PRUUsageAnalysisView
          modelUsageData={modelUsageData}
          pruAnalysisData={pruAnalysisData}
          modelFeatureDistributionData={modelFeatureDistributionData}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.COPILOT_ADOPTION:
      return (
        <CopilotAdoptionView
          featureAdoptionData={featureAdoptionData}
          agentModeHeatmapData={agentModeHeatmapData}
          stats={stats}
          pluginVersionData={pluginVersionData}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.USERS:
      return (
        <UniqueUsersView 
          users={userSummaries} 
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)} 
          onUserClick={handleUserClick}
        />
      );

    case VIEW_MODES.USER_DETAILS:
      if (!selectedUser) {
        navigateTo(VIEW_MODES.USERS);
        return null;
      }
      {
        if (userDetailsLoading || !userDetails) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
              </div>
            </div>
          );
        }
        const userSummary = userSummaries.find(u => u.user_id === selectedUser.id);
        if (!userSummary) {
          navigateTo(VIEW_MODES.USERS);
          return null;
        }
        return (
          <UserDetailsView
            userDetails={userDetails}
            userSummary={userSummary}
            userLogin={selectedUser.login}
            userId={selectedUser.id}
            onBack={() => navigateTo(VIEW_MODES.USERS)}
          />
        );
      }

    case VIEW_MODES.MODEL_DETAILS:
      if (!selectedModel) {
        navigateTo(VIEW_MODES.OVERVIEW);
        return null;
      }
      return (
        <ModelDetailsView
          modelBreakdownData={modelBreakdownData}
          onBack={() => {
            navigateTo(VIEW_MODES.OVERVIEW);
            clearSelectedModel();
          }}
        />
      );

    case VIEW_MODES.TEAMS:
      return (
        <UniqueTeamsView
          teams={teamSummaries}
          onBack={() => navigateTo(VIEW_MODES.OVERVIEW)}
        />
      );

    case VIEW_MODES.OVERVIEW:
    default:
      return (
        <OverviewDashboard
          stats={stats}
          enterpriseName={enterpriseName}
          engagementData={engagementData}
          chatUsersData={chatUsersData}
          chatRequestsData={chatRequestsData}
          uniqueTeams={uniqueTeams}
          onNavigate={navigateTo}
          onModelSelect={selectModel}
          onNavigateToTeams={() => navigateTo(VIEW_MODES.TEAMS)}
          onReset={resetData}
        />
      );
  }
};

export default ViewRouter;
