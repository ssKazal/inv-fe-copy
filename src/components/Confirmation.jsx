import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from '@mui/material/Snackbar';
import { useDispatch } from "react-redux";
import ApiClient from "../services/ApiClient";
import {
  deleteGoodsItem,
  undoDeleteGoodsItem,
} from "../redux/slices/GoodsSlice";
import {
  deleteOneTimeGoodsItem,
  undoDeleteOneTimeGoodsItem,
} from "../redux/slices/OneTimeGoodsSlice";
import {
  deleteOldOneTimeGoodsItem,
  undoDeleteOldOneTimeGoodsItem,
} from "../redux/slices/OldOneTimeGoodSlice";
import {
  deleteBazarItem,
  undoDeleteBazarItem,
} from "../redux/slices/BazarSlice";
import useGoods from '../hooks/useGoods';
import useBazar from '../hooks/useBazar';

function Confirmation({
  openConfirmation,
  handleCloseConfirmation,
  selectedGoodsItem,
  productType,
  setSelectedGoodsItem,
}) {

  const {
    fetchGoods,
    fetchOneTimeGoods,
  } = useGoods();
  const {
    fetchBazarList,
  } = useBazar();

  let undoDeleteDuration = 3  // After this time(second) item will permanently delete
  let undoDeleteDurationInMillisecond = 3000 // Delete duration time in millisecond
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationTimer, setConfirmationTimer] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarCountdown, setSnackbarCountdown] = useState(undoDeleteDuration);
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear the timer when the component unmounts or when confirmation is complete
    return () => clearTimeout(confirmationTimer);
  }, [confirmationTimer]);

  useEffect(() => {
    let timer;
    // Show left time in snackbar
    if (openSnackbar) {
      timer = setInterval(() => {
        setSnackbarCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [openSnackbar]);

  // Temporary hide selected item
  const handleHideSelectedGoodsItem = () => {
    if (productType === "bazar") {
      dispatch(deleteBazarItem(selectedGoodsItem.id));
    } else {
      if (selectedGoodsItem.is_one_time) {
        if (selectedGoodsItem.has_purchased) {
          dispatch(deleteOldOneTimeGoodsItem(selectedGoodsItem.id));
        } else {
          dispatch(deleteOneTimeGoodsItem(selectedGoodsItem.id));
        }
      } else {
        dispatch(deleteGoodsItem(selectedGoodsItem.id));
      };
    }
  }

  // Delete item
  const handleDeleteGoodsItem = () => {
    setIsActionLoading(true);

    let url_path = productType === "bazar" ? "bazar_goods" : "goods";

    ApiClient.delete(`/${url_path}/${selectedGoodsItem.id}`)
      .then((res) => {
        if (productType === "bazar") {
          dispatch(deleteBazarItem(selectedGoodsItem.id))
          fetchBazarList();
        } else {
          if (selectedGoodsItem.is_one_time) {
            if (selectedGoodsItem.has_purchased) {
              dispatch(deleteOldOneTimeGoodsItem(selectedGoodsItem.id));
            } else {
              dispatch(deleteOneTimeGoodsItem(selectedGoodsItem.id));
            }
            fetchOneTimeGoods();
          } else {
            dispatch(deleteGoodsItem(selectedGoodsItem.id));
            fetchGoods();
          };
        }
        handleCloseConfirmation();
        setSelectedGoodsItem({});
      })
      .catch((err) => {
        console.log("url_path-----", err)
        setError("Something went wrong!");
      })
      .finally(() => {
        setIsActionLoading(false);
      });
  };

  const handleOk = () => {
    setIsConfirmed(true);
    setOpenSnackbar(true);
    setSnackbarCountdown(undoDeleteDuration);

    setConfirmationTimer(setTimeout(() => {
      handleDeleteGoodsItem();
      handleCloseConfirmation();
      setIsConfirmed(false);
      setOpenSnackbar(false);
      setSnackbarCountdown(undoDeleteDuration);
    }, 3500)); // Delete function will call after undo time end

    handleHideSelectedGoodsItem();
  };

  const handleUndo = () => {
    clearTimeout(confirmationTimer);
    if (productType === "bazar") {
      dispatch(undoDeleteBazarItem());
    } else {
      if (selectedGoodsItem.is_one_time) {
        if (selectedGoodsItem.has_purchased) {
          dispatch(undoDeleteOldOneTimeGoodsItem());
        } else {
          dispatch(undoDeleteOneTimeGoodsItem());
        }
      } else {
        dispatch(undoDeleteGoodsItem());
      };
    }
    handleCloseConfirmation();
    setIsConfirmed(false);
    setOpenSnackbar(false);
    setSnackbarCountdown(undoDeleteDuration);
  };

  const snackbarAction = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleUndo}>
        UNDO
      </Button>
    </React.Fragment>
  );

  return (
    <>
      {isConfirmed ? (
        <div>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={undoDeleteDurationInMillisecond}
            message={snackbarCountdown}
            action={snackbarAction}
          />
        </div>
      ) : (
        <Dialog
          open={openConfirmation}
          onClose={handleCloseConfirmation}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {`Are you sure you want to delete item ${selectedGoodsItem?.name}?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {error ? <span style={{ color: "red" }}>{error}</span> : ""}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              sx={{ textTransform: "uppercase" }}
              onClick={handleCloseConfirmation}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ textTransform: "uppercase", mr: 2 }}
              onClick={handleOk}
              autoFocus
            >
              {isActionLoading ? <CircularProgress size={24} color="inherit" /> : "Ok"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export default Confirmation;
