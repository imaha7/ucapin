"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { CalendarDays, Check, Heart, MapPin, Music2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { BohoFloralInvitation } from "@/components/boho-floral-invitation";

type PublicInvitation = {
  slug: string;
  title: string;
  content: unknown;
  template: { slug: string; name: string; imageUrl: string } | null;
};

function contentText(content: unknown, key: string, fallback: string) {
  if (!content || typeof content !== "object" || !(key in content)) return fallback;
  const value = (content as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export default function PublicInvitationPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("ATTENDING");
  const [guestCount, setGuestCount] = useState("1");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<PublicInvitation>(`/invitations/public/${encodeURIComponent(slug)}`)
      .then((result) => { if (active) setInvitation(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Undangan tidak dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  async function sendRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFeedback("");
    setError("");
    try {
      await apiRequest(`/invitations/public/${encodeURIComponent(slug)}/rsvp`, {
        method: "POST",
        body: JSON.stringify({
          guestName,
          attendance,
          guestCount: Number(guestCount),
          ...(message.trim() ? { message: message.trim() } : {}),
        }),
      });
      setFeedback("Terima kasih, konfirmasimu sudah kami terima.");
      setGuestName("");
      setMessage("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Konfirmasi gagal dikirim.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#fbf8f3] text-sm text-[#817970]">Memuat undangan...</main>;
  if (!invitation) return <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbf8f3] px-5 text-center"><Heart size={25} className="text-[#9b775e]" /><h1 className="serif mt-5 text-[30px] text-[#333630]">Undangan belum tersedia.</h1><p className="mt-2 text-sm text-[#817970]">{error || "Tautan mungkin belum aktif atau tidak ditemukan."}</p><Button as={Link} href="/" radius="full" className="mt-6 bg-[#355747] px-5 text-xs text-white">Kembali ke Ucapin</Button></main>;

  const bride = contentText(invitation.content, "bride", "Mempelai");
  const groom = contentText(invitation.content, "groom", "Pasangan");
  const date = contentText(invitation.content, "date", "Tanggal acara");
  const venue = contentText(invitation.content, "venue", "Lokasi acara");
  const image = invitation.template?.imageUrl ?? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85";
  const rsvpForm = (
    <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#dfe2d7] bg-[#f7f5ec] p-6 text-left sm:p-8">
      <form onSubmit={sendRsvp} className="space-y-4">
        <label className="block text-[11px] text-[#625f57]">Nama<input required maxLength={100} value={guestName} onChange={(event) => setGuestName(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#d8dccf] bg-white px-3 text-sm outline-none focus:border-[#71846d]" placeholder="Nama lengkap" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[11px] text-[#625f57]">Konfirmasi<select value={attendance} onChange={(event) => setAttendance(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#d8dccf] bg-white px-3 text-xs outline-none focus:border-[#71846d]"><option value="ATTENDING">Hadir</option><option value="NOT_ATTENDING">Tidak hadir</option><option value="MAYBE">Belum pasti</option></select></label>
          <label className="block text-[11px] text-[#625f57]">Jumlah tamu<select value={guestCount} onChange={(event) => setGuestCount(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#d8dccf] bg-white px-3 text-xs outline-none focus:border-[#71846d]">{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} orang</option>)}</select></label>
        </div>
        <label className="block text-[11px] text-[#625f57]">Ucapan (opsional)<textarea maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1.5 min-h-20 w-full resize-y rounded-xl border border-[#d8dccf] bg-white p-3 text-sm outline-none focus:border-[#71846d]" placeholder="Tulis doa baikmu..." /></label>
        {feedback && <p role="status" className="flex items-start gap-2 rounded-lg bg-[#edf3eb] p-3 text-xs leading-5 text-[#45634a]"><Check size={14} className="mt-0.5 shrink-0" />{feedback}</p>}
        {error && <p role="alert" className="rounded-lg bg-[#fbefec] p-3 text-xs leading-5 text-[#9a4438]">{error}</p>}
        <Button type="submit" isLoading={sending} radius="full" className="h-11 w-full bg-[#415a41] text-xs text-white">Kirim konfirmasi</Button>
      </form>
    </div>
  );

  if (invitation.template?.slug === "seruni") {
    return <BohoFloralInvitation bride={bride} groom={groom} date={date} venue={venue} imageUrl={image}>{rsvpForm}</BohoFloralInvitation>;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between bg-[#282d28]/35 px-5 text-white backdrop-blur-md sm:px-8">
        <span className="serif text-[23px]">ucapin<span className="text-[#e7b49a]">.</span></span>
        <span className="rounded-full border border-white/40 bg-black/15 px-3 py-1.5 text-[9px] uppercase tracking-[1px]">Undangan</span>
      </header>
      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden px-5 py-28 text-center text-white">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#202720]/50 via-[#202720]/20 to-[#202720]/80" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[4px] text-white/85">Dengan penuh sukacita</p>
          <h1 className="serif mt-7 text-[54px] font-normal leading-[1.05] tracking-[-1px] sm:text-[76px]">{bride} <i className="text-[#efcfb9]">&amp;</i> {groom}</h1>
          <div className="mx-auto my-7 h-px w-14 bg-white/70" />
          <p className="serif text-[19px] italic text-white/90">Kami mengundang keluarga dan sahabat<br className="hidden sm:block" /> untuk merayakan hari istimewa bersama kami.</p>
          <p className="mt-6 text-[11px] uppercase tracking-[2.4px]">{date}</p>
          <a href="#detail-acara" className="mt-9 inline-flex h-12 items-center rounded-full border border-white/60 bg-white/10 px-7 text-xs text-white backdrop-blur-sm hover:bg-white/20">Lihat detail acara</a>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-white/30 sm:inset-6" />
      </section>
      <section id="detail-acara" className="mx-auto max-w-[900px] px-5 py-16 text-center sm:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#9b775e]">Hari bahagia kami</p>
        <h2 className="serif mt-4 text-[36px] text-[#344236] sm:text-[46px]">{bride} &amp; {groom}</h2>
        <p className="mx-auto mt-4 max-w-[520px] text-sm leading-7 text-[#817970]">Terima kasih telah menjadi bagian dari perjalanan kami. Kehadiran dan doa baikmu adalah hadiah yang berarti bagi kami.</p>
        <div className="mx-auto mt-9 grid max-w-[600px] gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-6"><CalendarDays size={19} className="mx-auto text-[#54715c]" /><p className="serif mt-3 text-[20px] text-[#383c35]">Tanggal</p><p className="mt-2 text-xs text-[#817970]">{date}</p></div>
          <div className="rounded-2xl border border-[#ebe5db] bg-[#fffdf9] p-6"><MapPin size={19} className="mx-auto text-[#54715c]" /><p className="serif mt-3 text-[20px] text-[#383c35]">Lokasi</p><p className="mt-2 text-xs text-[#817970]">{venue}</p></div>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-[#7b766e]"><Music2 size={14} /> Sebuah hari untuk dikenang bersama</div>
        <div className="mt-16">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#9b775e]">Mohon konfirmasi</p>
          <h3 className="serif mt-2 text-[28px] text-[#343730]">Bisakah kamu hadir?</h3>
        </div>
        {rsvpForm}
      </section>
      <footer className="bg-[#2e4035] px-5 py-7 text-center text-[10px] text-white/65">Dibuat dengan sepenuh hati di <Link href="/" className="font-semibold text-white">Ucapin</Link></footer>
    </main>
  );
}
