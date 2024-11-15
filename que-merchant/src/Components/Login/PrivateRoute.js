// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';

// // Adjusting PrivateRoute to properly handle its props as expected in React Router v6
// const PrivateRoute = ({ element: Component, ...rest }) => {
//     const isAuthenticated = sessionStorage.getItem("isLoggedIn"); // Check if the user is logged in

//     return (
//         <Route 
//             {...rest} 
//             element={isAuthenticated ? <Component /> : <Navigate to="/login" />} 
//         />
//     );
// };

// export default PrivateRoute;
