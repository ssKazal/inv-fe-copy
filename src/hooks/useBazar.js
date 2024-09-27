import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBazarList } from "../redux/slices/BazarSlice";
import ApiClient from "../services/ApiClient";

const useBazar = () => {
  const [openBazarModal, setOpenBazarModal] = useState(false);
  const [bazarError, setBazarError] = useState("");
  const [bazarPage, setBazarPage] = useState(1);
  const [ongoingBazar, setOngoingBazar] = useState(null);
  const [bazarListLoading, setBazarListLoading] = useState(false);
  const [bazarListError, setBazarListError] = useState("");

  const bazar = useSelector((state) => state.bazar);
  const dispatch = useDispatch();

  // Open log modal
  const handleOpenBazarModal = () => {
    setOpenBazarModal(true);
  };

  // Close log modal
  const handleCloseBazarModal = () => {
    setOpenBazarModal(false);
    setBazarError("");
  };

  // For log modal pagination
  const handleBazarPageChange = (event, value) => {
    setBazarPage(value);
  };

  // Get current bazar object
  const handleOngoingBazar = async () => {
    await ApiClient.get(`/bazar/ongoing/`)
      .then((res) => {
        setOngoingBazar(res.data);
      })
      .catch((err) => {
        setOngoingBazar(null);
      })
  };

  useEffect(() => {
    handleOngoingBazar();
  }, []);

  const fetchBazarList = async () => {
    if (!ongoingBazar?.id) return;

    setBazarListLoading(true);

    await ApiClient.get(`/bazar/${ongoingBazar?.id}/list/`)
      .then((res) => {
        dispatch(setBazarList(res.data));
      })
      .catch((err) => {
        dispatch(setBazarList({}));
        setBazarListError("Something went wrong!");
      })
      .finally(() => setBazarListLoading(false));
  };

  useEffect(() => {
    fetchBazarList();
  }, [ongoingBazar]);

  return {
    bazar,
    openBazarModal,
    bazarError,
    bazarPage,
    ongoingBazar,
    bazarListLoading,
    bazarListError,
    setOngoingBazar,
    handleOpenBazarModal,
    handleCloseBazarModal,
    handleBazarPageChange,
    handleOngoingBazar,
    fetchBazarList,
  };
};

export default useBazar;
