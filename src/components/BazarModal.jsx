import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { StyledTableCell, StyledTableRow } from "./CustomiedTableCellRow";
import FormControlLabel from "@mui/material/FormControlLabel";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import Fab from '@mui/material/Fab';
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
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import DialogActions from "@mui/material/DialogActions";
import ApiClient from "../services/ApiClient";
import useAuth from "../hooks/useAuth";
import Autocomplete from '@mui/material/Autocomplete';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import useGoods from '../hooks/useGoods';
import useBazar from '../hooks/useBazar';
import {
  setBazarList,
  purchaseBazarItem,
  updateBazarItem,
  purchaseAllBazarItems,
  selectTotalPrice,
} from "../redux/slices/BazarSlice";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  color: 'black',
  pt: 2,
  px: 4,
  pb: 3,
};


function BazarGoodsAddForm({
  openBazarGoodsForm,
  handleClose,
  ongoingBazar,
  selectedGoods,
  modalFor,
}) {

  const dispatch = useDispatch();
  const { user } = useAuth();

  const [addUpdateFormLoading, setAddUpdateFormLoading] = useState(false);
  const [hasUpdatedGoodsList, setHasUpdatedGoodsList] = useState(false);
  const [bazarAddUpdateError, setBazarAddUpdateError] = useState("");
  const [goodsType, setGoodsType] = useState("");
  const [hasBazarEnd, setHasBazarEnd] = useState(false);

  const handleGoodsTypeChange = (event) => {
    setGoodsType(event.target.value);
  };

  const handleHasBazarEnd = () => {
   setHasBazarEnd(true);
  };

  useEffect(() => {
    if (ongoingBazar.status === "end") {
      handleHasBazarEnd();
    }
    if (ongoingBazar.added_with_goods_list) {
      setHasUpdatedGoodsList(true);
    }
  }, [ongoingBazar]);

  // Add or update bazar goods
  const handleAddUpdateBazar = async (event) => {
    event.preventDefault();
    setAddUpdateFormLoading(true);

    let data = new FormData(event.currentTarget);
    if (modalFor === "add") {
      data.append("bazar_obj", ongoingBazar?.id);
      data.append("added_by", user?.data?.id);
    };

    let url = modalFor === "update" ? "/bazar_goods/" + selectedGoods.id + "/" : "/bazar_goods/";

    await ApiClient[modalFor === "update" ? "patch" : "post"](url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        dispatch(updateBazarItem(res.data))
        handleClose();
        setBazarAddUpdateError("");
      })
      .catch((err) => {
        setBazarAddUpdateError("Something went wrong!");
      })
      .finally(() => {
        setAddUpdateFormLoading(false);
      });
  };

  return (
    <React.Fragment>
      <Modal
        open={openBazarGoodsForm}
        onClose={handleClose}
        component="form"
        onSubmit={(event) => {
          handleAddUpdateBazar(event);
        }}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 500 }}>
          <DialogTitle sx={{ textTransform: "uppercase" }}>{modalFor === "update" ? "Update" : "Add"} Bazar Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {bazarAddUpdateError?.detail ? <span style={{ color: "red" }}>{bazarAddUpdateError.detail}</span> : ""}
            </DialogContentText>
            <TextField
              autoFocus
              required
              disabled={hasUpdatedGoodsList}
              sx={{ m: 1, maxWidth: 150 }}
              id="outlined-name"
              name="name"
              label="Name"
              type="text"
              defaultValue={selectedGoods?.name}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(bazarAddUpdateError?.name)}
              helperText={bazarAddUpdateError?.name}
            />
            <TextField
              autoFocus
              required
              disabled={hasUpdatedGoodsList}
              sx={{ m: 1, maxWidth: 150 }}
              id="outlined-quantity"
              label="Quantity"
              type="number"
              name="quantity"
              defaultValue={selectedGoods?.quantity}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(bazarAddUpdateError?.quantity)}
              helperText={bazarAddUpdateError?.quantity}
            />
            {selectedGoods?.has_purchased ?
              <TextField
                autoFocus
                required
                disabled={hasBazarEnd}
                sx={{ m: 1, maxWidth: 150 }}
                id="outlined-price"
                label="Price"
                type="number"
                name="price"
                defaultValue={selectedGoods?.price}
                InputLabelProps={{
                  shrink: true,
                }}
                error={Boolean(bazarAddUpdateError?.price)}
                helperText={bazarAddUpdateError?.price}
              /> : ""
            }
            <FormControl fullWidth sx={{ m: 1, maxWidth: 150 }}>
              <InputLabel id="goods-type-label">Type</InputLabel>
              <Select
                autoFocus
                required
                disabled={hasBazarEnd}
                labelId="goods-type-label"
                id="goods_type"
                name="goods_type"
                defaultValue={selectedGoods?.goods_type ? selectedGoods?.goods_type : ""}
                label="Type"
                onChange={handleGoodsTypeChange}
                error={Boolean(bazarAddUpdateError?.goods_type)}
                helperText={bazarAddUpdateError?.goods_type}
              >
                <MenuItem value="cooking">Cooking</MenuItem>
                <MenuItem value="snacks">Snacks</MenuItem>
                <MenuItem value="household">Household</MenuItem>
              </Select>
            </FormControl>
            <TextField
              autoFocus
              required
              disabled={hasBazarEnd}
              sx={{ m: 1, maxWidth: 150 }}
              id="outlined-read-only-input"
              label="Measurement Type"
              name="measurement_type"
              type="text"
              defaultValue={selectedGoods?.measurement_type}
              InputProps={{
                shrink: true,
              }}
              error={Boolean(bazarAddUpdateError?.measurement_type)}
              helperText={bazarAddUpdateError?.measurement_type}
            />
            <FormControlLabel
              name="is_one_time"
              label="Is one time"
              labelPlacement="start"
              control={
                <Checkbox color="success" defaultChecked={selectedGoods?.is_one_time} />
              }
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              sx={{ mr: 2 }}
              variant="outlined"
              color="primary"
              type="submit"
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Modal>
    </React.Fragment>
  );
};


