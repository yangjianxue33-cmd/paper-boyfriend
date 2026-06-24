import { create } from "zustand";
import { Character } from "@/lib/types";
import { CHARACTERS } from "@/lib/constants";

interface CharacterState {
  characters: Character[];
  selectedCharacterId: string | null;
  selectCharacter: (id: string) => void;
  getCharacterById: (id: string) => Character | undefined;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: CHARACTERS,
  selectedCharacterId: null,
  selectCharacter: (id) => set({ selectedCharacterId: id }),
  getCharacterById: (id) => get().characters.find((c) => c.id === id),
}));
