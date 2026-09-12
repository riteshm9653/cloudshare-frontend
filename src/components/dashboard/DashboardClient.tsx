"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { auth } from "@/lib/auth";
import type { FileItem, StorageUsage } from "@/types";

const byteUnits = ["B", "KB", "MB", "GB", "TB"];

function formatBytes(value: number) {
  if (value === 0) return "0 B";
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), byteUnits.length - 1);
  const formatted = value / 1024 ** index;
  return `${formatted.toFixed(formatted >= 10 ? 0 : 1)} ${byteUnits[index]}`;
}

function getFileCategory(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("text")) return "document";
  return "other";
}

interface DashboardClientProps {
  initialFiles: FileItem[];
  initialUsage: StorageUsage;
  initialError: string | null;
}

export function DashboardClient({ initialFiles, initialUsage, initialError }: DashboardClientProps) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [usage, setUsage] = useState<StorageUsage>(initialUsage);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const { addToast } = useToast();
  const isAuthed = Boolean(auth.getToken());

  const loadDashboard = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [filesResponse, usageResponse] = await Promise.all([api.getFiles(), api.getStorageUsage()]);
      setFiles(filesResponse);
      setUsage({
        ...usageResponse,
        totalBytes: usageResponse.totalBytes > 0 ? usageResponse.totalBytes : 1,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
      const category = getFileCategory(file.mimeType);
      const matchesFilter = filter === "all" || filter === category;
      return matchesSearch && matchesFilter;
    });
  }, [files, filter, search]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) return;

    try {
      setIsUploading(true);
      await api.uploadFiles(selectedFiles);
      addToast("success", "File upload completed");
      await loadDashboard();
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await api.deleteFile(id);
      setFiles((prev) => prev.filter((file) => file.id !== id));
      addToast("success", "File deleted");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleRename = async (file: FileItem) => {
    const nextName = window.prompt("Enter new file name", file.name)?.trim();
    if (!nextName || nextName === file.name) return;

    try {
      const updated = await api.renameFile(file.id, nextName);
      setFiles((prev) => prev.map((item) => (item.id === file.id ? updated : item)));
      addToast("success", "File renamed");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Rename failed");
    }
  };

  const handleShare = async (file: FileItem) => {
    try {
      const { shareUrl } = await api.shareFile(file.id);
      await navigator.clipboard.writeText(shareUrl);
      setFiles((prev) => prev.map((item) => (item.id === file.id ? { ...item, shared: true, shareUrl } : item)));
      addToast("success", "Share link copied to clipboard");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Share failed");
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await api.downloadFile(file.id);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      addToast("success", "Download started");
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Download failed");
    }
  };

  return (
    <section className="stack-lg">
      {!isAuthed ? (
        <div className="card stack-sm">
          <h1>Welcome to Cloud Share</h1>
          <p className="muted">Please login or create an account to manage files.</p>
          <div className="actions">
            <Link className="button button-primary" href="/login">
              Login
            </Link>
            <Link className="button button-secondary" href="/register">
              Register
            </Link>
          </div>
        </div>
      ) : null}

      {isAuthed ? (
        <>
          <div className="card">
            <h1>File Dashboard</h1>
            <p className="muted">Upload, manage and share your files in one place.</p>
          </div>

          <div className="grid two-col">
            <div className="card">
              <h2>Storage Usage</h2>
              <p className="muted">
                {formatBytes(usage.usedBytes)} of {formatBytes(usage.totalBytes)} used
              </p>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((usage.usedBytes / usage.totalBytes) * 100)}
              >
                <div className="progress-fill" style={{ width: `${Math.min((usage.usedBytes / usage.totalBytes) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="card stack-sm">
              <h2>Upload Files</h2>
              <label htmlFor="fileUpload" className="button button-primary">
                {isUploading ? "Uploading..." : "Choose files"}
              </label>
              <input id="fileUpload" type="file" multiple onChange={handleUpload} disabled={isUploading} className="hidden-input" />
              <button className="button button-secondary" onClick={() => void loadDashboard()} type="button" disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh files"}
              </button>
              <p className="muted">Supports multiple files. Files are uploaded individually.</p>
            </div>
          </div>

          <div className="card stack-sm">
            <h2>Search and Filter</h2>
            <div className="grid form-grid">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search files by name"
                className="input"
              />
              <select value={filter} onChange={(event) => setFilter(event.target.value)} className="input">
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="video">Videos</option>
                <option value="other">Others</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2>Files</h2>
            {isLoading ? <p>Loading files...</p> : null}
            {error ? <p className="error-box">{error}</p> : null}

            {!isLoading && !error ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.length ? (
                      filteredFiles.map((file) => (
                        <tr key={file.id}>
                          <td>{file.name}</td>
                          <td>{file.mimeType}</td>
                          <td>{formatBytes(file.size)}</td>
                          <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="actions">
                              <button className="button button-secondary" onClick={() => handleDownload(file)} type="button">
                                Download
                              </button>
                              <button className="button button-secondary" onClick={() => handleRename(file)} type="button">
                                Rename
                              </button>
                              <button className="button button-secondary" onClick={() => handleShare(file)} type="button">
                                Share
                              </button>
                              <button className="button button-danger" onClick={() => handleDelete(file.id)} type="button">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          No files found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
