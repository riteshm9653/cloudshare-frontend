import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { FileItem, StorageUsage } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function loadInitialDashboard(): Promise<{
  files: FileItem[];
  usage: StorageUsage;
  error: string | null;
}> {
  if (!API_BASE_URL) {
    return {
      files: [],
      usage: { usedBytes: 0, totalBytes: 1 },
      error: "Set NEXT_PUBLIC_API_BASE_URL in .env.local to load dashboard data.",
    };
  }

  try {
    const [filesResponse, usageResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/files`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/files/storage/usage`, { cache: "no-store" }),
    ]);

    if (!filesResponse.ok || !usageResponse.ok) {
      return {
        files: [],
        usage: { usedBytes: 0, totalBytes: 1 },
        error: "Unable to fetch initial dashboard data. Please login and click Refresh files.",
      };
    }

    const files = (await filesResponse.json()) as FileItem[];
    const usage = (await usageResponse.json()) as StorageUsage;

    return {
      files,
      usage: {
        ...usage,
        totalBytes: usage.totalBytes > 0 ? usage.totalBytes : 1,
      },
      error: null,
    };
  } catch {
    return {
      files: [],
      usage: { usedBytes: 0, totalBytes: 1 },
      error: "Unable to fetch initial dashboard data. Please login and click Refresh files.",
    };
  }
}

export default async function DashboardPage() {
  const initial = await loadInitialDashboard();

  return <DashboardClient initialFiles={initial.files} initialUsage={initial.usage} initialError={initial.error} />;
}
