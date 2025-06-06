// AssignClients.jsx
import React, { useEffect, useState } from 'react';
import { ImCross } from "react-icons/im";
import { useParams, useNavigate } from 'react-router-dom';

const AssignClients = ({userId, onClose}) => {
  const [platform, setPlatform] = useState('facebook');
  const [assignedClients, setAssignedClients] = useState([]);
  const [unassignedClients, setUnassignedClients] = useState([]);
  const [selectedAssignIds, setSelectedAssignIds] = useState([]);
  const [selectedUnassignIds, setSelectedUnassignIds] = useState([]);

  const token = localStorage.getItem('token');

  const fetchClients = async () => {
    try {
      const assignedRes = await fetch(`http://localhost:5000/api/clients/${platform}/assigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unassignedRes = await fetch(`http://localhost:5000/api/clients/${platform}/unassigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const assignedData = await assignedRes.json();
      const unassignedData = await unassignedRes.json();

      setAssignedClients(assignedData.clients.filter(client =>
        client.assignedAdmins.some(admin => admin._id === userId)
      ));
      setUnassignedClients(unassignedData.clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [platform]);

  const handleAssign = async () => {
    if (selectedAssignIds.length === 0) return alert('Select clients to assign');

    try {
      const res = await fetch(`http://localhost:5000/api/clients/${platform}/assign-multiple/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: selectedAssignIds })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      alert('Clients assigned successfully');
      fetchClients();
      setSelectedAssignIds([]);
    } catch (err) {
      alert('Error assigning clients');
      console.error(err);
    }
  };

  const handleUnassign = async () => {
    if (selectedUnassignIds.length === 0) return alert('Select clients to unassign');

    try {
      const res = await fetch(`http://localhost:5000/api/clients/${platform}/unassign-multiple/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientIds: selectedUnassignIds })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      alert('Clients unassigned successfully');
      fetchClients();
      setSelectedUnassignIds([]);
    } catch (err) {
      alert('Error unassigning clients');
      console.error(err);
    }
  };

  return (
    <div className="newUserMenu">
      <ImCross className="exitButton" onClick={onClose} />
      <div style={{ padding: 20 }}>
        <h2>Manage Client Assignments</h2>

        <label>Platform: </label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
        </select>

        <h3>Unassigned Clients</h3>
        <ul>
          {unassignedClients.map(client => (
            <li key={client._id}>
              <label>
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
            </li>
          ))}
        </ul>
        <button onClick={handleAssign}>Assign Selected Clients</button>

        <h3>Assigned Clients</h3>
        <ul>
          {assignedClients.map(client => (
            <li key={client._id}>
              <label>
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
            </li>
          ))}
        </ul>
        <button onClick={handleUnassign}>Unassign Selected Clients</button>
      </div>
    </div>
  );
};

export default AssignClients;
