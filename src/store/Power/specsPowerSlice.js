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
    editPrescription: (state, action) => {
      const index = state.prescriptions.findIndex(
        (pres) => pres.id === action.payload.id
      );
      if (index !== -1) {
        state.prescriptions[index] = action.payload;
      }
    },

    deletePrescription: (state, action) => {
      state.prescriptions = state.prescriptions.filter(
        (p) => p.id !== action.payload
      );
    },
    removeAllPrescriptions: (state) => {
      state.prescriptions = [];
    },
  },
});

export const {
  addPrescription,
  editPrescription,
  removeAllPrescriptions,
  deletePrescription,
} = PowerSlice.actions;
export default PowerSlice.reducer;
