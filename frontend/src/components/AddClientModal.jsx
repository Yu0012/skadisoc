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
    Facebook: { companyToken: "", pageId: "" },
    Twitter: { companyToken: "", pageId: "" },
    LinkedIn: { companyToken: "", pageId: "" },
    Instagram: { companyToken: "", pageId: "" },
  });

  useEffect(() => {
    if (clientData) {
      setCompanyName(clientData.companyName || "");
      setCompanyDetail(clientData.companyDetail || "");

      const updated = { ...socialMediaAccounts };
      clientData.socialAccounts?.forEach((acc) => {
        updated[acc.platform] = {
          companyToken: acc.companyToken || "",
          pageId: acc.pageId || ""
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
      .filter(([_, v]) => v.companyToken || v.pageId)
      .map(([platform, data]) => ({
        platform,
        ...data
      }));

    onSubmit({
      companyName,
      companyDetail,
      socialAccounts
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
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>

        <label>
          API Token
          <input
            type="text"
            value={socialMediaAccounts[socialMedia].companyToken}
            onChange={(e) => handleInputChange(socialMedia, "companyToken", e.target.value)}
          />
        </label>

        <label>
          Page ID
          <input
            type="text"
            value={socialMediaAccounts[socialMedia].pageId}
            onChange={(e) => handleInputChange(socialMedia, "pageId", e.target.value)}
          />
        </label>

        <input className="create-post-btn" type="submit" value={clientData ? "Update" : "Save"} />
      </form>
    </div>,
    document.body
  );
};

export default AddClientModal;
