import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUpRight, CalendarDays, Flower2, Heart, MapPin, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  bride: string;
  groom: string;
  date: string;
  venue: string;
  imageUrl: string;
  preview?: boolean;
  editorHref?: string;
  children?: ReactNode;
};

function BotanicalSprig({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 180 240" fill="none" className={className}>
      <path d="M25 218C48 176 77 132 151 35" stroke="#718267" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M55 170C33 166 20 153 15 133C37 138 52 149 55 170Z" fill="#9EAE91" fillOpacity=".74" />
      <path d="M70 147C66 124 73 107 92 94C94 116 86 135 70 147Z" fill="#C5CFB9" fillOpacity=".88" />
      <path d="M89 120C65 116 52 103 47 82C69 88 84 100 89 120Z" fill="#87977B" fillOpacity=".72" />
      <path d="M107 96C102 74 110 57 128 43C131 66 124 84 107 96Z" fill="#B7C4A9" fillOpacity=".88" />
      <path d="M124 73C104 69 92 57 88 39C107 43 120 55 124 73Z" fill="#96A689" fillOpacity=".76" />
      <path d="M44 193C29 183 20 168 20 149M80 135C83 113 94 96 111 84M105 105C99 84 102 65 114 49" stroke="#718267" strokeWidth=".8" strokeLinecap="round" />
      <circle cx="149" cy="33" r="5" fill="#B87F64" fillOpacity=".8" />
      <circle cx="41" cy="177" r="3" fill="#B87F64" fillOpacity=".55" />
    </svg>
  );
}

export function BohoFloralCover({
  bride,
  groom,
  date,
  venue,
  imageUrl,
}: Omit<Props, "preview" | "editorHref" | "children">) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden bg-[#f3f0e6] px-5 py-7 text-center text-[#344638]">
      <BotanicalSprig className="absolute -left-7 top-4 w-[96px] -rotate-[22deg] opacity-70" />
      <BotanicalSprig className="absolute -bottom-4 -right-7 w-[90px] rotate-[154deg] opacity-70" />
      <p className="relative z-[1] text-[8px] uppercase tracking-[2px] text-[#7b866d]">Undangan pernikahan</p>
      <div className="relative mt-5 min-h-0 w-full max-w-[190px] flex-1 overflow-hidden rounded-t-[48%] rounded-b-[42px] border-[5px] border-[#f9f7ef] bg-[#dce2d5] shadow-[0_12px_35px_rgba(52,70,56,.14)]">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#213427]/65 via-transparent to-[#213427]/5" />
        <div className="absolute bottom-5 left-2 right-2 text-white">
          <p className="serif text-[23px] leading-tight">{bride}</p>
          <p className="serif my-1 text-[16px] italic text-[#d9c09f]">&amp;</p>
          <p className="serif text-[23px] leading-tight">{groom}</p>
        </div>
      </div>
      <p className="serif mt-5 text-[14px] text-[#57694f]">{date}</p>
      <p className="mt-1 max-w-[230px] truncate text-[8px] uppercase tracking-[1.4px] text-[#858a77]">{venue}</p>
      <span className="mt-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#415a41] text-[#f3f0e6]"><Heart size={13} /></span>
    </div>
  );
}

