import { createSlice } from "@reduxjs/toolkit";

const GoodsSlice = createSlice({
  name: "goods",
  initialState: {
    count: 0,
    page_size: 0,
    next: null,
    previous: null,
    total_page: 0,
    results: [],
    searchQuery: "",
  },
  reducers: {
    setRegularGoodsList: (state, action) => {
      const { results: payloadResults } = action.payload;
      const { searchQuery } = state;

      if (searchQuery) {
        // Filter existing results based on the search query
        const filteredResults = state.results.filter((good) =>
          good.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Append the remaining results from the action payload
        const remainingResults = payloadResults.filter((payloadGood) => {
          return !filteredResults.some((filteredGood) => filteredGood.id === payloadGood.id);
        });

        state.results = [...filteredResults, ...remainingResults];
        // Update other fields if needed
        state.count = state.results.length;
        state.page_size = action.payload.page_size;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
        state.total_page = Math.ceil(state.count / state.page_size);
      } else {
        const regularGoodsList = action.payload.results.map((good) => ({
          ...good,
          isDisabled: false, // Add the new field isDisabled with the initial value false
        }));

        return {
          ...state,
          ...action.payload,
          results: regularGoodsList,
        };
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = "";
    },
    updateGoodCurrentQuantity: (state, action) => {
      const selectedGood = action.payload;
      const index = state.results.findIndex((good) => good.id === selectedGood?.id);

      if (index !== -1) {
        state.results[index] = { ...state.results[index], ...selectedGood };
      }
    },
    deleteGoodsItem: (state, action) => {
      const deletedItemId = action.payload;
      const deletedItemIndex = state.results.findIndex((good) => good.id === deletedItemId);

      if (deletedItemIndex !== -1) {
        state.deletedItem = {
          item: state.results[deletedItemIndex],
          index: deletedItemIndex,
        };

        state.results.splice(deletedItemIndex, 1);
      }
    },
    undoDeleteGoodsItem: (state) => {
      if (state.deletedItem) {
        const { item, index } = state.deletedItem;
        state.results.splice(index, 0, item);
        state.deletedItem = null;
      }
    },
  },
});

export const {
  setRegularGoodsList,
  updateGoodCurrentQuantity,
  deleteGoodsItem,
  setSearchQuery,
  clearSearchQuery,
  undoDeleteGoodsItem,
} = GoodsSlice.actions;
export default GoodsSlice.reducer;
