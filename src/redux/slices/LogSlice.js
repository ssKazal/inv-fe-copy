import { createSlice } from "@reduxjs/toolkit";

const LogSlice = createSlice({
  name: "log",
  initialState: [],
  reducers: {
    setLog: (state, action) => action.payload,
  },
});

export const { setLog } = LogSlice.actions;
export default LogSlice.reducer;
