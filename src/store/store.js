import { configureStore } from "@reduxjs/toolkit";
import PowerSlice from "./Power/specsPowerSlice.js";
export const store = configureStore({
  reducer: {
    specsPower: PowerSlice,
  },
});
