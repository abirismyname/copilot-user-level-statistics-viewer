'use client';

import React, { useRef, useState } from 'react';
import { useTeamLookup } from '../../TeamLookupContext';
import { parseTeamLookupCsv } from '../../../utils/teamLookupParser';

const TeamLookupUploadArea: React.FC = () => {
  const { teamLookup, setTeamLookup, clearTeamLookup } = useTeamLookup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLookup = teamLookup.size > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMessage(null);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const map = parseTeamLookupCsv(text);
        setTeamLookup(map);
        const teamCount = new Set(map.values()).size;
        setSuccessMessage(`${map.size} users mapped to ${teamCount} team${teamCount !== 1 ? 's' : ''}`);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to parse team lookup CSV');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file');
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleClear = () => {
    clearTeamLookup();
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Upload Teams Lookup (Optional)</h2>
      <p className="text-sm text-gray-500 mb-4">
        CSV with columns <code className="font-mono bg-gray-100 px-1 rounded">login</code> and{' '}
        <code className="font-mono bg-gray-100 px-1 rounded">enterprise_team_name</code> to map users to teams.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <label
          htmlFor="team-lookup-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {hasLookup ? 'Replace CSV' : 'Choose CSV'}
        </label>
        <input
          ref={fileInputRef}
          id="team-lookup-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {hasLookup && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-md transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {successMessage && (
        <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          ✓ {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default TeamLookupUploadArea;
