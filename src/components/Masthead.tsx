import React, { useState } from 'react';
import SubscribeModal from './SubscribeModal';

const Masthead: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* Atlassian logo SVG */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.7 2.6c-.4-.8-1.5-.8-1.9 0L2.3 27.2c-.4.8.1 1.8 1 1.8h7.7c.4 0 .8-.2 1-.6l4-7.2c.2-.4.8-.4 1 0l4 7.2c.2.4.6.6 1 .6h7.7c.9 0 1.4-1 .9-1.8L16.7 2.6z" fill="#0052CC"/>
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-[#0052CC] tracking-tight">Atlassian</h1>
                <p className="text-sm text-gray-500">Status Page</p>
              </div>
            </div>
            <nav className="flex space-x-8 items-center">
              <a href="/" className="text-[#0052CC] hover:text-blue-700 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-[#0052CC] transition">Status</a>
              <a href="/statuspage/uptime" className="text-gray-500 hover:text-blue-700 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-[#0052CC] transition">Uptime</a>
              <a href="/statuspage/incident-history" className="text-gray-500 hover:text-blue-700 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-[#0052CC] transition">Incident History</a>
              <button
                className="ml-6 bg-[#0052CC] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded shadow uppercase tracking-wider text-xs"
                style={{ letterSpacing: '0.05em' }}
                onClick={() => setShowModal(true)}
              >
                Subscribe to Updates
              </button>
            </nav>
          </div>
        </div>
      </header>
      <SubscribeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Masthead; 