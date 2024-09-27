import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLog } from "../redux/slices/LogSlice";
import ApiClient from "../services/ApiClient";

const useLog = () => {
  const [openLog, setOpenLog] = useState(false);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [logError, setLogError] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [selectedLogItem, setSelectedLogItem] = useState(null);

  const logs = useSelector((state) => state.log);
  const dispatch = useDispatch();

  // Open log modal
  const handleOpenLog = () => {
    setOpenLog(true);
  };

  // Close log modal
  const handleCloseLog = () => {
    setOpenLog(false);
    setLogError("");
  };

  // Current goods item
  const handleSelectedLogItem = (item) => {
    setSelectedLogItem(item);
  };

  // For log modal pagination
  const handleLogPageChange = (event, value) => {
    setLogPage(value);
  };

  // Get logs
  const handleGetLog = async (item) => {
    setIsLogLoading(true);

    await ApiClient.get(`/goods/${item.id}/goods_log/?page=${logPage}`)
      .then((res) => {
        dispatch(setLog(res.data));
        setLogError("");
      })
      .catch((err) => {
        setLogError("Something went wrong!");
      })
      .finally(() => setIsLogLoading(false));
  };

  useEffect(() => {
    if (selectedLogItem) handleGetLog(selectedLogItem);
  }, [logPage]);

  return {
    selectedLogItem,
    logs,
    openLog,
    isLogLoading,
    logError,
    logPage,
    handleOpenLog,
    handleCloseLog,
    handleGetLog,
    handleLogPageChange,
    handleSelectedLogItem,
  };
};

export default useLog;
