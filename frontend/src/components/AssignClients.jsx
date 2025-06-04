import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import axios from 'axios';
import "./CreateUserForm.css";
import rolePermissions from '../utils/rolePermissions';
import roleTypePermissions from '../utils/roleTypePermissions';

import { useParams, useNavigate } from 'react-router-dom';


const AssignClients = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState(['facebook', 'instagram', 'twitter', 'linkedin']);
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [unassignedClients, setUnassignedClients] = useState([]);
  const [assignedClients, setAssignedClients] = useState([]);
  const [selectedUnassigned, setSelectedUnassigned] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' }); // For status messages

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch user details and clients data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMessage({ text: 'Loading data...', type: 'info' });
        
        // Fetch user details
        const userRes = await axios.get(`/api/users/${userId}`);
        setUser(userRes.data);
        
        // Fetch unassigned clients for the selected platform
        const unassignedRes = await axios.get(`/api/clients/${selectedPlatform}/unassigned`);
        setUnassignedClients(unassignedRes.data.clients);
        
        // Fetch assigned clients for the selected platform
        const assignedRes = await axios.get(`/api/clients/${selectedPlatform}/assigned?userId=${userId}`);
        setAssignedClients(assignedRes.data.clients);
        
        setMessage({ text: '', type: '' });
      } catch (err) {
        setMessage({ 
          text: err.response?.data?.message || 'Error fetching data', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, selectedPlatform]);

  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    setSelectedUnassigned([]);
    setSelectedAssigned([]);
  };

  const handleUnassignedSelect = (clientId) => {
    setSelectedUnassigned(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId) 
        : [...prev, clientId]
    );
  };

  const handleAssignedSelect = (clientId) => {
    setSelectedAssigned(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId) 
        : [...prev, clientId]
    );
  };

  const assignClients = async () => {
    if (selectedUnassigned.length === 0) return;
    
    try {
      setLoading(true);
      setMessage({ text: 'Assigning clients...', type: 'info' });
      
      await axios.post(`/api/clients/${selectedPlatform}/assign-multiple/${userId}`, {
        clientIds: selectedUnassigned
      });
      
      // Refresh data
      const unassignedRes = await axios.get(`/api/clients/${selectedPlatform}/unassigned`);
      const assignedRes = await axios.get(`/api/clients/${selectedPlatform}/assigned?userId=${userId}`);
      
      setUnassignedClients(unassignedRes.data.clients);
      setAssignedClients(assignedRes.data.clients);
      setSelectedUnassigned([]);
      setMessage({ 
        text: `Successfully assigned ${selectedUnassigned.length} client(s)`, 
        type: 'success' 
      });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Error assigning clients', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const unassignClients = async () => {
    if (selectedAssigned.length === 0) return;
    
    try {
      setLoading(true);
      setMessage({ text: 'Unassigning clients...', type: 'info' });
      
      await axios.post(`/api/clients/${selectedPlatform}/unassign-multiple/${userId}`, {
        clientIds: selectedAssigned
      });
      
      // Refresh data
      const unassignedRes = await axios.get(`/api/clients/${selectedPlatform}/unassigned`);
      const assignedRes = await axios.get(`/api/clients/${selectedPlatform}/assigned?userId=${userId}`);
      
      setUnassignedClients(unassignedRes.data.clients);
      setAssignedClients(assignedRes.data.clients);
      setSelectedAssigned([]);
      setMessage({ 
        text: `Successfully unassigned ${selectedAssigned.length} client(s)`, 
        type: 'success' 
      });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Error unassigning clients', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Message styling based on type
  const getMessageStyle = () => {
    switch(message.type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  if (loading && !user) return <div>Loading user data...</div>;

  return (
    <div className="container mx-auto p-4">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back
      </button>
      
      {/* Status Message */}
      {message.text && (
        <div className={`mb-4 border px-4 py-3 rounded ${getMessageStyle()}`} role="alert">
          <span className="block sm:inline">{message.text}</span>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-4">
        Assign Clients to {user?.username || 'User'}
      </h1>
      
      <div className="mb-4">
        <label className="block mb-2">Platform:</label>
        <select
          value={selectedPlatform}
          onChange={handlePlatformChange}
          className="p-2 border rounded"
        >
          {platforms.map(platform => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unassigned Clients */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Unassigned Clients</h2>
          {unassignedClients.length === 0 ? (
            <p>No unassigned clients</p>
          ) : (
            <div className="space-y-2">
              {unassignedClients.map(client => (
                <div key={client._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUnassigned.includes(client._id)}
                    onChange={() => handleUnassignedSelect(client._id)}
                    className="mr-2"
                  />
                  <span>{client.pageName || client.username || client.name}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={assignClients}
            disabled={selectedUnassigned.length === 0 || loading}
            className={`mt-4 px-4 py-2 rounded ${selectedUnassigned.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {loading ? 'Processing...' : `Assign Selected (${selectedUnassigned.length})`}
          </button>
        </div>
        
        {/* Assigned Clients */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Assigned Clients</h2>
          {assignedClients.length === 0 ? (
            <p>No assigned clients</p>
          ) : (
            <div className="space-y-2">
              {assignedClients.map(client => (
                <div key={client._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAssigned.includes(client._id)}
                    onChange={() => handleAssignedSelect(client._id)}
                    className="mr-2"
                  />
                  <span>{client.pageName || client.username || client.name}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={unassignClients}
            disabled={selectedAssigned.length === 0 || loading}
            className={`mt-4 px-4 py-2 rounded ${selectedAssigned.length === 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {loading ? 'Processing...' : `Unassign Selected (${selectedAssigned.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignClients;