import React from "react";
import Button from '@mui/material/Button';
import useAuth from "../hooks/useAuth";

function NotFound() {
  const { user } = useAuth();
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <Button variant="contained" href="/">{ user.isAuthenticated ? "Dashboard" : "Home" }</Button>
    </div>
  );
}

export default NotFound;
