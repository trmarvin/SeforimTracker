import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/* ================================
   Types
================================ */

export type RefKind = "daf" | "siman" | "perek" | "shaar";

export type ReadingLog = {
  id: number;
  sefer_id: string;
  user_id: string;
  ref_kind: RefKind;

  daf: string | null;
  amud: "a" | "b" | null;

  siman: string | null;
  seif: string | null;

  perek: string | null;
  shaar: string | null;

  ref_label: string;
  notes: string | null;
  logged_at: string;
};

/* ================================
   Helpers
================================ */

function requireToken(state: RootState): string {
  const t = state.auth.token;
  if (!t) throw new Error("Missing auth token");
  return t;
}

/* ================================
   Thunks
================================ */

// GET /seforim/:id/logs
export const fetchReadingLogsThunk = createAsyncThunk<
  { seferId: string; logs: ReadingLog[] },
  { seferId: string },
  { state: RootState }
>("readingLogs/fetch", async ({ seferId }, { getState }) => {
  const token = requireToken(getState());

  const res = await fetch(`${API_BASE}/seforim/${seferId}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Logs fetch failed: ${res.status}`);
  }

  const data = await res.json();

  return {
    seferId,
    logs: data.logs as ReadingLog[],
  };
});

// POST /seforim/:id/logs
export const createReadingLogThunk = createAsyncThunk<
  { seferId: string; log: ReadingLog },
  {
    seferId: string;
    ref_kind: RefKind;
    daf?: string | null;
    amud?: "a" | "b" | null;
    siman?: string | null;
    seif?: string | null;
    perek?: string | null;
    shaar?: string | null;
    notes?: string | null;
  },
  { state: RootState }
>("readingLogs/create", async (payload, { getState }) => {
  const token = requireToken(getState());

  const { seferId, ...body } = payload;

  const res = await fetch(`${API_BASE}/seforim/${seferId}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Log create failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  return {
    seferId,
    log: data.log as ReadingLog,
  };
});

/* ================================
   Slice State
================================ */

type State = {
  bySeferId: Record<string, ReadingLog[]>;
  loadingBySeferId: Record<string, boolean>;
  errorBySeferId: Record<string, string | null>;
};

const initialState: State = {
  bySeferId: {},
  loadingBySeferId: {},
  errorBySeferId: {},
};

/* ================================
   Slice
================================ */

const slice = createSlice({
  name: "readingLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadingLogsThunk.pending, (state, action) => {
        const id = action.meta.arg.seferId;
        state.loadingBySeferId[id] = true;
        state.errorBySeferId[id] = null;
      })
      .addCase(fetchReadingLogsThunk.fulfilled, (state, action) => {
        const { seferId, logs } = action.payload;
        state.bySeferId[seferId] = logs;
        state.loadingBySeferId[seferId] = false;
      })
      .addCase(fetchReadingLogsThunk.rejected, (state, action) => {
        const id = action.meta.arg.seferId;
        state.loadingBySeferId[id] = false;
        state.errorBySeferId[id] =
          action.error.message ?? "Failed to load logs";
      })
      .addCase(createReadingLogThunk.fulfilled, (state, action) => {
        const { seferId, log } = action.payload;
        state.bySeferId[seferId] = [log, ...(state.bySeferId[seferId] ?? [])];
      });
  },
});

/* ================================
   Export
================================ */

export default slice.reducer;

/* ================================
   Selectors
================================ */

export const selectReadingLogsForSefer = (state: RootState, seferId: string) =>
  state.readingLogs.bySeferId[seferId] ?? [];

export const selectReadingLogsLoading = (state: RootState, seferId: string) =>
  !!state.readingLogs.loadingBySeferId[seferId];

export const selectReadingLogsError = (state: RootState, seferId: string) =>
  state.readingLogs.errorBySeferId[seferId] ?? null;
