import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../auth/api/authApi";
import { webinarsApi } from "../features/webinars/api/webinarsApi";
import { expertsApi } from "../features/experts/api/expertsApi";
import { socialsApi } from "../features/socials/api/socialsApi";
import { rubricsApi } from "../features/rubrics/api/rubricsApi";
import { siteContentApi } from "../features/siteContent/api/siteContentApi";
import { isValidToken, readStoredToken } from "../shared/baseQuery";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const storedToken = readStoredToken();

const initialState: AuthState = {
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      if (!isValidToken(action.payload)) {
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        return;
      }

      const token = action.payload.trim();
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [webinarsApi.reducerPath]: webinarsApi.reducer,
    [expertsApi.reducerPath]: expertsApi.reducer,
    [socialsApi.reducerPath]: socialsApi.reducer,
    [rubricsApi.reducerPath]: rubricsApi.reducer,
    [siteContentApi.reducerPath]: siteContentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      webinarsApi.middleware,
      expertsApi.middleware,
      socialsApi.middleware,
      rubricsApi.middleware,
      siteContentApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
