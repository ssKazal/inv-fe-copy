import { createSlice } from "@reduxjs/toolkit";

const BazarSlice = createSlice({
  name: "bazarList",
  initialState: {
    bazar_count: 0,
    bazar_page_size: 0,
    bazar_next: null,
    bazar_previous: null,
    bazar_total_page: 0,
    bazar_results: [],
  },
  reducers: {
    setBazarList: (state, action) => {
      const BazarList = action.payload.bazar_results.map((bazar) => ({
        ...bazar,
        isDisabled: false, // Add the new field isDisabled with the initial value false
      }));

      return {
        ...state,
        ...action.payload,
        bazar_results: BazarList,
      };
    },
    deleteBazarItem: (state, action) => {
      const deletedItemId = action.payload;
      const deletedItemIndex = state.bazar_results.findIndex((bazar_goods) => bazar_goods.id === deletedItemId);

      if (deletedItemIndex !== -1) {
        state.deletedItem = {
          item: state.bazar_results[deletedItemIndex],
          index: deletedItemIndex,
        };

        state.bazar_results.splice(deletedItemIndex, 1);
      }
    },
    undoDeleteBazarItem: (state) => {
      if (state.deletedItem) {
        const { item, index } = state.deletedItem;
        state.bazar_results.splice(index, 0, item);
        state.deletedItem = null;
      }
    },
    updateBazarItem: (state, action) => {
      const updatedBazar = action.payload;
      const index = state.bazar_results.findIndex(bazar => bazar.id === updatedBazar.id);

      if (index !== -1) {
        // Update existing item
        state.bazar_results[index] = { ...state.bazar_results[index], ...updatedBazar };
      } else {
        // Add new item
        state.bazar_results.push(updatedBazar);
      }
    },
    purchaseBazarItem: (state, action) => {
      const selectedBazarId = action.payload;
      const index = state.bazar_results.findIndex(bazar => bazar.id === selectedBazarId);

      if (index !== -1) {
        if (state.bazar_results[index].is_one_time) {
          state.bazar_results.splice(index, 1);
        } else {
          state.bazar_results[index].has_purchased = !state.bazar_results[index].has_purchased;
        }
      }
    },
    purchaseAllBazarItems: (state) => {
      state.bazar_results = state.bazar_results.map(bazar => ({
        ...bazar,
        has_purchased: true,
      }));

      // Filter out the one-time goods
      state.bazar_results = state.bazar_results.filter(bazar => !bazar.is_one_time);
    },
  },
});

export const {
  setBazarList,
  deleteBazarItem,
  undoDeleteBazarItem,
  updateBazarItem,
  purchaseBazarItem,
  purchaseAllBazarItems,
} = BazarSlice.actions;

export const selectTotalPrice = state =>
  state.bazarList.bazar_results.reduce((total, bazar) => total + (parseFloat(bazar.price) || 0), 0);

export default BazarSlice.reducer;