import React from 'react';

const statusStyles: Record<string, { bg: string; icon: JSX.Element; text: string }> = {
  operational: {
    bg: 'bg-[#E3FCEF] text-[#006644]',
    icon: (
      <svg className="h-6 w-6 mr-2" fill="none" stroke="#006644" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    ),
    text: 'All Systems Operational',
  },
  minor: {
    bg: 'bg-[#FFFAE6] text-[#FF991F]',
    icon: (
      <svg className="h-6 w-6 mr-2" fill="none" stroke="#FF991F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    ),
    text: 'Minor Issues',
  },
  partial: {
    bg: 'bg-[#FFFAE6] text-[#FF991F]',
    icon: (
      <svg className="h-6 w-6 mr-2" fill="none" stroke="#FF991F" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    ),
    text: 'Partial Outage',
  },
  major: {
    bg: 'bg-[#FFEBE6] text-[#DE350B]',
    icon: (
      <svg className="h-6 w-6 mr-2" fill="none" stroke="#DE350B" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    ),
    text: 'Major Outage',
  },
};

const PageStatus = ({ status, message }: { status: string; message: string }) => {
  const style = statusStyles[status] || statusStyles.operational;
  return (
    <div className={`w-full py-4 flex items-center justify-center ${style.bg} mb-6`}>
      {style.icon}
      <span className="font-bold text-lg mr-2">{style.text}</span>
      <span className="text-base">{message}</span>
    </div>
  );
};

export default PageStatus; 