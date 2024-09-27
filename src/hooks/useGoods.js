import { useState, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  setRegularGoodsList,
  updateGoodCurrentQuantity,
  deleteGoodsItem,
  setSearchQuery,
  clearSearchQuery,
} from "../redux/slices/GoodsSlice";
import {
  setOneTimeGoodsList,
  updateOneTimeGoodsCurrentQuantity,
  deleteOneTimeGoodsItem,
  setOneTimeGoodsSearchQuery,
  clearOneTimeGoodsSearchQuery,
} from "../redux/slices/OneTimeGoodsSlice";
import {
  deleteOldOneTimeGoodsItem,
} from "../redux/slices/OldOneTimeGoodSlice";
import { CanceledError } from "axios";
import ApiClient from "../services/ApiClient";
import FileToBase64 from "../services/FileToBase64";

const useGoods = () => {
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [oneTimeGoodsPage, setOneTimeGoodsPage] = useState(1);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [openModalForm, setOpenModalForm] = useState(false);
  const [modalFor, setModalFor] = useState("");
  const [selectedGoodsItem, setSelectedGoodsItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [orderBy, setOrderBy] = useState(""); // State to track the currently sorted column
  const [oneTimeGoodsOrderBy, setOneTimeGoodsOrderBy] = useState(""); // State to track the currently sorted column
  const [order, setOrder] = useState("asc"); // State to track the sorting order (asc or desc)
  const [oneTimeGoodsOrder, setOneTimeGoodsOrder] = useState("asc"); // State to track the sorting oneTimeGoodsOrder (asc or desc)
  const [searchInputValue, setSearchInputValue] = useState(""); // State to track the query value
  const [lastUpdatedValue, setLastUpdatedValue] = useState(null); // State to track goods last update quantity
  const [currentGoods, setCurrentGoods] = useState(null); // State to track goods from goods list
  const [previousValues, setPreviousValues] = useState(null); // State to track goods previous value
  const [hasQuantityChanged, setHasQuantityChanged] = useState(false); // New state to track changes
  const [oneTimeGoodsQuantityChanged, setOneTimeGoodsQuantityChanged] = useState(false);
  const [openOldOneTimeGoodsModal, setOpenOldOneTimeGoodsModal] = useState(false);
  const [openBazarModal, setOpenBazarModal] = useState(false);

  const regularGoodsList = useSelector((state) => state.goods);
  const oneTimeGoodsList = useSelector((state) => state.oneTimeGoods);
  const dispatch = useDispatch();

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // One Time Goods Pagination
  const handleOneTimeGoodsPageChange = (event, value) => {
    setOneTimeGoodsPage(value);
  };

  // Open Old Goods Modal
  const handleOpenOldOneTimeGoodsModal = () => {
    setOpenOldOneTimeGoodsModal(true);
  }
  // Close Old Goods Modal
  const handleCloseOldOneTimeGoodsModal = () => {
    setOpenOldOneTimeGoodsModal(false);
  };

  // Open confirmation modal
  const handleOpenConfirmation = () => {
    setOpenConfirmation(true);
  };

  // Close confirmation modal
  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setError("");
  };

  // Open Bazar modal
  const handleOpenBazarModal = () => {
    setOpenBazarModal(true);
  }

  // Close Bazar modal
  const handleCloseBazarModal = () => {
    setOpenBazarModal(false);
    setError("");
  };

  // Current goods item
  const handleSelectedGoodsItem = (item) => {
    setSelectedGoodsItem(item);
  };

  // Current goods item image
  const handleSelectedImage = (item) => {
    setSelectedImage(item.icon);
  };

  // Change current quantity in list
  const handleCurrentQuantityChange = async (goods, type, is_one_time = false) => {
    const originalValue = goods.current_quantity;
    const currentValue = parseFloat(goods.current_quantity);
    const newValue = type === "add" ? currentValue + 1 : Math.max(currentValue - 1, 0);
    const buttonDisable = newValue < 1;

    const updatedGood = {
      ...goods,
      current_quantity: newValue.toFixed(2).toString(),
      isDisabled: buttonDisable,
    };

    // Store the previous values
    setPreviousValues({
      current_quantity: originalValue,
      isDisabled: false,
    });

    if (is_one_time) {
      dispatch(updateOneTimeGoodsCurrentQuantity(updatedGood));
      setOneTimeGoodsQuantityChanged(true);
    } else {
      dispatch(updateGoodCurrentQuantity(updatedGood));
    }

    // Update state with the latest value and goods
    setLastUpdatedValue(newValue);
    setCurrentGoods(goods);
    setHasQuantityChanged(true);
  };

  // The useEffect below will handle the API request
  useEffect(() => {
    if (hasQuantityChanged) { // Check if changes have occurred before sending the request
      const timerId = setTimeout(async () => {
        try {
          await ApiClient.patch(`/goods/${currentGoods?.id}/`, { current_quantity: lastUpdatedValue });
        } catch (error) {
          console.error(error);
          // Handle error if needed

          // Dispatch previous values if an error occurs
          if (oneTimeGoodsQuantityChanged) {
            dispatch(updateOneTimeGoodsCurrentQuantity({
              ...currentGoods,
              current_quantity: previousValues?.current_quantity,
              isDisabled: previousValues?.isDisabled,
            }));
          } else {
            dispatch(updateGoodCurrentQuantity({
              ...currentGoods,
              current_quantity: previousValues?.current_quantity,
              isDisabled: previousValues?.isDisabled,
            }));
          }
        }
      }, 2000); // delay 2 seconds

      // Cleanup function to clear the timeout if the component unmounts or if the value changes again
      return () => clearTimeout(timerId);
    }
  }, [lastUpdatedValue, currentGoods, previousValues, hasQuantityChanged]);

  // Sorting
  const handleRequestSort = (attr) => {
    const isAsc = orderBy === attr && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(attr);
  };

  // One Time Goods Sorting
  const handleOneTimeGoodsRequestSort = (attr) => {
    const isAsc = oneTimeGoodsOrderBy === attr && oneTimeGoodsOrder === "asc";
    setOneTimeGoodsOrder(isAsc ? "desc" : "asc");
    setOneTimeGoodsOrderBy(attr);
  };

  // Fetch goods list
  const fetchGoods = async (controller = null) => {
    let existingGoodsIds = [];
    if (regularGoodsList?.searchQuery) {
      regularGoodsList.results.map((good) => existingGoodsIds.push(good.id));
    } else {
      dispatch(clearSearchQuery());
      existingGoodsIds = [];
    }

    const requestOptions = {
      ...(controller && { signal: controller.signal }), // Add signal only if controller is provided
    };

    await ApiClient.get(
      `/goods/regular/?page=${page}&search=${regularGoodsList?.searchQuery
      }&skip_ids_for_search=${existingGoodsIds}&ordering=${order === "desc" ? "-" + orderBy : orderBy
      }`,
      requestOptions
    )
      .then((res) => {
        dispatch(setRegularGoodsList(res.data));
        setError("");
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        if (err?.response?.data?.detail == "Invalid page.") {
          dispatch(setPage(page - 1));
        } else {
          setError(err.response.data);
          dispatch(setRegularGoodsList({}));
        }
      })
      .finally(() => {
        setIsFetchLoading(false);
      });
  };

  // Fetch onetime goods list
  const fetchOneTimeGoods = async (controller = null) => {
    let existingGoodsIds = [];
    if (oneTimeGoodsList?.oneTimeGoodsSearchQuery) {
      oneTimeGoodsList.onetime_goods_results.map((goods) => existingGoodsIds.push(goods.id));
    } else {
      dispatch(clearOneTimeGoodsSearchQuery());
      existingGoodsIds = [];
    }

    const requestOptions = {
      ...(controller && { signal: controller.signal }), // Add signal only if controller is provided
    };

    await ApiClient.get(
      `/goods/onetime/?page=${oneTimeGoodsPage}&search=${oneTimeGoodsList?.oneTimeGoodsSearchQuery
      }&skip_ids_for_search=${existingGoodsIds}&ordering=${oneTimeGoodsOrder === "desc" ? "-" + oneTimeGoodsOrderBy : oneTimeGoodsOrderBy
      }`,
      requestOptions
    )
      .then((res) => {
        dispatch(setOneTimeGoodsList(res.data));
        setError("");
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        if (err?.response?.data?.detail == "Invalid page.") {
          dispatch(setOneTimeGoodsPage(oneTimeGoodsPage - 1));
        } else {
          setError(err.response.data);
          dispatch(setOneTimeGoodsList({}));
        }
      })
      .finally(() => {
        setIsFetchLoading(false);
      });
  };


  // Update the search query on every key press
  const handleSearchChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Trigger the actual search on key up, after the user stops typing for 300ms
  const handleSearchKeyUp = useMemo(() => {
    return debounce(() => {
      dispatch(setSearchQuery(searchInputValue));
      dispatch(setOneTimeGoodsSearchQuery(searchInputValue));
      setPage(1);
      setOneTimeGoodsPage(1);
    }, 300);
  }, [searchInputValue]);

  useEffect(() => {
    return () => {
      // Cancel the debounced search when the component unmounts
      handleSearchKeyUp.cancel();
    };
  }, [handleSearchKeyUp]);

  // Get list
  useEffect(() => {
    const controller = new AbortController();
    setIsFetchLoading(true);

    fetchGoods(controller);

    // Cleanup function
    return () => {
      // Abort the request when the component unmounts
      controller.abort();
    };
  }, [page, order, orderBy, regularGoodsList.searchQuery]);

  // Get onetime goods list
  useEffect(() => {
    const controller = new AbortController();
    setIsFetchLoading(true);

    fetchOneTimeGoods(controller);

    // Cleanup function
    return () => {
      // Abort the request when the component unmounts
      controller.abort();
    };
  }, [oneTimeGoodsPage, oneTimeGoodsOrder, oneTimeGoodsOrderBy, regularGoodsList.searchQuery]);

  // Temporary hide selected goods item
  const handleHideSelectedGoodsItem = () => {
    setIsActionLoading(false);
    setError("");
    if (selectedGoodsItem.is_one_time) {
      if (selectedGoodsItem.has_purchased) {
        dispatch(deleteOldOneTimeGoodsItem(selectedGoodsItem.id))
      } else {
        dispatch(deleteOneTimeGoodsItem(selectedGoodsItem.id))
      }
    } else {
      dispatch(deleteGoodsItem(selectedGoodsItem.id));
    };
  }

  // Delete item
  const handleDeleteGoodsItem = () => {
    ApiClient.delete(`/goods/${selectedGoodsItem.id}`)
      .then((res) => {
        if (selectedGoodsItem.is_one_time) {
          if (selectedGoodsItem.has_purchased) {
            dispatch(deleteOldOneTimeGoodsItem(selectedGoodsItem.id))
          } else {
            dispatch(deleteOneTimeGoodsItem(selectedGoodsItem.id))
          }
        } else {
          dispatch(deleteGoodsItem(selectedGoodsItem.id));
        };
        fetchOneTimeGoods();
        fetchGoods();
        setOpenConfirmation(false);
        setSelectedGoodsItem({});
        setError("");
      })
      .catch((err) => {
        setError("Something went wrong!");
      })
      .finally(() => {
        setIsActionLoading(false);
      });
  };

  // Purchase item
  const handlePurchaseGoodsItem = (itemID) => {
    ApiClient.patch(`/goods/${itemID}/`, { has_purchased: true })
      .then((res) => {
        fetchOneTimeGoods();
      })
      .catch((err) => {
        console.error(err);
      })
  };

  // Set form modal
  const handleSetModalForm = (str) => {
    setModalFor(str);
  };

  // Open form modal
  const handleOpenModalForm = () => {
    setOpenModalForm(true);
  };

  // Close form modal
  const handleCloseModalForm = () => {
    setOpenModalForm(false);
    setError("");
    setSelectedImage(null);
    setSelectedGoodsItem({});
  };

  // Change image file
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const base64String = await FileToBase64(file);
        setSelectedImage(base64String);
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  };

  // Set base64 image in form data
  const handleImageInput = async (data) => {
    if (selectedImage) {
      data.set("icon", selectedImage);
    } else {
      setError({ detail: "Something went wrong in icon!" });
    }
  };

  // Add or update goods
  const handleAddOrUpdateGoodsItem = async (event) => {
    event.preventDefault();
    setIsActionLoading(true);
    setError("");

    let data = new FormData(event.currentTarget);
    let icon = data.get("icon");
    if (icon.size) await handleImageInput(data);

    let url = modalFor === "update" ? "/goods/" + selectedGoodsItem.id + "/" : "/goods/";

    await ApiClient[modalFor === "update" ? "put" : "post"](url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        fetchOneTimeGoods();
        fetchGoods();
        setOpenModalForm(false);
        setSelectedGoodsItem({}); // Clear the selected item (if any)
        setError(""); // Clear the error (if any)
        setSelectedImage(null); // Clear the selected image (if any)
      })
      .catch((err) => {
        if (err.response.status == 400) {
          setError(err.response.data);
        } else {
          setError({ detail: "Something went wrong!" });
        }
      })
      .finally(() => {
        setIsActionLoading(false);
      });
  };

  return {
    regularGoodsList,
    oneTimeGoodsList,
    openConfirmation,
    openModalForm,
    page,
    selectedGoodsItem,
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
    openBazarModal,
    openOldOneTimeGoodsModal,
    fetchGoods,
    fetchOneTimeGoods,
    handleOpenOldOneTimeGoodsModal,
    handleCloseOldOneTimeGoodsModal,
    handleOpenBazarModal,
    handleCloseBazarModal,
    handleSearchChange,
    handlePageChange,
    handleOneTimeGoodsPageChange,
    handleDeleteGoodsItem,
    handleHideSelectedGoodsItem,
    handleOpenConfirmation,
    handleCloseConfirmation,
    handleSelectedGoodsItem,
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
  };
};

export default useGoods;
