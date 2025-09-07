import React from 'react';
import Masthead from '../components/Masthead';
import PageFooter from '../components/PageFooter';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Masthead />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-gray-600 mb-8">This is a placeholder for the admin panel.</p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <p className="text-gray-500">Admin functionality will be implemented here.</p>
          </div>
        </div>
      </div>
      <PageFooter />
    </div>
  );
};

export default AdminPage;