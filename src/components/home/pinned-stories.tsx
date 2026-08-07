import { useLayoutEffect, useRef, useState, useEffect, type ReactNode } from "react";
import { CONTACT } from "@/lib/site-data";
import { IMAGES, type ImageKey } from "@/lib/image-map";
import {
  ensureGsap,
  isDesktopMotion,
  prefersReducedMotion,
  refreshScrollTriggers,
} from "@/lib/motion";

type Story = {
  num: string;
  title: string;
  copy: string;
  imageKey: ImageKey;
};

const STORIES: Story[] = [
  {
    num: "01",
    title: "Airport Transfers",
    copy: `Flight monitoring, luggage assistance, and calm arrivals across ${CONTACT.serviceRegion}. Curbside or meet-and-greet — ready when you land.`,
    imageKey: "airport",
  },
  {
    num: "02",
    title: "Corporate Transportation",
    copy: "Executive transfers for meetings, roadshows, and VIP guests. Punctuality, privacy, and a chauffeur who represents your standard.",
    // A distinct, building-forward crop of the same source ChauffeurSection
    // uses (see `corporateStory` in image-map.ts) — actually depicts a
    // corporate/business-district context, unlike the highway-dashboard
    // shot this used previously.
    imageKey: "corporateStory",
  },
  {
    num: "03",
    title: "Event Transportation",
    copy: "Coordinated fleets for stadium nights, galas, and private occasions — planned to the minute, executed without distraction.",
    imageKey: "events",
  },
  {
    num: "04",
    title: "Group Transportation",
    copy: "Sprinters and coach options for teams, weddings, and conferences. One point of contact. Seamless multi-passenger logistics.",
    imageKey: "groupCoachStory",
  },
];

/** Splits copy into word spans so the description can stagger in word-by-word. */
function StoryWords({ text }: { text: string }): ReactNode {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className="story-word inline-block will-change-transform">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

function usePinnedMode() {
  const [pinnedMode, setPinnedMode] = useState(() => isDesktopMotion());
  useEffect(() => {
    const update = () => setPinnedMode(isDesktopMotion());
    update();
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", update);
    reduceQuery.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      reduceQuery.removeEventListener("change", update);
    };
  }, []);
  return pinnedMode;
}

