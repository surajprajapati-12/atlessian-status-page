import React from 'react';

function formatMonthYear(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatIncidentTime(start: string, end: string | null) {
  const startDate = new Date(start);
  let result = startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  if (end) {
    const endDate = new Date(end);
    result += ' - ' + endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  result += ' UTC';
  return result;
}

function groupByMonthYear(incidents: any[]) {
  const groups: Record<string, any[]> = {};
  incidents.forEach(incident => {
    const key = formatMonthYear(incident.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(incident);
  });
  return groups;
}

interface Incident {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  resolved_at: string | null;
  incident_updates: Array<{
    body: string;
    created_at: string;
  }>;
}

interface IncidentsListProps {
  incidents: Incident[];
  title?: string;
  showResolved?: boolean;
}

const IncidentsList: React.FC<IncidentsListProps> = ({ incidents, title, showResolved = true }) => {
  // Group by month/year
  const grouped = groupByMonthYear(incidents);

  // Get all months in range (including months with no incidents)
  // For simplicity, just use months present in data
  const months = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="">
      {title && <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>}
      {months.length === 0 && (
        <div className="text-gray-400 text-base mb-6">No incidents reported.</div>
      )}
      {months.map(month => (
        <div key={month} className="mb-10">
          <div className="text-2xl font-semibold text-gray-500 mb-2 border-b pb-1">{month}</div>
          {grouped[month].length === 0 ? (
            <div className="text-gray-400 text-base mb-6">No incidents reported for this month.</div>
          ) : (
            grouped[month].map((incident: Incident) => (
              <div key={incident.id} className="mb-6">
                <div className={`font-bold text-lg mb-1 ${incident.impact === 'minor' ? 'text-yellow-500' : incident.impact === 'major' ? 'text-orange-500' : 'text-gray-700'}`}>
                  {incident.name}
                </div>
                <div className="text-gray-500 mb-1">
                  {incident.incident_updates[0]?.body || (incident.status === 'resolved' ? 'This incident has been resolved.' : '')}
                </div>
                <div className="text-xs text-gray-400">
                  {formatIncidentTime(incident.created_at, incident.resolved_at)}
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default IncidentsList; 