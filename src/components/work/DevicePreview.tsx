import Image from "next/image";
import type { ProjectImage, ProjectPreview } from "@/data/portfolio";

/**
 * Stand-in interfaces for the work gallery.
 *
 * There are no store screenshots for these apps, and an empty device frame
 * says less than no frame at all. So each project draws a small, recognisable
 * version of its own product surface — enough shape and wording that the kind
 * of app registers at a glance, without pretending to be a real screenshot.
 *
 * The chrome changes with the project too: a phone for the apps, a browser for
 * the Flutter Web build, a console for the Laravel service. That is the fastest
 * way to read what kind of thing each project is.
 *
 * Three of the apps are on the stores, and their listings ship the screenshot
 * already mounted in a device render. Those are used as-is at the same width as
 * the drawn phone, so a card with a real screenshot and a card without still
 * read as the same object.
 */

/* ── Chrome ─────────────────────────────────────────────────────────────── */

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[9/18.5] w-[178px] rounded-[1.7rem] border border-bone/20 bg-ink p-[5px] shadow-[0_28px_60px_-26px_rgb(0_0_0/0.95)]">
      <div className="relative h-full w-full overflow-hidden rounded-[1.4rem] bg-ink-soft">
        {/* Dynamic island */}
        <span className="absolute top-[7px] left-1/2 z-20 h-[9px] w-[42px] -translate-x-1/2 rounded-full bg-ink" />
        <div className="flex h-full flex-col pt-[22px]">{children}</div>
      </div>
    </div>
  );
}

function Browser({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[268px] overflow-hidden rounded-xl border border-bone/20 bg-ink shadow-[0_28px_60px_-26px_rgb(0_0_0/0.95)]">
      <div className="flex items-center gap-1.5 border-b border-line px-2.5 py-2">
        <span className="h-[5px] w-[5px] rounded-full bg-bone/25" />
        <span className="h-[5px] w-[5px] rounded-full bg-bone/25" />
        <span className="h-[5px] w-[5px] rounded-full bg-bone/25" />
        <span className="ml-1.5 flex-1 rounded-full bg-ink-soft px-2 py-[3px] text-center font-mono text-[6px] text-mute">
          doctorbox.app
        </span>
      </div>
      <div className="aspect-[16/11] bg-ink-soft">{children}</div>
    </div>
  );
}

function Console({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[268px] overflow-hidden rounded-xl border border-bone/20 bg-ink shadow-[0_28px_60px_-26px_rgb(0_0_0/0.95)]">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="h-[5px] w-[5px] rounded-full bg-blue/70" />
        <span className="font-mono text-[6px] tracking-widest text-mute uppercase">
          api / v1
        </span>
      </div>
      <div className="aspect-[16/11] bg-ink-soft p-3">{children}</div>
    </div>
  );
}

/* ── Shared parts ───────────────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 pb-1.5 font-mono text-[6px] text-mute">
      <span>9:41</span>
      <span className="flex gap-[3px]">
        <span className="h-[3px] w-[3px] rounded-full bg-mute/70" />
        <span className="h-[3px] w-[3px] rounded-full bg-mute/70" />
        <span className="h-[3px] w-[3px] rounded-full bg-mute/70" />
      </span>
    </div>
  );
}

function TabBar({ active = 0 }: { active?: number }) {
  return (
    <div className="mt-auto flex items-center justify-around border-t border-line px-3 py-2">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-[7px] w-[7px] rounded-[2px] ${
            i === active ? "bg-blue" : "bg-bone/15"
          }`}
        />
      ))}
    </div>
  );
}

/** Abstracted map: a tinted bed, two crossing roads and a live pin. */
function MapBed({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(70%_60%_at_50%_35%,color-mix(in_oklab,var(--c-accent)_14%,transparent),transparent_70%)]">
      <span className="absolute top-[22%] -left-[10%] h-px w-[130%] rotate-[16deg] bg-bone/12" />
      <span className="absolute top-[58%] -left-[10%] h-px w-[130%] -rotate-[9deg] bg-bone/10" />
      <span className="absolute top-0 left-[38%] h-full w-px bg-bone/10" />
      {/* Route */}
      <span className="absolute top-[30%] left-[30%] h-[34%] w-px bg-blue/70" />
      <span className="absolute top-[64%] left-[30%] h-px w-[26%] bg-blue/70" />
      <span className="absolute top-[28%] left-[30%] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue shadow-[0_0_10px_2px_var(--c-glow)]" />
      {children}
    </div>
  );
}

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-t-xl border-t border-bone/12 bg-ink/85 px-3 pt-2 pb-3 backdrop-blur-sm">
      <span className="mx-auto mb-2 block h-[3px] w-7 rounded-full bg-bone/20" />
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-[3px]">
      <span className="flex items-center gap-1.5 font-mono text-[6px] text-mute">
        <span className="h-1 w-1 rounded-full bg-blue" />
        {label}
      </span>
      {value && (
        <span className="font-mono text-[6px] text-bone/80">{value}</span>
      )}
    </div>
  );
}

