import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type { LibraryItem, LibraryStatus } from "../../api/library";
import {
  listLibraryApi,
  updateLibraryItemApi,
  deleteLibraryItemApi,
} from "../../api/library";

type LibraryState = {
  items: LibraryItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: LibraryState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchLibraryThunk = createAsyncThunk(
  "library/fetch",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await listLibraryApi(token);
      return res.items;
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to load library");
    }
  },
);

export const updateLibraryItemThunk = createAsyncThunk(
  "library/update",
  async (
    args: {
      token: string;
      itemId: string;
      patch: { status?: LibraryStatus; notes?: string | null };
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await updateLibraryItemApi(
        args.token,
        args.itemId,
        args.patch,
      );
      return res.items;
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to update item");
    }
  },
);

export const deleteLibraryItemThunk = createAsyncThunk(
  "library/delete",
  async (args: { token: string; itemId: string }, { rejectWithValue }) => {
    try {
      const res = await deleteLibraryItemApi(args.token, args.itemId);
      return res.items;
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to delete item");
    }
  },
);

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLibraryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchLibraryThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load library";
      })
      .addCase(updateLibraryItemThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteLibraryItemThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const selectLibraryItems = (state: RootState) => state.library.items;
export const selectLibraryStatus = (state: RootState) => state.library.status;
export const selectLibraryError = (state: RootState) => state.library.error;

export default librarySlice.reducer;
