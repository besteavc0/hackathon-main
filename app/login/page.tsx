"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("ahmet@opsmind.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    if (!ok) {
      setError("Geçersiz e-posta veya şifre. Örnek: ahmet@opsmind.com / herhangi 4+ karakter");
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand" style={{ marginBottom: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
          <Image src="/logo.png" alt="OpsMind AI Logo" width={220} height={60} priority style={{ width: "auto", height: "auto", maxHeight: "60px" }} />
          <div>
            <p className="brand-tagline" style={{ fontSize: "0.95rem" }}>Akıllı Operasyon Yönetim Platformu</p>
          </div>
        </div>

        <div className="login-field">
          <label htmlFor="email">E-posta</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="ad@opsmind.com"
            autoComplete="email"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Şifre</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          type="button"
          className="button login-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>
    </div>
  );
}
