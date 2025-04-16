import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4

const PowerSlice = createSlice({
  name: "specsPower",
  initialState: {
    prescriptions: [],
  },
  reducers: {
    addPrescription: (state, action) => {
      const prescription = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
      };
      const existingIndex = state.prescriptions.findIndex(
        (p) => p.id === prescription.id
      );
      if (existingIndex >= 0) {
        state.prescriptions[existingIndex] = prescription;
      } else {
        state.prescriptions.push(prescription);
      }
    },
    deletePrescription: (state, action) => {
      state.prescriptions = state.prescriptions.filter(
        (p) => p.id !== action.payload
      );
    },
  },
});

export const { addPrescription, deletePrescription } = PowerSlice.actions;
export default PowerSlice.reducer;
