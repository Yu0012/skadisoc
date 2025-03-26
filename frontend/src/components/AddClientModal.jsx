import React, { useEffect, useRef } from "react";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";

const AddClientModal = ({
  onClose,
  onSubmit,
  clientData, // If editing, this will contain existing client info
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

  // Prefill form fields when editing an existing client
  useEffect(() => {
    if (clientData) {
      setCompanyName(clientData.companyName || "");
      setCompanyDetail(clientData.companyDetail || "");

      // Default to the first social account if available
      if (clientData.socialAccounts && clientData.socialAccounts.length > 0) {
        const firstAccount = clientData.socialAccounts[0];
        setSocialMedia(firstAccount.platform || "Facebook");
      }
    }
  }, [clientData, setCompanyName, setCompanyDetail, setSocialMedia]);

  // Close modal when user clicks outside the form
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

  // Render the modal using a portal (attached to body)
  return createPortal(
    <div className="newUserMenu" ref={modalRef}>
      {/* Close icon */}
      <ImCross className="exitButton" onClick={onClose} />

      {/* Client creation/edit form */}
      <form className="form-group" onSubmit={onSubmit}>
        <a className="form-title">{clientData ? "Edit Client" : "Create New Client"}</a>

        {/* Company Name Input */}
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

        {/* Company Details Input */}
        <label>
          Company Details
          <input
            type="text"
            value={companyDetail}
            onChange={(e) => setCompanyDetail(e.target.value)}
            placeholder="Type company details here"
          />
        </label>

        {/* Social Media Platform Selector */}
        <select
          className="dropdown"
          value={socialMedia}
          onChange={(e) => setSocialMedia(e.target.value)}
        >
          <option value="Facebook">Facebook</option>
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>

        {/* API Token Field for Selected Platform */}
        <label>
          API Token
          <input
            type="text"
            value={socialMediaAccounts[socialMedia]?.companyToken || ""}
            onChange={(e) => handleInputChange(socialMedia, "companyToken", e.target.value)}
            placeholder="Enter API token"
          />
        </label>

        {/* Page ID Field for Selected Platform */}
        <label>
          Page ID
          <input
            type="text"
            value={socialMediaAccounts[socialMedia]?.pageId || ""}
            onChange={(e) => handleInputChange(socialMedia, "pageId", e.target.value)}
            placeholder="Enter Page ID"
          />
        </label>

        {/* Submit Button */}
        <input
          className="create-post-btn"
          type="submit"
          value={clientData ? "Update" : "Save"}
        />
      </form>
    </div>,
    document.body
  );
};

export default AddClientModal;
