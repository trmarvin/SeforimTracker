import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import libraryReducer from "../features/library/librarySlice";
import seferAliasesReducer from "../features/seferAliases/seferAliasesSlice";
import readingLogsReducer from "../features/readingLogs/readingLogsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    library: libraryReducer,
    seferAliases: seferAliasesReducer,
    readingLogs: readingLogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
