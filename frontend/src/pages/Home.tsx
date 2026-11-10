import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, shown };
}

const ink = "text-[#1d1d1f]";
const quiet = "text-[#6e6e73]";

function AxialResistor({ className = "h-14 w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 176 56" className={className} aria-hidden="true">
      <line x1="2" y1="28" x2="34" y2="28" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <line x1="142" y1="28" x2="174" y2="28" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <rect x="34" y="14" width="108" height="28" rx="14" fill="#f6e7cf" />
      <rect x="50" y="14.5" width="8" height="27" fill="var(--band-brown)" />
      <rect x="66" y="14.5" width="8" height="27" fill="#1d1d1f" />
      <rect x="82" y="14.5" width="8" height="27" fill="var(--band-orange)" />
      <rect x="114" y="14.5" width="10" height="27" fill="var(--gold)" />
      <rect x="34" y="14" width="108" height="28" rx="14" fill="none" stroke="#1d1d1f" strokeWidth="1.25" />
    </svg>
  );
}

function CeramicCap({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 88" className={className} aria-hidden="true">
      <line x1="28" y1="62" x2="22" y2="84" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="62" x2="50" y2="84" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="36" cy="34" rx="24" ry="28" fill="var(--ceramic)" />
      <ellipse cx="30" cy="28" rx="8" ry="12" fill="#ffffff" opacity="0.28" />
      <ellipse cx="36" cy="34" rx="24" ry="28" fill="none" stroke="#1d1d1f" strokeWidth="1.25" />
    </svg>
  );
}

function Led({ className = "h-16 w-12", color = "var(--band-red)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 88" className={className} aria-hidden="true">
      <line x1="24" y1="52" x2="18" y2="84" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="52" x2="46" y2="78" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
      <path className="led-dome" d="M14 40a18 18 0 0 1 36 0v8H14z" fill={color} />
      <path d="M22 28a8 10 0 0 1 10 8" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <rect x="14" y="46" width="36" height="8" rx="1" fill="#1d1d1f" opacity="0.18" />
    </svg>
  );
}

function DipChip({ className = "h-14 w-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 72" className={className} aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <rect x="8" y={10 + i * 14} width="14" height="5" rx="1" fill="#c8c8ce" stroke="#1d1d1f" strokeWidth="0.75" />
          <rect x="82" y={10 + i * 14} width="14" height="5" rx="1" fill="#c8c8ce" stroke="#1d1d1f" strokeWidth="0.75" />
        </g>
      ))}
      <rect x="22" y="6" width="60" height="60" rx="6" fill="#1d1d1f" />
      <circle cx="52" cy="16" r="3.5" fill="#3a3a3e" stroke="#6e6e73" strokeWidth="1" />
      <text x="52" y="44" textAnchor="middle" fill="#f5f5f7" fontSize="11" fontFamily="Inter, sans-serif">
        555
      </text>
    </svg>
  );
}

function PinHeader({ className = "h-14 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 64" className={className} aria-hidden="true">
      <rect x="6" y="24" width="68" height="14" rx="2" fill="#1d1d1f" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={14 + i * 10} y="8" width="4" height="46" rx="1" fill="var(--gold)" />
      ))}
    </svg>
  );
}

function Board({ className = "h-14 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 112 68" className={className} aria-hidden="true">
      <rect x="4" y="8" width="104" height="52" rx="8" fill="var(--mat)" />
      <rect x="16" y="20" width="34" height="24" rx="3" fill="#1d1d1f" />
      <circle className="led-dome" cx="74" cy="28" r="7" fill="var(--band-red)" />
      <circle cx="92" cy="28" r="5" fill="var(--gold)" />
      <circle cx="74" cy="46" r="4" fill="var(--ceramic)" />
    </svg>
  );
}

function PartTile({
  wash,
  label,
  delay = 0,
  children,
}: {
  wash: string;
  label: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="part-pop flex flex-col items-center rounded-2xl px-2 py-3"
      style={{ backgroundColor: wash, animationDelay: `${delay}ms` }}
    >
      <div className="flex h-14 w-full items-center justify-center">{children}</div>
      <p className={`mt-1 text-[11px] font-medium ${quiet}`}>{label}</p>
    </div>
  );
}

