import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import useAuth from "../hooks/useAuth";

export default function LogoutModal({
    openLogoutModal,
    handleCloseLogoutModal
}) {
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
    };

  return (
    <Dialog
    open={openLogoutModal}
    onClose={handleCloseLogoutModal}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    >
    <DialogTitle id="alert-dialog-title">
      {`Are you sure you want to logout?`}
    </DialogTitle>
    <DialogActions>
      <Button
        variant="outlined"
        sx={{ textTransform: "uppercase" }}
        onClick={handleCloseLogoutModal}
      >
        Cancel
      </Button>
      <Button
        variant="outlined"
        color="error"
        sx={{ textTransform: "uppercase", mr: 2 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </DialogActions>
    </Dialog>
  );
}
