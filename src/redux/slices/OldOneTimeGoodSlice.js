import { createSlice } from "@reduxjs/toolkit";

const OldOneTimeGoodsSlice = createSlice({
  name: "oldOneTimeGoods",
  initialState: {
    old_onetime_goods_count: 0,
    old_onetime_goods_page_size: 0,
    old_onetime_goods_next: null,
    old_onetime_goods_previous: null,
    old_onetime_goods_total_page: 0,
    old_onetime_goods_results: [],
  },
  reducers: {
    setOldOneTimeGoodsList: (state, action) => {
      const oldOneTimeGoodsList = action.payload.old_onetime_goods_results.map((oldOneTimeGoods) => ({
        ...oldOneTimeGoods,
        isDisabled: false, // Add the new field isDisabled with the initial value false
      }));

      return {
        ...state,
        ...action.payload,
        old_onetime_goods_results: oldOneTimeGoodsList,
      };
    },
    deleteOldOneTimeGoodsItem: (state, action) => {
      const deletedOneTimeItemId = action.payload;
      const deletedOneTimeItemIndex = state.old_onetime_goods_results.findIndex((goods) => goods.id === deletedOneTimeItemId);

      if (deletedOneTimeItemIndex !== -1) {
        state.deletedOneTimeItem = {
          item: state.old_onetime_goods_results[deletedOneTimeItemIndex],
          index: deletedOneTimeItemIndex,
        };

        state.old_onetime_goods_results.splice(deletedOneTimeItemIndex, 1);
      }
    },
    undoDeleteOldOneTimeGoodsItem: (state) => {
      if (state.deletedOneTimeItem) {
        const { item, index } = state.deletedOneTimeItem;
        state.old_onetime_goods_results.splice(index, 0, item);
        state.deletedOneTimeItem = null;
      }
    },
  },
});

export const {
  setOldOneTimeGoodsList,
  deleteOldOneTimeGoodsItem,
  undoDeleteOldOneTimeGoodsItem,
} = OldOneTimeGoodsSlice.actions;

export default OldOneTimeGoodsSlice.reducer;
