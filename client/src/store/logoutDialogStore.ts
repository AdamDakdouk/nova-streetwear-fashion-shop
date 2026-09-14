import { create } from "zustand";

interface LogoutDialogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLogoutDialogStore = create<LogoutDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
