"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthed = Boolean(auth.getToken());

  const logout = () => {
    auth.clearToken();
    router.push("/login");
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" href="/">
          Cloud Share
        </Link>

        <nav className="nav-links">
          <Link className={pathname === "/" ? "nav-link active" : "nav-link"} href="/">
            Dashboard
          </Link>
          <Link className={pathname === "/profile" ? "nav-link active" : "nav-link"} href="/profile">
            Profile
          </Link>
          {!isAuthed ? (
            <>
              <Link className={pathname === "/login" ? "nav-link active" : "nav-link"} href="/login">
                Login
              </Link>
              <Link className={pathname === "/register" ? "nav-link active" : "nav-link"} href="/register">
                Register
              </Link>
            </>
          ) : (
            <button className="button button-secondary" onClick={logout} type="button">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
