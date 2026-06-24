import { create } from "zustand";
import { UserProfile } from "@/lib/types";
import { getInviteCode } from "@/lib/utils";

interface UserState {
  profile: UserProfile;
  inviteCode: string;
  invitedBy: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setInvitedBy: (code: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {},
  inviteCode: getInviteCode(),
  invitedBy: null,
  updateProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),
  setInvitedBy: (code) => set({ invitedBy: code }),
}));
