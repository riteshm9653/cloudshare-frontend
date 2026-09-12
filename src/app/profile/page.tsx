"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (!auth.getToken()) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setError(null);
        const data = await api.getProfile();
        setProfile(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load profile");
        addToast("error", "Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [addToast, router]);

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p className="error-box">{error}</p>;
  }

  if (!profile) {
    return <p className="muted">No profile data found.</p>;
  }

  return (
    <section className="card stack-sm profile-card">
      <h1>User Profile</h1>
      <p>
        <strong>Name:</strong> {profile.name}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>User ID:</strong> {profile.id}
      </p>
    </section>
  );
}
