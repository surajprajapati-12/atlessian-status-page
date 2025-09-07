import React, { useState, useEffect } from 'react';
import Masthead from '../components/Masthead';
import PageFooter from '../components/PageFooter';
import { fetchSummary, Component } from '../server/apiHandlers';
import type { Component as ComponentType } from '../server/apiHandlers';

function getMonthYear(date: Date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const UPTIME_MONTHS = 3; // Show 3 months at a time

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

const UptimePage: React.FC = () => {
  const [components, setComponents] = useState<(ComponentType & { children?: (ComponentType & { children?: any[] })[] })[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = latest, 1 = previous set, etc.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'tiles' | 'calendar'>('tiles');
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summary = await fetchSummary();
        const nestedComponents = nestComponents(summary.components);
        setComponents(nestedComponents);
        if (!selectedComponentId && nestedComponents.length > 0) {
          setSelectedComponentId(nestedComponents[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch uptime data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const selectedComponent = components.find(c => c.id === selectedComponentId);

  // Generate mock uptime data for the past 90 days
  type UptimeDay = { 
    date: string; 
    uptime: number; 
    status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
    duration?: { hours: number; minutes: number };
    relatedMessage?: string;
  };
  const generateUptimeData = (component: ComponentType): UptimeDay[] => {
    const data: UptimeDay[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      let status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
      let uptime: number;
      const rand = Math.random();
      if (rand < 0.95) {
        status = 'operational';
        uptime = 99.95 + Math.random() * 0.05;
      } else if (rand < 0.99) {
        status = 'degraded_performance';
        uptime = 98.0 + Math.random() * 1.5;
      } else if (rand < 0.999) {
        status = 'partial_outage';
        uptime = 95.0 + Math.random() * 2.5;
      } else {
        status = 'major_outage';
        uptime = 85.0 + Math.random() * 10.0;
      }
      data.push({
        date: date.toISOString().split('T')[0],
        uptime: Math.round(uptime * 100) / 100,
        status,
        duration: status !== 'operational' ? { hours: Math.floor(Math.random() * 4), minutes: Math.floor(Math.random() * 60) } : undefined,
        relatedMessage: status !== 'operational' ? 'Service disruption detected' : undefined
      });
    }
    return data;
  };

  // Helper to get color by status
  function getStatusColor(status: string) {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded_performance':
        return 'bg-yellow-400';
      case 'partial_outage':
        return 'bg-orange-500';
      case 'major_outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  }

  // Group uptime data by month
  function groupUptimeByMonth(uptimeData: UptimeDay[]) {
    const groups: Record<string, UptimeDay[]> = {};
    uptimeData.forEach(day => {
      const d = new Date(day.date);
      const key = getMonthYear(d);
      if (!groups[key]) groups[key] = [];
      groups[key].push(day);
    });
    return groups;
  }

  // Get the months to display based on offset
  function getMonthRange(uptimeData: UptimeDay[]) {
    const months = Array.from(new Set(uptimeData.map(day => getMonthYear(new Date(day.date)))));
    const total = months.length;
    const start = Math.max(0, total - UPTIME_MONTHS - monthOffset);
    const end = total - monthOffset;
    return months.slice(start, end);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Masthead />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading uptime data...</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (error || !selectedComponent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Masthead />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
            <p className="text-gray-600">{error || 'No component selected.'}</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // --- Tiles View ---
  const tilesView = (
    <div className="grid gap-6">
      {components.map((component) => {
        let uptimeData;
        if (component.children && component.children.length > 0) {
          // All days are operational (green)
          const today = new Date();
          uptimeData = [];
          for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            uptimeData.push({
              date: date.toISOString().split('T')[0],
              uptime: 100,
              status: 'operational' as const
            });
          }
        } else {
          uptimeData = generateUptimeData(component);
        }
        const overallUptime = Math.round((uptimeData.reduce((sum, day) => sum + day.uptime, 0) / uptimeData.length) * 100) / 100;
        const statusText = component.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const statusColor = component.status === 'operational' ? 'text-green-600' : component.status === 'degraded_performance' ? 'text-yellow-600' : component.status === 'partial_outage' ? 'text-orange-600' : 'text-red-600';
        return (
          <div key={component.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-gray-700">{component.name}</span>
                {component.description && (
                  <div className="relative group ml-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-base cursor-pointer">?</span>
                    <div className="absolute left-1/2 z-10 hidden group-hover:block -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-xs rounded shadow-lg whitespace-pre-line min-w-[180px]">
                      {component.description}
                    </div>
                  </div>
                )}
              </div>
              <span className={`font-semibold text-base ${statusColor}`}>{statusText}</span>
            </div>
            <div className="flex items-center justify-center my-2">
              <div className="flex items-end gap-[2px] w-full max-w-full overflow-x-visible" style={{minHeight: '48px'}}>
                {uptimeData.map((day, index) => (
                  <div className="relative group" key={index}>
                    <div
                      className={`rounded-sm ${
                        day.status === 'operational' ? 'bg-green-600' :
                        day.status === 'partial_outage' ? 'bg-yellow-400' :
                        day.status === 'major_outage' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: 6, height: 40, marginRight: index !== uptimeData.length - 1 ? 2 : 0 }}
                    />
                    <div className="absolute z-50 hidden group-hover:flex flex-col items-center left-1/2 -translate-x-1/2 bottom-full mb-3">
                      {/* Arrow */}
                      <div className="w-4 h-4 overflow-hidden flex justify-center">
                        <div className="bg-white w-3 h-3 rotate-45 shadow -mb-2"></div>
                      </div>
                      {/* Tooltip box */}
                      <div className="bg-white text-gray-700 rounded shadow-lg px-6 py-4 min-w-[280px] text-left border border-gray-200">
                        <div className="font-bold text-lg mb-3">
                          {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {day.status === 'operational' ? (
                          <div className="text-base text-gray-600">No downtime recorded on this day.</div>
                        ) : (
                          <>
                            <div className={`flex items-center rounded px-4 py-2 mb-4 ${
                              day.status === 'partial_outage' ? 'bg-yellow-100' :
                              day.status === 'major_outage' ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                              {/* Status Icon */}
                              {day.status === 'partial_outage' && (
                                <span className="text-yellow-500 mr-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                  </svg>
                                </span>
                              )}
                              {day.status === 'major_outage' && (
                                <span className="text-red-500 mr-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                  </svg>
                                </span>
                              )}
                              <span className="font-semibold text-base mr-4 capitalize">
                                {day.status === 'partial_outage' ? 'Partial outage' : 'Critical outage'}
                              </span>
                              {/* Duration */}
                              <span className="ml-auto text-base font-medium">
                                {day.duration ? `${day.duration.hours} hrs ${day.duration.minutes} mins` : ''}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-gray-400 mb-1">RELATED</div>
                            <div className="text-base text-gray-600">
                              {day.relatedMessage || 'No details available.'}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-gray-400 text-base font-medium">
              <span>90 days ago</span>
              <span className="text-gray-400">{overallUptime.toFixed(1)}% uptime</span>
              <span>Today</span>
              {component.children && component.children.length > 0 && (
                <button
                  className="ml-2 focus:outline-none"
                  aria-label={expanded[component.id] ? "Collapse" : "Expand"}
                  type="button"
                  onClick={() => setExpanded(exp => ({ ...exp, [component.id]: !exp[component.id] }))}
                >
                  {expanded[component.id] ? (
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {expanded[component.id] && component.children && component.children.length > 0 && (
              <div className="ml-8">
                {component.children.map(child => {
                  // Generate green uptime data for subcomponents
                  const today = new Date();
                  const uptimeData = [];
                  for (let i = 89; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    uptimeData.push({
                      date: date.toISOString().split('T')[0],
                      uptime: 100,
                      status: 'operational' as const
                    });
                  }
                  return (
                    <div key={child.id} className="bg-gray-100 rounded-xl border border-gray-200 p-4 my-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-gray-700">{child.name}</span>
                        <span className="text-green-600 font-semibold">Operational</span>
                      </div>
                      <div className="flex items-center justify-center my-2">
                        <div className="flex items-end gap-[2px] w-full max-w-full overflow-x-visible" style={{minHeight: '32px'}}>
                          {uptimeData.map((day, index) => (
                            <div className="relative group" key={index}>
                              <div
                                className="rounded-sm bg-green-600"
                                style={{ width: 6, height: 24, marginRight: index !== uptimeData.length - 1 ? 2 : 0 }}
                              />
                              <div className="absolute z-50 hidden group-hover:flex flex-col items-center left-1/2 -translate-x-1/2 bottom-full mb-3">
                                {/* Arrow */}
                                <div className="w-4 h-4 overflow-hidden flex justify-center">
                                  <div className="bg-white w-3 h-3 rotate-45 shadow -mb-2"></div>
                                </div>
                                {/* Tooltip box */}
                                <div className="bg-white text-gray-700 rounded shadow-lg px-6 py-4 min-w-[280px] text-left border border-gray-200">
                                  <div className="font-bold text-lg mb-3">
                                    {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </div>
                                  {day.status !== 'operational' ? (
                                    <>
                                      <div className="flex items-center bg-gray-100 rounded px-4 py-2 mb-4">
                                        {/* Status Icon */}
                                        {day.status === 'partial_outage' && (
                                          <span className="text-yellow-500 mr-2">
                                            {/* Exclamation icon */}
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                                            </svg>
                                          </span>
                                        )}
                                        {/* Add more icons for other statuses if needed */}
                                        <span className="font-semibold text-base mr-4 capitalize">{(day.status as string).replace('_', ' ')}</span>
                                        {/* Duration */}
                                        <span className="ml-auto text-base font-medium">
                                          {(day as any).duration ? `${(day as any).duration.hours} hrs ${(day as any).duration.minutes} mins` : ''}
                                        </span>
                                      </div>
                                      <div className="text-xs font-bold text-gray-400 mb-1">RELATED</div>
                                      <div className="text-base text-gray-600">
                                        {(day as any).relatedMessage || 'No details available.'}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-base text-gray-600">No downtime recorded on this day.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // --- Calendar View ---
  const uptimeData = generateUptimeData(selectedComponent);
  const grouped = groupUptimeByMonth(uptimeData);
  const months = getMonthRange(uptimeData);
  const canGoPrev = months.length > 0 && Object.keys(grouped).indexOf(months[0]) > 0;
  const canGoNext = monthOffset > 0;
  const monthRangeLabel = months.length > 1 ? `${months[0]} to ${months[months.length - 1]}` : months[0];
  const calendarView = (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-8">
        <select
          className="border border-gray-300 rounded px-4 py-2 text-lg mb-4 md:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedComponentId || ''}
          onChange={e => setSelectedComponentId(e.target.value)}
        >
          {components.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
            onClick={() => setMonthOffset(o => o + 1)}
            disabled={!canGoPrev}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-lg text-gray-600 font-medium min-w-[200px] text-center">{monthRangeLabel}</span>
          <button
            className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
            onClick={() => setMonthOffset(o => Math.max(o - 1, 0))}
            disabled={!canGoNext}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <span className="text-2xl font-bold text-gray-800">{selectedComponent.name}</span>
        {selectedComponent.children && selectedComponent.children.length > 0 && (
          <button
            className="ml-2 focus:outline-none"
            aria-label={expanded[selectedComponent.id] ? "Collapse" : "Expand"}
            type="button"
            onClick={() => setExpanded(exp => ({ ...exp, [selectedComponent.id]: !exp[selectedComponent.id] }))}
          >
            {expanded[selectedComponent.id] ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-12 justify-center">
        {months.map(month => {
          const days = grouped[month];
          // Calculate 100% uptime for the month
          const allUp = days.every(d => d.uptime >= 99.9);
          // Calendar grid: 7 columns, fill from first day of month
          const firstDate = new Date(days[0].date);
          const year = firstDate.getFullYear();
          const monthIdx = firstDate.getMonth();
          const firstDay = getFirstDayOfMonth(year, monthIdx);
          const daysInMonth = getDaysInMonth(year, monthIdx);
          const grid: (typeof days[0] | null)[] = Array(firstDay).fill(null).concat(days);
          while (grid.length % 7 !== 0) grid.push(null);
          return (
            <div key={month} className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl font-semibold text-gray-600">{month}</span>
                <span className="ml-2 text-gray-400 font-semibold">{allUp ? '100%' : ''}</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {grid.map((day, idx) =>
                  day ? (
                    <div
                      key={day.date}
                      className={`w-7 h-7 rounded ${getStatusColor(day.status)}`}
                      title={`${new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}: ${day.uptime}% uptime`}
                    />
                  ) : (
                    <div key={idx} className="w-7 h-7" />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
      {expanded[selectedComponent.id] && selectedComponent.children && selectedComponent.children.length > 0 && (
        <div className="mt-8">
          {selectedComponent.children.map(child => {
            // Generate green uptime data for subcomponents
            const today = new Date();
            const uptimeData = [];
            for (let i = 89; i >= 0; i--) {
              const date = new Date(today);
              date.setDate(today.getDate() - i);
              uptimeData.push({
                date: date.toISOString().split('T')[0],
                uptime: 100,
                status: 'operational' as const
              });
            }
            const grouped = groupUptimeByMonth(uptimeData);
            const months = getMonthRange(uptimeData);
            return (
              <div key={child.id} className="mb-8">
                <div className="text-lg font-bold text-gray-700 mb-2">{child.name}</div>
                <div className="flex flex-wrap gap-12 justify-center">
                  {months.map(month => {
                    const days = grouped[month];
                    const firstDate = new Date(days[0].date);
                    const year = firstDate.getFullYear();
                    const monthIdx = firstDate.getMonth();
                    const firstDay = getFirstDayOfMonth(year, monthIdx);
                    const daysInMonth = getDaysInMonth(year, monthIdx);
                    const grid = Array(firstDay).fill(null).concat(days);
                    while (grid.length % 7 !== 0) grid.push(null);
                    return (
                      <div key={month} className="flex flex-col items-center">
                        <div className="text-xl font-semibold text-gray-600 mb-1">{month}</div>
                        <div className="grid grid-cols-7 gap-2">
                          {grid.map((day, idx) =>
                            day ? (
                              <div
                                key={day.date}
                                className="w-7 h-7 rounded bg-green-500"
                                title={`${new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}: ${day.uptime}% uptime`}
                              />
                            ) : (
                              <div key={idx} className="w-7 h-7" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Masthead />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Uptime</h1>
          <div className="flex items-center space-x-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium border ${view === 'tiles' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              onClick={() => setView('tiles')}
            >
              Tiles View
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium border ${view === 'calendar' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              onClick={() => setView('calendar')}
            >
              Calendar View
            </button>
          </div>
        </div>
        {view === 'tiles' ? tilesView : calendarView}
      </div>
      <PageFooter />
    </div>
  );
};

export default UptimePage;


//HARD CODED JSON RESPONSE TO TEST SUB-COMPONENT

// import React, { useState, useEffect } from 'react';
// import Masthead from '../components/Masthead';
// import PageFooter from '../components/PageFooter';
// import { fetchSummary, Component } from '../server/apiHandlers';

// function getMonthYear(date: Date) {
//   return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
// }

// function getDaysInMonth(year: number, month: number) {
//   return new Date(year, month + 1, 0).getDate();
// }

// function getFirstDayOfMonth(year: number, month: number) {
//   return new Date(year, month, 1).getDay();
// }

// const UPTIME_MONTHS = 3; // Show 3 months at a time

// const UptimePage: React.FC = () => {
//   const [components, setComponents] = useState<Component[]>([]);
//   const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
//   const [monthOffset, setMonthOffset] = useState(0); // 0 = latest, 1 = previous set, etc.
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [view, setView] = useState<'tiles' | 'calendar'>('tiles');
//   const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});

//   useEffect(() => {
//     // Hardcoded test data with subcomponents
//     const components = [
//       {
//         id: "mvm98gtxvb9b",
//         name: "www.npmjs.com website",
//         status: "operational",
//         description: "The ability for users to navigate to or interact with the npm website.",
//       },
//       {
//         id: "k1wj10x6gmph",
//         name: "Package installation",
//         status: "operational",
//         description: "The ability for users to read from the registry so that they can install packages.",
//         children: [
//           {
//             id: "k1wj10x6gmph-1",
//             name: "Install via npm CLI",
//             status: "operational",
//             description: "Install packages using npm CLI.",
//           },
//           {
//             id: "k1wj10x6gmph-2",
//             name: "Install via Yarn",
//             status: "operational",
//             description: "Install packages using Yarn.",
//           }
//         ]
//       },
//       {
//         id: "fvjvqll59f1x",
//         name: "Package publishing",
//         status: "operational",
//         description: null,
//       },
//       {
//         id: "8mzc4ncc0r6m",
//         name: "Package search",
//         status: "operational",
//         description: "The ability for users to search for a package",
//       },
//       {
//         id: "4nj1xcbwf28g",
//         name: "Security Audit",
//         status: "operational",
//         description: "The ability for users to get output from running npm audit",
//       },
//       {
//         id: "c567bg7rqjmc",
//         name: "Replication Feed",
//         status: "operational",
//         description: "Allows users to replicate public registry",
//       }
//     ];
//     setComponents(components);
//     if (!selectedComponentId && components.length > 0) {
//       setSelectedComponentId(components[0].id);
//     }
//     setLoading(false);
//     // eslint-disable-next-line
//   }, []);

//   const selectedComponent = components.find(c => c.id === selectedComponentId);

//   // Generate mock uptime data for the past 90 days
//   type UptimeDay = { date: string; uptime: number; status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' };
//   const generateUptimeData = (component: Component): UptimeDay[] => {
//     const data: UptimeDay[] = [];
//     const today = new Date();
//     for (let i = 89; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       let status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
//       let uptime: number;
//       const rand = Math.random();
//       if (rand < 0.95) {
//         status = 'operational';
//         uptime = 99.95 + Math.random() * 0.05;
//       } else if (rand < 0.99) {
//         status = 'degraded_performance';
//         uptime = 98.0 + Math.random() * 1.5;
//       } else if (rand < 0.999) {
//         status = 'partial_outage';
//         uptime = 95.0 + Math.random() * 2.5;
//       } else {
//         status = 'major_outage';
//         uptime = 85.0 + Math.random() * 10.0;
//       }
//       data.push({
//         date: date.toISOString().split('T')[0],
//         uptime: Math.round(uptime * 100) / 100,
//         status
//       });
//     }
//     return data;
//   };

//   // Helper to get color by status
//   function getStatusColor(status: string) {
//     switch (status) {
//       case 'operational':
//         return 'bg-green-500';
//       case 'degraded_performance':
//         return 'bg-yellow-400';
//       case 'partial_outage':
//         return 'bg-orange-500';
//       case 'major_outage':
//         return 'bg-red-500';
//       default:
//         return 'bg-gray-300';
//     }
//   }

//   // Group uptime data by month
//   function groupUptimeByMonth(uptimeData: UptimeDay[]) {
//     const groups: Record<string, UptimeDay[]> = {};
//     uptimeData.forEach(day => {
//       const d = new Date(day.date);
//       const key = getMonthYear(d);
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(day);
//     });
//     return groups;
//   }

//   // Get the months to display based on offset
//   function getMonthRange(uptimeData: UptimeDay[]) {
//     const months = Array.from(new Set(uptimeData.map(day => getMonthYear(new Date(day.date)))));
//     const total = months.length;
//     const start = Math.max(0, total - UPTIME_MONTHS - monthOffset);
//     const end = total - monthOffset;
//     return months.slice(start, end);
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Masthead />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading uptime data...</p>
//           </div>
//         </div>
//         <PageFooter />
//       </div>
//     );
//   }

//   if (error || !selectedComponent) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Masthead />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
//             <p className="text-gray-600">{error || 'No component selected.'}</p>
//           </div>
//         </div>
//         <PageFooter />
//       </div>
//     );
//   }

//   // --- Tiles View ---
//   const tilesView = (
//     <div className="grid gap-6">
//       {components.map((component) => {
//         let uptimeData;
//         if (component.children && component.children.length > 0) {
//           // All days are operational (green)
//           const today = new Date();
//           uptimeData = [];
//           for (let i = 89; i >= 0; i--) {
//             const date = new Date(today);
//             date.setDate(today.getDate() - i);
//             uptimeData.push({
//               date: date.toISOString().split('T')[0],
//               uptime: 100,
//               status: 'operational'
//             });
//           }
//         } else {
//           uptimeData = generateUptimeData(component);
//         }
//         const overallUptime = Math.round((uptimeData.reduce((sum, day) => sum + day.uptime, 0) / uptimeData.length) * 100) / 100;
//         const statusText = component.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
//         const statusColor = component.status === 'operational' ? 'text-green-600' : component.status === 'degraded_performance' ? 'text-yellow-600' : component.status === 'partial_outage' ? 'text-orange-600' : 'text-red-600';
//         return (
//           <div key={component.id} className="bg-gray-50 rounded-xl border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <span className="font-bold text-xl text-gray-700">{component.name}</span>
//                 <span className="text-gray-400" title="Uptime is calculated based on the last 90 days.">
//                   <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#bbb" strokeWidth="2"/><path d="M12 8v4" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#bbb"/></svg>
//                 </span>
//               </div>
//               <span className={`font-semibold text-base ${statusColor}`}>{statusText}</span>
//             </div>
//             <div className="flex items-center justify-center my-2">
//               <div className="flex items-end gap-[2px] w-full max-w-full overflow-x-hidden" style={{minHeight: '48px'}}>
//                 {uptimeData.map((day, index) => (
//                   <div
//                     key={index}
//                     className={`rounded-sm ${
//                       day.status === 'operational' ? 'bg-green-600' :
//                       day.status === 'degraded_performance' ? 'bg-yellow-400' :
//                       day.status === 'partial_outage' ? 'bg-orange-500' :
//                       'bg-red-500'
//                     }`}
//                     style={{ width: 6, height: 40, marginRight: index !== uptimeData.length - 1 ? 2 : 0 }}
//                     title={`${day.date}: ${day.uptime}% uptime`}
//                   />
//                 ))}
//               </div>
//             </div>
//             <div className="flex items-center justify-between mt-2 text-gray-400 text-base font-medium">
//               <span>90 days ago</span>
//               <span className="text-gray-400">{overallUptime.toFixed(1)}% uptime</span>
//               <span>Today</span>
//               {component.children && component.children.length > 0 && (
//                 <button
//                   className="ml-2 focus:outline-none"
//                   aria-label={expanded[component.id] ? "Collapse" : "Expand"}
//                   type="button"
//                   onClick={() => setExpanded(exp => ({ ...exp, [component.id]: !exp[component.id] }))}
//                 >
//                   {expanded[component.id] ? (
//                     <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
//                     </svg>
//                   ) : (
//                     <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
//                     </svg>
//                   )}
//                 </button>
//               )}
//             </div>
//             {expanded[component.id] && component.children && component.children.length > 0 && (
//               <div className="ml-8">
//                 {component.children.map(child => {
//                   // Generate green uptime data for subcomponents
//                   const today = new Date();
//                   const uptimeData = [];
//                   for (let i = 89; i >= 0; i--) {
//                     const date = new Date(today);
//                     date.setDate(today.getDate() - i);
//                     uptimeData.push({
//                       date: date.toISOString().split('T')[0],
//                       uptime: 100,
//                       status: 'operational'
//                     });
//                   }
//                   return (
//                     <div key={child.id} className="bg-gray-100 rounded-xl border border-gray-200 p-4 my-2">
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="font-bold text-lg text-gray-700">{child.name}</span>
//                         <span className="text-green-600 font-semibold">Operational</span>
//                       </div>
//                       <div className="flex items-center justify-center my-2">
//                         <div className="flex items-end gap-[2px] w-full max-w-full overflow-x-hidden" style={{minHeight: '32px'}}>
//                           {uptimeData.map((day, index) => (
//                             <div
//                               key={index}
//                               className="rounded-sm bg-green-600"
//                               style={{ width: 6, height: 24, marginRight: index !== uptimeData.length - 1 ? 2 : 0 }}
//                               title={`${day.date}: ${day.uptime}% uptime`}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );

//   // --- Calendar View ---
//   const uptimeData = generateUptimeData(selectedComponent);
//   const grouped = groupUptimeByMonth(uptimeData);
//   const months = getMonthRange(uptimeData);
//   const canGoPrev = months.length > 0 && Object.keys(grouped).indexOf(months[0]) > 0;
//   const canGoNext = monthOffset > 0;
//   const monthRangeLabel = months.length > 1 ? `${months[0]} to ${months[months.length - 1]}` : months[0];
//   const calendarView = (
//     <>
//       <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-8">
//         <select
//           className="border border-gray-300 rounded px-4 py-2 text-lg mb-4 md:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={selectedComponentId || ''}
//           onChange={e => setSelectedComponentId(e.target.value)}
//         >
//           {components.map(c => (
//             <option key={c.id} value={c.id}>{c.name}</option>
//           ))}
//         </select>
//         <div className="flex items-center space-x-2">
//           <button
//             className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
//             onClick={() => setMonthOffset(o => o + 1)}
//             disabled={!canGoPrev}
//           >
//             <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
//           </button>
//           <span className="text-lg text-gray-600 font-medium min-w-[200px] text-center">{monthRangeLabel}</span>
//           <button
//             className="p-2 rounded border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
//             onClick={() => setMonthOffset(o => Math.max(o - 1, 0))}
//             disabled={!canGoNext}
//           >
//             <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
//           </button>
//         </div>
//       </div>
//       <div className="flex items-center mb-4">
//         <span className="text-2xl font-bold text-gray-800">{selectedComponent.name}</span>
//         {selectedComponent.children && selectedComponent.children.length > 0 && (
//           <button
//             className="ml-2 focus:outline-none"
//             aria-label={expanded[selectedComponent.id] ? "Collapse" : "Expand"}
//             type="button"
//             onClick={() => setExpanded(exp => ({ ...exp, [selectedComponent.id]: !exp[selectedComponent.id] }))}
//           >
//             {expanded[selectedComponent.id] ? (
//               <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
//               </svg>
//             ) : (
//               <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
//               </svg>
//             )}
//           </button>
//         )}
//       </div>
//       <div className="flex flex-wrap gap-12 justify-center">
//         {months.map(month => {
//           const days = grouped[month];
//           // Calculate 100% uptime for the month
//           const allUp = days.every(d => d.uptime >= 99.9);
//           // Calendar grid: 7 columns, fill from first day of month
//           const firstDate = new Date(days[0].date);
//           const year = firstDate.getFullYear();
//           const monthIdx = firstDate.getMonth();
//           const firstDay = getFirstDayOfMonth(year, monthIdx);
//           const daysInMonth = getDaysInMonth(year, monthIdx);
//           const grid: (typeof days[0] | null)[] = Array(firstDay).fill(null).concat(days);
//           while (grid.length % 7 !== 0) grid.push(null);
//           return (
//             <div key={month} className="flex flex-col items-center">
//               <div className="flex items-center justify-between w-full mb-1">
//                 <span className="text-xl font-semibold text-gray-600">{month}</span>
//                 <span className="ml-2 text-gray-400 font-semibold">{allUp ? '100%' : ''}</span>
//               </div>
//               <div className="grid grid-cols-7 gap-2">
//                 {grid.map((day, idx) =>
//                   day ? (
//                     <div
//                       key={day.date}
//                       className={`w-7 h-7 rounded ${getStatusColor(day.status)}`}
//                       title={`${new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}: ${day.uptime}% uptime`}
//                     />
//                   ) : (
//                     <div key={idx} className="w-7 h-7" />
//                   )
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {expanded[selectedComponent.id] && selectedComponent.children && selectedComponent.children.length > 0 && (
//         <div className="mt-8">
//           {selectedComponent.children.map(child => {
//             // Generate green uptime data for subcomponents
//             const today = new Date();
//             const uptimeData = [];
//             for (let i = 89; i >= 0; i--) {
//               const date = new Date(today);
//               date.setDate(today.getDate() - i);
//               uptimeData.push({
//                 date: date.toISOString().split('T')[0],
//                 uptime: 100,
//                 status: 'operational'
//               });
//             }
//             const grouped = groupUptimeByMonth(uptimeData);
//             const months = getMonthRange(uptimeData);
//             return (
//               <div key={child.id} className="mb-8">
//                 <div className="text-lg font-bold text-gray-700 mb-2">{child.name}</div>
//                 <div className="flex flex-wrap gap-12 justify-center">
//                   {months.map(month => {
//                     const days = grouped[month];
//                     const firstDate = new Date(days[0].date);
//                     const year = firstDate.getFullYear();
//                     const monthIdx = firstDate.getMonth();
//                     const firstDay = getFirstDayOfMonth(year, monthIdx);
//                     const daysInMonth = getDaysInMonth(year, monthIdx);
//                     const grid = Array(firstDay).fill(null).concat(days);
//                     while (grid.length % 7 !== 0) grid.push(null);
//                     return (
//                       <div key={month} className="flex flex-col items-center">
//                         <div className="text-xl font-semibold text-gray-600 mb-1">{month}</div>
//                         <div className="grid grid-cols-7 gap-2">
//                           {grid.map((day, idx) =>
//                             day ? (
//                               <div
//                                 key={day.date}
//                                 className="w-7 h-7 rounded bg-green-500"
//                                 title={`${new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}: ${day.uptime}% uptime`}
//                               />
//                             ) : (
//                               <div key={idx} className="w-7 h-7" />
//                             )
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Masthead />
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Uptime</h1>
//           <div className="flex items-center space-x-2">
//             <button
//               className={`px-4 py-2 rounded-md text-sm font-medium border ${view === 'tiles' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
//               onClick={() => setView('tiles')}
//             >
//               Tiles View
//             </button>
//             <button
//               className={`px-4 py-2 rounded-md text-sm font-medium border ${view === 'calendar' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
//               onClick={() => setView('calendar')}
//             >
//               Calendar View
//             </button>
//           </div>
//         </div>
//         {view === 'tiles' ? tilesView : calendarView}
//       </div>
//       <PageFooter />
//     </div>
//   );
// };

// export default UptimePage;