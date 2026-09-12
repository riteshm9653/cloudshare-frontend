"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await api.register({ name, email, password });
      auth.setToken(response.token);
      addToast("success", "Registration successful");
      router.push("/");
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-wrapper">
      <form className="card auth-card stack-sm" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <p className="muted">Create your Cloud Share account.</p>

        <input
          className="input"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="muted">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}
