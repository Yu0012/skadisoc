import React, { useEffect, useState } from 'react';
import { ImCross } from "react-icons/im";
import "../styles.css"; 
import "./CreateUserForm.css";
import Swal from 'sweetalert2';
import config from '../config';

// Component to assign/unassign clients to a user
const AssignClients = ({ userId, onClose }) => {
  // Platform selector (facebook, instagram, twitter)
  const [platform, setPlatform] = useState('facebook');

  // Lists of clients and selection states
  const [assignedClients, setAssignedClients] = useState([]);
  const [unassignedClients, setUnassignedClients] = useState([]);
  const [selectedAssignIds, setSelectedAssignIds] = useState([]);
  const [selectedUnassignIds, setSelectedUnassignIds] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch assigned and unassigned clients for current platform
  const fetchClients = async () => {
    try {
      const assignedRes = await fetch(`${config.API_BASE}/api/clients/${platform}/assigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unassignedRes = await fetch(`${config.API_BASE}/api/clients/unassigned/${platform}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const assignedData = await assignedRes.json();
      const unassignedData = await unassignedRes.json();

      // Only include clients assigned to this specific user
      setAssignedClients(
        assignedData.clients.filter(client =>
          client.assignedAdmins.some(admin => admin._id === userId)
        )
      );
      setUnassignedClients(unassignedData.clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  // Fetch clients on mount and whenever platform changes
  useEffect(() => {
    fetchClients();
  }, [platform]);

  // Assign selected clients to the user
  const handleAssign = async () => {
    if (selectedAssignIds.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'No clients selected',
        text: 'Please select clients to assign.'
      });
    }
    
    try {
      const res = await fetch(`${config.API_BASE}/api/clients/${platform}/assign-multiple/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: selectedAssignIds })
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);
        Swal.fire({
          icon: 'success',
          title: 'Assigned',
          text: 'Clients assigned successfully.',
          confirmButtonText: 'OK'
        });

        fetchClients();
        setSelectedAssignIds([]);
      } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Assign Failed',
        text: err.message || 'Error assigning clients.'
      });
      console.error(err);
    }
  };

  // Unassign selected clients from the user
  const handleUnassign = async () => {
    if (selectedUnassignIds.length === 0) {
      Swal.fire({
        icon: 'success',
        title: 'Unassigned',
        text: 'Clients unassigned successfully.',
        confirmButtonText: 'OK'
      });
    }

    try {
      const res = await fetch(`${config.API_BASE}/api/clients/${platform}/unassign-multiple/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: selectedUnassignIds })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      Swal.fire({
        icon: 'success',
        title: 'Unassigned',
        text: 'Clients unassigned successfully.',
        confirmButtonText: 'OK'
      });
      
      fetchClients();
      setSelectedUnassignIds([]);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Unassign Failed',
        text: err.message || 'Error unassigning clients.'
      });
      console.error(err);
    }
  };

  return (
    <div className="newUserMenu assign-clients-container">
      {/* Close Button */}
      <ImCross className="exitButton" onClick={onClose} />

      <div style={{ padding: 20 }}>
        <h2>Manage Client Assignments</h2>

        {/* Platform selector */}
        <div className="platform-navbar">
          {['facebook', 'instagram', 'twitter'].map(p => (
            <button
              key={p}
              className={platform === p ? 'active' : ''}
              type="button"
              onClick={() => setPlatform(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Unassigned Clients Section */}
        <h3>Unassigned Clients</h3>
        <div className="assign-users-container">
          {unassignedClients.map(client => (
            <label key={client._id}>
              <input
                type="checkbox"
                checked={selectedAssignIds.includes(client._id)}
                onChange={() => {
                  setSelectedAssignIds(prev =>
                    prev.includes(client._id)
                      ? prev.filter(id => id !== client._id)
                      : [...prev, client._id]
                  );
                }}
              />
              {client.pageName || client.name || client.username || client._id}
            </label>
          ))}
        </div>

        <br />
        <button onClick={handleAssign}>Assign Selected Clients</button>

        {/* Assigned Clients Section */}
        <h3>Assigned Clients</h3>
        <div className="assign-users-container">
          {assignedClients.map(client => (
            <label key={client._id}>
              <input
                type="checkbox"
                checked={selectedUnassignIds.includes(client._id)}
                onChange={() => {
                  setSelectedUnassignIds(prev =>
                    prev.includes(client._id)
                      ? prev.filter(id => id !== client._id)
                      : [...prev, client._id]
                  );
                }}
              />
              {client.pageName || client.name || client.username || client._id}
            </label>
          ))}
        </div>

        <br />
        <button onClick={handleUnassign}>Unassign Selected Clients</button>
      </div>
    </div>
  );
};

export default AssignClients;
