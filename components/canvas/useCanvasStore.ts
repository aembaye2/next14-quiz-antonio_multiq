import { create } from "zustand";

interface CanvasState {
  currentState: any;
  setCurrentState: (state: any) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  currentState: null,
  setCurrentState: (state) => set({ currentState: state }),
}));
