import React from "react";
import { ImCross } from "react-icons/im";

const CreateUserForm = ({
  username, setName,
  email, setEmail,
  password, setPassword,
  role, setRole,
  onClose,
  onSubmit,
  isEditing
}) => {
  return (
    <div className="newUserMenu">
      <ImCross className="exitButton" onClick={onClose} />
      <form className="form-group" onSubmit={onSubmit}>
        <a className="form-title">{isEditing ? "Edit User" : "Create New User"}</a>
        <label>Name: <input type="text" className="newAccountForm" value={username} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <label>Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <input className="create-post-btn" type="submit" value="Save" />
      </form>
    </div>
  );
};

export default CreateUserForm;
