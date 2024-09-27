import { createSlice } from "@reduxjs/toolkit";

const OneTimeGoodsSlice = createSlice({
  name: "oneTimeGoods",
  initialState: {
    onetime_goods_count: 0,
    onetime_goods_page_size: 0,
    onetime_goods_next: null,
    onetime_goods_previous: null,
    onetime_goods_total_page: 0,
    onetime_goods_results: [],
    oneTimeGoodsSearchQuery: "",
  },
  reducers: {
    setOneTimeGoodsList: (state, action) => {
      const { onetime_goods_results: payloadResults } = action.payload;
      const { oneTimeGoodsSearchQuery } = state;

      if (oneTimeGoodsSearchQuery) {
        // Filter existing results based on the search query
        const filteredResults = state.onetime_goods_results.filter((oneTimeGoods) => 
          oneTimeGoods.name.toLowerCase().includes(oneTimeGoodsSearchQuery.toLowerCase())
        );

        // Append the remaining results from the action payload
        const remainingResults = payloadResults.filter((payloadGoods) => {
          return !filteredResults.some((filteredGoods) => filteredGoods.id === payloadGoods.id);
        });
        
        state.onetime_goods_results = [...filteredResults, ...remainingResults];
        // Update other fields if needed
        state.onetime_goods_count = state.onetime_goods_results.length;
        state.onetime_goods_page_size = action.payload.onetime_goods_page_size;
        state.onetime_goods_next = action.payload.onetime_goods_next;
        state.onetime_goods_previous = action.payload.onetime_goods_previous;
        state.onetime_goods_total_page = Math.ceil(state.onetime_goods_count / state.onetime_goods_page_size);
      } else {
        const oneTimeGoodsList = action.payload.onetime_goods_results.map((oneTimeGoods) => ({
          ...oneTimeGoods,
          isDisabled: false, // Add the new field isDisabled with the initial value false
        }));

        return {
          ...state,
          ...action.payload,
          onetime_goods_results: oneTimeGoodsList,
        };
      }
    },
    setOneTimeGoodsSearchQuery: (state, action) => {
      state.oneTimeGoodsSearchQuery = action.payload;
    },
    clearOneTimeGoodsSearchQuery: (state) => {
      state.oneTimeGoodsSearchQuery = "";
    },
    updateOneTimeGoodsCurrentQuantity: (state, action) => {
      const selectedOneTimeGoods = action.payload;
      const index = state.onetime_goods_results.findIndex((goods) => goods.id === selectedOneTimeGoods?.id);

      if (index !== -1) {
        state.onetime_goods_results[index] = { ...state.onetime_goods_results[index], ...selectedOneTimeGoods };
      }
    },
    deleteOneTimeGoodsItem: (state, action) => {
      const deletedOneTimeItemId = action.payload;
      const deletedOneTimeItemIndex = state.onetime_goods_results.findIndex((goods) => goods.id === deletedOneTimeItemId);

      if (deletedOneTimeItemIndex !== -1) {
        state.deletedOneTimeItem = {
          item: state.onetime_goods_results[deletedOneTimeItemIndex],
          index: deletedOneTimeItemIndex,
        };

        state.onetime_goods_results.splice(deletedOneTimeItemIndex, 1);
      }
    },
    undoDeleteOneTimeGoodsItem: (state) => {
      if (state.deletedOneTimeItem) {
        const { item, index } = state.deletedOneTimeItem;
        state.onetime_goods_results.splice(index, 0, item);
        state.deletedOneTimeItem = null;
      }
    },
  },
});

export const {
  setOneTimeGoodsList,
  updateOneTimeGoodsCurrentQuantity,
  deleteOneTimeGoodsItem,
  setOneTimeGoodsSearchQuery,
  clearOneTimeGoodsSearchQuery,
  undoDeleteOneTimeGoodsItem,
} = OneTimeGoodsSlice.actions;

export default OneTimeGoodsSlice.reducer;