function PillLink({
  to,
  children,
  variant,
}: {
  to: string;
  children: ReactNode;
  variant: "solid" | "ghost" | "deep";
}) {
  const base =
    "inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium transition duration-200 ease-out active:scale-[0.98]";
  if (variant === "solid") {
    return (
      <Link
        to={to}
        className={`${base} bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:bg-white/90`}
        style={{ color: "var(--mat-deep)" }}
      >
        {children}
      </Link>
    );
  }
  if (variant === "ghost") {
    return (
      <Link
        to={to}
        className={`${base} border border-white/55 text-white hover:bg-white/10`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className={`${base} text-white hover:brightness-110`}
      style={{ backgroundColor: "var(--mat-deep)" }}
    >
      {children}
    </Link>
  );
}

function RevealGrid({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, shown } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal-grid ${className ?? ""}`} data-shown={shown ? "true" : "false"}>
      {children}
    </div>
  );
}

function FillBar() {
  const { ref, shown } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`bar-fill h-full w-[42%] rounded-full ${shown ? "is-in" : ""}`}
      style={{ backgroundColor: "var(--copper)" }}
    />
  );
}

function Status({ children, tone }: { children: ReactNode; tone: "ok" | "short" }) {
  const style =
    tone === "ok"
      ? { color: "var(--mat-deep)", backgroundColor: "#e7f6ec" }
      : { color: "var(--copper)", backgroundColor: "var(--copper-wash)" };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={style}>
      {children}
    </span>
  );
}

function Feature({
  to,
  title,
  body,
  visual,
  flip,
}: {
  to: string;
  title: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  const { ref, shown } = useInView<HTMLAnchorElement>();
  return (
    <Link
      ref={ref}
      to={to}
      className={`rise grid items-center gap-10 overflow-hidden rounded-[28px] bg-white px-6 py-12 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_22px_50px_rgba(0,0,0,0.08)] sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-20 lg:px-14 ${ink} ${shown ? "is-in" : ""}`}
    >
      <div className={flip ? "min-w-0 lg:order-2" : "min-w-0"}>
        <h2 className="max-w-md text-[2rem] font-light leading-[1.12] tracking-[-0.03em] sm:text-[2.5rem]">
          {title}
        </h2>
        <p className={`mt-4 max-w-md text-[17px] leading-[1.47] ${quiet}`}>{body}</p>
        <span
          className="mt-8 inline-flex h-10 items-center rounded-full px-4 text-[15px] font-medium text-white transition duration-200 hover:brightness-110"
          style={{ backgroundColor: "var(--mat-deep)" }}
        >
          Learn more
        </span>
      </div>
      <div className={flip ? "w-full max-w-[28rem] lg:order-1 lg:mr-auto" : "w-full max-w-[28rem] lg:ml-auto"}>
        {visual}
      </div>
    </Link>
  );
}

const details: [string, string][] = [
  ["Quantity", "A count, a unit, and a low-stock line you set per part."],
  ["Location", "Cabinets, drawers, and bins, nested as deep as the shop needs."],
  ["Identity", "Manufacturer, MPN, value, and package, next to the name."],
  ["Datasheets", "A datasheet link, plus one-click searches on the usual suppliers."],
  ["Projects", "Which builds use the part, and how many they still need."],
  ["Photos", "The picture you scanned, kept with the record."],
];

const detailTones = [
  "var(--wash-resistor)",
  "var(--wash-cap)",
  "var(--wash-chip)",
  "var(--copper-wash)",
  "var(--wash-ok, #e7f6ec)",
  "var(--wash-led)",
];

const kinds: [string, string, string, ReactNode][] = [
  ["Resistors", "Banded by value, filed by package.", "var(--wash-resistor)", <AxialResistor key="r" className="h-12 w-full" />],
  ["Capacitors", "Ceramic discs and the tall electrolytics.", "var(--wash-cap)", <CeramicCap key="c" />],
  ["LEDs", "Color, size, and how bright they run.", "var(--wash-led)", <Led key="l" />],
  ["Chips", "Timers, regulators, and the odd microcontroller.", "var(--wash-chip)", <DipChip key="d" />],
  ["Connectors", "Headers, jacks, and the wire between them.", "var(--copper-wash)", <PinHeader key="n" />],
  ["Modules", "Boards you build a project around.", "#e7f6ec", <Board key="m" />],
];

const cameras: [string, string, string, ReactNode][] = [
  [
    "A webcam",
    "The Scan page uses the camera in the browser. A laptop webcam is enough to start.",
    "var(--wash-chip)",
    <span key="cam" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d1d1f]"><span className="led-dome h-7 w-7 rounded-full" style={{ backgroundColor: "var(--ceramic)" }} /></span>,
  ],
  [
    "A Raspberry Pi",
    "Leave a Pi and a camera pointed at a sorting tray and post each shot to the same app.",
    "#e7f6ec",
    <Board key="pi" />,
  ],
  [
    "An ESP32-CAM",
    "A small Wi-Fi board over a bin. Press a button and it sends a photo.",
    "var(--copper-wash)",
    <span key="esp" className="flex h-16 w-20 items-center justify-center gap-1 rounded-md bg-[#1d1d1f]"><span className="h-6 w-6 rounded-sm bg-white" /><span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: "var(--gold)" }} /></span>,
  ],
];

const footer: [string, [string, string][]][] = [
  [
    "Use",
    [
      ["Inventory", "/inventory"],
      ["Scan", "/scan"],
      ["Dashboard", "/dashboard"],
    ],
  ],
  [
    "Organize",
    [
      ["Locations", "/locations"],
      ["Projects", "/projects"],
    ],
  ],
  [
    "Run",
    [["Settings", "/settings"]],
  ],
];

export default function Home() {
  const closer = useInView<HTMLElement>();
  const foot = useInView<HTMLElement>();

  return (
    <div className="-mx-4 -mt-4 flex flex-1 flex-col sm:-mx-6 sm:-mt-6">
      <section className="flex min-h-screen flex-col justify-end px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <div className="settle min-w-0 max-w-3xl">
            <p className="text-[13px] font-medium text-white/75">SnapBin</p>
            <h1 className="mt-3 text-5xl font-light leading-[1.05] tracking-[-0.035em] text-white sm:text-7xl">
              An inventory
              <span className="mt-1 block">for your bench.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.47] text-white/85 sm:text-lg">
              Photograph a component and SnapBin suggests what it is. File it in
              a bin with a count, then see which projects are still short before
              you start soldering.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink to="/inventory" variant="solid">
                Open inventory
              </PillLink>
              <PillLink to="/scan" variant="ghost">
                Scan a part
              </PillLink>
            </div>
          </div>

          <div className="hero-float w-full min-w-0 max-w-[30rem] lg:justify-self-end">
          <div className={`settle overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.16)] ${ink}`} style={{ animationDelay: "120ms" }}>
            <div className="grid grid-cols-4 gap-2 bg-[#f7f7f8] p-3">
              <PartTile delay={180} wash="var(--wash-resistor)" label="10k">
                <AxialResistor className="h-8 w-full" />
              </PartTile>
              <PartTile delay={280} wash="var(--wash-cap)" label="100µF">
                <CeramicCap className="h-12 w-10" />
              </PartTile>
              <PartTile delay={380} wash="var(--wash-led)" label="LED">
                <Led className="h-12 w-8" />
              </PartTile>
              <PartTile delay={480} wash="var(--wash-chip)" label="NE555">
                <DipChip className="h-10 w-16" />
              </PartTile>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className={`text-[13px] ${quiet}`}>Just scanned</p>
                <Status tone="ok">In stock</Status>
              </div>
              <p className="mt-3 text-[1.65rem] font-light leading-none tracking-[-0.03em]">
                10k Ohm Resistor
              </p>
              <p className={`mt-2 text-sm ${quiet}`}>Drawer 1 · 42 pieces</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <div className="-mt-16 flex flex-col gap-5 px-4 pb-5 sm:px-6 lg:px-10">
        <Feature
          to="/scan"
          title="Recognize it from a photo."
          body="A picture comes back as a name, value, and package, so you are not copying the label by hand."
          visual={
            <div className="overflow-hidden rounded-[24px] bg-[var(--wash-resistor)]">
              <div className="flex h-36 items-center px-4">
                <AxialResistor className="h-16 w-full" />
              </div>
              <div className="flex gap-3 px-6 pb-5">
                {[
                  ["var(--band-brown)", "1"],
                  ["#1d1d1f", "0"],
                  ["var(--band-orange)", "×1k"],
                  ["var(--gold)", "5%"],
                ].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="bg-white px-6 py-5">
                <p className={`text-[13px] ${quiet}`}>Identified</p>
                <p className="mt-1 text-xl font-medium tracking-[-0.02em]">10k Ohm Resistor</p>
                <p className={`mt-1 text-sm ${quiet}`}>10 kΩ · 0805 · Yageo</p>
              </div>
            </div>
          }
        />
        <Feature
          to="/inventory"
          flip
          title="Keep a count, and a place."
          body="Every part has a bin and a quantity. When the count drops under your line, it shows up as low stock."
          visual={
            <div className="rounded-[24px] bg-[#f5f5f7] p-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["R", "120", "var(--mat)", "#ffffff"],
                  ["C", "64", "var(--ceramic)", "#ffffff"],
                  ["LED", "42", "var(--copper)", "#ffffff"],
                  ["IC", "18", "var(--gold)", "#1d1d1f"],
                ].map(([label, count, color, fg]) => (
                  <div key={label} className="rounded-2xl px-2 py-3" style={{ backgroundColor: color, color: fg }}>
                    <p className="text-[11px] font-medium opacity-80">{label}</p>
                    <p className="mt-2 text-xl font-light tracking-[-0.03em]">{count}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-5">
              <p className={`text-[13px] ${quiet}`}>On hand</p>
              <p className="mt-1 text-6xl font-light tracking-[-0.04em]">42</p>
              <p className={`mt-3 flex flex-wrap items-center gap-2 text-sm ${quiet}`}>
                pieces
                <Status tone="short">Low under 100</Status>
              </p>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black/5">
                <FillBar />
              </div>
              <p className="mt-5 text-sm font-medium">Drawer 1 — Resistors</p>
              </div>
            </div>
          }
        />
        <Feature
          to="/projects"
          title="See what a build still needs."
          body="A project holds a bill of materials. Shortages are visible before you start, and building can take the parts out of stock."
          visual={
            <div className="rounded-[24px] bg-[#f5f5f7] p-3">
              <p className={`px-4 pb-2 pt-3 text-[13px] ${quiet}`}>LED blinker</p>
              {[
                ["Red LED", "5 of 5", "var(--wash-led)", <Led key="row-led" className="h-8 w-6" />],
                ["10k resistor", "2 of 2", "var(--wash-resistor)", <AxialResistor key="row-r" className="h-6 w-16" />],
              ].map(([name, count, wash, art]) => (
                <div key={name as string} className="mt-2 flex items-center justify-between rounded-2xl bg-white px-3 py-2.5">
                  <span className="flex items-center gap-3 text-[15px]">
                    <span className="flex h-9 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: wash as string }}>
                      {art}
                    </span>
                    {name}
                  </span>
                  <span className={`text-sm ${quiet}`}>{count as string}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-2xl bg-white px-3 py-2.5">
                <span className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-9 w-12 items-center justify-center rounded-xl bg-[var(--wash-chip)]">
                    <DipChip className="h-7 w-10" />
                  </span>
                  NE555
                </span>
                <Status tone="short">Short 1</Status>
              </div>
            </div>
          }
        />

      <section className={`overflow-hidden rounded-[28px] bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-14 ${ink}`}>
        <h2 className="max-w-xl text-[2rem] font-light leading-[1.12] tracking-[-0.03em] sm:text-[2.5rem]">
          A color for every drawer.
        </h2>
        <p className={`mt-4 max-w-xl text-[17px] leading-[1.47] ${quiet}`}>
          Resistors, capacitors, chips, and the boards you build around. Each
          kind keeps its own count.
        </p>
        <RevealGrid className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kinds.map(([name, body, wash, art]) => (
            <div key={name} className="rounded-[22px] px-5 py-5" style={{ backgroundColor: wash }}>
              <div className="flex h-20 items-center justify-center">{art}</div>
              <h3 className="mt-2 text-[17px] font-medium tracking-[-0.02em]">{name}</h3>
              <p className={`mt-1 text-sm leading-relaxed ${quiet}`}>{body}</p>
            </div>
          ))}
        </RevealGrid>
      </section>

      <section className={`overflow-hidden rounded-[28px] bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-14 ${ink}`}>
        <h2 className="max-w-xl text-[2rem] font-light leading-[1.12] tracking-[-0.03em] sm:text-[2.5rem]">
          A part record holds more than a name.
        </h2>
        <p className={`mt-4 max-w-xl text-[17px] leading-[1.47] ${quiet}`}>
          Once something is in the inventory, the details you actually look up
          live on the same page.
        </p>
        <RevealGrid className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([title, body], index) => (
            <div key={title} className="rounded-[22px] px-6 py-6" style={{ backgroundColor: detailTones[index] }}>
              <dt className={`text-[13px] ${quiet}`}>{title}</dt>
              <dd className="mt-2 text-[17px] font-medium leading-snug tracking-[-0.02em]">{body}</dd>
            </div>
          ))}
        </RevealGrid>
      </section>

      <section className={`overflow-hidden rounded-[28px] bg-white px-6 py-14 sm:px-10 sm:py-16 lg:px-14 ${ink}`}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[2rem] font-light leading-[1.12] tracking-[-0.03em] sm:text-[2.5rem]">
              Use the camera you already have.
            </h2>
            <p className={`mt-4 text-[17px] leading-[1.47] ${quiet}`}>
              SnapBin takes a JPEG. Start with a laptop webcam, then leave a
              camera on the bench if you want one there.
            </p>
          </div>
          <PillLink to="/scan" variant="deep">
            Scan a part
          </PillLink>
        </div>
        <RevealGrid className="mt-12 grid gap-3 md:grid-cols-3">
          {cameras.map(([title, body, wash, art]) => (
            <div key={title} className="rounded-[22px] px-6 py-6" style={{ backgroundColor: wash }}>
              <div className="flex h-20 items-center">{art}</div>
              <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em]">{title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${quiet}`}>{body}</p>
            </div>
          ))}
        </RevealGrid>
      </section>
      </div>

      <section
        ref={closer.ref}
        className={`rise px-4 py-28 sm:px-6 lg:px-10 ${closer.shown ? "is-in" : ""}`}
      >
        <h2 className="max-w-3xl text-4xl font-light leading-[1.1] tracking-[-0.035em] text-white sm:text-5xl">
          The inventory stays on hardware you run.
        </h2>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.47] text-white/85 sm:text-lg">
          SnapBin is one web app with one URL, MIT licensed. The database and
          the photos live on a machine you control, not in someone else’s
          account.
        </p>
        <div className="mt-8">
          <PillLink to="/settings" variant="solid">
            Open settings
          </PillLink>
        </div>
      </section>

      <footer
        ref={foot.ref}
        className={`rise mx-4 mb-4 overflow-hidden rounded-[28px] bg-white px-6 py-12 sm:mx-6 sm:px-10 lg:mx-10 lg:px-14 ${ink} ${foot.shown ? "is-in" : ""}`}
      >
        <div className="grid gap-10 sm:grid-cols-3">
          {footer.map(([heading, links]) => (
            <div key={heading}>
              <p className={`text-[13px] ${quiet}`}>{heading}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(([label, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-[15px] text-[#1d1d1f] transition-colors duration-200 hover:text-[var(--mat-deep)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={`mt-12 text-sm ${quiet}`}>SnapBin · MIT licensed</p>
      </footer>
    </div>
  );
}
