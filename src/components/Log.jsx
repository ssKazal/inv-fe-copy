import React from "react";
import { StyledTableCell, StyledTableRow } from "./CustomiedTableCellRow";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CustomPagination from "./CustomPagination";

function Log({
  selectedLogItem,
  logs,
  openLog,
  handleCloseLog,
  isLogLoading,
  logError,
  logPage,
  handleLogPageChange,
}) {
  return (
    <Dialog
      open={openLog}
      onClose={handleCloseLog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        Logs of {selectedLogItem?.name}
        <IconButton onClick={handleCloseLog} sx={{ padding: "4px" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ paddingBottom: 1 }}>
          {logError ? <span style={{ color: "red" }}>{logError}</span> : ""}
        </DialogContentText>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 600 }} aria-label="customized table">
            <TableHead sx={{ textTransform: "uppercase" }}>
              <TableRow>
                <StyledTableCell>Date/Time</StyledTableCell>
                <StyledTableCell align="right">Action type</StyledTableCell>
                <StyledTableCell align="right">Transition Details</StyledTableCell>
                <StyledTableCell align="right">User</StyledTableCell>
              </TableRow>
            </TableHead>
            {isLogLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {logs?.results?.length > 0 ? (
                  logs?.results?.map((log) => (
                    <React.Fragment key={log.id}>
                      {log.notes.map((note, noteIndex) => {
                        try {
                          const parsedNote = JSON.parse(note.replace(/'/g, '"'));

                          return (
                            <StyledTableRow key={noteIndex}>
                              {noteIndex === 0 && (
                                <StyledTableCell
                                  component="th"
                                  scope="row"
                                  rowSpan={log.notes.length}
                                >
                                  {parsedNote.date}
                                </StyledTableCell>
                              )}
                              <StyledTableCell align="right">
                                {parsedNote.action_type}
                              </StyledTableCell>

                              {parsedNote.action_field === "icon" ? (
                                <StyledTableCell
                                  align="right"
                                  sx={{ display: "flex", padding: "12px", pr: 2 }}
                                >
                                  <Box
                                    component="img"
                                    sx={{
                                      maxHeight: 28,
                                    }}
                                    alt="previous icon"
                                    src={parsedNote.previous_value}
                                  />
                                  <Box padding="4px">to</Box>
                                  <Box
                                    component="img"
                                    sx={{
                                      maxHeight: 28,
                                    }}
                                    alt="current icon"
                                    src={parsedNote.current_value}
                                  />
                                </StyledTableCell>
                              ) : parsedNote.action_type === "update" ? (
                                <StyledTableCell align="right">
                                  {parsedNote.previous_value} to {parsedNote.current_value}
                                </StyledTableCell>
                              ) : (
                                <StyledTableCell align="right"></StyledTableCell>
                              )}

                              <StyledTableCell align="right">
                                {parsedNote.username}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        } catch (error) {
                          return null; // or handle the error as needed
                        }
                      })}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          textTransform: "uppercase",
                        }}
                      >
                        No data available
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </DialogContent>

      {/* Pagination */}
      <Box sx={{ pb: 2, pr: 3 }}>
        {logs?.total_page > 1 ? (
          <CustomPagination data={logs} page={logPage} handlePageChange={handleLogPageChange} />
        ) : (
          ""
        )}
      </Box>
    </Dialog>
  );
}

export default Log;
