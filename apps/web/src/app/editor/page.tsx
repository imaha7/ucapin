"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@heroui/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, Monitor, Music2, Smartphone, Sparkles } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { templates } from "@/lib/templates";
import { ApiError, apiRequest, getAccessToken } from "@/lib/api";
import { BohoFloralCover } from "@/components/boho-floral-invitation";

type Draft = { bride: string; groom: string; date: string; venue: string; slug: string; templateSlug?: string };
type InvitationDetail = { slug: string; content: unknown; template: { slug: string } | null };
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const initialDraft: Draft = { bride: "Nadia", groom: "Arga", date: "08 Agustus 2026", venue: "Taman Bunga, Bandung", slug: "nadia-arga" };

function getContentText(content: unknown, key: string, fallback: string) {
  if (!content || typeof content !== "object") return fallback;
  const value = (content as Record<string, unknown>)[key];
  return typeof value === "string" ? value : fallback;
}

async function findAvailableSlug(base: string) {
  const normalized = slugify(base) || `undangan-${Date.now()}`;
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const tail = suffix === 1 ? "" : `-${suffix}`;
    const candidate = `${normalized.slice(0, 60 - tail.length)}${tail}`;
    const result = await apiRequest<{ available: boolean }>(`/invitations/slug/${encodeURIComponent(candidate)}/availability`);
    if (result.available) return candidate;
  }
  throw new Error("Tidak menemukan alamat undangan yang tersedia. Coba ubah slug.");
}

function EditorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const editingInvitationId = params.get("invitation");
  const selectedTemplate = useMemo(() => templates.find((item) => item.id === params.get("template")) ?? templates[0], [params]);
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [savingToAccount, setSavingToAccount] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [slugAvailability, setSlugAvailability] = useState<"checking" | "available" | "taken" | "error" | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(Boolean(getAccessToken()));
    if (editingInvitationId) {
      setReady(false);
      if (!getAccessToken()) {
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      let active = true;
      apiRequest<InvitationDetail>(`/invitations/${encodeURIComponent(editingInvitationId)}`, { auth: true })
        .then((invitation) => {
          if (!active) return;
          setDraft({
            bride: getContentText(invitation.content, "bride", initialDraft.bride),
            groom: getContentText(invitation.content, "groom", initialDraft.groom),
            date: getContentText(invitation.content, "date", initialDraft.date),
            venue: getContentText(invitation.content, "venue", initialDraft.venue),
            slug: invitation.slug,
            templateSlug: invitation.template?.slug ?? selectedTemplate.id,
          });
          setSaveError("");
          setReady(true);
        })
        .catch((reason: unknown) => {
          if (!active) return;
          if (reason instanceof ApiError && reason.status === 401) {
            router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
          }
          setSaveError(reason instanceof Error ? reason.message : "Undangan gagal dimuat.");
          setReady(true);
        });
      return () => { active = false; };
    }

    const stored = window.localStorage.getItem(`ucapin-draft-${selectedTemplate.id}`) ?? window.localStorage.getItem("ucapin-draft");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Draft>;
        const draftData = { ...parsed } as Partial<Draft> & { invitationId?: string };
        delete draftData.invitationId;
        setDraft({
          ...initialDraft,
          ...draftData,
          slug: draftData.slug || slugify(`${draftData.bride ?? initialDraft.bride}-${draftData.groom ?? initialDraft.groom}`),
          templateSlug: selectedTemplate.id,
        });
      } catch {
        window.localStorage.removeItem(`ucapin-draft-${selectedTemplate.id}`);
        window.localStorage.removeItem("ucapin-draft");
      }
    }
    setReady(true);
  }, [editingInvitationId, router, selectedTemplate.id]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(`ucapin-draft-${selectedTemplate.id}`, JSON.stringify(draft));
      window.localStorage.setItem("ucapin-draft", JSON.stringify(draft));
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, ready, selectedTemplate.id]);

  function update(key: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
    if (key === "slug") setSlugAvailability(null);
  }

  async function checkSlugAvailability() {
    if (draft.slug.length < 3) {
      setSlugAvailability("taken");
      return;
    }
    setSlugAvailability("checking");
    try {
      const result = await apiRequest<{ available: boolean }>(`/invitations/slug/${encodeURIComponent(draft.slug)}/availability`);
      setSlugAvailability(result.available ? "available" : "taken");
    } catch {
      setSlugAvailability("error");
    }
  }

  function save() {
    window.localStorage.setItem(`ucapin-draft-${selectedTemplate.id}`, JSON.stringify(draft));
    window.localStorage.setItem("ucapin-draft", JSON.stringify(draft));
    setSaved(true);
  }

  async function saveToAccount() {
    if (!getAccessToken()) {
      setSaveError("Sesi login tidak ditemukan. Silakan masuk kembali.");
      setAuthenticated(false);
      return;
    }
    setSavingToAccount(true);
    setSaveError("");
    try {
      const content = {
        bride: draft.bride,
        groom: draft.groom,
        date: draft.date,
        venue: draft.venue,
        templateSlug: selectedTemplate.id,
      };
      let invitation: { slug: string };
      if (editingInvitationId) {
        invitation = await apiRequest<{ slug: string }>(`/invitations/${encodeURIComponent(editingInvitationId)}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify({ title: `${draft.bride} & ${draft.groom}`, content }),
        });
      } else {
        let candidateSlug = await findAvailableSlug(draft.slug);
        for (let attempt = 0; ; attempt += 1) {
          try {
            invitation = await apiRequest<{ slug: string }>("/invitations", {
              method: "POST",
              auth: true,
              body: JSON.stringify({
                slug: candidateSlug,
                title: `${draft.bride} & ${draft.groom}`,
                content,
                templateSlug: selectedTemplate.id,
              }),
            });
            break;
          } catch (reason) {
            if (!(reason instanceof ApiError) || reason.status !== 409 || attempt >= 2) throw reason;
            candidateSlug = await findAvailableSlug(`${draft.slug}-${attempt + 2}`);
          }
        }
      }
      const updatedDraft = { ...draft, slug: invitation.slug, templateSlug: selectedTemplate.id };
      setDraft(updatedDraft);
      window.localStorage.setItem(`ucapin-draft-${selectedTemplate.id}`, JSON.stringify(updatedDraft));
      window.localStorage.setItem("ucapin-draft", JSON.stringify(updatedDraft));
      window.location.assign("/dashboard");
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Draft gagal disimpan ke akun.");
    } finally {
      setSavingToAccount(false);
    }
  }

  if (editingInvitationId && !ready) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f4f0] text-sm text-[#817970]">Memuat undangan...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f4f0]">
      <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-[#e8e3dc] bg-[#fffdf9]/95 px-4 backdrop-blur sm:px-7">
        <div className="flex items-center gap-4">
          <Link aria-label="Kembali ke beranda" href="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e3dc] text-[#5a655b] hover:bg-[#edf0e9]"><ArrowLeft size={16} /></Link>
          <span className="serif text-[21px] text-[#355747]">ucapin<span className="text-[#bd8065]">.</span></span>
          <span className="hidden h-6 border-l border-[#e6e1d9] sm:block" />
          <div className="hidden sm:block"><p className="text-[11px] font-semibold text-[#44433d]">{editingInvitationId ? "Edit undangan" : "Editor undangan"}</p><p className="mt-0.5 text-[9px] text-[#9b948a]">Draft tersimpan di perangkatmu</p></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[10px] text-[#79786c] sm:flex">{saved ? <Check size={13} className="text-[#55745b]" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#b9a883]" />}{saved ? "Tersimpan" : "Menyimpan..."}</span>
          <Button size="sm" radius="full" onPress={save} className="h-9 bg-[#355747] px-4 text-[11px] text-white"><Check size={13} className="mr-1" />Simpan draft</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100vh-66px)] lg:grid-cols-[370px_1fr]">
        <aside className="border-b border-[#e8e3dc] bg-[#fffdf9] p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[1.4px] text-[#9b775e]">Langkah {step + 1} dari 3</p><h1 className="serif mt-1 text-[27px] text-[#333630]">{["Ceritakan kalian", "Detail acara", "Simpan undangan"][step]}</h1></div>
            <Sparkles size={18} className="text-[#b48e6d]" />
          </div>
          <div className="mb-7 flex gap-1.5">
            {[0, 1, 2].map((n) => <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-[#58705c]" : "bg-[#e9e5dd]"}`} />)}
          </div>
          {step === 0 && <div className="space-y-4">
            <Input label="Nama mempelai perempuan" labelPlacement="outside" placeholder="Contoh: Nadia" value={draft.bride} onValueChange={(v) => update("bride", v)} variant="bordered" classNames={{ label: "text-[11px] text-[#6c685f]", inputWrapper: "h-11 rounded-xl border-[#e5e0d7] bg-[#fffdf9]", input: "text-[13px]" }} />
            <Input label="Nama mempelai laki-laki" labelPlacement="outside" placeholder="Contoh: Arga" value={draft.groom} onValueChange={(v) => update("groom", v)} variant="bordered" classNames={{ label: "text-[11px] text-[#6c685f]", inputWrapper: "h-11 rounded-xl border-[#e5e0d7] bg-[#fffdf9]", input: "text-[13px]" }} />
            <div className="rounded-xl bg-[#f4f2eb] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8b8173]">Desain pilihanmu</p>
              <div className="mt-3 flex items-center gap-3">
                <img src={`https://images.unsplash.com/${selectedTemplate.image}?auto=format&fit=crop&w=140&q=80`} alt="" className="h-[58px] w-[54px] rounded-lg object-cover" />
                <div className="flex-1"><p className="serif text-[17px] text-[#3d423a]">{selectedTemplate.title}</p><p className="mt-0.5 text-[10px] text-[#898277]">{selectedTemplate.category} · bisa diganti kapan saja</p></div>
                <Link href="/#templates" className="text-[10px] font-semibold text-[#496b56]">Ganti</Link>
              </div>
            </div>
          </div>}
          {step === 1 && <div className="space-y-4">
            <Input type="text" label="Tanggal pernikahan" labelPlacement="outside" placeholder="08 Agustus 2026" value={draft.date} onValueChange={(v) => update("date", v)} variant="bordered" classNames={{ label: "text-[11px] text-[#6c685f]", inputWrapper: "h-11 rounded-xl border-[#e5e0d7] bg-[#fffdf9]", input: "text-[13px]" }} />
            <Input label="Lokasi acara" labelPlacement="outside" placeholder="Nama venue, kota" value={draft.venue} onValueChange={(v) => update("venue", v)} variant="bordered" classNames={{ label: "text-[11px] text-[#6c685f]", inputWrapper: "h-11 rounded-xl border-[#e5e0d7] bg-[#fffdf9]", input: "text-[13px]" }} />
            <Input label="Alamat undangan" labelPlacement="outside" placeholder="nadia-arga" value={draft.slug} onValueChange={(value) => update("slug", slugify(value))} onBlur={() => void checkSlugAvailability()} startContent={<span className="whitespace-nowrap text-[11px] text-[#958e83]">ucapin.id/</span>} variant="bordered" classNames={{ label: "text-[11px] text-[#6c685f]", inputWrapper: "h-11 rounded-xl border-[#e5e0d7] bg-[#fffdf9]", input: "text-[13px]" }} />
            <p className="-mt-2 text-[10px] leading-5 text-[#918a7f]">{slugAvailability === "checking" ? "Memeriksa alamat..." : slugAvailability === "available" ? "Alamat ini tersedia." : slugAvailability === "taken" ? "Alamat sudah dipakai; sistem akan memilih alamat tersedia saat disimpan." : slugAvailability === "error" ? "Alamat belum dapat diperiksa. Coba lagi atau simpan untuk validasi ulang." : "Tautan ini akan digunakan tamu untuk membuka undanganmu."}</p>
          </div>}
          {step === 2 && <div className="rounded-2xl bg-[#f4f2eb] p-5">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#54715c]"><Check size={18} /></span>
            <p className="serif text-[22px] text-[#343a32]">{editingInvitationId ? "Simpan perubahan." : "Simpan, lalu bagikan."}</p>
            <p className="mt-2 text-xs leading-5 text-[#817970]">Draft disimpan ke akunmu. Undangan berbayar baru aktif setelah pembayaran terverifikasi.</p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-3"><span className="truncate text-[11px] text-[#837e74]">ucapin.id/{draft.slug || "alamat-undangan"}</span><button aria-label="Salin alamat undangan" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/${draft.slug}`); }} className="ml-2 text-[#54715c]"><Copy size={14} /></button></div>
            <Link href={`/preview?template=${selectedTemplate.id}`} className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#496b56] hover:underline">Lihat pratinjau <ChevronRight size={13} /></Link>
            {saveError && <p role="alert" className="mt-4 rounded-lg bg-[#fbefec] px-3 py-2 text-[10px] leading-5 text-[#9a4438]">{saveError}</p>}
            {!authenticated && <p className="mt-4 text-[10px] leading-5 text-[#817970]">Masuk atau daftar untuk menyimpan undangan di akun.</p>}
          </div>}
          <div className="mt-7 flex justify-between">
            <Button isDisabled={step === 0} onPress={() => setStep((s) => Math.max(s - 1, 0))} variant="bordered" radius="full" className="h-10 border-[#ded8cf] px-4 text-[11px] text-[#6d675f]"><ChevronLeft size={15} className="mr-1" /> Kembali</Button>
            {step < 2 && <Button onPress={() => setStep((s) => Math.min(s + 1, 2))} radius="full" className="h-10 bg-[#355747] px-5 text-[11px] text-white">Lanjutkan <ChevronRight size={15} className="ml-1" /></Button>}
            {step === 2 && (authenticated
              ? <Button isLoading={savingToAccount} onPress={() => void saveToAccount()} radius="full" className="h-10 bg-[#355747] px-5 text-[11px] text-white"><Check size={14} className="mr-1" /> {editingInvitationId ? "Simpan perubahan" : "Simpan ke akun"}</Button>
              : <Button as={Link} href={`/login?next=${encodeURIComponent(`/editor?template=${selectedTemplate.id}`)}`} radius="full" className="h-10 bg-[#355747] px-5 text-[11px] text-white">Masuk untuk simpan</Button>)}
          </div>
          <p className="mt-6 text-center text-[10px] leading-5 text-[#a09a90]">Belum perlu akun atau pembayaran.<br />Mulai dulu, sesuaikan nanti.</p>
        </aside>
        <section className="flex min-h-[600px] flex-col items-center bg-[#eeece7] px-4 py-6 sm:px-8 lg:py-9">
          <div className="mb-5 flex w-full max-w-[840px] items-center justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[1.4px] text-[#948c80]">Pratinjau langsung</p><p className="mt-1 text-xs text-[#605d56]">{selectedTemplate.title}</p></div>
            <div className="flex rounded-full bg-[#e0ddd6] p-1">
              <button onClick={() => setDevice("mobile")} aria-label="Pratinjau ponsel" className={`flex h-8 w-9 items-center justify-center rounded-full ${device === "mobile" ? "bg-white text-[#355747] shadow-sm" : "text-[#817b71]"}`}><Smartphone size={15} /></button>
              <button onClick={() => setDevice("desktop")} aria-label="Pratinjau desktop" className={`flex h-8 w-9 items-center justify-center rounded-full ${device === "desktop" ? "bg-white text-[#355747] shadow-sm" : "text-[#817b71]"}`}><Monitor size={15} /></button>
            </div>
          </div>
          <div className={`editor-preview soft-shadow relative my-auto overflow-hidden border-[7px] border-[#fffdf9] transition-all duration-300 ${device === "mobile" ? "phone-frame h-[570px] w-[294px] rounded-[34px]" : "h-[510px] w-full max-w-[840px] rounded-[17px]"}`}>
            {selectedTemplate.id === "seruni" ? <BohoFloralCover
              bride={draft.bride || "Nama"}
              groom={draft.groom || "Pasangan"}
              date={draft.date || "Tanggal pernikahan"}
              venue={draft.venue || "Lokasi acara"}
              imageUrl={`https://images.unsplash.com/${selectedTemplate.image}?auto=format&fit=crop&w=1200&q=85`}
            /> : <>
            <img src={`https://images.unsplash.com/${selectedTemplate.image}?auto=format&fit=crop&w=1200&q=85`} alt="Pratinjau dekorasi undangan" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f251f]/75 via-[#1f251f]/15 to-[#1f251f]/20" />
            <div className="absolute left-0 right-0 top-8 text-center text-[9px] uppercase tracking-[3px] text-white/90">Undangan pernikahan</div>
            <div className="absolute bottom-[18%] left-4 right-4 text-center text-white">
              <p className="serif text-[14px] italic text-white/90">The Wedding Of</p>
              <h2 className="serif mt-3 text-[42px] leading-[1.05]">{draft.bride || "Nama"}<br /><span className="text-[25px] italic text-[#f1d8c6]">&amp;</span><br />{draft.groom || "Pasangan"}</h2>
              <p className="mt-5 text-[10px] uppercase tracking-[2.4px]">{draft.date || "Tanggal pernikahan"}</p>
              <div className="mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full border border-white/45 bg-white/15 px-4 py-2 text-[9px] backdrop-blur-sm"><MapPinIcon /> Buka undangan</div>
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center text-[8px] tracking-[2px] text-white/75">{draft.venue || "Lokasi acara"}</div>
            <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white"><Music2 size={13} /></div>
            </>}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[10px] text-[#938c81]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#789078]" /> Pratinjau berubah otomatis saat kamu mengetik</div>
        </section>
      </div>
    </main>
  );
}

function MapPinIcon() {
  return <span className="text-[10px]">↗</span>;
}

export default function EditorPage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-[#817970]">Menyiapkan editor...</div>}><EditorContent /></Suspense>;
}
