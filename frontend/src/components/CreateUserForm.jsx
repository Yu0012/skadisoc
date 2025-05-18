import React from "react";
import { ImCross } from "react-icons/im";

const CreateUserForm = ({
  username, setName,
  email, setEmail,
  phoneNum, setPhoneNum,
  address, setAddress,
  password, setPassword,
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
        <input className="create-post-btn" type="submit" value="Save" />
      </form>
    </div>
  );
};

export default CreateUserForm;
