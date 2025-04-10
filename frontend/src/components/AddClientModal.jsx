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
  const [socialMedia, setSocialMedia] = useState("Facebook");
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
      setCompanyName(clientData.companyName || "");
      setCompanyDetail(clientData.companyDetail || "");

      //default to the first social account if available
      const updated = { ...socialMediaAccounts };
      clientData.socialAccounts?.forEach((acc) => {
        updated[acc.platform] = {
          companyToken: acc.companyToken || "",
          pageId: acc.pageId || "",
          apiKey: acc.apiKey || "",
          apiKeySecret: acc.apiKeySecret || "",
          accessToken: acc.accessToken || "",
          accessTokenSecret: acc.accessTokenSecret || "",
          urn: acc.urn || ""
        };
      });
      setSocialMediaAccounts(updated);
    }
  }, [clientData]);

  const handleInputChange = (platform, field, value) => {
    setSocialMediaAccounts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const socialAccounts = Object.entries(socialMediaAccounts)
    .filter(([platform, data]) => {
      switch (platform) {
        case "Twitter":
          return data.apiKey || data.apiKeySecret || data.accessToken || data.accessTokenSecret;
        case "Facebook":
        case "Instagram":
          return data.companyToken || data.pageId;
        case "LinkedIn":
          return data.accessToken || data.urn;
        default:
          return false;
      }
    })
    .map(([platform, data]) => {
      switch (platform) {
        case "Twitter":
          return {
            platform,
            apiKey: data.apiKey,
            apiKeySecret: data.apiKeySecret,
            accessToken: data.accessToken,
            accessTokenSecret: data.accessTokenSecret,
          };
        case "Facebook":
        case "Instagram":
          return {
            platform,
            companyToken: data.companyToken,
            pageId: data.pageId
          };
        case "LinkedIn":
          return {
            platform,
            accessToken: data.accessToken,
            urn: data.urn,
          };
        default:
          return { platform };
      }
    });
    
    
  
    onSubmit({
      companyName,
      companyDetail,
      socialAccounts,
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

        <select className="dropdown" value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)}>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
        </select>

        {(socialMedia === "Facebook" || socialMedia === "Instagram") && (
          <>
            <label>Company Token
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
            <label>
              API Key
              <input
                type="text"
                value={socialMediaAccounts.Twitter?.apiKey || ""}
                onChange={(e) =>
                  handleInputChange("Twitter", "apiKey", e.target.value)
                }
              />
            </label>
            <label>
              API Key Secret
              <input
                type="text"
                value={socialMediaAccounts.Twitter?.apiKeySecret || ""}
                onChange={(e) =>
                  handleInputChange("Twitter", "apiKeySecret", e.target.value)
                }
              />
            </label>
            <label>
              Access Token
              <input
                type="text"
                value={socialMediaAccounts.Twitter?.accessToken || ""}
                onChange={(e) =>
                  handleInputChange("Twitter", "accessToken", e.target.value)
                }
              />
            </label>
            <label>
              Access Token Secret
              <input
                type="text"
                value={socialMediaAccounts.Twitter?.accessTokenSecret || ""}
                onChange={(e) =>
                  handleInputChange("Twitter", "accessTokenSecret", e.target.value)
                }
              />
            </label>
          </>
        )}
        {socialMedia === "LinkedIn" && (
          <>
            <label>Access Token
              <input
                type="text"
                value={socialMediaAccounts.LinkedIn?.accessToken || ""}
                onChange={(e) => handleInputChange("LinkedIn", "accessToken", e.target.value)}
              />
            </label>
            <label>URN
              <input
                type="text"
                value={socialMediaAccounts.LinkedIn?.urn || ""}
                onChange={(e) => handleInputChange("LinkedIn", "urn", e.target.value)}
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
