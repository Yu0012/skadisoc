import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
    <p className="mt-4">You do not have permission to view this page.</p>
    <Link to="/dashboard" className="mt-6 inline-block text-blue-500 underline">Return to Dashboard</Link>
  </div>
);

export default Unauthorized;
