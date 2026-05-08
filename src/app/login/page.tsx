"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  Lock,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const router = useRouter();

  async function handleLogin() {
    try {
      setLoading(true);

      setError("");

      const res = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Login failed"
        );

        return;
      }

      router.push("/dashboard");

      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] relative overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0">

        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-[#ff9900]/10 rounded-full blur-3xl" />

        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#232f3e]/10 rounded-full blur-3xl" />
      </div>

      {/* CONTENT */}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">

        <div className="w-full max-w-md">

          {/* LOGO */}

          <div className="flex flex-col items-center mb-10">

            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#232f3e] to-[#37475a] flex items-center justify-center shadow-2xl border border-white/20">

              <ShieldCheck className="w-12 h-12 text-[#ff9900]" />
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#232f3e]">
              PROSYNC VAULT
            </h1>

            <p className="text-gray-500 mt-3 text-center leading-relaxed">
              Secure access to the multilingual
              business card intelligence system.
            </p>
          </div>

          {/* CARD */}

          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] overflow-hidden">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] px-8 py-7 text-white">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">

                  <Lock className="w-7 h-7 text-[#ff9900]" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Admin Login
                  </h2>

                  <p className="text-sm text-white/70 mt-1">
                    Authentication required
                  </p>
                </div>
              </div>
            </div>

            {/* BODY */}

            <div className="p-8 space-y-6">

              <div className="space-y-2">

                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Internal Password
                </label>

                <input
                  type="password"
                  placeholder="Enter secure admin password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#232f3e] transition-all"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-semibold text-red-500">
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-[58px] rounded-2xl bg-[#232f3e] hover:bg-black text-white font-black tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />

                    Authenticating...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </div>
          </div>

          {/* FOOTER */}

          <p className="text-center text-xs text-gray-400 mt-8 uppercase tracking-[0.25em]">
            Internal Secure Access Portal
          </p>
        </div>
      </div>
    </main>
  );
}