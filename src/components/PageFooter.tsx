import React from 'react';

const PageFooter: React.FC = () => {
  return (
    <footer className="bg-[#F4F5F7] border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center mb-4 md:mb-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
            <path d="M16.7 2.6c-.4-.8-1.5-.8-1.9 0L2.3 27.2c-.4.8.1 1.8 1 1.8h7.7c.4 0 .8-.2 1-.6l4-7.2c.2-.4.8-.4 1 0l4 7.2c.2.4.6.6 1 .6h7.7c.9 0 1.4-1 .9-1.8L16.7 2.6z" fill="#0052CC"/>
          </svg>
          <div>
            <h3 className="text-lg font-bold text-[#0052CC]">Atlassian</h3>
            <p className="text-sm text-gray-500">Status Page &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="https://support.atlassian.com/" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline">Support</a>
          <a href="https://www.atlassian.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline">Privacy</a>
          <a href="https://www.atlassian.com/legal" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline">Legal</a>
          <a href="https://www.atlassian.com/company/contact" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter; 