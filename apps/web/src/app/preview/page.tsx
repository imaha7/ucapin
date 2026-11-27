"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowDown, ArrowLeft, CalendarDays, MapPin, Music2 } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { templates } from "@/lib/templates";
import { BohoFloralInvitation } from "@/components/boho-floral-invitation";

type PreviewDraft = {
  bride?: string;
  groom?: string;
  date?: string;
  venue?: string;
};

function PreviewContent() {
  const params = useSearchParams();
  const template = useMemo(() => templates.find((item) => item.id === params.get("template")) ?? templates[0], [params]);
  const [draft, setDraft] = useState<PreviewDraft>({});

  useEffect(() => {
    const storageKey = `ucapin-draft-${template.id}`;
    const stored = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem("ucapin-draft");
    if (stored) {
      try { setDraft(JSON.parse(stored) as PreviewDraft); }
      catch { window.localStorage.removeItem(storageKey); }
    }
  }, [template.id]);

  if (template.id === "seruni") {
    return <BohoFloralInvitation
      bride={draft.bride || "Nadia"}
      groom={draft.groom || "Arga"}
      date={draft.date || "08 Agustus 2026"}
      venue={draft.venue || "Taman Bunga, Bandung"}
      imageUrl={`https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=1200&q=85`}
      preview
      editorHref={`/editor?template=${template.id}`}
    />;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between bg-[#282d28]/35 px-5 text-white backdrop-blur-md sm:px-8">
        <Link href={`/editor?template=${template.id}`} className="flex items-center gap-2 text-[11px] hover:text-white/80"><ArrowLeft size={15} /> Kembali ke editor</Link>
        <span className="serif text-[23px]">ucapin<span className="text-[#e7b49a]">.</span></span>
        <span className="rounded-full border border-white/40 bg-black/15 px-3 py-1.5 text-[9px] uppercase tracking-[1px]">Preview</span>
      </header>
      <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden px-5 py-28 text-center text-white">
        <img src={`https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=1800&q=90`} alt="Pratinjau suasana undangan" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#202720]/45 via-[#202720]/20 to-[#202720]/75" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[4px] text-white/85">Undangan pernikahan</p>
          <h1 className="serif mt-7 text-[54px] font-normal leading-[1.05] tracking-[-1px] sm:text-[76px]">{draft.bride || "Nadia"} <span className="italic text-[#efcfb9]">&amp;</span> {draft.groom || "Arga"}</h1>
          <div className="mx-auto my-7 h-px w-14 bg-white/70" />
          <p className="serif text-[19px] italic text-white/90">Dengan penuh sukacita, kami mengundang</p>
          <p className="mt-4 text-[11px] uppercase tracking-[2.4px]">{draft.date || "08 Agustus 2026"}</p>
          <Button as="a" href="#detail-acara" radius="full" className="mt-9 h-12 border border-white/60 bg-white/10 px-7 text-xs text-white backdrop-blur-sm">Buka undangan <ArrowDown size={14} className="ml-2" /></Button>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-white/30 sm:inset-6" />
      </section>
      <section id="detail-acara" className="mx-auto max-w-[900px] px-5 py-16 text-center sm:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#9b775e]">Simpan tanggalnya</p>
        <h2 className="serif mt-4 text-[36px] text-[#344236] sm:text-[46px]">{draft.bride || "Nadia"} &amp; {draft.groom || "Arga"}</h2>
        <p className="mx-auto mt-4 max-w-[520px] text-sm leading-7 text-[#817970]">Sebuah hari istimewa akan lebih lengkap dengan kehadiran keluarga dan sahabat. Kami berharap dapat merayakannya bersama kalian.</p>
        <div className="mx-auto mt-9 grid max-w-[600px] gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-6">
            <CalendarDays size={19} className="mx-auto text-[#54715c]" /><p className="serif mt-3 text-[20px] text-[#383c35]">Hari pernikahan</p><p className="mt-2 text-xs text-[#817970]">{draft.date || "08 Agustus 2026"}</p>
          </div>
          <div className="rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-6">
            <MapPin size={19} className="mx-auto text-[#54715c]" /><p className="serif mt-3 text-[20px] text-[#383c35]">Lokasi acara</p><p className="mt-2 text-xs text-[#817970]">{draft.venue || "Taman Bunga, Bandung"}</p>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-[#7b766e]"><Music2 size={14} /> Lagu kenangan kalian</div>
      </section>
      <div className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-32px)] max-w-[540px] -translate-x-1/2 rounded-2xl border border-[#e6dfd4] bg-[#fffdf9]/95 px-4 py-3 shadow-[0_8px_40px_rgba(47,44,37,.16)] backdrop-blur sm:flex sm:items-center sm:justify-between sm:px-5">
        <div className="mb-2 sm:mb-0"><p className="text-[11px] font-semibold text-[#49473f]">Ini masih pratinjau draft</p><p className="mt-0.5 text-[9px] text-[#8b857a]">Undangan belum dipublikasikan untuk tamu.</p></div>
        <Button as={Link} href={`/editor?template=${template.id}`} size="sm" radius="full" className="h-9 w-full bg-[#355747] px-4 text-[10px] text-white sm:w-auto">Lanjut edit</Button>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return <Suspense fallback={<div className="p-8 text-center text-sm text-[#817970]">Menyiapkan pratinjau...</div>}><PreviewContent /></Suspense>;
}
