import React from "react";
import Dashboard from "./views/Dashboard";
import SignIn from "./views/SignIn";
import NotFound from "./views/NotFound";
import AuthGuard from "./auth/AuthGuard";
import HowToUse from "./views/HowToUse";

export const AllPages = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/how-to-use",
    element: (
      <AuthGuard>
        <HowToUse />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
