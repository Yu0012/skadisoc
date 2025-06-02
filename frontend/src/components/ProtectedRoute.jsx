// import React, { useContext } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { AuthContext } from "../context/AuthContext";

// const ProtectedRoute = ({ children, requiredMenu }) => {
//   const { user, permissions } = useContext(AuthContext);
//   const location = useLocation();

//   if (!user) {
//     // User not logged in, redirect to login page
//     return <Navigate to="/" state={{ from: location }} replace />;
//   }

//   if (requiredMenu && !permissions?.menus?.includes(requiredMenu)) {
//     // User doesn't have permission, redirect to dashboard
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;