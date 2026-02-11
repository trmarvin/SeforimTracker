import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type AliasType = "title" | "author" | "abbr" | "other";
export type AliasLang = "en" | "he" | "mixed" | null;

export type SeferAlias = {
  id: number;
  sefer_id: string;
  type: AliasType;
  value: string;
  normalized: string;
  language: AliasLang;
  created_at: string;
};

function requireToken(state: RootState): string {
  const t = state.auth.token;
  if (!t) throw new Error("Missing auth token");
  return t;
}

export const fetchAliasesThunk = createAsyncThunk<
  { seferId: string; aliases: SeferAlias[] },
  { seferId: string },
  { state: RootState }
>("seferAliases/fetch", async ({ seferId }, { getState }) => {
  const token = requireToken(getState());

  const res = await fetch(`${API_BASE}/seforim/${seferId}/aliases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Aliases fetch failed: ${res.status}`);

  const data = await res.json();
  return { seferId, aliases: data.aliases as SeferAlias[] };
});

export const createAliasThunk = createAsyncThunk<
  { seferId: string; alias: SeferAlias },
  { seferId: string; type: AliasType; value: string; language?: AliasLang },
  { state: RootState }
>(
  "seferAliases/create",
  async ({ seferId, type, value, language }, { getState }) => {
    const token = requireToken(getState());

    const res = await fetch(`${API_BASE}/seforim/${seferId}/aliases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, value, language }),
    });
    if (!res.ok) throw new Error(`Alias create failed: ${res.status}`);

    const data = await res.json();
    return { seferId, alias: data.alias as SeferAlias };
  },
);

export const deleteAliasThunk = createAsyncThunk<
  { seferId: string; aliasId: number },
  { seferId: string; aliasId: number },
  { state: RootState }
>("seferAliases/delete", async ({ seferId, aliasId }, { getState }) => {
  const token = requireToken(getState());

  const res = await fetch(`${API_BASE}/seforim/${seferId}/aliases/${aliasId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Alias delete failed: ${res.status}`);

  return { seferId, aliasId };
});

type State = {
  bySeferId: Record<string, SeferAlias[]>;
  loadingBySeferId: Record<string, boolean>;
  errorBySeferId: Record<string, string | null>;
};

const initialState: State = {
  bySeferId: {},
  loadingBySeferId: {},
  errorBySeferId: {},
};

const slice = createSlice({
  name: "seferAliases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAliasesThunk.pending, (state, action) => {
        const id = action.meta.arg.seferId;
        state.loadingBySeferId[id] = true;
        state.errorBySeferId[id] = null;
      })
      .addCase(fetchAliasesThunk.fulfilled, (state, action) => {
        const { seferId, aliases } = action.payload;
        state.bySeferId[seferId] = aliases;
        state.loadingBySeferId[seferId] = false;
      })
      .addCase(fetchAliasesThunk.rejected, (state, action) => {
        const id = action.meta.arg.seferId;
        state.loadingBySeferId[id] = false;
        state.errorBySeferId[id] =
          action.error.message ?? "Failed to load aliases";
      })
      .addCase(createAliasThunk.fulfilled, (state, action) => {
        const { seferId, alias } = action.payload;
        state.bySeferId[seferId] = [alias, ...(state.bySeferId[seferId] ?? [])];
      })
      .addCase(deleteAliasThunk.fulfilled, (state, action) => {
        const { seferId, aliasId } = action.payload;
        state.bySeferId[seferId] = (state.bySeferId[seferId] ?? []).filter(
          (a) => a.id !== aliasId,
        );
      });
  },
});

export default slice.reducer;

export const selectAliasesForSefer = (state: RootState, seferId: string) =>
  state.seferAliases.bySeferId[seferId] ?? [];
export const selectAliasesLoading = (state: RootState, seferId: string) =>
  !!state.seferAliases.loadingBySeferId[seferId];
export const selectAliasesError = (state: RootState, seferId: string) =>
  state.seferAliases.errorBySeferId[seferId] ?? null;
