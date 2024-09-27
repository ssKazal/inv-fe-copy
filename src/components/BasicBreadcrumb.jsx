import React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";

function BasicBreadcrumb({ children }) {
  return (
    <div role="presentation">
      <Breadcrumbs aria-label="breadcrumb">
        <Typography sx={{ fontWeight: "bold", textTransform: "uppercase" }} color="text.primary">
          {children}
        </Typography>
      </Breadcrumbs>
    </div>
  );
}

export default BasicBreadcrumb;
