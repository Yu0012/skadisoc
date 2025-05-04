import React, { useEffect, useState } from "react";

const ClientDropdown = ({ onSelect }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then(res => res.json())
      .then(data => {
        console.log("Clients fetched:", data); // 🔍 Add this line
        setClients(data);
      })
      .catch(err => console.error("Client fetch error:", err));
  }, []);
  

  return (
    <select onChange={(e) => onSelect(e.target.value)} style={{ marginBottom: "1rem" }}>
      <option value="">Select Client</option>
      {clients.map(client => (
        <option key={client._id} value={client._id}>
          {client.companyName}
        </option>
      ))}
    </select>
  );
};

export default ClientDropdown;
