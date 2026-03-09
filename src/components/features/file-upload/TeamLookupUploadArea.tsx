'use client';

import React, { useRef, useState } from 'react';
import { useTeamLookup } from '../../TeamLookupContext';
import { parseTeamLookupCsv } from '../../../utils/teamLookupParser';

const TeamLookupUploadArea: React.FC = () => {
  const { teamLookup, setTeamLookup, clearTeamLookup } = useTeamLookup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLookup = teamLookup.size > 0;

  const processFile = (file: File) => {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = () => {
    clearTeamLookup();
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Upload Teams Lookup (Optional)</h2>
      <p className="text-sm text-gray-500 mb-2">
        CSV with columns <code className="font-mono bg-gray-100 px-1 rounded">login</code> and{' '}
        <code className="font-mono bg-gray-100 px-1 rounded">enterprise_team_name</code> to map users to teams.
      </p>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : hasLookup
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id="team-lookup-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="team-lookup-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <svg
            className={`w-12 h-12 ${hasLookup ? 'text-green-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {hasLookup ? 'Click to replace or drag and drop' : 'Click to upload or drag and drop'}
          </span>
          <span className="text-xs text-gray-500">Accepted: .csv</span>
        </label>
      </div>

      {hasLookup && (
        <div className="mt-3 flex items-center justify-between">
          {successMessage && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              ✓ {successMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {!hasLookup && successMessage && (
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
