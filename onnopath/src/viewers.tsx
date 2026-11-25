"use client";
import { useState, useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  Expand,
  Maximize,
  PanelLeft,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Check,
} from "lucide-react";
import { Lesson, clock } from "./data";
import { useFile } from "./files";
import { useStore } from "./store";
import { Bar } from "./ui";

const chapters: Record<string, number[]> = {
  "design-systems": [21.17, 42],
  "modern-react": [20.08, 40.67],
  "applied-ai": [20.67, 41.33],
  "interface-design": [19, 38.92],
  "data-storytelling": [20.25, 41],
  "product-strategy": [18, 38.92],
};

function fullscreen(node: HTMLElement | null) {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else node?.requestFullscreen?.().catch(() => {});
}

export function VideoViewer({
  l,
  position,
  theater,
}: {
  l: Lesson;
  position: (tag: string) => void;
  theater: () => void;
}) {
  const src = useFile(l.src);
  const v = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, time] = useState(0);
  const [d, duration] = useState(l.seconds || 1);
  const [muted, mute] = useState(false);
  const [error, setError] = useState(false);
  const [cc, setCC] = useState(false);

  function play() {
    if (!v.current) return;
    if (playing) v.current.pause();
    else v.current.play().catch(() => setError(true));
  }

  const slug = src?.split("/")[2] || "";
  const points = src?.endsWith("/demo.mp4") ? chapters[slug] || [] : [];

  return (
    <div className="video-view" ref={box}>
      <div className="video-surface">
        <video
          ref={v}
          src={src}
          width={960}
          height={540}
          poster={
            src?.endsWith("/demo.mp4")
              ? src.replace("demo.mp4", "cover.webp")
              : undefined
          }
          playsInline
          preload="auto"
          onClick={play}
          onLoadedMetadata={(e) => duration(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            time(e.currentTarget.currentTime);
            position(clock(e.currentTarget.currentTime));
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setError(true)}
        >
          {points.length > 0 && (
            <track
              kind="captions"
              srcLang="en"
              label="English"
              src={src?.replace("demo.mp4", "captions.vtt")}
            />
          )}
        </video>
        {error ? (
          <div className="video-error">This video could not be loaded.</div>
        ) : (
          !playing && (
            <button
              type="button"
              className="big-play"
              onClick={play}
              aria-label="Play lesson"
            >
              <Play fill="currentColor" aria-hidden="true" />
            </button>
          )
        )}
      </div>
      <div className="video-controls">
        <div className="timeline">
          <input
            aria-label="Seek video"
            type="range"
            min="0"
            max={d}
            step=".1"
            value={t}
            onChange={(e) => {
              if (v.current) v.current.currentTime = Number(e.target.value);
            }}
          />
          {points.map((p, i) => (
            <button
              type="button"
              className="chapter-dot"
              aria-label={"Jump to chapter " + (i + 2)}
              key={p}
              style={{ left: (p / d) * 100 + "%" }}
              onClick={() => {
                if (v.current) v.current.currentTime = p;
              }}
            />
          ))}
        </div>
        <div className="row">
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={play}
          >
            {playing ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              if (v.current) v.current.muted = !muted;
              mute(!muted);
            }}
          >
            {muted ? (
              <VolumeX size={16} aria-hidden="true" />
            ) : (
              <Volume2 size={16} aria-hidden="true" />
            )}
          </button>
          <small>
            {clock(t)} / {clock(d)}
          </small>
          <div className="grow" />
          {points.length > 0 && (
            <button
              type="button"
              className={cc ? "cc on" : "cc"}
              aria-label="Toggle captions"
              aria-pressed={cc}
              onClick={() => {
                if (v.current?.textTracks[0])
                  v.current.textTracks[0].mode = cc ? "hidden" : "showing";
                setCC(!cc);
              }}
            >
              CC
            </button>
          )}
          <select
            defaultValue="1"
            aria-label="Playback speed"
            onChange={(e) => {
              if (v.current) v.current.playbackRate = +e.target.value;
            }}
          >
            {[1, 1.25, 1.5, 2].map((s) => (
              <option value={s} key={s}>
                {s}x
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Toggle theater mode"
            onClick={theater}
          >
            <Columns2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Fullscreen video"
            onClick={() => fullscreen(box.current)}
          >
            <Expand size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfPage({
  doc,
  page,
  small = false,
}: {
  doc: PDFDocumentProxy;
  page: number;
  small?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    let task:
      | ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]>
      | undefined;
    doc
      .getPage(page)
      .then((p) => {
        if (!active || !ref.current) return;
        const viewport = p.getViewport({ scale: small ? 0.2 : 1.7 });
        const c = ref.current;
        c.width = viewport.width;
        c.height = viewport.height;
        task = p.render({ canvas: c, viewport });
        task.promise.catch(() => {});
      })
      .catch(() => {});
    return () => {
      active = false;
      task?.cancel();
    };
  }, [doc, page, small]);
  return <canvas aria-label={"Document page " + page} ref={ref} />;
}

export function PDFViewer({
  l,
  position,
}: {
  l: Lesson;
  position: (s: string) => void;
}) {
  const src = useFile(l.src);
  const box = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState("Fit Width");
  const [thumb, show] = useState(false);
  const [failed, fail] = useState(false);

  useEffect(() => {
    if (!src) return;
    let alive = true;
    let task: ReturnType<(typeof import("pdfjs-dist"))["getDocument"]> | undefined;
    import("pdfjs-dist")
      .then((pdf) => {
        if (!alive) return;
        pdf.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        task = pdf.getDocument({ url: src });
        return task.promise.then((d) => {
          if (alive) setDoc(d);
        });
      })
      .catch(() => {
        if (alive) fail(true);
      });
    return () => {
      alive = false;
      task?.destroy().catch(() => {});
    };
  }, [src]);

  const n = doc?.numPages || l.pages || 1;
  function go(p: number) {
    setPage(p);
    position("Page " + p);
  }

  return (
    <div className="reader" ref={box}>
      <div className="reader-toolbar">
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle page thumbnails"
          aria-pressed={thumb}
          onClick={() => show(!thumb)}
        >
          <PanelLeft size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-btn"
          disabled={page <= 1}
          aria-label="Previous page"
          onClick={() => go(page - 1)}
        >
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        <small>
          Page {page} of {n}
        </small>
        <button
          type="button"
          className="icon-btn"
          disabled={page >= n}
          aria-label="Next page"
          onClick={() => go(page + 1)}
        >
          <ChevronRight size={17} aria-hidden="true" />
        </button>
        <div className="grow" />
        <select
          aria-label="Document zoom"
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        >
          {["75%", "100%", "125%", "Fit Width"].map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
        <button
          type="button"
          className="icon-btn"
          aria-label="Fullscreen reading"
          onClick={() => fullscreen(box.current)}
        >
          <Expand size={17} aria-hidden="true" />
        </button>
        {l.download && (
          <a
            className="icon-btn"
            download={l.title + ".pdf"}
            href={src}
            aria-label="Download PDF"
          >
            <Download size={17} aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="reader-stage">
        {thumb && doc && (
          <div className="thumbs">
            {Array.from({ length: n }, (_, i) => (
              <button
                type="button"
                aria-label={"Read page " + (i + 1)}
                className={page === i + 1 ? "on" : ""}
                key={i}
                onClick={() => go(i + 1)}
              >
                <PdfPage doc={doc} page={i + 1} small />
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
        )}
        <div className="paper-scroll">
          {doc ? (
            <div
              className="pdf-page"
              style={{ width: zoom === "Fit Width" ? "100%" : zoom }}
            >
              <PdfPage doc={doc} page={page} />
            </div>
          ) : (
            <p>
              {failed ? "This PDF could not be opened." : "Opening document…"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideImage({ src, caption }: { src: string; caption: string }) {
  const url = useFile(src);
  return <img src={url} alt={caption} draggable={false} />;
}

export function Gallery({
  l,
  position,
}: {
  l: Lesson;
  position: (s: string) => void;
}) {
  const slides = l.images || [];
  const [i, set] = useState(0);
  const [z, zoom] = useState(1);
  const area = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(
    null,
  );

  if (!slides.length) return <p>No images in this lesson.</p>;

  function go(n: number) {
    set(n);
    zoom(1);
    position("Slide " + (n + 1));
  }

  return (
    <div ref={box}>
      <div className="reader-toolbar">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous slide"
          disabled={i === 0}
          onClick={() => go(i - 1)}
        >
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        <small>
          Slide {i + 1} of {slides.length}
        </small>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next slide"
          disabled={i === slides.length - 1}
          onClick={() => go(i + 1)}
        >
          <ChevronRight size={17} aria-hidden="true" />
        </button>
        <div className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label="Zoom out"
          disabled={z <= 1}
          onClick={() => zoom(z - 0.5)}
        >
          <ZoomOut size={17} aria-hidden="true" />
        </button>
        <small>{z * 100}%</small>
        <button
          type="button"
          className="icon-btn"
          aria-label="Zoom in"
          disabled={z >= 3}
          onClick={() => zoom(z + 0.5)}
        >
          <ZoomIn size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Open fullscreen slide"
          onClick={() => fullscreen(box.current)}
        >
          <Maximize size={17} aria-hidden="true" />
        </button>
      </div>
      <div
        className={"image-stage " + (z > 1 ? "pannable" : "")}
        ref={area}
        onPointerDown={(e) => {
          if (z <= 1) return;
          const a = e.currentTarget;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: a.scrollLeft,
            top: a.scrollTop,
          };
          a.setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onPointerMove={(e) => {
          if (!drag.current || !area.current) return;
          const d = drag.current;
          area.current.scrollLeft = d.left + d.x - e.clientX;
          area.current.scrollTop = d.top + d.y - e.clientY;
        }}
      >
        <div style={{ width: z * 100 + "%" }}>
          <SlideImage {...slides[i]} />
        </div>
      </div>
      <div className="filmstrip">
        {slides.map((s, j) => (
          <button
            type="button"
            aria-label={"View slide " + (j + 1)}
            key={j}
            className={j === i ? "on" : ""}
            onClick={() => go(j)}
          >
            <SlideImage {...s} />
          </button>
        ))}
        <strong>{slides[i].caption}</strong>
      </div>
    </div>
  );
}

export function Quiz({ l, storageKey }: { l: Lesson; storageKey: string }) {
  const { s, change } = useStore();
  const qs = l.questions || [];
  const [i, setI] = useState(0);
  const [answers, answer] = useState<number[]>([]);
  const [finished, finish] = useState(s.scores[storageKey] !== undefined);

  if (!qs.length) return <p>No questions in this assessment.</p>;

  const q = qs[i];
  const picked = answers[i];
  const score = answers.filter((a, j) => a === qs[j].answer).length;

  return (
    <div className="quiz-stage">
      {finished ? (
        <>
          <span className="pillar-icon">
            <Check aria-hidden="true" />
          </span>
          <h2>Assessment complete</h2>
          <p>Your score</p>
          <div className="quiz-score">
            {s.scores[storageKey] ?? Math.round((score / qs.length) * 100)}%
          </div>
          <p>
            {Math.round(((s.scores[storageKey] ?? 0) * qs.length) / 100)} of{" "}
            {qs.length} questions correct
          </p>
          <button
            type="button"
            className="btn outline"
            onClick={() => {
              finish(false);
              setI(0);
              answer([]);
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Retry quiz
          </button>
        </>
      ) : (
        <>
          <small>
            Question {i + 1} of {qs.length}
          </small>
          <Bar value={(i / qs.length) * 100} />
          <h2>{q.prompt}</h2>
          {q.choices.map((choice, a) => (
            <button
              type="button"
              className={
                "answer-btn " +
                (picked !== undefined && a === q.answer
                  ? "correct"
                  : picked === a
                    ? "incorrect"
                    : "")
              }
              key={a}
              disabled={picked !== undefined}
              onClick={() => answer([...answers, a])}
            >
              <span>{String.fromCharCode(65 + a)}</span>
              {choice}
            </button>
          ))}
          {picked !== undefined && (
            <div className="explanation">
              <strong>
                {picked === q.answer ? "Correct answer" : "Review the answer"}
              </strong>
              <p>{q.why}</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (i + 1 < qs.length) setI(i + 1);
                  else {
                    change((prev) => ({
                      ...prev,
                      scores: {
                        ...prev.scores,
                        [storageKey]: Math.round((score / qs.length) * 100),
                      },
                    }));
                    finish(true);
                  }
                }}
              >
                {i + 1 === qs.length ? "See results" : "Next question"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

