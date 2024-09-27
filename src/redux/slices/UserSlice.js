import { createSlice } from "@reduxjs/toolkit";

const isAccessToken = localStorage.getItem("access_token");

const UserSlice = createSlice({
  name: "user",
  initialState: {
    data: {},
    isAuthenticated: isAccessToken ? true : false,
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.data = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const { setUserInfo, setIsAuthenticated } = UserSlice.actions;
export default UserSlice.reducer;
