import React, { useEffect, useRef } from "react";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";

const AddClientModal = ({
  onClose,
  onSubmit,
  clientData, // New: Will hold data when editing
  companyName,
  setCompanyName,
  companyDetail,
  setCompanyDetail,
  socialMedia,
  setSocialMedia,
  socialMediaAccounts,
  handleInputChange
}) => {
  const modalRef = useRef(null);

  // Pre-fill form fields if editing an existing client
  useEffect(() => {
    if (clientData) {
      setCompanyName(clientData.companyName || "");
      setCompanyDetail(clientData.companyDetail || "");

      if (clientData.socialAccounts && clientData.socialAccounts.length > 0) {
        const firstAccount = clientData.socialAccounts[0]; // Assuming one account for now
        setSocialMedia(firstAccount.platform || "Facebook");
      }
    }
  }, [clientData, setCompanyName, setCompanyDetail, setSocialMedia]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div className="newUserMenu" ref={modalRef}>
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={onSubmit}>
        <a className="form-title">{clientData ? "Edit Client" : "Create New Client"}</a>
        <label>
          Company Name
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Type company name here"
            required
          />
        </label>
        <label>
          Company Details
          <input
            type="text"
            value={companyDetail}
            onChange={(e) => setCompanyDetail(e.target.value)}
            placeholder="Type company details here"
          />
        </label>
        <select className="dropdown" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)}>
          <option value="Facebook">Facebook</option>
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>
        <label>
          API Token
          <input
            type="text"
            value={socialMediaAccounts[socialMedia]?.companyToken || ""}
            onChange={(e) => handleInputChange(socialMedia, "companyToken", e.target.value)}
            placeholder="Enter API token"
          />
        </label>
        <label>
          Page ID
          <input
            type="text"
            value={socialMediaAccounts[socialMedia]?.pageId || ""}
            onChange={(e) => handleInputChange(socialMedia, "pageId", e.target.value)}
            placeholder="Enter Page ID"
          />
        </label>
        <input className="create-post-btn" type="submit" value={clientData ? "Update" : "Save"} />
      </form>
    </div>,
    document.body
  );
};

export default AddClientModal;
