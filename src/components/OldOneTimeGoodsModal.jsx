import React from "react";
import { green, yellow, red } from "@mui/material/colors";
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
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Stack from "@mui/material/Stack";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RestoreIcon from '@mui/icons-material/Restore';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOldOneTimeGoodsList } from "../redux/slices/OldOneTimeGoodSlice";
import ApiClient from "../services/ApiClient";
import useGoods from "../hooks/useGoods";


function OldOneTimeGoodsModal({
  openOldOneTimeGoodsModal,
  handleCloseOldOneTimeGoodsModal,
  handleOpenConfirmation,
  handleSelectedGoodsItem,
}) {

  const { user } = useAuth();
  const {
    fetchOneTimeGoods,
  } = useGoods();
  const [oldOneTimeGoodsError, setOldOneTimeGoodsError] = useState("");
  const [isOldOneTimeGoodsFetchLoading, setIsOldOneTimeGoodsFetchLoading] = useState(false);
  const [oldOneTimeGoodsPage, setOldOneTimeGoodsPage] = useState(1);

  const oldOneTimeGoodsList = useSelector((state) => state.oldOneTimeGoods);
  const dispatch = useDispatch();

  // For log modal pagination
  const handleOldOneTimeGoodsPageChange = (event, value) => {
    setOldOneTimeGoodsPage(value);
  };

  // Fetch old onetime goods list
  const fetchOldOneTimeGoods = async (controller = null) => {
    const requestOptions = {
      ...(controller && { signal: controller.signal }), // Add signal only if controller is provided
    };

    await ApiClient.get(
      `/goods/old-onetime/?page=${oldOneTimeGoodsPage}`,
      requestOptions
    )
    .then((res) => {
      dispatch(setOldOneTimeGoodsList(res.data));
      setOldOneTimeGoodsError("");
    })
    .catch((err) => {
      if (err instanceof CanceledError) return;
      if (err?.response?.data?.detail == "Invalid page.") {
          dispatch(setOldOneTimeGoodsPage(oldOneTimeGoodsPage - 1));
      } else {
          setOldOneTimeGoodsError(err.response.data);
          dispatch(setOldOneTimeGoodsList({}));
      }
    })
    .finally(() => {
      setIsOldOneTimeGoodsFetchLoading(false);
    });
  };
  // Get onetime goods list
  useEffect(() => {
    const controller = new AbortController();
    setIsOldOneTimeGoodsFetchLoading(true);
    fetchOldOneTimeGoods(controller);
    // Cleanup function
    return () => {
      // Abort the request when the component unmounts
      controller.abort();
    };
  }, [oldOneTimeGoodsPage]);

  // Restore purchase item
  const handleRestorePurchaseGoodsItem = (itemID) => {
    ApiClient.patch(`/goods/${itemID}/`, { has_purchased: false })
      .then((res) => {
        fetchOldOneTimeGoods();
        fetchOneTimeGoods();
      })
      .catch((err) => {
        console.error(err);
      })
  };

  // Permission
  const isSuperuser = user?.data?.is_superuser;
  const userHasEditGoodsPermission = user?.data?.permissions?.includes("change_goods");
  const userHasDeleteGoodsPermission = user?.data?.permissions?.includes("delete_goods");

  return (
    <Dialog
      open={openOldOneTimeGoodsModal}
      onClose={handleCloseOldOneTimeGoodsModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        List of Old Onetime Goods
        <IconButton onClick={handleCloseOldOneTimeGoodsModal} sx={{ padding: "4px" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ paddingBottom: 1 }}>
          {oldOneTimeGoodsError ? <span style={{ color: "red" }}>{oldOneTimeGoodsError}</span> : ""}
        </DialogContentText>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 900 }} aria-label="customized table">
          <TableHead sx={{ textTransform: "uppercase" }}>
              <TableRow className="goods-th">
                <StyledTableCell>
                  <TableSortLabel>
                    Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">Type</StyledTableCell>
                <StyledTableCell align="right">Icon</StyledTableCell>
                <Tooltip title="Current quantity" followCursor>
                  <StyledTableCell align="right">
                    <TableSortLabel>
                      CT
                    </TableSortLabel>
                  </StyledTableCell>
                </Tooltip>
                <Tooltip title="Standard quantity" followCursor>
                  <StyledTableCell align="right">ST</StyledTableCell>
                </Tooltip>
                <Tooltip title="Measurement type" followCursor>
                  <StyledTableCell align="right">MT</StyledTableCell>
                </Tooltip>
                <Tooltip title="Is onetime product" followCursor>
                  <StyledTableCell align="right">IOP</StyledTableCell>
                </Tooltip>
                <StyledTableCell align="right" className="action-th">
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            {isOldOneTimeGoodsFetchLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                { oldOneTimeGoodsList?.old_onetime_goods_results?.length > 0 ? (
                  oldOneTimeGoodsList?.old_onetime_goods_results?.map((goods) => (
                    <StyledTableRow
                      className="goods-tb"
                      key={goods.id}
                      sx={{
                        backgroundColor:
                          goods.current_quantity >= goods.standard_quantity
                            ? green[100] // Change to the color you want for this condition
                            : goods.current_quantity < goods.standard_quantity &&
                              goods.current_quantity > 0
                            ? yellow[100] // Change to the color you want for this condition
                            : goods.current_quantity <= 0
                            ? red[100] // Change to the color you want for this condition
                            : "inherit", // Use the default color for other rows
                      }}
                    >
                      <StyledTableCell>{goods.name}</StyledTableCell>
                      <StyledTableCell align="center">{goods.goods_type_display}</StyledTableCell>
                      <StyledTableCell align="right" sx={{ padding: 0 }}>
                        <Box
                          component="img"
                          sx={{
                            maxWidth: 51,
                            maxHeight: 51,
                            paddingTop: "5px",
                            paddingRight: 2,
                          }}
                          alt="Goods icon"
                          src={goods.goods_icon}
                          loading="lazy"
                        />
                      </StyledTableCell>
                      <StyledTableCell
                        className="ct-tb"
                        align="right"
                        sx={{ display: "flex", alignItems: "center", padding: 1, pr: 2, gap: 1 }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <IconButton
                            sx={{ padding: 0 }}
                            color="warning"
                            disabled={false}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            sx={{ padding: 0 }}
                            color="warning"
                            disabled={goods.current_quantity < 1 ? true : goods.isDisabled}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                        {goods.current_quantity}
                      </StyledTableCell>
                      <StyledTableCell align="right">{goods.standard_quantity}</StyledTableCell>
                      <StyledTableCell align="right">{goods.measurement_type}</StyledTableCell>
                      <StyledTableCell align="right">
                        {goods?.is_one_time ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </StyledTableCell>
                      <StyledTableCell className="action-tb" align="right" sx={{ padding: 0 }}>
                        <Stack direction="row-reverse">
                          <Tooltip
                            title={
                              !isSuperuser && !userHasDeleteGoodsPermission
                                ? "You have no permission to restore the goods"
                                : "Delete"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="log"
                                color="secondary"
                                disabled={!isSuperuser && !userHasEditGoodsPermission}
                                sx={{ paddingRight: "12px" }}
                                onClick={() => {
                                  handleRestorePurchaseGoodsItem(goods.id);
                                }}
                              >
                                <RestoreIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              !isSuperuser && !userHasDeleteGoodsPermission
                                ? "You have no permission to delete the goods"
                                : "Delete"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                disabled={!isSuperuser && !userHasDeleteGoodsPermission}
                                onClick={() => {
                                  handleOpenConfirmation();
                                  handleSelectedGoodsItem(goods);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ textTransform: "uppercase" }}>
                      No data available
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
        {oldOneTimeGoodsList?.old_onetime_goods_total_page > 1 ? (
          <CustomPagination data={oldOneTimeGoodsList} page={oldOneTimeGoodsPage} onChange={handleOldOneTimeGoodsPageChange} />
        ) : (
          ""
        )}
      </Box>
    </Dialog>
  );
}

export default OldOneTimeGoodsModal;