export function PinnedStories() {
  const rootRef = useRef<HTMLElement>(null);
  const pinnedMode = usePinnedMode();

  // Desktop cinematic pinned timeline — only mounted/active when motion + width allow it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !pinnedMode) return;
    const { gsap } = ensureGsap();

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".story-panel");
      const numbers = gsap.utils.toArray<HTMLElement>(".story-number");
      const titles = gsap.utils.toArray<HTMLElement>(".story-title");
      const descs = gsap.utils.toArray<HTMLElement>(".story-desc");
      const imageWraps = gsap.utils.toArray<HTMLElement>(".story-image-wrap");
      const imageEls = gsap.utils.toArray<HTMLElement>(".story-image-el");
      const segFills = gsap.utils.toArray<HTMLElement>(".story-progress-seg-fill");
      const overlay = root.querySelector(".story-overlay") as HTMLElement | null;
      const stage = root.querySelector(".story-stage") as HTMLElement | null;
      const n = STORIES.length;

      // Baseline: only the first story is visible/readable; everything else fully hidden.
      gsap.set(panels, { visibility: "hidden" });
      gsap.set(panels[0], { visibility: "visible" });
      gsap.set(imageWraps, { autoAlpha: 0, clipPath: "inset(0% 0 100% 0)" });
      gsap.set(imageWraps[0], { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(imageEls, { scale: 1.12 });
      gsap.set(imageEls[0], { scale: 1 });
      gsap.set(overlay, { autoAlpha: 0 });
      gsap.set(titles, { clipPath: "inset(0% 0 100% 0)" });
      gsap.set(titles[0], { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(numbers, { autoAlpha: 0, scale: 0.7, yPercent: 15 });
      gsap.set(numbers[0], { autoAlpha: 1, scale: 1, yPercent: 0 });
      gsap.set(descs, { autoAlpha: 0, yPercent: 20 });
      gsap.set(descs[0], { autoAlpha: 1, yPercent: 0 });

      if (stage) {
        gsap.from(stage, {
          autoAlpha: 0,
          y: 48,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const HOLD = 2.2;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * n * 1.15}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const pos = self.progress * n;
            segFills.forEach((seg, i) => {
              const fill = gsap.utils.clamp(0, 1, pos - i);
              seg.style.transform = `scaleX(${fill})`;
            });
            if (stage) {
              const idx = Math.min(n - 1, Math.floor(self.progress * n));
              stage.style.setProperty(
                "background",
                idx % 2 === 0
                  ? "radial-gradient(70% 50% at 80% 40%, oklch(0.25 0.03 75 / 0.35), transparent 70%)"
                  : "radial-gradient(70% 50% at 20% 50%, oklch(0.22 0.04 90 / 0.3), transparent 70%)",
              );
            }
          },
        },
      });

      tl.to({}, { duration: HOLD });

      STORIES.forEach((_, i) => {
        if (i === 0) return;
        const p = i - 1;
        const dir = i % 2 === 0 ? 1 : -1;
        const label = `t${i}`;

        tl.addLabel(label)
          // 1. current description fades upward and out
          .to(descs[p], { autoAlpha: 0, yPercent: -24, duration: 0.32, ease: "power2.in" }, label)
          // 2. current title clips upward and disappears
          .to(titles[p], { clipPath: "inset(0% 0 100% 0)", duration: 0.4, ease: "power3.inOut" }, `${label}+=0.03`)
          // 3. current number fades and scales down
          .to(numbers[p], { autoAlpha: 0, scale: 0.68, duration: 0.3, ease: "power2.in" }, label)
          .set(panels[p], { visibility: "hidden" }, `${label}+=0.4`)
          // 4. image transitions: dark pass + direction-aware clip reveal
          .to(overlay, { autoAlpha: 0.85, duration: 0.22 }, `${label}+=0.1`)
          .to(imageEls[p], { scale: 1.05, duration: 0.55, ease: "power2.in" }, label)
          .set(imageWraps[p], { autoAlpha: 0 }, `${label}+=0.4`)
          .fromTo(
            imageWraps[i],
            {
              autoAlpha: 1,
              clipPath: dir === 1 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 100%)",
            },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.out" },
            `${label}+=0.3`,
          )
          .fromTo(imageEls[i], { scale: 1.14 }, { scale: 1, duration: 0.95, ease: "power2.out" }, `${label}+=0.3`)
          .to(overlay, { autoAlpha: 0, duration: 0.35 }, `${label}+=0.45`)
          // 5. new number enters
          .set(panels[i], { visibility: "visible" }, `${label}+=0.5`)
          .fromTo(
            numbers[i],
            { autoAlpha: 0, scale: 1.3, yPercent: 22 },
            { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.48, ease: "power3.out" },
            `${label}+=0.5`,
          )
          // 6. new title reveals using clip-path
          .fromTo(
            titles[i],
            { clipPath: "inset(0% 0 100% 0)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.out" },
            `${label}+=0.62`,
          )
          // 7. new description appears last, staggered word-in
          .fromTo(
            descs[i],
            { autoAlpha: 0, yPercent: 20 },
            { autoAlpha: 1, yPercent: 0, duration: 0.4, ease: "power2.out" },
            `${label}+=0.78`,
          )
          .fromTo(
            descs[i].querySelectorAll(".story-word"),
            { yPercent: 55, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.4, stagger: 0.012, ease: "power2.out" },
            `${label}+=0.8`,
          )
          .to({}, { duration: HOLD });
      });
    }, root);

    const imgs = root.querySelectorAll("img");
    let pending = imgs.length;
    const done = () => {
      pending -= 1;
      if (pending <= 0) refreshScrollTriggers();
    };
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    refreshScrollTriggers();
    return () => ctx.revert();
  }, [pinnedMode]);

  // Stacked fallback (mobile widths, coarse pointers, or reduced motion at any width).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || pinnedMode) return;
    const { gsap } = ensureGsap();
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.utils.toArray<HTMLElement>(".story-stack-item").forEach((item) => {
        gsap.from(item.querySelectorAll(".story-stack-reveal"), {
          autoAlpha: 0,
          y: 32,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, root);

    refreshScrollTriggers();
    return () => ctx.revert();
  }, [pinnedMode]);

  return (
    <section ref={rootRef} id="stories" className="relative overflow-hidden bg-[color:var(--surface-black)]">
      {pinnedMode ? (
        <div className="story-stage relative min-h-[100svh]">
          <div className="absolute inset-0 grid grid-cols-[0.9fr_1px_1.1fr]">
            <div className="story-copy-col relative z-10 flex flex-col justify-center px-[var(--page-gutter)] py-24">
              <div className="eyebrow mb-10 text-champagne">Signature Journeys</div>
              <div className="relative min-h-[22rem]">
                {STORIES.map((s, i) => (
                  <div
                    key={s.num}
                    className="story-panel absolute inset-x-0 top-0"
                    style={{ visibility: i === 0 ? "visible" : "hidden" }}
                  >
                    <div className="story-number font-display text-6xl text-champagne/50 md:text-7xl">
                      {s.num}
                    </div>
                    <h2
                      className="story-title mt-4 font-display text-4xl leading-tight text-off-white md:text-5xl"
                      style={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0 100% 0)" }}
                    >
                      {s.title}
                    </h2>
                    <p className="story-desc mt-6 max-w-md text-base leading-relaxed text-off-white/70">
                      <StoryWords text={s.copy} />
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex w-full gap-2">
                {STORIES.map((s) => (
                  <div key={s.num} className="h-px flex-1 overflow-hidden bg-white/10">
                    <div
                      className="story-progress-seg-fill h-full w-full origin-left bg-champagne"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Elegant gold divider between text and image columns */}
            <div className="relative">
              <div className="absolute inset-y-[10%] left-0 w-px bg-gradient-to-b from-transparent via-champagne/50 to-transparent" />
            </div>

            <div className="story-image-col relative overflow-hidden">
              {STORIES.map((s, i) => {
                const img = IMAGES[s.imageKey];
                return (
                  <div
                    key={s.num}
                    className="story-image-wrap absolute inset-0 overflow-hidden"
                    style={{
                      opacity: i === 0 ? 1 : 0,
                      clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0 100% 0)",
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="story-image-el h-full w-full object-cover"
                      style={{
                        objectPosition: img.objectPositionDesktop,
                        transform: i === 0 ? "scale(1)" : "scale(1.12)",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/40" />
                  </div>
                );
              })}
              <div className="story-overlay pointer-events-none absolute inset-0 z-20 bg-black opacity-0" />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {STORIES.map((s) => {
            const img = IMAGES[s.imageKey];
            return (
              <article key={s.num} className="story-stack-item relative min-h-[80svh] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="story-stack-reveal absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: img.objectPositionMobile }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[80svh] w-full max-w-2xl flex-col justify-end px-[var(--page-gutter)] pb-16 pt-24">
                  <div className="story-stack-reveal font-display text-5xl text-champagne/55">{s.num}</div>
                  <h2 className="story-stack-reveal mt-3 font-display text-3xl text-off-white">{s.title}</h2>
                  <p className="story-stack-reveal mt-4 max-w-md text-sm leading-relaxed text-off-white/75">
                    {s.copy}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