function Action({ label }: { label: string }) {
  return (
    <span className="mt-2 block rounded-md bg-blue py-[5px] text-center font-mono text-[6px] tracking-widest text-on-pop uppercase">
      {label}
    </span>
  );
}

/* ── Per-project screens ────────────────────────────────────────────────── */

function Food() {
  return (
    <>
      <StatusBar />
      <div className="px-3">
        <p className="text-[8px] font-bold">Menu</p>
        <span className="mt-1.5 block rounded-md bg-bone/8 px-2 py-[5px] font-mono text-[6px] text-mute">
          Search meals
        </span>
        <div className="mt-2 flex gap-1.5">
          {["Burgers", "Pizza", "Combos"].map((c, i) => (
            <span
              key={c}
              className={`rounded-full px-1.5 py-[3px] font-mono text-[5.5px] ${
                i === 0 ? "bg-blue text-on-pop" : "bg-bone/8 text-mute"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-2.5 space-y-1.5">
          {["Double Smash", "Chicken Box"].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-md border border-line p-1.5"
            >
              <span className="h-6 w-6 shrink-0 rounded bg-bone/10" />
              <span className="flex-1">
                <span className="block text-[6.5px] text-bone/90">{item}</span>
                <span className="mt-[3px] block h-[3px] w-10 rounded-full bg-bone/10" />
              </span>
              <span className="font-mono text-[6px] text-blue">120</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar />
    </>
  );
}

function Rider() {
  return (
    <>
      <StatusBar />
      <MapBed>
        <span className="absolute top-2 right-2 left-2 rounded-md bg-ink/85 px-2 py-[5px] font-mono text-[6px] text-mute backdrop-blur-sm">
          Where to?
        </span>
      </MapBed>
      <Sheet>
        <Row label="Pickup" value="Nasr City" />
        <Row label="Drop-off" value="Maadi" />
        <Action label="Confirm ride" />
      </Sheet>
    </>
  );
}

function Driver() {
  return (
    <>
      <StatusBar />
      <div className="flex items-center justify-between px-3 pb-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[6px] text-bone/90">
          <span className="h-1.5 w-1.5 rounded-full bg-acid" />
          Online
        </span>
        <span className="font-mono text-[6px] text-blue">EGP 480</span>
      </div>
      <MapBed />
      <Sheet>
        <p className="font-mono text-[6px] tracking-widest text-cyan uppercase">
          New order
        </p>
        <Row label="3.4 km away" value="12 min" />
        <Action label="Accept" />
      </Sheet>
    </>
  );
}

function Assist() {
  return (
    <>
      <StatusBar />
      <MapBed>
        <span className="absolute top-2 left-2 rounded-full bg-ink/85 px-2 py-[3px] font-mono text-[5.5px] text-mute backdrop-blur-sm">
          4 providers nearby
        </span>
      </MapBed>
      <Sheet>
        <Row label="Verified provider" value="1.2 km" />
        <Action label="Request tow" />
      </Sheet>
    </>
  );
}

function Shop() {
  return (
    <>
      <StatusBar />
      <div className="px-3">
        <span className="block rounded-md bg-bone/8 px-2 py-[5px] font-mono text-[6px] text-mute">
          Search products
        </span>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-line p-1.5">
              <span className="block h-8 w-full rounded bg-bone/10" />
              <span className="mt-1.5 block h-[3px] w-3/4 rounded-full bg-bone/12" />
              <span className="mt-1 block font-mono text-[6px] text-blue">
                $ 49
              </span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active={1} />
    </>
  );
}

function Web() {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-bold">Doctor Box</span>
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[3px] w-4 rounded-full bg-bone/15" />
          ))}
        </span>
      </div>
      <div className="mt-3 flex-1 rounded-md bg-[radial-gradient(60%_70%_at_20%_20%,color-mix(in_oklab,var(--c-accent)_18%,transparent),transparent_70%)] p-2.5">
        <span className="block h-[5px] w-24 rounded-full bg-bone/25" />
        <span className="mt-1.5 block h-[3px] w-16 rounded-full bg-bone/12" />
        <span className="mt-2 inline-block rounded bg-blue px-2 py-[3px] font-mono text-[5.5px] text-on-pop">
          Order now
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-6 rounded border border-line" />
        ))}
      </div>
    </div>
  );
}

function Api() {
  const routes = [
    ["GET", "/menu/branches", "200"],
    ["POST", "/cart/items", "201"],
    ["GET", "/orders/{id}", "200"],
    ["POST", "/loyalty/redeem", "200"],
  ];
  return (
    <div className="flex h-full flex-col justify-between font-mono text-[6px]">
      <div className="space-y-[5px]">
        {routes.map(([verb, path, code]) => (
          <div key={path} className="flex items-center gap-1.5">
            <span
              className={`w-7 shrink-0 rounded px-1 py-[1px] text-center text-[5px] ${
                verb === "GET" ? "bg-blue/20 text-blue" : "bg-acid/20 text-acid"
              }`}
            >
              {verb}
            </span>
            <span className="flex-1 truncate text-mute">{path}</span>
            <span className="text-bone/60">{code}</span>
          </div>
        ))}
      </div>
      <div className="rounded border border-line p-1.5 text-mute">
        <span className="block text-bone/70">{"{"}</span>
        <span className="block pl-2">
          <span className="text-cyan">&quot;source&quot;</span>:{" "}
          <span className="text-code-str">&quot;foodics&quot;</span>,
        </span>
        <span className="block pl-2">
          <span className="text-cyan">&quot;cached&quot;</span>:{" "}
          <span className="text-code-str">true</span>
        </span>
        <span className="block text-bone/70">{"}"}</span>
      </div>
    </div>
  );
}

/* ── Entry point ────────────────────────────────────────────────────────── */

const screens: Record<ProjectPreview, () => React.ReactElement> = {
  food: Food,
  rider: Rider,
  driver: Driver,
  assist: Assist,
  shop: Shop,
  web: Web,
  api: Api,
};

/** Width every device renders at in a card. */
export const DEVICE_W = 220;

/** Width the drawn screens are authored against. */
const DESIGN_W = 178;

/**
 * The drawn screens carry ~40 absolute pixel sizes tuned against DESIGN_W.
 * Scaling the finished device is one transform instead of forty edits, and
 * text stays crisp because it is scaled before rasterising, not after.
 */
function Scaled({ children, of }: { children: React.ReactNode; of: number }) {
  const k = DEVICE_W / of;
  return (
    <div style={{ width: DEVICE_W }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}

export default function DevicePreview({
  kind,
  image,
}: {
  kind: ProjectPreview;
  image?: ProjectImage;
}) {
  if (image) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        // The store render's own bezel is already in the pixels; the radius
        // clips the sliver of listing background left in its rounded corners.
        className="h-auto w-[220px] rounded-[1.3rem] shadow-[0_24px_50px_-24px_rgb(0_0_0/0.95)]"
      />
    );
  }

  const Screen = screens[kind];

  if (kind === "web" || kind === "api") {
    const Chrome = kind === "web" ? Browser : Console;
    return (
      <Scaled of={268}>
        <Chrome>
          <Screen />
        </Chrome>
      </Scaled>
    );
  }
  return (
    <Scaled of={DESIGN_W}>
      <Phone>
        <Screen />
      </Phone>
    </Scaled>
  );
}
