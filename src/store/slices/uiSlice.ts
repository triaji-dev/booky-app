import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  searchQuery: string;
  selectedCategoryId: string | null;
  isLoading: boolean;
  sidebarOpen: boolean;
}

const initialState: UiState = {
  searchQuery: '',
  selectedCategoryId: null,
  isLoading: false,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setLoading,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
