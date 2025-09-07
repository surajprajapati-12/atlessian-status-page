import React, { useState } from 'react';
import ComponentItem from './ComponentItem';

interface Component {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
  description?: string;
  uptime?: number;
  children?: Component[];
}

interface ComponentGroupProps {
  name: string;
  components: Component[];
  isExpanded?: boolean;
}

const statusColors: Record<string, string> = {
  operational: 'text-[#006644] bg-[#E3FCEF]',
  degraded_performance: 'text-[#FF991F] bg-[#FFFAE6]',
  partial_outage: 'text-[#FF991F] bg-[#FFFAE6]',
  major_outage: 'text-[#DE350B] bg-[#FFEBE6]',
  under_maintenance: 'text-[#0052CC] bg-[#DEEBFF]',
};

const statusIcons: Record<string, JSX.Element> = {
  operational: <svg className="h-4 w-4" fill="none" stroke="#006644" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  degraded_performance: <svg className="h-4 w-4" fill="none" stroke="#FF991F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><circle cx="12" cy="16" r="1" /></svg>,
  partial_outage: <svg className="h-4 w-4" fill="none" stroke="#FF991F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><circle cx="12" cy="16" r="1" /></svg>,
  major_outage: <svg className="h-4 w-4" fill="none" stroke="#DE350B" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  under_maintenance: <svg className="h-4 w-4" fill="none" stroke="#0052CC" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>,
};

const statusText: Record<string, string> = {
  operational: 'Operational',
  degraded_performance: 'Degraded Performance',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  under_maintenance: 'Under Maintenance',
};

const ComponentGroup: React.FC<ComponentGroupProps> = ({ 
  name, 
  components, 
  isExpanded: initialExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const operationalCount = components.filter(c => c.status === 'operational').length;
  const totalCount = components.length;

  return (
    <div className="border border-gray-200 rounded-lg mb-6 bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[#F4F5F7] hover:bg-[#EBECF0] rounded-t-lg border-b border-gray-200 focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-[#253858] text-base">{name}</span>
          <span className="text-xs text-gray-500">{operationalCount} of {totalCount} operational</span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isExpanded && (
        <div className="bg-white rounded-b-lg divide-y divide-gray-100">
          {components.map((component) => (
            <div
              key={component.id}
              className="flex items-center px-4 py-3 group hover:bg-[#F4F5F7] transition"
            >
              <div className={`flex items-center justify-center rounded-full h-7 w-7 mr-3 ${statusColors[component.status]}`}>{statusIcons[component.status]}</div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-[#253858]">{component.name}</span>
                {component.description && (
                  <span className="ml-2 text-xs text-gray-400 group-hover:underline cursor-help" title={component.description}>?</span>
                )}
                {component.uptime !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">{component.uptime.toFixed(2)}% uptime</span>
                )}
              </div>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[component.status]}`}>{statusText[component.status]}</span>
              {component.children && component.children.length > 0 && (
                <div className="ml-4 w-full">
                  <ComponentGroup name="Subcomponents" components={component.children} isExpanded={false} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComponentGroup; 