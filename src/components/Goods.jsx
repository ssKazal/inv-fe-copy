import React, { useCallback, useEffect, useState } from 'react';
import ReactToPrint from "react-to-print";
import { green, yellow, red } from "@mui/material/colors";
import { StyledTableCell, StyledTableRow } from "./CustomiedTableCellRow";
import AddIcon from "@mui/icons-material/Add";
import Fab from '@mui/material/Fab';
import ListIcon from '@mui/icons-material/List';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PrintIcon from "@mui/icons-material/Print";
import RemoveIcon from "@mui/icons-material/Remove";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import BasicBreadcrumb from "./BasicBreadcrumb";
import Confirmation from "./Confirmation";
import GoodsModalForm from "./GoodsModalForm";
import CustomPagination from "./CustomPagination";
import Log from "./Log";
import useAuth from "../hooks/useAuth";
import useGoods from "../hooks/useGoods";
import useLog from "../hooks/useLog";
import OldOneTimeGoodsModal from "./OldOneTimeGoodsModal";
import BazarModal from "./BazarModal";
import useBazar from "../hooks/useBazar";

function Goods({ contentRef }) {
  const { user } = useAuth();
  const {
    regularGoodsList,
    oneTimeGoodsList,
    openConfirmation,
    openModalForm,
    page,
    oneTimeGoodsPage,
    order,
    orderBy,
    oneTimeGoodsOrder,
    oneTimeGoodsOrderBy,
    selectedImage,
    isFetchLoading,
    isActionLoading,
    modalFor,
    error,
    searchInputValue,
    handleSearchKeyUp,
    openOldOneTimeGoodsModal,
    handleOpenOldOneTimeGoodsModal,
    handleCloseOldOneTimeGoodsModal,
    handleSearchChange,
    handlePageChange,
    handleOneTimeGoodsPageChange,
    handleDeleteGoodsItem,
    handleHideSelectedGoodsItem,
    handleOpenConfirmation,
    handleCloseConfirmation,
    handleSelectedImage,
    handleOpenModalForm,
    handleCloseModalForm,
    handleImageChange,
    handleAddOrUpdateGoodsItem,
    handleSetModalForm,
    handleRequestSort,
    handleOneTimeGoodsRequestSort,
    handleCurrentQuantityChange,
    handlePurchaseGoodsItem,
  } = useGoods();
  const {
    logs,
    openLog,
    isLogLoading,
    logError,
    logPage,
    selectedLogItem,
    handleOpenLog,
    handleCloseLog,
    handleGetLog,
    handleLogPageChange,
    handleSelectedLogItem,
  } = useLog();
  const {
    ongoingBazar,
    openBazarModal,
    setOngoingBazar,
    handleOpenBazarModal,
    handleCloseBazarModal,
  } = useBazar();

  // Permission
  const isSuperuser = user?.data?.is_superuser;
  const userHasViewGoodsPermission = user?.data?.permissions?.includes("view_goods");
  const userHasAddGoodsPermission = user?.data?.permissions?.includes("add_goods");
  const userHasEditGoodsPermission = user?.data?.permissions?.includes("change_goods");
  const userHasDeleteGoodsPermission = user?.data?.permissions?.includes("delete_goods");
  const userHasViewGoodsLogPermission = user?.data?.permissions?.includes("view_goodslog");

  const [productType, setProductType] = useState("");
  const [selectedGoodsItem, setSelectedGoodsItem] = useState(null);

  const handleProductType = (str) => {
    setProductType(str)
  };
  // Manage goods item
  const handleSelectedGoodsItem = (item) => {
    setSelectedGoodsItem(item);
  };

  // handle what happens on key press
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'B') {
      handleOpenBazarModal();
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Container maxWidth="xl">
      <Box className="goods-header" sx={{ mt: 5 }}>
        <div className="goods-breadcrumbs">
          <BasicBreadcrumb>Goods list</BasicBreadcrumb>
        </div>
        <div className="goods-action">
          <TextField
            type="text"
            variant="outlined"
            inputProps={{ sx: { height: 5 } }}
            placeholder="Search…"
            value={searchInputValue}
            onChange={handleSearchChange}
            onKeyUp={handleSearchKeyUp}
          />
          <ReactToPrint
            bodyClass="print-goods"
            content={() => contentRef.current}
            trigger={() => (
              <Tooltip title="Print out your goods list" followCursor>
                <Button variant="outlined" startIcon={<PrintIcon />}>
                  Print
                </Button>
              </Tooltip>
            )}
          />
          <Tooltip
            title={
              !isSuperuser && !userHasAddGoodsPermission
                ? "You have no permission to add new goods"
                : "Add goods item in your list"
            }
            followCursor
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                disabled={!isSuperuser && !userHasAddGoodsPermission}
                onClick={() => {
                  handleOpenModalForm();
                  handleSetModalForm("add");
                }}
              >
                Add
              </Button>
            </span>
          </Tooltip>
        </div>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Box sx={{ '& > :not(style)': { m: 1 } }} align="right">
          <Fab
            variant="extended"
            onClick={() => {
              handleOpenBazarModal();
            }}
          >
            <ListIcon sx={{ mr: 1 }} />
            Bazar
          </Fab>
          <Fab
            variant="extended"
            onClick={() => {
              handleOpenOldOneTimeGoodsModal();
            }}
          >
            <ListIcon sx={{ mr: 1 }} />
            Old One Time Goods
          </Fab>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead sx={{ textTransform: "uppercase" }}>
              <TableRow className="goods-th">
                <StyledTableCell>
                  <TableSortLabel
                    active={oneTimeGoodsOrderBy === "name"}
                    direction={oneTimeGoodsOrderBy === "name" ? oneTimeGoodsOrder : "asc"}
                    onClick={() => handleOneTimeGoodsRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">Type</StyledTableCell>
                <StyledTableCell align="right">Icon</StyledTableCell>
                <Tooltip title="Current quantity" followCursor>
                  <StyledTableCell align="right">
                    <TableSortLabel
                      active={oneTimeGoodsOrderBy === "current_quantity"}
                      direction={oneTimeGoodsOrderBy === "current_quantity" ? oneTimeGoodsOrder : "asc"}
                      onClick={() => handleOneTimeGoodsRequestSort("current_quantity")}
                    >
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
            {isFetchLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {(isSuperuser || userHasViewGoodsPermission) && oneTimeGoodsList?.onetime_goods_results?.length > 0 ? (
                  oneTimeGoodsList?.onetime_goods_results?.map((goods) => (
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
                            onClick={() => handleCurrentQuantityChange(goods, "add", true)}
                            sx={{ padding: 0 }}
                            color="warning"
                            disabled={false}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleCurrentQuantityChange(goods, "remove", true)}
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
                              !isSuperuser && !userHasEditGoodsPermission
                                ? "You have no permission to Purchase"
                                : "Purchase"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="log"
                                color="secondary"
                                disabled={!isSuperuser && !userHasViewGoodsLogPermission}
                                onClick={() => {
                                  handlePurchaseGoodsItem(goods.id);
                                }}
                                sx={{ paddingRight: "12px" }}
                              >
                                <ShoppingBagIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              !isSuperuser && !userHasEditGoodsPermission
                                ? "You have no permission to view logs"
                                : "Logs"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="log"
                                color="secondary"
                                disabled={!isSuperuser && !userHasViewGoodsLogPermission}
                                onClick={() => {
                                  handleSelectedLogItem(goods);
                                  handleOpenLog();
                                  handleGetLog(goods);
                                }}
                                sx={{ paddingRight: "12px" }}
                              >
                                <PendingActionsIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              !isSuperuser && !userHasEditGoodsPermission
                                ? "You have no permission to edit the goods"
                                : "Edit"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="edit"
                                color="warning"
                                disabled={!isSuperuser && !userHasEditGoodsPermission}
                                onClick={() => {
                                  handleOpenModalForm();
                                  handleSelectedGoodsItem(goods);
                                  handleSelectedImage(goods);
                                  handleSetModalForm("update");
                                }}
                              >
                                <EditIcon />
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
                                  handleProductType("goods")
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

        {/* Pagination */}
        <Box mt={2}>
          {(isSuperuser || userHasViewGoodsPermission) && oneTimeGoodsList?.onetime_goods_total_page > 1 ? (
            <CustomPagination data={oneTimeGoodsList} page={oneTimeGoodsPage} handleOneTimeGoodsPageChange={handleOneTimeGoodsPageChange} />
          ) : (
            ""
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead sx={{ textTransform: "uppercase" }}>
              <TableRow className="goods-th">
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">Type</StyledTableCell>
                <StyledTableCell align="right">Icon</StyledTableCell>
                <Tooltip title="Current quantity" followCursor>
                  <StyledTableCell align="right">
                    <TableSortLabel
                      active={orderBy === "current_quantity"}
                      direction={orderBy === "current_quantity" ? order : "asc"}
                      onClick={() => handleRequestSort("current_quantity")}
                    >
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
            {isFetchLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {(isSuperuser || userHasViewGoodsPermission) && regularGoodsList?.results?.length > 0 ? (
                  regularGoodsList?.results?.map((goods) => (
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
                            onClick={() => handleCurrentQuantityChange(goods, "add")}
                            sx={{ padding: 0 }}
                            color="warning"
                            disabled={false}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleCurrentQuantityChange(goods, "remove")}
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
                              !isSuperuser && !userHasEditGoodsPermission
                                ? "You have no permission to view logs"
                                : "Logs"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="log"
                                color="secondary"
                                disabled={!isSuperuser && !userHasViewGoodsLogPermission}
                                onClick={() => {
                                  handleSelectedLogItem(goods);
                                  handleOpenLog();
                                  handleGetLog(goods);
                                }}
                                sx={{ paddingRight: "12px" }}
                              >
                                <PendingActionsIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              !isSuperuser && !userHasEditGoodsPermission
                                ? "You have no permission to edit the goods"
                                : "Edit"
                            }
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="edit"
                                color="warning"
                                disabled={!isSuperuser && !userHasEditGoodsPermission}
                                onClick={() => {
                                  handleOpenModalForm();
                                  handleSelectedGoodsItem(goods);
                                  handleSelectedImage(goods);
                                  handleSetModalForm("update");
                                }}
                              >
                                <EditIcon />
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
                                  handleProductType("goods")
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

        {/* Pagination */}
        <Box mt={2}>
          {(isSuperuser || userHasViewGoodsPermission) && regularGoodsList?.total_page > 1 ? (
            <CustomPagination data={regularGoodsList} page={page} handlePageChange={handlePageChange} />
          ) : (
            ""
          )}
        </Box>
      </Box>

      {/* Confirmation modal */}
      {openConfirmation ? (
        <Confirmation
          openConfirmation={openConfirmation}
          handleCloseConfirmation={handleCloseConfirmation}
          selectedGoodsItem={selectedGoodsItem}
          productType={productType}
          setSelectedGoodsItem={setSelectedGoodsItem}
        />
      ) : (
        ""
      )}

      {/* Form modal */}
      {openModalForm ? (
        <GoodsModalForm
          selectedImage={selectedImage}
          openModalForm={openModalForm}
          handleCloseModalForm={handleCloseModalForm}
          handleImageChange={handleImageChange}
          handleAddOrUpdateGoodsItem={handleAddOrUpdateGoodsItem}
          error={error}
          isActionLoading={isActionLoading}
          selectedGoodsItem={selectedGoodsItem}
          modalFor={modalFor}
        />
      ) : (
        ""
      )}

      {/* Log modal */}
      {openLog ? (
        <Log
          selectedLogItem={selectedLogItem}
          logs={logs}
          openLog={openLog}
          handleCloseLog={handleCloseLog}
          isLogLoading={isLogLoading}
          logError={logError}
          logPage={logPage}
          handleLogPageChange={handleLogPageChange}
        />
      ) : (
        ""
      )}

      {/* Old one time goods modal */}
      {openOldOneTimeGoodsModal ? (
        <OldOneTimeGoodsModal
          openOldOneTimeGoodsModal={openOldOneTimeGoodsModal}
          handleCloseOldOneTimeGoodsModal={handleCloseOldOneTimeGoodsModal}
          handleOpenConfirmation={handleOpenConfirmation}
          handleSelectedGoodsItem={handleSelectedGoodsItem}
          handleProductType={handleProductType}
        />
      ) : (
        ""
      )}

      {/* Bazar modal */}
      {openBazarModal ? (
        <BazarModal
          openBazarModal={openBazarModal}
          ongoingBazar={ongoingBazar}
          setOngoingBazar={setOngoingBazar}
          handleCloseBazarModal={handleCloseBazarModal}
          handleOpenConfirmation={handleOpenConfirmation}
          handleSelectedGoodsItem={handleSelectedGoodsItem}
          handleProductType={handleProductType}
        />
      ) : (
        ""
      )}
    </Container>
  );
}

export default Goods;
