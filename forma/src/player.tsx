"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
} from "lucide-react";
import { Course, Lesson, Resource, coursePath, lessons } from "./data";
import { useCourse, useStore } from "./store";
import { Badge, Bar, Empty, MediaIcon, Modal } from "./ui";
import { Missing, Curriculum } from "./details";
import { VideoViewer, PDFViewer, Gallery, Quiz } from "./viewers";
import { useFile } from "./files";
function Attachment({ r }: { r: Resource }) {
  const src = useFile(r.src),
    [open, set] = useState(false);
  return (
    <div className="resource">
      <MediaIcon type={r.type} />
      <button className="text-link" onClick={() => set(true)}>
        {r.name}
      </button>
      <a
        className="icon-btn"
        aria-label={"Download " + r.name}
        download={r.name + (r.type === "PDF" ? ".pdf" : ".webp")}
        href={src}
      >
        <Download size={17} />
      </a>
      {open && (
        <Modal wide title={r.name} onClose={() => set(false)}>
          {r.type === "PDF" ? (
            <PDFViewer
              l={{
                id: "asset",
                type: "PDF",
                title: r.name,
                src: r.src,
                summary: "",
                download: true,
              }}
              position={() => {}}
            />
          ) : (
            <img className="resource-image" src={src} alt={r.name} />
          )}
        </Modal>
      )}
    </div>
  );
}
function Workspace({ c }: { c: Course }) {
  const { s, change, progress, toggle, toast } = useStore(),
    all = lessons(c),
    [active, setActive] = useState(() => {
      const q = new URLSearchParams(window.location.search).get("lesson");
      return all.find((l) => l.id === q)?.id || s.last[c.id] || all[0]?.id;
    }),
    [side, show] = useState(true),
    [mobile, drawer] = useState(false),
    [tab, setTab] = useState("Overview"),
    [note, setNote] = useState(""),
    [reply, setReply] = useState("");
  const l = all.find((l) => l.id === active) || all[0],
    pos = useRef("");
  useEffect(() => {
    if (!l) return;
    pos.current =
      l.type === "PDF"
        ? "Page 1"
        : l.type === "Slides"
          ? "Slide 1"
          : l.type === "Video"
            ? "0:00"
            : "Quiz";
    change((s) =>
      s.last[c.id] === l.id && s.recent === c.id
        ? s
        : { ...s, recent: c.id, last: { ...s.last, [c.id]: l.id } },
    );
    setNote("");
    setReply("");
  }, [l?.id, c.id, change]);
  if (!l)
    return (
      <Empty
        title="No lessons yet"
        body="The instructor is preparing this course."
      />
    );
  const key = c.id + "/" + l.id,
    done = s.done[c.id] || [],
    i = all.indexOf(l);
  function select(x: Lesson) {
    setActive(x.id);
    drawer(false);
    setTab("Overview");
  }
  const sideContent = (
    <>
      <h3>Course curriculum</h3>
      <div className="row spread">
        <small>Overall progress</small>
        <b>{progress(c)}%</b>
      </div>
      <Bar value={progress(c)} />
      <Curriculum c={c} active={l.id} done={done} select={select} />
    </>
  );
  const resources =
    l.resources ||
    all
      .flatMap((x) => x.resources || [])
      .filter((r, i, a) => a.findIndex((t) => t.src === r.src) === i);
  return (
    <div className="wrap player-page">
      <div className="crumb">
        <Link href="/dashboard/">My Learning</Link>
        <ChevronRight />
        <Link href={coursePath(c)}>{c.title}</Link>
      </div>
      <div className={"player-layout " + (side ? "" : "theater")}>
        <div className="player-main">
          <div className="player-top">
            <span>{c.title}</span>
            <button
              className="icon-btn desktop-side"
              aria-label="Toggle curriculum"
              onClick={() => show(!side)}
            >
              {side ? (
                <PanelRightClose size={18} />
              ) : (
                <PanelRightOpen size={18} />
              )}
            </button>
            <button
              className="btn outline mobile-filter"
              onClick={() => drawer(true)}
            >
              <Menu size={15} />
              Lessons
            </button>
          </div>
          <div className="stage" key={l.id}>
            {l.type === "Video" ? (
              <VideoViewer
                l={l}
                position={(p) => (pos.current = p)}
                theater={() => show(!side)}
              />
            ) : l.type === "PDF" ? (
              <PDFViewer l={l} position={(p) => (pos.current = p)} />
            ) : l.type === "Slides" ? (
              <Gallery l={l} position={(p) => (pos.current = p)} />
            ) : (
              <Quiz l={l} storageKey={key} />
            )}
          </div>
          <div className="lesson-info">
            <Badge type={l.type} />
            <small>
              Lesson {i + 1} of {all.length}
            </small>
            <h1>{l.title}</h1>
          </div>
          <div className="action-bar">
            <button
              className={
                "btn " + (done.includes(l.id) ? "complete-btn" : "primary")
              }
              onClick={() => toggle(c, l.id)}
            >
              <CheckCircle2 size={17} />
              {done.includes(l.id) ? "Completed" : "Mark as Complete"}
            </button>
            <div className="row">
              <button
                className="btn outline"
                disabled={!i}
                onClick={() => select(all[i - 1])}
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <button
                className="btn outline"
                disabled={i === all.length - 1}
                onClick={() => select(all[i + 1])}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          <div className="tabs">
            {["Overview", "Resources", "My Notes", "Q&A"].map((t) => (
              <button
                key={t}
                className={t === tab ? "on" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="workspace-tab">
            {tab === "Overview" ? (
              <>
                <h3>Lesson overview</h3>
                <p>{l.summary}</p>
                <h3>Key takeaways</h3>
                {c.outcomes.map((t) => (
                  <div className="includes" key={t}>
                    <Check size={15} />
                    {t}
                  </div>
                ))}
              </>
            ) : tab === "Resources" ? (
              <>
                <h3>Attachments & resources</h3>
                {resources.length ? (
                  resources.map((r) => <Attachment key={r.src} r={r} />)
                ) : (
                  <p>No supplemental files for this lesson.</p>
                )}
              </>
            ) : tab === "My Notes" ? (
              <>
                <h3>My notes</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!note.trim()) return;
                    const n = {
                      id: crypto.randomUUID(),
                      body: note.trim(),
                      at: pos.current,
                    };
                    change((s) => ({
                      ...s,
                      notes: {
                        ...s.notes,
                        [key]: [...(s.notes[key] || []), n],
                      },
                    }));
                    setNote("");
                    toast("Lesson note saved");
                  }}
                >
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a note at your current position…"
                    aria-label="Lesson note"
                  />
                  <button className="btn primary" disabled={!note.trim()}>
                    Save note
                  </button>
                </form>
                {(s.notes[key] || []).map((n) => (
                  <article className="note" key={n.id}>
                    <span className="tag">{n.at}</span>
                    <button
                      className="icon-btn"
                      aria-label="Delete note"
                      onClick={() =>
                        change((s) => ({
                          ...s,
                          notes: {
                            ...s.notes,
                            [key]: s.notes[key].filter((x) => x.id !== n.id),
                          },
                        }))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                    <p>{n.body}</p>
                  </article>
                ))}
              </>
            ) : (
              <>
                <h3>Lesson discussion</h3>
                <p>Share a question or a reflection on this lesson.</p>
                {(s.threads[key] || []).map((t, j) => (
                  <article className="note" key={j}>
                    <strong>Alex Morgan</strong>
                    <p>{t}</p>
                  </article>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reply.trim()) return;
                    change((s) => ({
                      ...s,
                      threads: {
                        ...s.threads,
                        [key]: [...(s.threads[key] || []), reply.trim()],
                      },
                    }));
                    setReply("");
                    toast("Reply added to this workspace");
                  }}
                >
                  <textarea
                    aria-label="Discussion reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                  />
                  <button className="btn primary" disabled={!reply.trim()}>
                    Post reply
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        {side && <aside className="panel syllabus">{sideContent}</aside>}
      </div>
      {mobile && (
        <Modal title="Lessons" onClose={() => drawer(false)}>
          {sideContent}
        </Modal>
      )}
    </div>
  );
}
export default function Player({ id }: { id: string }) {
  const c = useCourse(id),
    { ready, s, enroll } = useStore();
  if (!c || !ready) return <Missing />;
  if (!s.enrolled.includes(c.id))
    return (
      <div className="wrap page">
        <Empty
          title={c.title}
          body="Enroll to open the lessons and track your progress."
        >
          <button className="btn primary" onClick={() => enroll(c)}>
            Enroll Now
          </button>
        </Empty>
      </div>
    );
  return <Workspace c={c} key={c.id} />;
}
