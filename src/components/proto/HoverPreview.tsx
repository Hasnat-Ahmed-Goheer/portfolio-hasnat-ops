"use client";

/**
 * Index list with a floating screenshot that follows the cursor while a row
 * is hovered (fine pointers only). Rows are plain links, so touch and keyboard
 * get the list without the preview.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface PreviewRow {
  key: string;
  href: string;
  image?: string;
  content: ReactNode;
}

export default function HoverPreview({
  rows,
  rowClassName,
}: {
  rows: PreviewRow[];
  rowClassName?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(
      window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (!fine) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const tick = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      if (boxRef.current)
        boxRef.current.style.transform = `translate3d(${cx + 28}px, ${cy - 110}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  const current = rows.find((r) => r.key === active);

  return (
    <>
      <ul onPointerLeave={() => setActive(null)}>
        {rows.map((r) => (
          <li key={r.key}>
            <a
              href={r.href}
              onPointerEnter={() => setActive(r.key)}
              className={rowClassName}
              data-active={active === r.key || undefined}
              data-dim={(active && active !== r.key) || undefined}
            >
              {r.content}
            </a>
          </li>
        ))}
      </ul>
      {fine && (
        <div
          ref={boxRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-50 w-[340px] overflow-hidden rounded-md shadow-2xl shadow-black/25 transition-[opacity,scale] duration-300"
          style={{
            opacity: current?.image ? 1 : 0,
            scale: current?.image ? "1" : "0.92",
          }}
        >
          {rows.map((r) =>
            r.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={r.key}
                src={r.image}
                alt=""
                className="block aspect-[16/10] w-full object-cover object-top"
                style={{ display: r.key === active ? "block" : "none" }}
              />
            ) : null
          )}
        </div>
      )}
    </>
  );
}
