export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  avatar: string;
  occupation: string;
  personality: string[];
  backstory: string;
  mbti?: string;
  weaknesses: string;
  systemPrompt: string;
}

export enum CharacterType {
  CEO = "ceo",
  Racer = "racer",
  Doctor = "doctor",
  Artist = "artist",
  Police = "police",
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  timestamp: number;
  type: "text" | "image" | "choice";
}

export interface UserProfile {
  personality?: string;
  ageRange?: "20-25" | "26-30" | "30+";
  hobbies?: string[];
  emotionalPattern?: string;
  workExperience?: string;
}

export interface ChatResponse {
  content: string;
  instructions?: {
    type: "image" | "choice" | "profile";
    payload: unknown;
  }[];
}
