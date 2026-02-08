// src/api/seforim.ts
import { apiRequest } from "./http";

export type Sefer = {
  id: string;
  title: string;
  title_he: string | null;
  author: string | null;
  author_he: string | null;
  genre: string | null;
  description: string | null;
  description_he: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string | null;
};

type ListSeforimResponse = { seforim: Sefer[] };

export function listSeforimApi(token: string) {
  return apiRequest<ListSeforimResponse>("/seforim", { token });
}
