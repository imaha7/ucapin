"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { ArrowLeft, Heart, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Suspense, useState } from "react";
import { apiRequest, storeSession, type ApiUser } from "@/lib/api";

type AuthResponse = { accessToken: string; user: ApiUser };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const isRegister = params.get("mode") === "register";
  const nextPath = params.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await apiRequest<AuthResponse>(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      storeSession(result.accessToken, result.user);
      router.replace(nextPath?.startsWith("/") ? nextPath : "/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#fbf8f3] lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#31483a] text-white lg:flex lg:items-end lg:p-14">
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#203127] via-[#27392f]/45 to-[#24372b]/30" />
        <div className="relative max-w-[500px]">
          <Heart size={25} className="mb-6 text-[#e2b79e]" />
          <h1 className="serif text-[50px] leading-tight">Cerita kalian,<br /><i className="text-[#e2b79e]">selalu layak dirayakan.</i></h1>
          <p className="mt-5 max-w-[390px] text-sm leading-7 text-white/75">Simpan detail hari istimewa, bagikan undangan, dan sambut kabar baik dari orang-orang tersayang.</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-xs text-[#706c62] hover:text-[#355747]"><ArrowLeft size={14} /> Kembali ke beranda</Link>
          <Link href="/" className="serif block text-[31px] font-semibold tracking-[-1.5px] text-[#355747]">ucapin<span className="text-[#bd8065]">.</span></Link>
          <h2 className="serif mt-8 text-[36px] text-[#333630]">{isRegister ? "Mulai cerita baru." : "Senang bertemu lagi."}</h2>
          <p className="mt-2 text-sm text-[#817970]">{isRegister ? "Buat akun untuk menyimpan undangan dan mengelolanya." : "Masuk ke akun untuk melanjutkan undanganmu."}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {isRegister && <Input label="Nama lengkap" labelPlacement="outside" autoComplete="name" value={name} onValueChange={setName} isRequired startContent={<UserRound size={15} className="text-[#8f897e]" />} variant="bordered" classNames={{ label: "text-xs text-[#5e5a52]", inputWrapper: "h-12 rounded-xl border-[#e5dfd5] bg-white", input: "text-sm" }} />}
            <Input type="email" label="Email" labelPlacement="outside" autoComplete="email" value={email} onValueChange={setEmail} isRequired startContent={<Mail size={15} className="text-[#8f897e]" />} variant="bordered" classNames={{ label: "text-xs text-[#5e5a52]", inputWrapper: "h-12 rounded-xl border-[#e5dfd5] bg-white", input: "text-sm" }} />
            <Input type="password" label="Kata sandi" labelPlacement="outside" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onValueChange={setPassword} minLength={10} isRequired startContent={<LockKeyhole size={15} className="text-[#8f897e]" />} variant="bordered" classNames={{ label: "text-xs text-[#5e5a52]", inputWrapper: "h-12 rounded-xl border-[#e5dfd5] bg-white", input: "text-sm" }} />
            {isRegister && <p className="-mt-3 text-[10px] leading-5 text-[#898378]">Gunakan sedikitnya 10 karakter.</p>}
            {error && <p role="alert" className="rounded-xl bg-[#fbefec] px-4 py-3 text-xs leading-5 text-[#9a4438]">{error}</p>}
            <Button type="submit" isLoading={busy} radius="full" className="h-12 w-full bg-[#355747] text-sm text-white">{isRegister ? "Buat akun" : "Masuk"}</Button>
          </form>
          <p className="mt-6 text-center text-xs text-[#817970]">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link href={isRegister ? `/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}` : `/login?mode=register${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`} className="font-semibold text-[#496b56] hover:underline">{isRegister ? "Masuk" : "Daftar gratis"}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-[#817970]">Memuat...</div>}><LoginForm /></Suspense>;
}
