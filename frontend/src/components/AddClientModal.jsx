import React, { useEffect, useState, useRef } from "react";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";

const AddClientModal = ({
  onClose,
  onSubmit,
  clientData
}) => {
  const modalRef = useRef(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [assignedAdmins, setAssignedAdmins] = useState([]);

//prefill form fields when editing an existing client
  useEffect(() => {
    if (clientData) {
      const name = clientData.pageName || clientData.username || "";
      const detail = clientData.pageId
        ? `Page ID: ${clientData.pageId}`
        : clientData.instagramBusinessId
          ? `Business ID: ${clientData.instagramBusinessId}`
            : clientData.name
            ? `Twitter user: ${clientData.name}`
            : "";

      setCompanyName(name);
      setCompanyDetail(detail);
      setAssignedAdmins(
        Array.isArray(clientData.assignedAdmins)
          ? clientData.assignedAdmins.map(a => (typeof a === 'object' ? a._id : a))
          : []
      );
    }
  }, [clientData]);

  // Fetch all users for the dropdown
  // This will be used to assign admins to the client
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/simple');
        const data = await res.json();
        setAllUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      _id: clientData?._id, // ensure this is passed!
      pageName: companyName,
      pageId: companyDetail.replace("Page ID: ", "").trim(),
      assignedAdmins: assignedAdmins.length ? assignedAdmins : [],
    });
  };
  
  return createPortal(
    <div className="newUserMenu" ref={modalRef}>
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={handleSubmit}>
        <a className="form-title">{clientData ? "Edit Client" : "Add Client"}</a>

        <label>
          Company Name
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </label>

        <label>
          Company Details
          <input type="text" value={companyDetail} onChange={(e) => setCompanyDetail(e.target.value)} />
        </label>

        <label>Assign to Users:</label>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
          {allUsers.map((user) => (
            <label key={user._id} style={{ width: '30%' }}>
              <input
                type="checkbox"
                value={user._id}
                checked={assignedAdmins.includes(user._id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAssignedAdmins(prev =>
                    checked
                      ? [...prev, user._id]
                      : prev.filter(id => id !== user._id)
                  );
                }}
              />
              {user.username} ({user.email})
            </label>
          ))}
        </div>

        <input className="create-post-btn" type="submit" value={clientData ? "Update" : "Save"} />
      </form>
    </div>,
    document.body
  );
};

export default AddClientModal;