const CreateBazarForm = ({ setOngoingBazar }) => {

  function Today() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${year}-${month}-${date}`;
  }

  const [users, setUsers] = React.useState([]);
  const [date, setDate] = React.useState(dayjs(Today()));
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };
  const [shopper, setShopper] = React.useState('');
  const [error, setError] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const handleShopperChange = (event) => {
    setShopper(event.target.value);
  };

  useEffect(() => {
    // Fetch users logic here
    ApiClient.get("/users/")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((error) => {
        setUsers([]);
        console.error('Error fetching users:', error);
      });
  }, []);

  // Create Bazar
  const handleBazarCreate = async (event) => {
    event.preventDefault();
    setIsActionLoading(true);
    setError("");

    let data = new FormData(event.currentTarget);

    ApiClient.post(`/bazar/`, data)
      .then((res) => {
        setOngoingBazar(res.data);
        setError("");
      })
      .catch((err) => {
        setError("Something went wrong!");
      })
      .finally(() => {
        setIsActionLoading(false);
      });
  };

  return (
    <React.Fragment>
      <DialogTitle sx={{ textTransform: "uppercase" }}>Create Bazar</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleBazarCreate}
        >
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Bazar Date"
                name="bazar_date"
                value={date}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            <InputLabel id="shopper-select-label">Shopper</InputLabel>
            <Select
              labelId="shopper-select-label"
              id="shopper-select"
              value={shopper}
              label="Shopper"
              name="shopper"
              onChange={handleShopperChange}
            >
              {users.length > 0 ? (
                users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">
                  No users found
                </MenuItem>
              )}
            </Select>
          </div>

          <DialogActions>
            <Button
              sx={{ mr: 2 }}
              variant="outlined"
              color="primary"
              type="submit"
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </React.Fragment>
  )
};

function BazarFormModal({
  openBazarCreateForm,
  handleCloseBazarCreateForm,
  setOngoingBazar,
}) {

  return (
    <React.Fragment>
      <Modal
        open={openBazarCreateForm}
        onClose={handleCloseBazarCreateForm}
        component="form"
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 500 }}>
           <IconButton onClick={handleCloseBazarCreateForm} sx={{ padding: "4px" }}>
              <CloseIcon />
            </IconButton>
          <CreateBazarForm setOngoingBazar={setOngoingBazar} />
        </Box>
      </Modal>
    </React.Fragment>
  );
}


const BazarList = ({
  ongoingBazar,
  openBazarCreateForm,
  handleCloseBazarCreateForm,
  handleOpenBazarCreateForm,
  setOngoingBazar,
  handleOpenConfirmation,
  handleSelectedGoodsItem,
  handleProductType,
}) => {

  const { fetchGoods } = useGoods();
  const {
    fetchBazarList,
    bazarListLoading,
    bazarListError,
  } = useBazar();

  const [openBazarGoodsForm, setOpenBazarGoodsForm] = useState(false);
  const [selectableGoodsList, setSelectableGoodsList] = useState([]);
  const [selectedGoods, setSelectedGoods] = useState([]);
  const [modalFor, setModalFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasBazarStarted, setHasBazarStarted] = useState(false);
  const [hasBazarFinished, setHasBazarFinished] = useState(false);
  const totalPrice = useSelector(selectTotalPrice);
  const [goodsListUpdateLoading, setGoodsListUpdateLoading] = useState(false);
  const [goodListUpdateMessage, setGoodListUpdateMessage] = useState("");
  const [statusButtonText, setStatusButtonText] = useState("");

  const handlePurchased = (status) => {
    setHasPurchased(status);
  }

  const bazarList = useSelector((state) => state.bazarList);
  const dispatch = useDispatch();

  // Get current bazar object
  const handleSelectableGoodsList = async () => {
    await ApiClient.get(`/bazar/selectable-goods/`)
      .then((res) => {
        setSelectableGoodsList(res.data);
      })
      .catch((err) => {
        setSelectableGoodsList([]);
      })
  };

  const handleModalFor = (str) => {
    setModalFor(str);
  };

  useEffect(() => {
    handleSelectableGoodsList();
  }, []);

  const changeBazarStatus = async () => {
    setLoading(true);
    let status = ""
    if (ongoingBazar?.status === "created") {
      status = "started"
    } else if (ongoingBazar?.status === "started") {
      status = "end"
    } else if (ongoingBazar?.status === "end") {
      status = "done"
    }
    
    if (status) {
      await ApiClient.patch(`/bazar/${ongoingBazar.id}/`, { "status": status })
        .then((res) => {
          if (status !== "done") {
            setOngoingBazar(res.data);
          } else {
            setOngoingBazar(null);
          }
          setError("");
        })
        .catch((err) => {
          setError("Something went wrong!");
        })
        .finally(() => {
          setLoading(false);
        });
    };
  };

  const updateGoodsList = async () => {
    setGoodsListUpdateLoading(true);

    await ApiClient.post(`/bazar/${ongoingBazar.id}/update-goods-list/`)
      .then((res) => {
        fetchGoods();
        setGoodListUpdateMessage(res.data["message"]);
      })
      .catch((err) => {
        console.log("err", err)
        setGoodListUpdateMessage(err.response.data["message"]);
      })
      .finally(() => {
        setGoodsListUpdateLoading(false);
      });
  };

  const handleClose = () => {
    setOpenBazarGoodsForm(false);
  };

  const handleChange = (event, params) => {
    if (params) {
      setSelectedGoods(params);
      setOpenBazarGoodsForm(true);
      handleModalFor("add");
    }
  };

  const handleRenderInput = (params) => {
    return <TextField {...params} label="Select goods" />;
  };

  const purchaseSingleBazar = async (bazar) => {
    let has_purchased_status = bazar?.has_purchased ? false : true;

    await ApiClient.patch(`/bazar_goods/${bazar?.id}/`, { "has_purchased": has_purchased_status })
      .catch((err) => {
        dispatch(purchaseBazarItem(bazar?.id));
      })
  };

  const handlePurchaseClick = (bazar) => {
    dispatch(purchaseBazarItem(bazar?.id));
    purchaseSingleBazar(bazar); // Call purchase logic
  };

  const purchaseAllBazar = async (bazar) => {
    await ApiClient.post(`/bazar/${ongoingBazar.id}/purchase-all/`)
      .catch((err) => {
        fetchBazarList();
      })
  };

  const handlePurchaseAllClick = () => {
    dispatch(purchaseAllBazarItems());
    purchaseAllBazar()
  };

  const generateTSVContent = (bazarList) => {
    // Define the headers for the TSV
    const headers = ["Date", "Name", "Quantity", "Price"];

    // Map through the bazar list and create an array of TSV rows
    const rows = bazarList.bazar_results.map((bazar, index) => [
      index === 0 ? ongoingBazar.bazar_date : "", // Set the date only in the first row
      bazar.name,
      bazar.quantity,
      bazar.price,
    ]);

    // Combine the headers and rows into a single array
    const tsvContent = [headers, ...rows];
    // Convert the array to a TSV string
    const tsvString = tsvContent.map(e => e.join("\t")).join("\n");
    return tsvString;
  };

  const downloadTSV = (tsvContent, filename = `bazar-${ongoingBazar.bazar_date}.txt`) => {
    // Create a Blob from the TSV content
    const blob = new Blob([tsvContent], { type: "text/plain" });
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // Append the link to the document body and trigger the click event
    document.body.appendChild(link);
    link.click();
    // Remove the link from the document body
    document.body.removeChild(link);
  };

  const handleCopyToClipboardClick = () => {
    const tsvContent = generateTSVContent(bazarList);
    downloadTSV(tsvContent);
  };

  useEffect(() => {
    if (ongoingBazar?.status === "created") {
      setStatusButtonText("Start")
    } else if (ongoingBazar?.status === "started") {
      setStatusButtonText("End")
      setHasBazarStarted(true);
    } else if (ongoingBazar?.status === "end") {
      setStatusButtonText("Done")
      setHasBazarFinished(true);
    }
  }, [ongoingBazar])

  return (
    <React.Fragment>
      <BazarGoodsAddForm
        openBazarGoodsForm={openBazarGoodsForm}
        handleClose={handleClose}
        ongoingBazar={ongoingBazar}
        selectedGoods={selectedGoods}
        modalFor={modalFor}
      />
      <BazarFormModal 
        openBazarCreateForm={openBazarCreateForm}
        handleCloseBazarCreateForm={handleCloseBazarCreateForm}
        setOngoingBazar={setOngoingBazar}
      />
      <DialogTitle
        id="alert-dialog-title"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        Bazar - {ongoingBazar.bazar_date}

        {/* <Fab
          variant="extended"
          sx={{ align: "right", padding: "4px" }}
          onClick={() => {
            handleOpenBazarCreateForm();
          }}
        >
          Create Bazar
        </Fab> */}
      </DialogTitle>
      <DialogContent>
        {!hasBazarFinished ? 
          <DialogContentText sx={{ paddingBottom: 1 }}>
            <Button onClick={() => {
              setOpenBazarGoodsForm(true);
              handleModalFor("add");
              setSelectedGoods(null);
            }}>Add Bazar Goods</Button>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={selectableGoodsList}
              sx={{ width: 300 }}
              renderInput={handleRenderInput}
              onChange={handleChange}
            />
          </DialogContentText>
          : null
        }
        Total: {totalPrice}
        <Box sx={{ '& > :not(style)': { m: 1 } }} align="right">
          <Fab
            variant="extended"
            onClick={handleCopyToClipboardClick}
          >
            Download
          </Fab>
          {!hasBazarFinished ?
            <>
              {hasBazarStarted ? 
                <Fab
                  variant="extended"
                  onClick={handlePurchaseAllClick}
                >
                  Purchase All
                </Fab> : ""
              }
              
            </>
            : 
            <>
              {goodListUpdateMessage}
              <Fab
                variant="extended"
                onClick={updateGoodsList}
              >
                Update Goods list
              </Fab>
            </>
          }
          <Fab
            variant="extended"
            onClick={changeBazarStatus}
          >
            {statusButtonText}
          </Fab>
        </Box>

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
                <Tooltip title="Quantity" followCursor>
                  <StyledTableCell align="right">QT</StyledTableCell>
                </Tooltip>
                <Tooltip title="Measurement type" followCursor>
                  <StyledTableCell align="right">MT</StyledTableCell>
                </Tooltip>
                <Tooltip title="Is onetime product" followCursor>
                  <StyledTableCell align="right">IOP</StyledTableCell>
                </Tooltip>
                <Tooltip title="Price" followCursor>
                  <StyledTableCell align="right">Price</StyledTableCell>
                </Tooltip>
                {hasBazarStarted ? 
                  <Tooltip title="Purchase" followCursor>
                    <StyledTableCell align="right">Purchase</StyledTableCell>
                  </Tooltip> : ""
                }
                <StyledTableCell align="right" className="action-th">
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            {bazarListLoading ? (
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
                {bazarList?.bazar_results?.length > 0 ? (
                  bazarList?.bazar_results?.map((bazar) => (
                    <StyledTableRow
                      className="goods-tb"
                      key={bazar.id}
                      sx={{
                        backgroundColor: "inherit", // Use the default color for other rows
                      }}
                    >
                      <StyledTableCell>{bazar.name}</StyledTableCell>
                      <StyledTableCell align="center">{bazar.goods_type}</StyledTableCell>
                      <StyledTableCell align="right">{bazar.quantity}</StyledTableCell>
                      <StyledTableCell align="right">{bazar.measurement_type}</StyledTableCell>
                      <StyledTableCell align="right">
                        {bazar?.is_one_time ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="right">{bazar.price}</StyledTableCell>
                      {hasBazarStarted ? 
                        <StyledTableCell align="right">
                          <Checkbox
                            checked={bazar.has_purchased}
                            disabled={hasBazarFinished}
                            onClick={() => {
                              handlePurchaseClick(bazar)
                            }}
                          />
                        </StyledTableCell> : ""
                      }
                      <StyledTableCell className="action-tb" align="right" sx={{ padding: 0 }}>
                        <Stack direction="row-reverse">
                          <Tooltip
                            // title={
                            //   !isSuperuser && !userHasEditGoodsPermission
                            //     ? "You have no permission to edit the goods"
                            //     : "Edit"
                            // }
                            Edit
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="edit"
                                color="warning"
                                // disabled={!isSuperuser && !userHasEditGoodsPermission}
                                // onClick={() => {
                                //   handleOpenModalForm();
                                //   handleSelectedGoodsItem(goods);
                                //   handleSelectedImage(goods);
                                //   handleSetModalForm("update");
                                // }}
                                onClick={() => {
                                  setOpenBazarGoodsForm(true);
                                  setSelectedGoods(bazar);
                                  handleModalFor("update");
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            // title={
                            //   !isSuperuser && !userHasDeleteGoodsPermission
                            //     ? "You have no permission to delete the goods"
                            //     : "Delete"
                            // }
                            Delete
                            followCursor
                          >
                            <span>
                              <IconButton
                                aria-label="delete"
                                color="error"
                                // disabled={!isSuperuser && !userHasDeleteGoodsPermission}
                                onClick={() => {
                                  handleOpenConfirmation();
                                  handleSelectedGoodsItem(bazar);
                                  handleProductType("bazar")
                                }}
                                disabled={hasBazarFinished}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  )
                  )
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

    </React.Fragment>
  )
}


function BazarModal({
  openBazarModal,
  ongoingBazar,
  setOngoingBazar,
  handleCloseBazarModal,
  CloseBazarCreateForm,
  handleSelectedGoodsItem,
  handleProductType,
}) {

  const [openBazarCreateForm, setOpenBazarCreateForm] = useState(false);
  const handleOpenBazarCreateForm = () => {
    setOpenBazarCreateForm(true);
  };
  const handleCloseBazarCreateForm = () => {
    setOpenBazarCreateForm(false);
  };

  return (
    <Dialog
      open={openBazarModal}
      onClose={handleCloseBazarModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xl"
    > 
      <IconButton onClick={handleCloseBazarModal} sx={{ padding: "4px" }}>
        <CloseIcon />
      </IconButton>
      {ongoingBazar ?
        <BazarList
          ongoingBazar={ongoingBazar}
          setOngoingBazar={setOngoingBazar}
          CloseBazarCreateForm={CloseBazarCreateForm}
          handleSelectedGoodsItem={handleSelectedGoodsItem}
          handleProductType={handleProductType}
          openBazarCreateForm={openBazarCreateForm}
          handleOpenBazarCreateForm={handleOpenBazarCreateForm}
          handleCloseBazarCreateForm={handleCloseBazarCreateForm}
        /> : <CreateBazarForm 
                setOngoingBazar={setOngoingBazar} 
              />
      }
    </Dialog>
  );
}

export default BazarModal;
