'use client';

import React from 'react';

const HowToGetData: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Get Your Data Export</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs mr-3 flex-shrink-0 mt-0.5">1</span>
            <p>Navigate to your GitHub Enterprise account settings or organization dashboard</p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs mr-3 flex-shrink-0 mt-0.5">2</span>
            <p>Go to the <strong>GitHub Copilot Usage Metrics Dashboard</strong></p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs mr-3 flex-shrink-0 mt-0.5">3</span>
            <p>Select the desired date range and export options</p>
          </div>
          <div className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs mr-3 flex-shrink-0 mt-0.5">4</span>
            <p>Download the <strong>User Level Metrics</strong> file (NDJSON format)</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/view-usage-and-adoption"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View GitHub Documentation
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Generate the Teams Metrics Lookup CSV</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Use the{' '}
            <a
              href="https://gist.github.com/abirismyname/fb54c990abb04c73c1f4c00061cc37dd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              enterprise-team-members
            </a>{' '}
            GitHub CLI script to generate a CSV mapping enterprise users to their teams:
          </p>
          <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto whitespace-pre">
{`# Download the script
gh gist view fb54c990abb04c73c1f4c00061cc37dd --raw > enterprise-team-members.sh
chmod +x enterprise-team-members.sh

# Run it (requires admin:enterprise token scope)
./enterprise-team-members.sh YOUR_ENTERPRISE_SLUG`}
          </pre>
          <p>
            This produces an <code className="font-mono bg-gray-100 px-1 rounded">enterprise_team_members.csv</code> file
            with columns <code className="font-mono bg-gray-100 px-1 rounded">login</code>,{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">enterprise_team_slug</code>, and{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">enterprise_team_name</code>.
          </p>
          <p className="text-gray-500">
            <strong>Note:</strong> Your GitHub token needs the{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">admin:enterprise</code> scope. Run{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">gh auth refresh -h github.com -s admin:enterprise</code>{' '}
            if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToGetData;
