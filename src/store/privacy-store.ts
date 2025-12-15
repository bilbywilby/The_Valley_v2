import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
export interface PrivacyState {
  privacyMode: boolean;
  localUpvotes: Record<string, number>;
  localDownvotes: Record<string, number>;
}
export interface PrivacyActions {
  togglePrivacyMode: () => void;
  incrementLocalVote: (id: string, voteType: 'up' | 'down') => void;
}
const initialState: PrivacyState = {
  privacyMode: false,
  localUpvotes: {},
  localDownvotes: {},
};
export const usePrivacyStore = create<PrivacyState & PrivacyActions>()(
  persist(
    immer((set) => ({
      ...initialState,
      togglePrivacyMode: () =>
        set((state) => {
          state.privacyMode = !state.privacyMode;
        }),
      incrementLocalVote: (id, voteType) =>
        set((state) => {
          if (voteType === 'up') {
            state.localUpvotes[id] = (state.localUpvotes[id] || 0) + 1;
          } else {
            state.localDownvotes[id] = (state.localDownvotes[id] || 0) + 1;
          }
        }),
    })),
    {
      name: 'lv-privacy-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);