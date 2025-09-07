import React, { useState } from 'react';

interface ComponentItemProps {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
  description?: string | null;
  uptime?: number;
  children?: any[];
}

const ComponentItem: React.FC<ComponentItemProps> = ({ 
  id, 
  name, 
  status, 
  description, 
  uptime, 
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      case 'under_maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded_performance':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial Outage';
      case 'major_outage':
        return 'Major Outage';
      case 'under_maintenance':
        return 'Under Maintenance';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded_performance':
      case 'partial_outage':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'major_outage':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'under_maintenance':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center space-x-3">
          <div className={`p-1 rounded-full ${getStatusColor(status)}`}>{getStatusIcon(status)}</div>
          <div>
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900">{name}</h3>
              {description && (
                <div className="relative group ml-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs cursor-pointer">?</span>
                  <div className="absolute left-1/2 z-10 hidden group-hover:block -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-xs rounded shadow-lg whitespace-pre-line min-w-[180px]">
                    {description}
                  </div>
                </div>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {uptime !== undefined && (
            <div className="text-sm text-gray-500">{uptime.toFixed(2)}% uptime</div>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{getStatusText(status)}</span>
          {children && children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 focus:outline-none"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
              ) : (
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              )}
            </button>
          )}
        </div>
      </div>
      {isExpanded && children && children.length > 0 && (
        <div className="ml-8 border-l border-gray-200 pl-4">
          {children.map((child, idx) => (
            <ComponentItem key={child.id || (child.name + idx)} {...child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComponentItem; 


//HARD CODED JSON RESPONSE TO TEST SUB-COMPONENT

// import React, { useState } from 'react';

// interface ComponentItemProps {
//   name: string;
//   status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
//   description?: string;
//   uptime?: number;
//   children?: ComponentItemProps[];
// }

// const ComponentItem: React.FC<ComponentItemProps> = ({ 
//   name, 
//   status, 
//   description, 
//   uptime, 
//   children 
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'operational':
//         return 'text-green-600 bg-green-100';
//       case 'degraded_performance':
//         return 'text-yellow-600 bg-yellow-100';
//       case 'partial_outage':
//         return 'text-orange-600 bg-orange-100';
//       case 'major_outage':
//         return 'text-red-600 bg-red-100';
//       case 'under_maintenance':
//         return 'text-blue-600 bg-blue-100';
//       default:
//         return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'operational':
//         return 'Operational';
//       case 'degraded_performance':
//         return 'Degraded Performance';
//       case 'partial_outage':
//         return 'Partial Outage';
//       case 'major_outage':
//         return 'Major Outage';
//       case 'under_maintenance':
//         return 'Under Maintenance';
//       default:
//         return 'Unknown';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'operational':
//         return (
//           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//           </svg>
//         );
//       case 'degraded_performance':
//       case 'partial_outage':
//         return (
//           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//         );
//       case 'major_outage':
//         return (
//           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//         );
//       case 'under_maintenance':
//         return (
//           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//           </svg>
//         );
//       default:
//         return (
//           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//           </svg>
//         );
//     }
//   };

//   return (
//     <div>
//       <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
//         <div className="flex items-center space-x-3">
//           <div className={`p-1 rounded-full ${getStatusColor(status)}`}>{getStatusIcon(status)}</div>
//           <div>
//             <h3 className="text-sm font-medium text-gray-900">{name}</h3>
//             {description && <p className="text-sm text-gray-500">{description}</p>}
//           </div>
//         </div>
//         <div className="flex items-center space-x-4">
//           {uptime !== undefined && (
//             <div className="text-sm text-gray-500">{uptime.toFixed(2)}% uptime</div>
//           )}
//           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{getStatusText(status)}</span>
//           {children && children.length > 0 && (
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="ml-2 focus:outline-none"
//               aria-label={isExpanded ? 'Collapse' : 'Expand'}
//             >
//               {isExpanded ? (
//                 <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
//               ) : (
//                 <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//       {isExpanded && children && children.length > 0 && (
//         <div className="ml-8 border-l border-gray-200 pl-4">
//           {children.map((child, idx) => (
//             <ComponentItem key={child.name + idx} {...child} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ComponentItem;