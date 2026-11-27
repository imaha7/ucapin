"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowUpRight, Check, Clock3, ExternalLink, Heart, LogOut, Plus, RefreshCw, WalletCards } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest, clearSession, getAccessToken, getStoredUser, type ApiInvitation, type ApiUser } from "@/lib/api";

type PaymentMethod = "QRIS" | "BANK_TRANSFER";

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
}

function DashboardContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiInvitation | null>(null);
  const paymentReturn = params.get("payment") === "finish";
  const paymentInvitationId = params.get("invitation");

  const loadInvitations = useCallback(async () => {
    try {
      const data = await apiRequest<ApiInvitation[]>("/invitations/mine", { auth: true });
      setInvitations(data);
      setError("");
      return data;
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        router.replace("/login?next=%2Fdashboard");
        return [];
      }
      setError(reason instanceof Error ? reason.message : "Undangan gagal dimuat.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login?next=%2Fdashboard");
      return;
    }
    setUser(getStoredUser());
    void loadInvitations();
  }, [loadInvitations, router]);

  useEffect(() => {
    if (!paymentReturn) return;
    setNotice("Memeriksa status pembayaran dari Midtrans...");
    let active = true;
    let attempts = 0;
    const timer = window.setInterval(async () => {
      attempts += 1;
      const data = await loadInvitations();
      if (!active) return;
      const paid = data.some((item) => item.id === paymentInvitationId && item.status === "PUBLISHED");
      if (paid || attempts >= 12) {
        window.clearInterval(timer);
        setNotice(paid
          ? "Pembayaran terverifikasi. Undangan sudah dipublikasikan."
          : "Status belum berubah. Pembayaran akan diperbarui otomatis setelah notifikasi gateway diterima.");
      }
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [paymentReturn, paymentInvitationId, loadInvitations]);

  async function publish(id: string) {
    setBusy(id);
    setError("");
    try {
      await apiRequest(`/invitations/${id}/publish`, { method: "POST", auth: true });
      await loadInvitations();
      setNotice("Undangan berhasil dipublikasikan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Undangan gagal dipublikasikan.");
    } finally {
      setBusy("");
    }
  }

  async function checkout(id: string) {
    setBusy(id);
    setError("");
    try {
      const result = await apiRequest<{ redirectUrl: string }>("/payments/" + id + "/checkout", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ method }),
      });
      window.location.assign(result.redirectUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Checkout gagal dibuat.");
      setBusy("");
    }
  }

  async function deleteInvitation() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusy(`delete-${target.id}`);
    setError("");
    try {
      await apiRequest(`/invitations/${target.id}`, { method: "DELETE", auth: true });
      setInvitations((current) => current.filter((item) => item.id !== target.id));
      setDeleteTarget(null);
      setNotice("Undangan dihapus dan tautan publiknya dinonaktifkan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Undangan gagal dihapus.");
    } finally {
      setBusy("");
    }
  }

  function signOut() {
    clearSession();
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <header className="border-b border-[#e9e3da] bg-[#fffdf9]">
        <div className="mx-auto flex h-[72px] max-w-[1160px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="serif text-[27px] font-semibold tracking-[-1.5px] text-[#355747]">ucapin<span className="text-[#bd8065]">.</span></Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#706c62] sm:inline">{user?.name}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-[#706c62] hover:text-[#355747]"><LogOut size={14} /> Keluar</button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[1160px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-semibold uppercase tracking-[1.7px] text-[#9b775e]">Ruang ceritamu</p><h1 className="serif mt-2 text-[38px] text-[#333630] sm:text-[44px]">Halo, {user?.name?.split(" ")[0] ?? "kamu"}.</h1><p className="mt-2 text-sm text-[#817970]">Kelola undangan dan pantau kabar dari para tamu.</p></div>
          <Button as={Link} href="/#templates" radius="full" className="h-11 bg-[#355747] px-5 text-xs text-white"><Plus size={15} className="mr-1" /> Buat undangan baru</Button>
        </div>
        {notice && <div role="status" className="mt-7 flex items-start gap-2 rounded-xl border border-[#d9e3d8] bg-[#edf3eb] px-4 py-3 text-xs leading-5 text-[#45634a]"><Check size={15} className="mt-0.5 shrink-0" />{notice}<button onClick={() => setNotice("")} className="ml-auto pl-2 text-[#45634a]">Tutup</button></div>}
        {error && <div role="alert" className="mt-7 rounded-xl border border-[#edd9d4] bg-[#fbefec] px-4 py-3 text-xs leading-5 text-[#9a4438]">{error}</div>}
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total undangan", value: invitations.length, icon: Heart },
            { label: "Sudah dipublikasikan", value: invitations.filter((item) => item.status === "PUBLISHED").length, icon: Check },
            { label: "Konfirmasi tamu", value: invitations.reduce((sum, item) => sum + (item._count?.rsvps ?? 0), 0), icon: WalletCards },
          ].map((stat) => <div key={stat.label} className="rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-5"><div className="flex items-center justify-between"><p className="text-[11px] text-[#817970]">{stat.label}</p><stat.icon size={16} className="text-[#71846d]" /></div><p className="serif mt-3 text-[32px] text-[#344236]">{stat.value}</p></div>)}
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h2 className="serif text-[27px] text-[#343730]">Undanganmu</h2><p className="mt-1 text-xs text-[#817970]">Draft dapat diedit; undangan aktif dapat dibagikan ke tamu.</p></div>
          <label className="flex items-center gap-2 text-[11px] text-[#817970]">
            Pembayaran
            <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} className="h-9 rounded-lg border border-[#e3ddd3] bg-[#fffdf9] px-3 text-[11px] text-[#45463f] outline-none focus:border-[#71846d]">
              <option value="QRIS">QRIS</option>
              <option value="BANK_TRANSFER">Transfer bank</option>
            </select>
          </label>
        </div>
        {loading ? <div className="mt-5 rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-8 text-center text-sm text-[#817970]">Memuat undangan...</div>
          : invitations.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#dcd5ca] bg-[#fffdf9] px-6 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf1ea] text-[#55745b]"><Heart size={19} /></span><h3 className="serif mt-4 text-[24px] text-[#343730]">Kisahmu dimulai di sini.</h3><p className="mx-auto mt-2 max-w-[340px] text-xs leading-5 text-[#817970]">Buat undangan pertama, simpan draft di akun, lalu publikasikan setelah pembayaran.</p><Button as={Link} href="/#templates" radius="full" className="mt-5 bg-[#355747] px-5 text-xs text-white">Pilih desain <ArrowUpRight size={14} className="ml-1" /></Button></div>
          : <div className="mt-5 space-y-3">
            {invitations.map((item) => {
              const isFree = Number(item.calculatedPrice) <= 0;
              return <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="serif truncate text-[22px] text-[#373a33]">{item.title}</h3><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.status === "PUBLISHED" ? "bg-[#e9f1e7] text-[#55745b]" : "bg-[#f5efe3] text-[#98763e]"}`}>{item.status === "PUBLISHED" ? "AKTIF" : item.status === "UNPAID" ? "MENUNGGU PEMBAYARAN" : item.status}</span></div>
                  <p className="mt-1 text-[10px] text-[#898378]">ucapin.id/{item.slug}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#898378]"><span>{formatPrice(item.calculatedPrice)}</span><span>{item._count?.rsvps ?? 0} konfirmasi tamu</span><span>Diperbarui {new Date(item.updatedAt).toLocaleDateString("id-ID")}</span></div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button as={Link} href={`/editor?template=${encodeURIComponent(item.template?.slug ?? "savana")}&invitation=${encodeURIComponent(item.id)}`} size="sm" radius="full" variant="bordered" className="h-9 border-[#ded8cf] px-4 text-[16px] text-[#496b56]">Edit</Button>
                  {item.status === "PUBLISHED" ? <Button as={Link} href={`/${item.slug}`} size="sm" radius="full" variant="bordered" className="h-9 border-[#ded8cf] px-4 text-[16px] text-[#496b56]">Lihat <ExternalLink size={12} className="ml-1" /></Button>
                    : isFree ? <Button size="sm" isLoading={busy === item.id} onPress={() => void publish(item.id)} radius="full" className="h-9 bg-[#355747] px-4 text-[10px] text-white">Publikasikan</Button>
                      : <Button size="sm" isLoading={busy === item.id} onPress={() => void checkout(item.id)} radius="full" className="h-9 bg-[#355747] px-4 text-[10px] text-white">{item.status === "UNPAID" ? "Lanjutkan pembayaran" : "Bayar & publikasikan"} <ArrowUpRight size={12} className="ml-1" /></Button>}
                  <Button size="sm" isDisabled={busy === `delete-${item.id}`} onPress={() => setDeleteTarget(item)} radius="full" variant="light" className="h-9 px-3 text-[16px] text-[#9a5147]">Hapus</Button>
                </div>
              </article>;
            })}
          </div>}
        <p className="mt-7 flex items-center gap-2 text-[10px] leading-5 text-[#938c81]"><Clock3 size={13} /> Publikasi otomatis dilakukan setelah Midtrans mengonfirmasi pembayaran melalui webhook.</p>
        <Button isIconOnly aria-label="Muat ulang daftar" variant="light" onPress={() => void loadInvitations()} className="fixed bottom-5 right-5 z-10 rounded-full bg-white text-[#526c57] shadow-md"><RefreshCw size={15} /></Button>
      </section>
      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2c23]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-[440px] rounded-2xl bg-[#fffdf9] p-6 shadow-2xl sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[1.4px] text-[#9b775e]">Hapus undangan</p>
          <h2 id="delete-title" className="serif mt-2 text-[27px] text-[#333630]">{deleteTarget.title}</h2>
          <p className="mt-3 text-xs leading-6 text-[#817970]">Tautan publik akan dinonaktifkan dan data RSVP serta ucapan akan dihapus. Riwayat transaksi tetap disimpan untuk pencatatan pembayaran. Transaksi yang masih menunggu pembayaran harus selesai atau kedaluwarsa dulu.</p>
          {error && <p role="alert" className="mt-4 rounded-lg bg-[#fbefec] px-3 py-2 text-[11px] leading-5 text-[#9a4438]">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <Button onPress={() => setDeleteTarget(null)} radius="full" variant="bordered" className="h-10 border-[#ded8cf] px-4 text-xs text-[#6d675f]">Batal</Button>
            <Button isLoading={busy === `delete-${deleteTarget.id}`} onPress={() => void deleteInvitation()} radius="full" className="h-10 bg-[#9a5147] px-5 text-xs text-white">Hapus undangan</Button>
          </div>
        </section>
      </div>}
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-[#817970]">Memuat dashboard...</div>}><DashboardContent /></Suspense>;
}
