// components/CreatePostLauncher.jsx
import React, { useState } from 'react';
import CreatePostModal from './CreatePostModal';

const CreatePostLauncher = () => {
  const [platform, setPlatform] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePlatformSelect = (e) => {
    setPlatform(e.target.value);
    setShowModal(true);
    setDropdownOpen(false);
  };

  return (
    <div>
      {!showModal && (
        <>
          <button onClick={() => setDropdownOpen((prev) => !prev)}>
            ➕ Create Post
          </button>
          {dropdownOpen && (
            <select onChange={handlePlatformSelect} defaultValue="">
              <option value="" disabled>
                Select Platform
              </option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter">Twitter</option>
            </select>
          )}
        </>
      )}

      {showModal && (
        <CreatePostModal
          platform={platform}
          onClose={() => {
            setShowModal(false);
            setPlatform('');
          }}
        />
      )}
    </div>
  );
};

export default CreatePostLauncher;
