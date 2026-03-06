"use client";

import React, { useState, useRef } from 'react';
import PrivacyNotice from './PrivacyNotice';
import HowToGetData from './HowToGetData';
import TeamLookupUploadArea from './TeamLookupUploadArea';
import { MultiFileProgress } from '../../../infra/metricsFileParser';

interface FileUploadAreaProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSampleLoad: () => void;
  onAnalyze: () => void;
  stagedFiles: File[];
  onClearStaged: () => void;
  isLoading: boolean;
  error: string | null;
  uploadProgress?: MultiFileProgress | null;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileUpload,
  onSampleLoad,
  onAnalyze,
  stagedFiles,
  onClearStaged,
  isLoading,
  error,
  uploadProgress,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < files.length; i++) {
          dataTransfer.items.add(files[i]);
        }
        fileInputRef.current.files = dataTransfer.files;
        
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const hasStagedFiles = stagedFiles.length > 0;

  return (
    <div className="space-y-6">
      <PrivacyNotice />
      <HowToGetData />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Metrics File</h2>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : hasStagedFiles
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
            type="file"
            accept=".ndjson,.json"
            multiple
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <svg
              className={`w-12 h-12 ${hasStagedFiles ? 'text-green-500' : 'text-gray-400'}`}
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
              {hasStagedFiles ? 'Click to replace files or drag and drop' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-gray-500">Accepted: .ndjson, .json (multiple files supported)</span>
          </label>
        </div>

        {hasStagedFiles && !isLoading && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} ready to analyze
                </p>
                <ul className="text-sm text-green-700 space-y-0.5">
                  {stagedFiles.map((f) => (
                    <li key={f.name} className="flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={onClearStaged}
                className="text-xs text-green-600 hover:text-green-800 underline ml-2 flex-shrink-0"
              >
                Clear
              </button>
            </div>
            <button
              onClick={onAnalyze}
              className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Analyze
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onSampleLoad}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Load Sample Data
          </button>
        </div>
        
        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-flex flex-col items-center space-y-2">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-gray-600">
                  {uploadProgress && uploadProgress.totalFiles > 1
                    ? `Processing file ${uploadProgress.currentFile} of ${uploadProgress.totalFiles}...`
                    : 'Processing file...'}
                </span>
              </div>
              {uploadProgress && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{uploadProgress.fileName}</span>
                  <span className="mx-2">•</span>
                  <span>{uploadProgress.recordsProcessed.toLocaleString()} records processed</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      <TeamLookupUploadArea />
    </div>
  );
};

export default FileUploadArea;
