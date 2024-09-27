import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function AuthGuard({ children }) {
  const { user, getUserInfo } = useAuth();

  // Get user info for authenticated user
  useEffect(() => {
    if (user.isAuthenticated) {
      getUserInfo();
    }
  }, [user.isAuthenticated]);

  if (!user.isAuthenticated) return <Navigate to="/sign-in" replace={true} />;
  if (user.isAuthenticated) return <>{children}</>;
}

export default AuthGuard;