export function BohoFloralInvitation({
  bride,
  groom,
  date,
  venue,
  imageUrl,
  preview = false,
  editorHref = "/",
  children,
}: Props) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f0e6] text-[#344638]">
      <header className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-9 sm:py-7">
        {preview ? (
          <Link href={editorHref} className="inline-flex items-center gap-2 text-[11px] text-[#66745d] hover:text-[#344638]">
            <ArrowLeft size={14} /> Kembali ke editor
          </Link>
        ) : (
          <span className="serif text-[23px] font-semibold tracking-[-1px] text-[#40563f]">ucapin<span className="text-[#b87f64]">.</span></span>
        )}
        <span className="hidden items-center gap-2 text-[9px] uppercase tracking-[2px] text-[#78836d] sm:flex">
          <Flower2 size={13} /> {preview ? "Pratinjau desain" : "Undangan pernikahan"}
        </span>
        {preview ? (
          <Link href={editorHref} className="rounded-full bg-[#415a41] px-4 py-2.5 text-[10px] text-white hover:bg-[#344a35]">Lanjut edit</Link>
        ) : (
          <a href="#rsvp" className="rounded-full border border-[#cbd0c1] px-4 py-2.5 text-[10px] text-[#52644d] transition hover:bg-[#e6e9dc]">Konfirmasi hadir</a>
        )}
      </header>

      <section className="relative mx-auto grid min-h-[690px] max-w-[1240px] items-center gap-8 px-5 pb-16 pt-4 sm:px-9 lg:min-h-[730px] lg:grid-cols-[.92fr_1.08fr] lg:gap-12 lg:pb-20">
        <div className="relative z-[1] order-2 pb-4 text-center lg:order-1 lg:pb-0 lg:text-left">
          <p className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[2.4px] text-[#8b765d]"><Sparkles size={13} /> Hari yang kami nantikan</p>
          <h1 className="serif mt-6 text-[51px] font-normal leading-[.98] tracking-[-2px] text-[#344638] sm:text-[70px] lg:text-[76px]">
            {bride}<br /><span className="ml-1 text-[37px] italic text-[#ad775e] sm:text-[47px]">&amp;</span><br />{groom}
          </h1>
          <div className="mx-auto mt-7 flex w-fit items-center gap-3 lg:mx-0">
            <span className="h-px w-9 bg-[#aab29e]" /><Heart size={13} className="text-[#ad775e]" /><span className="h-px w-9 bg-[#aab29e]" />
          </div>
          <p className="serif mt-6 text-[19px] italic text-[#697660]">Satu langkah kecil menuju selamanya.</p>
          <p className="mt-4 text-[10px] uppercase tracking-[2px] text-[#858a77]">{date}</p>
          <a href="#detail-acara" className="mx-auto mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#415a41] px-6 text-[11px] text-white shadow-[0_8px_24px_rgba(52,70,56,.15)] transition hover:-translate-y-0.5 hover:bg-[#344a35] lg:mx-0">
            Jelajahi undangan <ArrowDown size={14} />
          </a>
          <p className="mt-7 text-[10px] tracking-[.2px] text-[#8a8d7e]">Dengan hangat, kami mengundang keluarga dan sahabat.</p>
        </div>

        <div className="relative order-1 mx-auto h-[430px] w-full max-w-[540px] sm:h-[545px] lg:order-2 lg:h-[625px]">
          <div aria-hidden className="absolute inset-[7%_5%_4%_13%] rotate-[3deg] rounded-t-[48%] rounded-b-[44%_12%] border border-[#b8c0ac]" />
          <div className="absolute inset-[3%_10%_8%_8%] overflow-hidden rounded-t-[48%] rounded-b-[44%_12%] bg-[#d9dfd0] shadow-[0_24px_70px_rgba(52,70,56,.14)]">
            <img src={imageUrl} alt={`Suasana floral untuk pernikahan ${bride} dan ${groom}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#213427]/55 via-transparent to-[#213427]/5" />
            <div className="absolute bottom-8 left-4 right-4 text-center text-white">
              <span className="text-[9px] uppercase tracking-[2.7px] text-white/85">Merayakan cinta</span>
              <p className="serif mt-2 text-[26px] italic sm:text-[32px]">{bride} &amp; {groom}</p>
            </div>
          </div>
          <BotanicalSprig className="absolute -left-2 top-[10%] w-[100px] -rotate-[18deg] sm:-left-4 sm:w-[135px] lg:-left-10" />
          <BotanicalSprig className="absolute -bottom-[1%] right-0 w-[104px] rotate-[156deg] sm:w-[142px] lg:-right-7" />
          <div className="absolute right-0 top-[14%] flex h-[62px] w-[62px] items-center justify-center rounded-full border border-[#d6d8cb] bg-[#f7f4eb] text-[#718267] shadow-sm sm:right-1 sm:h-[76px] sm:w-[76px]">
            <Flower2 size={25} strokeWidth={1.2} />
          </div>
          <div className="absolute bottom-[13%] left-0 rounded-full border border-white/80 bg-[#f7f4eb]/95 px-4 py-3 text-[9px] text-[#617057] shadow-lg backdrop-blur">
            <span className="flex items-center gap-2"><MapPin size={13} /> {venue}</span>
          </div>
        </div>
        <BotanicalSprig className="pointer-events-none absolute -right-10 top-4 hidden w-[145px] rotate-[26deg] opacity-40 lg:block" />
      </section>

      <section className="relative border-y border-[#e1dfd2] bg-[#e9ebdf] px-5 py-16 text-center sm:px-9 sm:py-20">
        <BotanicalSprig className="pointer-events-none absolute -left-8 top-1/2 hidden w-[145px] -translate-y-1/2 -rotate-[34deg] opacity-50 sm:block" />
        <p className="text-[9px] font-semibold uppercase tracking-[2.4px] text-[#8b765d]">Sebuah perayaan sederhana</p>
        <h2 className="serif mx-auto mt-4 max-w-[720px] text-[31px] font-normal leading-tight text-[#3d503e] sm:text-[42px]">
          “Hal terindah dari perjalanan ini adalah menemukan rumah di dalam satu sama lain.”
        </h2>
        <p className="mt-5 text-[10px] uppercase tracking-[1.7px] text-[#7b826f]">{bride} &amp; {groom}</p>
      </section>

      <section id="detail-acara" className="scroll-mt-8 px-5 py-16 sm:px-9 sm:py-24">
        <div className="mx-auto grid max-w-[1040px] gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-16">
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="absolute -inset-3 rotate-[-4deg] rounded-t-[48%] rounded-b-[18px] border border-[#bac2ae]" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[48%] rounded-b-[18px] bg-[#dce2d5]">
              <img src={imageUrl} alt="Detail suasana acara" className="h-full w-full object-cover object-center" loading="lazy" />
            </div>
            <span className="absolute -bottom-4 -right-3 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#415a41] text-[#f4f0e5] shadow-lg"><Heart size={22} strokeWidth={1.2} /></span>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[9px] font-semibold uppercase tracking-[2.2px] text-[#9a765c]">Catat tanggalnya</p>
            <h2 className="serif mt-3 text-[38px] font-normal leading-tight text-[#344638] sm:text-[48px]">Kami akan menikah.</h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[13px] leading-7 text-[#767b6c] lg:mx-0">
              Dengan penuh rasa syukur, kami ingin berbagi hari istimewa ini bersama orang-orang yang kami sayangi.
            </p>
            <div className="mt-8 border-y border-[#d9d9cc] py-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e8dc] text-[#64765c]"><CalendarDays size={19} /></span>
                <div className="text-center sm:text-left"><p className="text-[9px] uppercase tracking-[1.7px] text-[#8b8b7b]">Hari &amp; tanggal</p><p className="serif mt-1 text-[21px] text-[#3b4e3b]">{date}</p></div>
              </div>
              <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e8dc] text-[#64765c]"><MapPin size={19} /></span>
                <div className="text-center sm:text-left"><p className="text-[9px] uppercase tracking-[1.7px] text-[#8b8b7b]">Tempat perayaan</p><p className="serif mt-1 text-[21px] text-[#3b4e3b]">{venue}</p></div>
              </div>
            </div>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold text-[#526a4d] hover:underline">
              Buka petunjuk arah <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section id="rsvp" className="scroll-mt-6 bg-[#e9ebdf] px-5 py-16 sm:px-9 sm:py-20">
        <div className="mx-auto max-w-[740px] text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[2.4px] text-[#8b765d]">Akan sangat berarti</p>
          <h2 className="serif mt-3 text-[39px] font-normal text-[#344638] sm:text-[48px]">Sampaikan kabarmu.</h2>
          <p className="mt-3 text-[12px] leading-6 text-[#767b6c]">Mohon konfirmasi kehadiran agar kami dapat menyambutmu dengan hangat.</p>
          {children ?? (
            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-[#d5d9ca] bg-[#f5f3e9] px-4 py-3 text-[10px] text-[#737b68]"><Heart size={13} /> RSVP tersedia setelah undangan dipublikasikan.</div>
          )}
        </div>
      </section>

      <footer className="bg-[#344638] px-5 py-10 text-center text-[#e8e8d9] sm:px-9">
        <Heart size={17} className="mx-auto text-[#c59678]" />
        <p className="serif mt-3 text-[24px] italic">{bride} &amp; {groom}</p>
        <p className="mt-2 text-[9px] uppercase tracking-[1.8px] text-white/60">{date} · {venue}</p>
        <p className="mt-7 text-[9px] text-white/45">Dirangkai dengan sepenuh hati di Ucapin.</p>
      </footer>

      {preview && <div className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[540px] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-[#e4dfd2] bg-[#fffdf8]/95 px-4 py-3 shadow-[0_8px_40px_rgba(47,44,37,.16)] backdrop-blur">
        <div className="min-w-0"><p className="text-[10px] font-semibold text-[#49473f]">Pratinjau draft</p><p className="truncate text-[9px] text-[#8b857a]">Tampilan tamu setelah undangan diterbitkan.</p></div>
        <Link href={editorHref} className="shrink-0 rounded-full bg-[#415a41] px-4 py-2.5 text-[10px] text-white">Edit desain</Link>
      </div>}
    </main>
  );
}
