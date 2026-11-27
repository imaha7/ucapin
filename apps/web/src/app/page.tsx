"use client";

import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Flower2,
  Heart,
  MapPin,
  Menu,
  Music2,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatRupiah, templates } from "@/lib/templates";

const categories = ["Semua", "Boho", "Rustic", "Floral", "Minimalis", "Tradisional", "Modern"];

function photoUrl(id: string, width = 750) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}

export default function Home() {
  const [category, setCategory] = useState("Semua");
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = useMemo(
    () => category === "Semua" ? templates : templates.filter((item) => item.category === category),
    [category],
  );

  return (
    <main className="overflow-hidden">
      <header className="relative z-20 border-b border-[#e9e3da] bg-[#fbf8f3]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="serif text-[28px] font-semibold tracking-[-1.5px] text-[#355747]">
            ucapin<span className="text-[#bd8065]">.</span>
          </Link>
          <nav className="hidden items-center gap-9 text-[13px] text-[#5f5a53] md:flex">
            <a href="#templates" className="transition hover:text-[#355747]">Galeri</a>
            <a href="#cara-kerja" className="transition hover:text-[#355747]">Cara kerja</a>
            <a href="#harga" className="transition hover:text-[#355747]">Harga</a>
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/login" className="text-[13px] text-[#5f5a53] hover:text-[#355747]">Masuk</Link>
            <Button as={Link} href="#templates" radius="full" className="h-11 bg-[#355747] px-6 text-[13px] font-medium text-white shadow-none hover:bg-[#294638]">
              Buat undangan <ArrowUpRight size={15} className="ml-1" />
            </Button>
          </div>
          <button aria-label={menuOpen ? "Tutup menu" : "Buka menu"} onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 text-[#355747] md:hidden">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && <div className="border-t border-[#e9e3da] bg-[#fbf8f3] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5 text-sm">
            <a onClick={() => setMenuOpen(false)} href="#templates">Galeri template</a>
            <a onClick={() => setMenuOpen(false)} href="#cara-kerja">Cara kerja</a>
            <a onClick={() => setMenuOpen(false)} href="#harga">Harga</a>
            <Link onClick={() => setMenuOpen(false)} href="/login">Masuk / Daftar</Link>
            <Button as={Link} href="#templates" radius="full" className="bg-[#355747] text-white">Buat undangan</Button>
          </div>
        </div>}
      </header>

      <section className="hero-grid relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf8f3] via-[#fbf8f3]/95 to-[#fbf8f3]/65" />
        <div className="relative mx-auto grid min-h-[680px] max-w-[1320px] items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:py-16">
          <div className="max-w-[550px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce4da] bg-[#f7f8f3] px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.4px] text-[#496b56]">
              <Sparkles size={13} /> Cara baru merayakan cinta
            </div>
            <h1 className="serif text-[50px] font-normal leading-[1.08] tracking-[-2.8px] text-[#2e322d] sm:text-[64px] lg:text-[70px]">
              Hari bahagiamu,<br />cerita <i className="text-[#a76d56]">paling indah.</i>
            </h1>
            <p className="mt-6 max-w-[455px] text-[15px] leading-7 text-[#777168] sm:text-[16px]">
              Buat undangan digital yang terasa seperti kalian. Cantik, personal, dan siap dibagikan ke orang-orang tersayang.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} href="#templates" radius="full" className="h-[52px] bg-[#355747] px-7 text-sm font-medium text-white shadow-[0_8px_24px_rgba(53,87,71,.18)] hover:bg-[#294638]">
                Temukan desainmu <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button as="a" href="#cara-kerja" variant="bordered" radius="full" className="h-[52px] border-[#ded8ce] px-6 text-sm text-[#4c4943]">
                <Play size={14} fill="currentColor" className="mr-2" /> Lihat cara kerja
              </Button>
            </div>
            <div className="mt-9 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["photo-1534528741775-53994a69daeb","photo-1500648767791-00dcc994a43e","photo-1531123897727-8f129e1688ce"].map((id) =>
                  <img key={id} src={photoUrl(id, 80)} alt="" className="h-8 w-8 rounded-full border-2 border-[#fbf8f3] object-cover" />,
                )}
              </div>
              <p className="text-xs text-[#817970]"><b className="font-semibold text-[#49453f]">2.400+</b> pasangan sudah bercerita</p>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-[#817970]">
              {["Gratis mulai", "Tanpa biaya bulanan", "Siap dalam 10 menit"].map((text) => <span key={text} className="flex items-center gap-1.5"><Check size={13} className="text-[#54715c]" />{text}</span>)}
            </div>
          </div>
          <div className="relative mx-auto h-[450px] w-full max-w-[570px] sm:h-[525px]">
            <div className="absolute left-[3%] top-[13%] h-[73%] w-[51%] overflow-hidden rounded-[180px_180px_12px_12px] border-[7px] border-white bg-[#e8d8ca] shadow-[0_25px_70px_rgba(65,49,35,.14)] sm:left-[5%] sm:top-[9%]">
              <img src={photoUrl("photo-1519741497674-611481863552", 850)} alt="Dekorasi pernikahan di taman" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d201b]/55 via-transparent to-[#1d201b]/5" />
              <div className="absolute bottom-8 left-0 right-0 text-center text-white">
                <p className="serif text-[33px] italic">Nadia &amp; Arga</p>
                <p className="mt-2 text-[9px] uppercase tracking-[3px]">08 . 08 . 2026</p>
              </div>
            </div>
            <div className="absolute right-[1%] top-[4%] w-[45%] rotate-[4deg] rounded-[26px] border-[5px] border-white bg-[#fffdf9] p-3 shadow-[0_25px_65px_rgba(65,49,35,.16)] sm:right-[2%] sm:top-[3%]">
              <div className="relative h-[260px] overflow-hidden rounded-[18px] sm:h-[320px]">
                <img src={photoUrl("photo-1523438885200-e635ba2c371e", 600)} alt="Contoh tampilan undangan digital" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-2 right-2 text-center text-white">
                  <p className="serif text-[23px]">The Wedding</p>
                  <p className="mt-1 text-[9px] tracking-[2px]">NADIA &amp; ARGA</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1 pt-3">
                <span className="serif text-[13px] italic text-[#4e5e50]">A little forever</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7eee6] text-[#526c57]"><Heart size={13} fill="currentColor" /></span>
              </div>
            </div>
            <div className="absolute bottom-[5%] left-[0%] rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9eee7] text-[#54715c]"><Music2 size={16} /></div>
                <div><p className="text-[10px] font-semibold text-[#45453e]">Lagu kenangan kalian</p><p className="mt-1 text-[9px] text-[#938b7f]">Tersimpan di setiap cerita</p></div>
              </div>
            </div>
            <div className="absolute bottom-[16%] right-[4%] flex items-center gap-2 rounded-full bg-[#fffdf9] px-3 py-2 shadow-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1e4dc] text-[#a46f57]"><MapPin size={14} /></span>
              <span className="text-[10px] text-[#625d54]">Lokasi acara, satu ketuk</span>
            </div>
            <div className="absolute right-[2%] top-[48%] -z-0 flex h-12 w-12 items-center justify-center rounded-full border border-[#d6dfd4] bg-[#e7eee6] text-[#5f755f]"><Flower2 size={21} /></div>
          </div>
        </div>
        <a href="#templates" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[2px] text-[#9b9388] md:flex">Jelajahi template <ArrowDown size={13} /></a>
      </section>

      <section id="templates" className="scroll-mt-5 bg-[#f7f4ee] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#9b775e]">Koleksi pilihan</p>
              <h2 className="serif text-[38px] font-normal tracking-[-1.2px] text-[#33342e] sm:text-[46px]">Temukan yang terasa <i className="text-[#a76d56]">seperti kalian.</i></h2>
              <p className="mt-3 text-sm text-[#817970]">Setiap kisah punya cara sendiri untuk dirayakan.</p>
            </div>
            <Link href="#templates" className="inline-flex items-center gap-2 text-xs font-medium text-[#42604d] hover:gap-3">Lihat semua desain <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => <Button key={item} size="sm" radius="full" variant={category === item ? "solid" : "bordered"} onPress={() => setCategory(item)} className={category === item ? "h-9 shrink-0 bg-[#355747] px-4 text-[11px] text-white" : "h-9 shrink-0 border-[#e3ddd3] bg-transparent px-4 text-[11px] text-[#746e65]"}>{item}</Button>)}
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="template-card group overflow-hidden rounded-[18px] border border-[#ebe5db] bg-[#fffdf9]">
                <Link href={`/editor?template=${item.id}`} className="relative block h-[300px] overflow-hidden bg-[#e9e4dc] sm:h-[320px]">
                  <img src={photoUrl(item.image)} alt={`Desain undangan ${item.title}`} className="template-photo h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5 opacity-80" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[1px] text-[#514a40] backdrop-blur">{item.category}</span>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                    <div><p className="serif text-[25px]">{item.title}</p><p className="mt-1 text-[11px] text-white/80">{item.description}</p></div>
                    <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white group-hover:text-[#355747]"><ArrowUpRight size={16} /></span>
                  </div>
                </Link>
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-[11px] text-[#817970]">Mulai <span className="ml-1 font-semibold text-[#383832]">{formatRupiah(item.price)}</span></p>
                  <Link href={`/editor?template=${item.id}`} className="text-[11px] font-semibold text-[#496b56] hover:underline">Coba desain <ArrowRight size={12} className="ml-1 inline" /></Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center"><Button as={Link} href="/editor" variant="bordered" radius="full" className="border-[#dcd5ca] px-7 text-xs text-[#4e5f50]">Jelajahi semua template <ArrowRight size={14} className="ml-2" /></Button></div>
        </div>
      </section>

      <section id="cara-kerja" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1320px]">
          <div className="mx-auto max-w-[580px] text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#9b775e]">Semudah itu</p>
            <h2 className="serif text-[40px] font-normal tracking-[-1.2px] text-[#33342e] sm:text-[48px]">Dari ide ke hari <i className="text-[#a76d56]">istimewa.</i></h2>
            <p className="mt-4 text-sm leading-6 text-[#817970]">Semua yang kalian butuhkan, tanpa ribet. Fokus pada cerita kalian, biar kami bantu sisanya.</p>
          </div>
          <div className="mt-14 grid gap-9 sm:grid-cols-3 sm:gap-7">
            {[
              { number: "01", title: "Pilih desain", text: "Temukan template yang paling mewakili cerita dan suasana hari spesial kalian.", icon: Flower2 },
              { number: "02", title: "Jadikan milikmu", text: "Isi detail acara, tambahkan foto dan cerita. Lihat hasilnya secara langsung.", icon: Heart },
              { number: "03", title: "Bagikan bahagia", text: "Sebarkan tautan undangan ke orang tersayang. RSVP dan ucapan terkumpul rapi.", icon: ArrowUpRight },
            ].map((step) => <div key={step.number} className="relative border-t border-[#e5ded4] pt-6">
              <span className="serif absolute right-0 top-3 text-[44px] text-[#ece6dd]">{step.number}</span>
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#e9eee7] text-[#54715c]"><step.icon size={18} /></span>
              <h3 className="serif text-[24px] text-[#363730]">{step.title}</h3>
              <p className="mt-2 max-w-[310px] text-[13px] leading-6 text-[#817970]">{step.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="harga" className="bg-[#e9eee7] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <Chip size="sm" className="mb-4 bg-white/70 text-[10px] text-[#506c56]">Sederhana dan transparan</Chip>
            <h2 className="serif max-w-[520px] text-[39px] leading-tight text-[#303c32] sm:text-[48px]">Cinta tak ternilai.<br /><i className="text-[#a76d56]">Undangannya tetap terjangkau.</i></h2>
            <p className="mt-4 max-w-[450px] text-sm leading-6 text-[#6e776d]">Mulai gratis, bebas edit sampai puas. Bayar sekali untuk membuat undangan aktif selamanya.</p>
          </div>
          <div className="min-w-[280px] rounded-[20px] border border-white/70 bg-[#fffdf9] p-7 shadow-[0_16px_50px_rgba(47,59,46,.08)] sm:min-w-[340px] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#8c887f]">Mulai dari</p>
            <p className="serif mt-2 text-[42px] text-[#344b3b]">Rp99.000</p>
            <p className="mt-1 text-xs text-[#837d74]">sekali bayar · tanpa biaya bulanan</p>
            <div className="my-5 border-t border-[#eee9e0]" />
            <ul className="space-y-3 text-xs text-[#625f57]">
              {["Semua template & bebas ganti desain", "RSVP, galeri, dan peta lokasi", "Link undangan personal selamanya"].map((item) => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#54715c]" />{item}</li>)}
            </ul>
            <Button as={Link} href="#templates" radius="full" className="mt-7 h-12 w-full bg-[#355747] text-xs font-medium text-white">Mulai buat undangan <ArrowRight size={14} className="ml-2" /></Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#2e4035] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div><Link href="/" className="serif text-[27px] tracking-[-1px]">ucapin<span className="text-[#d59b7f]">.</span></Link><p className="mt-1 text-[11px] text-white/60">Satu cerita, banyak cara untuk merayakan.</p></div>
          <p className="text-[10px] text-white/55">© 2026 Ucapin. Dibuat dengan sepenuh hati.</p>
          <div className="flex gap-5 text-[11px] text-white/70"><a href="#templates" className="hover:text-white">Template</a><a href="#cara-kerja" className="hover:text-white">Tentang kami</a><a href="mailto:hallo@ucapin.id" className="hover:text-white">Kontak</a></div>
        </div>
      </footer>
    </main>
  );
}
