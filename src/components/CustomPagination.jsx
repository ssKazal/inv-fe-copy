import React from "react";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

function CustomPagination({ data, page, handlePageChange }) {
  return (
    <Box className="pagination-box">
      <Stack direction="row-reverse" spacing={2}>
        <Pagination
          color="primary"
          count={data.total_page}
          page={page}
          onChange={handlePageChange}
        />
      </Stack>
    </Box>
  );
}

export default CustomPagination;
