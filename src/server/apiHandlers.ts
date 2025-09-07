interface StatusData {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
}

interface Component {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
  created_at: string;
  updated_at: string;
  position: number;
  description: string | null;
  showcase: boolean;
  start_date: string | null;
  group_id: string | null;
  page_id: string;
  group: boolean;
  only_show_if_degraded: boolean;
}

interface ComponentsData {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  components: Component[];
}

interface Incident {
  id: string;
  name: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: 'none' | 'minor' | 'major' | 'critical';
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: Array<{
    id: string;
    status: string;
    body: string;
    incident_id: string;
    created_at: string;
    updated_at: string;
    display_at: string;
    affected_components: Array<{
      code: string;
      name: string;
      old_status: string;
      new_status: string;
    }>;
    deliver_notifications: boolean;
    custom_tweet: string | null;
    tweet_id: string | null;
  }>;
  components: Array<{
    id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    position: number;
    description: string | null;
    showcase: boolean;
    group_id: string | null;
    page_id: string;
    group: boolean;
    only_show_if_degraded: boolean;
    start_date: string | null;
  }>;
}

interface IncidentsData {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  incidents: Incident[];
}

interface SummaryData {
  page: {
    id: string;
    name: string;
    url: string;
    time_zone: string;
    updated_at: string;
  };
  components: Component[];
  incidents: Incident[];
  scheduled_maintenances: any[];
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
}

const API_BASE = 'https://status.npmjs.org/api/v2';

let broadcastUpdate: any;
try {
  // Use require to avoid circular dependency issues
  // @ts-ignore
  broadcastUpdate = require('../../server').broadcastUpdate;
} catch (e) {
  broadcastUpdate = undefined;
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'npm-status-monitor/1.0.0'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchStatus(): Promise<StatusData> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/status.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'status', data });
    return data;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
}

export async function fetchComponents(): Promise<ComponentsData> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/components.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'components', data });
    return data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
}

export async function fetchIncidents(): Promise<IncidentsData> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/incidents.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'incidents', data });
    return data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
}

export async function fetchUnresolvedIncidents(): Promise<IncidentsData> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/incidents/unresolved.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'incidents', data });
    return data;
  } catch (error) {
    console.error('Error fetching unresolved incidents:', error);
    throw error;
  }
}

export async function fetchSummary(): Promise<SummaryData> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/summary.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'summary', data });
    return data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

export async function fetchScheduledMaintenances(type: 'upcoming' | 'active' | 'all' = 'all'): Promise<any> {
  try {
    const url = type === 'all' 
      ? `${API_BASE}/scheduled-maintenances.json`
      : `${API_BASE}/scheduled-maintenances/${type}.json`;
    
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    broadcastUpdate && broadcastUpdate({ type: 'scheduled_maintenances', data });
    return data;
  } catch (error) {
    console.error('Error fetching scheduled maintenances:', error);
    throw error;
  }
}

export function getOverallStatus(components: Component[]): 'operational' | 'partial' | 'major' | 'minor' {
  const statusCounts = components.reduce((acc, component) => {
    acc[component.status] = (acc[component.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (statusCounts['major_outage'] > 0) return 'major';
  if (statusCounts['partial_outage'] > 0) return 'partial';
  if (statusCounts['degraded_performance'] > 0) return 'minor';
  return 'operational';
}

export function groupComponents(components: Component[]): Record<string, Component[]> {
  return components.reduce((acc, component) => {
    const group = component.group_id || 'Ungrouped';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(component);
    return acc;
  }, {} as Record<string, Component[]>);
}

export type { StatusData, ComponentsData, Incident, IncidentsData, SummaryData, Component }; 