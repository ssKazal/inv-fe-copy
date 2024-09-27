import axios from "axios";
import { useState } from "react";
import { VAIDINVENTORYBE_HOST } from "../utils/Conf";
import ApiClient from "../services/ApiClient";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo, setIsAuthenticated } from "../redux/slices/UserSlice";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openLogoutModal, set0penLogoutModal] = useState(false);
  const [error, setError] = useState("");

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Open log modal
  const handleOpenLogoutModal = () => {
    set0penLogoutModal(true);
  };

  // Close log modal
  const handleCloseLogoutModal = () => {
    set0penLogoutModal(false);
    setError("");
  };

  const login = async (username, password) => {
    setIsLoading(true);
    await axios
      .post(`${VAIDINVENTORYBE_HOST}/api/token/`, {
        username,
        password,
      })
      .then((response) => {
        localStorage.clear();
        const access_token = response.data.access;
        const refresh_token = response.data.refresh;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        dispatch(setIsAuthenticated(true));
      })
      .catch((error) => {
        setError(error.response.data);
        dispatch(setIsAuthenticated(false));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    dispatch(setIsAuthenticated(false));
  };

  const getUserInfo = () => {
    ApiClient.get("/user-info-from-token/")
      .then((response) => {
        dispatch(setUserInfo(response.data));
      })
      .catch((error) => {
        if (error.response) setError(error.response.data);
        dispatch(setUserInfo({}));
      });
  };

  return { login, logout, getUserInfo, isLoading, error, user, openLogoutModal, handleOpenLogoutModal, handleCloseLogoutModal };
};

export default useAuth;
