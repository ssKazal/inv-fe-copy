import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function GoodsModalForm({
  selectedGoodsItem,
  selectedImage,
  openModalForm,
  handleCloseModalForm,
  handleImageChange,
  handleAddOrUpdateGoodsItem,
  error,
  isActionLoading,
  modalFor,
}) {
  const [goodsType, setGoodsType] = React.useState('');
  const handleGoodsTypeChange = (event) => {
    setGoodsType(event.target.value);
  };

  return (
    <React.Fragment>
      <Dialog
        open={openModalForm}
        onClose={handleCloseModalForm}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            handleAddOrUpdateGoodsItem(event);
          },
        }}
        fullWidth
      >
        <DialogTitle sx={{ textTransform: "uppercase" }}>{modalFor} Goods Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {error?.detail ? <span style={{ color: "red" }}>{error.detail}</span> : ""}
          </DialogContentText>
          <TextField
            autoFocus
            required
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue={selectedGoodsItem?.name}
            error={Boolean(error?.name)}
            helperText={error?.name}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <TextField
              required
              id="name"
              name="current_quantity"
              label="Current quantity"
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
              variant="outlined"
              defaultValue={selectedGoodsItem?.current_quantity}
              error={Boolean(error?.current_quantity)}
              helperText={error?.current_quantity}
              sx={{ mt: 2 }}
            />
            <TextField
              required
              id="name"
              name="standard_quantity"
              label="Standard quantity"
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
              variant="outlined"
              defaultValue={selectedGoodsItem?.standard_quantity}
              error={Boolean(error?.standard_quantity)}
              helperText={error?.standard_quantity}
              sx={{ mt: 2 }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="goods-type-label">Type</InputLabel>
            <Select
              required
              labelId="goods-type-label"
              id="goods_type"
              name="goods_type"
              defaultValue={selectedGoodsItem?.goods_type ? selectedGoodsItem?.goods_type : ""}
              label="Type"
              onChange={handleGoodsTypeChange}
            >
              <MenuItem value="cooking">Cooking</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
              <MenuItem value="household">Household</MenuItem>
            </Select>
          </FormControl>

            <TextField
              required
              id="measurement_type"
              name="measurement_type"
              label="Measurement type"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={selectedGoodsItem?.measurement_type}
              error={Boolean(error?.measurement_type)}
              helperText={error?.measurement_type}
              sx={{ mt: 2 }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
              Upload Icon
              <VisuallyHiddenInput
                name="icon"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={modalFor === "add"}
              />
            </Button>
            <FormControlLabel
              name="is_one_time"
              label="Is one time"
              labelPlacement="start"
              control={
                <Checkbox color="success" defaultChecked={selectedGoodsItem?.is_one_time} />
              }
            />
          </Box>
          {selectedImage && (
            <Box sx={{ mt: 2, maxWidth: 100, maxHeight: 100 }}>
              <img src={selectedImage} alt="Uploaded" style={{ maxWidth: "100%" }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseModalForm}>
            Cancel
          </Button>
          <Button
            sx={{ mr: 2 }}
            variant="outlined"
            color={modalFor === "add" ? "primary" : "warning"}
            type="submit"
          >
            {isActionLoading ? (
              <CircularProgress size={24} color={modalFor === "add" ? "primary" : "warning"} />
            ) : (
              modalFor
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default GoodsModalForm;
