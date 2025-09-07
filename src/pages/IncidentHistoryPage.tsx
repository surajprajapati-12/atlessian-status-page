import React, { useState, useEffect, useMemo } from 'react';
import Masthead from '../components/Masthead';
import PageFooter from '../components/PageFooter';
import IncidentsList from '../components/IncidentsList';
import { fetchIncidents, Incident } from '../server/apiHandlers';

function formatMonthYear(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

const IncidentHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [monthIndex, setMonthIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const incidentsData = await fetchIncidents();
        setIncidents(incidentsData.incidents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incident data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredIncidents = useMemo(() => incidents.filter(incident => {
    if (filter === 'resolved') return incident.status === 'resolved';
    if (filter === 'unresolved') return incident.status !== 'resolved';
    return true;
  }), [incidents, filter]);

  // Group incidents by month-year
  const monthGroups = useMemo(() => {
    const groups: Record<string, Incident[]> = {};
    filteredIncidents.forEach(incident => {
      const key = formatMonthYear(incident.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(incident);
    });
    // Sort months descending (latest first)
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredIncidents]);

  // For slider: get current, prev, next months
  const months = monthGroups.map(([month]) => month);
  const currentMonth = months[monthIndex] || null;
  const prevMonth = months[monthIndex + 1] || null;
  const nextMonth = months[monthIndex - 1] || null;
  const currentIncidents = currentMonth ? monthGroups.find(([m]) => m === currentMonth)?.[1] || [] : [];

  const impactStats = useMemo(() => {
    const stats = { critical: 0, major: 0, minor: 0, none: 0 };
    incidents.forEach(incident => { stats[incident.impact]++; });
    return stats;
  }, [incidents]);
  const statusStats = useMemo(() => {
    const stats = { investigating: 0, identified: 0, monitoring: 0, resolved: 0, postmortem: 0 };
    incidents.forEach(incident => { stats[incident.status]++; });
    return stats;
  }, [incidents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Masthead />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading incident history...</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Masthead />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Masthead />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident History</h1>
          <p className="text-gray-600">
            Complete history of all incidents and their resolutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Critical</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(impactStats.critical / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{impactStats.critical}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Major</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(impactStats.major / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{impactStats.major}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Minor</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(impactStats.minor / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{impactStats.minor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">None</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${(impactStats.none / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{impactStats.none}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolved</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(statusStats.resolved / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{statusStats.resolved}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Investigating</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(statusStats.investigating / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{statusStats.investigating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Identified</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(statusStats.identified / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{statusStats.identified}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monitoring</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(statusStats.monitoring / incidents.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{statusStats.monitoring}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'unresolved'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Unresolved ({incidents.filter(i => i.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'resolved'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Resolved ({incidents.filter(i => i.status === 'resolved').length})
            </button>
          </div>
        </div>

        {months.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <button
              className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
              onClick={() => setMonthIndex(i => Math.min(i + 1, months.length - 1))}
              disabled={monthIndex === months.length - 1}
            >
              <span className="sr-only">Previous month</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="text-xl text-gray-600 font-semibold">
              {currentMonth}
            </div>
            <button
              className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
              onClick={() => setMonthIndex(i => Math.max(i - 1, 0))}
              disabled={monthIndex === 0}
            >
              <span className="sr-only">Next month</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        <IncidentsList 
          incidents={currentIncidents}
          title={undefined}
          showResolved={filter !== 'unresolved'}
        />
      </div>
      <PageFooter />
    </div>
  );
};

export default IncidentHistoryPage; 