import React, { useState, useEffect, useRef } from 'react';
import Masthead from '../components/Masthead';
import PageStatus from '../components/PageStatus';
import ComponentsContainer from '../components/ComponentsContainer';
import IncidentsList from '../components/IncidentsList';
import PageFooter from '../components/PageFooter';
import { 
  fetchSummary, 
  fetchUnresolvedIncidents, 
  getOverallStatus, 
  groupComponents,
  Component,
  Incident 
} from '../server/apiHandlers';
import ComponentGroup from '../components/ComponentGroup';
import type { Component as ComponentType } from '../server/apiHandlers';

function nestComponents(components: ComponentType[]): (ComponentType & { children: (ComponentType & { children: any[] })[] })[] {
  const map: Record<string, ComponentType & { children: any[] }> = {};
  const roots: (ComponentType & { children: any[] })[] = [];
  components.forEach((comp) => {
    map[comp.id] = { ...comp, children: [] };
  });
  components.forEach((comp) => {
    if (comp.group_id && map[comp.group_id]) {
      map[comp.group_id].children.push(map[comp.id]);
    } else {
      roots.push(map[comp.id]);
    }
  });
  return roots;
}

// Recursive filter for nested components
function filterComponents(
  components: (ComponentType & { children?: (ComponentType & { children?: any[] })[] })[],
  search: string,
  statusFilter: string
): (ComponentType & { children?: (ComponentType & { children?: any[] })[] })[] {
  return components
    .map(component => {
      let children = component.children ? filterComponents(component.children, search, statusFilter) : [];
      const matches =
        (statusFilter === 'all' || component.status === statusFilter) &&
        component.name.toLowerCase().includes(search.toLowerCase());
      if (matches || children.length > 0) {
        return { ...component, children };
      }
      return null;
    })
    .filter(Boolean) as (ComponentType & { children?: (ComponentType & { children?: any[] })[] })[];
}

const StatusPage: React.FC = () => {
  const [components, setComponents] = useState<(ComponentType & { children?: (ComponentType & { children?: any[] })[] })[]>([]);
  const [unresolvedIncidents, setUnresolvedIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summary, unresolved] = await Promise.all([
        fetchSummary(),
        fetchUnresolvedIncidents()
      ]);
      const nestedComponents = nestComponents(summary.components);
      setComponents(nestedComponents);
      setUnresolvedIncidents(unresolved.incidents);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // WebSocket connection for real-time updates
    wsRef.current = new WebSocket('ws://localhost:3000');
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'status') setComponents(msg.data.components);
      if (msg.type === 'incidents') setUnresolvedIncidents(msg.data.incidents);
      // Add more as needed
    };
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  // Remove or reduce polling interval
  useEffect(() => {
    fetchData();
    // Optionally, keep a long interval as fallback
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtering logic
  const filteredComponents = filterComponents(components, search, statusFilter);
  const filteredIncidents = unresolvedIncidents.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const overallStatus = getOverallStatus(components as any);
  const groupedComponents = groupComponents(components as any);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Masthead />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading status data...</p>
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
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Masthead />
      
      <PageStatus 
        status={overallStatus}
        message={overallStatus === 'operational' ? 'All systems are running smoothly.' : 'Some systems are experiencing issues.'}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="border px-2 py-1 rounded" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border px-2 py-1 rounded">
            <option value="all">All</option>
            <option value="operational">Operational</option>
            <option value="degraded_performance">Degraded</option>
            <option value="partial_outage">Partial Outage</option>
            <option value="major_outage">Major Outage</option>
            <option value="under_maintenance">Maintenance</option>
          </select>
        </div>

        <div className="grid gap-8">
          <ComponentGroup name="Ungrouped Components" components={filteredComponents as any} isExpanded />

          {filteredIncidents.length > 0 && (
            <IncidentsList 
              incidents={filteredIncidents}
              title="Active Incidents"
              showResolved={false}
            />
          )}

          <IncidentsList 
            incidents={[]} // We'll fetch this separately if needed
            title="Recent Incidents"
            showResolved={true}
          />
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default StatusPage;


//HARD CODED JSON RESPONSE TO TEST SUB-COMPONENT

// import React, { useState, useEffect } from 'react';
// import Masthead from '../components/Masthead';
// import PageStatus from '../components/PageStatus';
// import ComponentsContainer from '../components/ComponentsContainer';
// import IncidentsList from '../components/IncidentsList';
// import PageFooter from '../components/PageFooter';
// import { 
//   fetchSummary, 
//   fetchUnresolvedIncidents, 
//   getOverallStatus, 
//   groupComponents,
//   Component,
//   Incident 
// } from '../server/apiHandlers';
// import ComponentGroup from '../components/ComponentGroup';

// const StatusPage: React.FC = () => {
//   const [components, setComponents] = useState<Component[]>([]);
//   const [unresolvedIncidents, setUnresolvedIncidents] = useState<Incident[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [summary, unresolved] = await Promise.all([
//         fetchSummary(),
//         fetchUnresolvedIncidents()
//       ]);
      
//       setComponents(summary.components);
//       setUnresolvedIncidents(unresolved.incidents);
//       setLastUpdated(new Date());
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch status data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
    
//     // Refresh data every 30 seconds
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const overallStatus = getOverallStatus(components);
//   const groupedComponents = groupComponents(components);

//   // Transform components for the ComponentsContainer
//   const transformedComponents = components.map(component => ({
//     id: component.id,
//     name: component.name,
//     status: component.status,
//     description: component.description || undefined,
//     uptime: undefined, // We'll add this later if needed
//     group: component.group_id || undefined
//   }));

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Masthead />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading status data...</p>
//           </div>
//         </div>
//         <PageFooter />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Masthead />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
//             <p className="text-gray-600">{error}</p>
//             <button 
//               onClick={fetchData}
//               className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//         <PageFooter />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Masthead />
      
//       <PageStatus 
//         status={overallStatus}
//         message={overallStatus === 'operational' ? 'All systems are running smoothly.' : 'Some systems are experiencing issues.'}
//       />
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Last updated: {lastUpdated.toLocaleTimeString()}
//             </p>
//           </div>
//           <button 
//             onClick={fetchData}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
//           >
//             Refresh
//           </button>
//         </div>

//         <div className="grid gap-8">
//           <ComponentGroup name="Ungrouped Components" components={components} isExpanded />

//           {unresolvedIncidents.length > 0 && (
//             <IncidentsList 
//               incidents={unresolvedIncidents}
//               title="Active Incidents"
//               showResolved={false}
//             />
//           )}

//           <IncidentsList 
//             incidents={[]} // We'll fetch this separately if needed
//             title="Recent Incidents"
//             showResolved={true}
//           />
//         </div>
//       </div>

//       <PageFooter />
//     </div>
//   );
// };

// export default StatusPage;