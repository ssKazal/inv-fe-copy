import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./slices/UserSlice";
import GoodsReducer from "./slices/GoodsSlice";
import OneTimeGoodsSlice from "./slices/OneTimeGoodsSlice";
import LogReducer from "./slices/LogSlice";
import OldOneTimeGoodSlice from "./slices/OldOneTimeGoodSlice";
import BazarSlice from "./slices/BazarSlice";

const Store = configureStore({
  reducer: {
    user: UserReducer,
    goods: GoodsReducer,
    oneTimeGoods: OneTimeGoodsSlice,
    oldOneTimeGoods: OldOneTimeGoodSlice,
    log: LogReducer,
    bazarList: BazarSlice,
  },
});

export default Store;
