import { apiRequest } from "./http";

export type SeferSummary = {
  id: string;
  title: string;
  title_he: string | null;
  author: string | null;
  author_he: string | null;
  genre: string | null;
  description: string | null;
  description_he: string | null;
  cover_image: string | null;
};

export type LibraryStatus =
  | "to_read"
  | "reading"
  | "finished"
  | "paused"
  | "did_not_finish";

export type LibraryItem = {
  id: string;
  status: LibraryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  sefer: SeferSummary;
};

export type ListLibraryResponse = { items: LibraryItem[] };

export function listLibraryApi(token: string) {
  return apiRequest<ListLibraryResponse>("/library", { token });
}

export function updateLibraryItemApi(
  token: string,
  itemId: string,
  body: { status?: LibraryStatus; notes?: string | null },
) {
  // Your backend says PUT /library/itemId
  return apiRequest<ListLibraryResponse>(`/library/${itemId}`, {
    method: "PUT",
    token,
    body,
  });
}

export function deleteLibraryItemApi(token: string, itemId: string) {
  return apiRequest<ListLibraryResponse>(`/library/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function addToLibraryApi(
  token: string,
  body: { seferId: string; status?: LibraryStatus; notes?: string | null },
) {
  return apiRequest<ListLibraryResponse>("/library", {
    method: "POST",
    token,
    body,
  });
}
