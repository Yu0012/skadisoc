import React, { useEffect, useState, useRef } from "react";
import { ImCross } from "react-icons/im";
import { createPortal } from "react-dom";
import config from '../config'; 
import axios from 'axios';

const AddClientModal = ({
  onClose,
  onSubmit,
  clientData,
  selectedPlatform
}) => {
  
  const modalRef = useRef(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDetail, setCompanyDetail] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [assignedAdmins, setAssignedAdmins] = useState([]);
  const [socialMedia, setSocialMedia] = useState(selectedPlatform || "Facebook");
  const [socialMediaAccounts, setSocialMediaAccounts] = useState({
    Facebook: { 
      companyToken: "", 
      pageId: "" 
    },
    Twitter: {
      apiKey: "",
      apiKeySecret: "",
      accessToken: "",
      accessTokenSecret: "",
    },
    LinkedIn: {
      accessToken: "",
      urn: ""
    },
    Instagram: { 
      companyToken: "", 
      pageId: "" 
    },
  });

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

  const handleInputChange = (platform, field, value) => {
    setSocialMediaAccounts(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      platform: socialMedia,
      assignedAdmins,
    };

    if (clientData?._id) {
      payload._id = clientData._id;
    }

    // Platform-specific fields
    if (socialMedia === "Facebook") {
      payload.pageName = companyName;
      payload.pageId = socialMediaAccounts.Facebook.pageId;
      payload.pageAccessToken = socialMediaAccounts.Facebook.companyToken;
    }

    if (socialMedia === "Instagram") {
      payload.username = companyName;
      payload.instagramBusinessId = socialMediaAccounts.Instagram.pageId?.trim() || "";
      payload.accessToken = socialMediaAccounts.Instagram.companyToken?.trim() || "";
      payload.userId = companyName.trim(); // or replace with actual user ID if it's a separate input
    }

    if (socialMedia === "Twitter") {
      payload.username = companyName;
      payload.name = companyDetail;
      payload.userId = companyName.trim();
      payload.appKey = socialMediaAccounts.Twitter.apiKey;
      payload.appSecret = socialMediaAccounts.Twitter.apiKeySecret;
      payload.accessToken = socialMediaAccounts.Twitter.accessToken;
      payload.accessTokenSecret = socialMediaAccounts.Twitter.accessTokenSecret;
      payload.bearerToken = socialMediaAccounts.Twitter.bearerToken?.trim() || "";
    }

    onSubmit(payload);
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

        {(socialMedia === "Facebook" || socialMedia === "Instagram") && (
          <>
            <label>Access Token
              <input
                type="text"
                value={socialMediaAccounts[socialMedia]?.companyToken || ""}
                onChange={(e) => handleInputChange(socialMedia, "companyToken", e.target.value)}
              />
            </label>
            <label>Page ID
              <input
                type="text"
                value={socialMediaAccounts[socialMedia]?.pageId || ""}
                onChange={(e) => handleInputChange(socialMedia, "pageId", e.target.value)}
              />
            </label>
          </>
        )}

        {socialMedia === "Twitter" && (
          <>
            <label>API Key
              <input
                type="text"
                value={socialMediaAccounts.Twitter.apiKey}
                onChange={(e) => handleInputChange("Twitter", "apiKey", e.target.value)}
              />
            </label>
            <label>API Secret
              <input
                type="text"
                value={socialMediaAccounts.Twitter.apiKeySecret}
                onChange={(e) => handleInputChange("Twitter", "apiKeySecret", e.target.value)}
              />
            </label>
            <label>Access Token
              <input
                type="text"
                value={socialMediaAccounts.Twitter.accessToken}
                onChange={(e) => handleInputChange("Twitter", "accessToken", e.target.value)}
              />
            </label>
            <label>Access Token Secret
              <input
                type="text"
                value={socialMediaAccounts.Twitter.accessTokenSecret}
                onChange={(e) => handleInputChange("Twitter", "accessTokenSecret", e.target.value)}
              />
            </label>
            <label>Bearer Token
              <input
                type="text"
                value={socialMediaAccounts.Twitter.bearerToken || ""}
                onChange={(e) => handleInputChange("Twitter", "bearerToken", e.target.value)}
              />
            </label>
          </>
        )}


        <input className="create-post-btn" type="submit" value={clientData ? "Update" : "Save"} />
      </form>
    </div>,
    document.body
  );
};

export default AddClientModal;
