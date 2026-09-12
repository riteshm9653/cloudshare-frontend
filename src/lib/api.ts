import { auth } from "@/lib/auth";
import type { AuthResponse, FileItem, StorageUsage, UserProfile } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL. Configure it in your .env.local file.");
  }

  const token = auth.getToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getProfile: () => request<UserProfile>("/users/me"),

  getFiles: () => request<FileItem[]>("/files"),

  getStorageUsage: () => request<StorageUsage>("/files/storage/usage"),

  uploadFiles: async (files: FileList) => {
    await Promise.all(
      Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        await request<FileItem>("/files/upload", {
          method: "POST",
          body: formData,
        });
      }),
    );
  },

  deleteFile: (id: string) =>
    request<void>(`/files/${id}`, {
      method: "DELETE",
    }),

  renameFile: (id: string, name: string) =>
    request<FileItem>(`/files/${id}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  shareFile: (id: string) =>
    request<{ shareUrl: string }>(`/files/${id}/share`, {
      method: "POST",
    }),

  downloadFile: async (id: string): Promise<Blob> => {
    if (!API_BASE_URL) {
      throw new Error("Missing NEXT_PUBLIC_API_BASE_URL. Configure it in your .env.local file.");
    }

    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/files/${id}/download`, {
      headers: token ? { Authorization: "Bearer " + token } : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.blob();
  },
};
