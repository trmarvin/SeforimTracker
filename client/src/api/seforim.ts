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

export type ListSeforimResponse = { seforim: Sefer[] };

export function listSeforimApi(token: string) {
  return apiRequest<ListSeforimResponse>("/seforim", { token });
}

export type CreateSeferInput = {
  title: string;
  title_he?: string | null;
  author?: string | null;
  author_he?: string | null;
  genre?: string | null;
  description?: string | null;
  description_he?: string | null;
  cover_image?: string | null;
};

export function createSeferApi(token: string, body: CreateSeferInput) {
  return apiRequest<ListSeforimResponse>("/seforim", {
    method: "POST",
    token,
    body,
  });
}
