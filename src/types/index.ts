export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  shared: boolean;
  shareUrl?: string;
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
