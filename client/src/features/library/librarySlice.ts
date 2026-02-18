import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type { LibraryItem, LibraryStatus } from "../../api/library";
import {
  listLibraryApi,
  updateLibraryItemApi,
  deleteLibraryItemApi,
} from "../../api/library";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type LibraryState = {
  items: LibraryItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  seferById: Record<string, any>;
};

const initialState: LibraryState = {
  items: [],
  status: "idle",
  error: null,
  seferById: {},
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

export const fetchSeferByIdThunk = createAsyncThunk(
  "library/fetchSeferById",
  async (
    { token, seferId }: { token: string; seferId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${API_BASE}/seforim/${seferId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Sefer fetch failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      // depending on your backend response shape
      return (data.sefer ?? data) as any;
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to load sefer");
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
      .addCase(fetchSeferByIdThunk.fulfilled, (state, action) => {
        const sefer = action.payload;
        state.seferById[sefer.id] = sefer;
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
export const selectSeferById = (state: RootState, seferId: string) =>
  state.library.seferById[seferId] ??
  state.library.items.find((it) => it.sefer.id === seferId)?.sefer; // adjust if your shape differs

export default librarySlice.reducer;
