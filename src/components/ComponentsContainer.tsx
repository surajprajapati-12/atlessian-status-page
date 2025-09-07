import React, { useState } from 'react';
import ComponentGroup from './ComponentGroup';
import ComponentItem from './ComponentItem';

interface Component {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
  description?: string;
  uptime?: number;
  group?: string;
}

interface ComponentsContainerProps {
  components: Component[];
}

const ComponentsContainer: React.FC<ComponentsContainerProps> = ({ components }) => {
  const [showUngrouped, setShowUngrouped] = useState(false);

  // Group components by their group property
  const groupedComponents = components.reduce((acc, component) => {
    const group = component.group || 'Ungrouped';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(component);
    return acc;
  }, {} as Record<string, Component[]>);

  // Separate grouped and ungrouped components
  const grouped = Object.entries(groupedComponents).filter(([group]) => group !== 'Ungrouped');
  const ungrouped = groupedComponents['Ungrouped'] || [];

  const getOverallStatus = () => {
    const allComponents = Object.values(groupedComponents).flat();
    const operationalCount = allComponents.filter(c => c.status === 'operational').length;
    const totalCount = allComponents.length;
    if (operationalCount === totalCount) return 'operational';
    if (allComponents.some(c => c.status === 'major_outage')) return 'major_outage';
    if (allComponents.some(c => c.status === 'partial_outage')) return 'partial_outage';
    if (allComponents.some(c => c.status === 'degraded_performance')) return 'degraded_performance';
    return 'operational';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded_performance':
        return 'text-yellow-600 bg-yellow-100';
      case 'partial_outage':
        return 'text-orange-600 bg-orange-100';
      case 'major_outage':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded_performance':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial System Outage';
      case 'major_outage':
        return 'Major System Outage';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(getOverallStatus())}`}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                {getOverallStatus() === 'operational' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <p className="text-sm text-gray-500">{getStatusText(getOverallStatus())}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getOverallStatus())}`}>
            {getStatusText(getOverallStatus())}
          </span>
        </div>
      </div>
      <div className="px-6 py-4">
        {grouped.map(([group, comps]) => (
          <ComponentGroup key={group} name={group} components={comps} />
        ))}
        {ungrouped.length > 0 && (
          <div className="mt-6">
            <button
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setShowUngrouped(v => !v)}
            >
              <span>{showUngrouped ? 'Hide' : 'Show'} Ungrouped Components</span>
              <svg
                className={`h-5 w-5 text-gray-400 transform transition-transform ${showUngrouped ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showUngrouped && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg">
                {ungrouped.map((component) => (
                  <ComponentItem
                    key={component.id}
                    id={component.id}
                    name={component.name}
                    status={component.status}
                    description={component.description}
                    uptime={component.uptime}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentsContainer; 