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
import { Badge, Bar, Empty, MediaIcon, Modal, Tabs } from "./ui";
import { Missing, Curriculum } from "./details";
import { VideoViewer, PDFViewer, Gallery, Quiz } from "./viewers";
import { useFile } from "./files";

function Attachment({ r }: { r: Resource }) {
  const src = useFile(r.src);
  const [open, set] = useState(false);
  return (
    <div className="resource-row">
      <MediaIcon type={r.type} />
      <button type="button" className="text-link" onClick={() => set(true)}>
        {r.name}
      </button>
      <div className="grow" />
      <a
        className="icon-btn"
        aria-label={"Download " + r.name}
        download={r.name + (r.type === "PDF" ? ".pdf" : ".webp")}
        href={src}
      >
        <Download size={17} aria-hidden="true" />
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
            <img src={src} alt={r.name} />
          )}
        </Modal>
      )}
    </div>
  );
}

function Workspace({ c }: { c: Course }) {
  const { s, change, progress, toggle, toast } = useStore();
  const all = lessons(c);
  const [active, setActive] = useState(() => {
    const q = new URLSearchParams(window.location.search).get("lesson");
    return all.find((l) => l.id === q)?.id || s.last[c.id] || all[0]?.id;
  });
  const [side, show] = useState(true);
  const [mobile, drawer] = useState(false);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");

  const l = all.find((x) => x.id === active) || all[0];
  const pos = useRef("");

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
    change((prev) =>
      prev.last[c.id] === l.id && prev.recent === c.id
        ? prev
        : { ...prev, recent: c.id, last: { ...prev.last, [c.id]: l.id } },
    );
    setNote("");
    setReply("");
  }, [l?.id, c.id, change]);

  if (!l)
    return (
      <Empty
        title="No lessons yet"
        body="This studio track is being prepared by the instructor."
      />
    );

  const key = c.id + "/" + l.id;
  const done = s.done[c.id] || [];
  const i = all.indexOf(l);

  function select(x: Lesson) {
    setActive(x.id);
    drawer(false);
    setTab("overview");
  }

  const sideContent = (
    <>
      <h2>Course syllabus</h2>
      <div className="row spread">
        <small>Path completion</small>
        <strong>{progress(c)}%</strong>
      </div>
      <Bar value={progress(c)} />
      <Curriculum c={c} active={l.id} done={done} select={select} />
    </>
  );

  const resources =
    l.resources ||
    all
      .flatMap((x) => x.resources || [])
      .filter((r, idx, arr) => arr.findIndex((t) => t.src === r.src) === idx);

  return (
    <div className="wrap page">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/dashboard/">My Studio</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href={coursePath(c)}>{c.title}</Link>
      </nav>

      <div className={"player-layout " + (side ? "" : "theater")}>
        <div>
          <div className="player-top">
            <strong>{c.title}</strong>
            <div className="row">
              <button
                type="button"
                className="icon-btn"
                aria-label="Toggle syllabus panel"
                onClick={() => show(!side)}
              >
                {side ? (
                  <PanelRightClose size={18} aria-hidden="true" />
                ) : (
                  <PanelRightOpen size={18} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="btn outline mobile-filter"
                onClick={() => drawer(true)}
              >
                <Menu size={15} aria-hidden="true" />
                Lessons
              </button>
            </div>
          </div>

          <div className="lesson-info" style={{ marginBlockStart: 0 }}>
            <div className="row">
              <Badge type={l.type} />
              <small>
                Lesson {i + 1} of {all.length}
              </small>
            </div>
            <h1 id="main-heading" tabIndex={-1}>
              {l.title}
            </h1>
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

          <div className="action-bar">
            <button
              type="button"
              className={
                "btn " + (done.includes(l.id) ? "complete-btn" : "primary")
              }
              onClick={() => toggle(c, l.id)}
            >
              <CheckCircle2 size={17} aria-hidden="true" />
              {done.includes(l.id) ? "Completed" : "Mark as Complete"}
            </button>
            <div className="row">
              <button
                type="button"
                className="btn outline"
                disabled={!i}
                onClick={() => select(all[i - 1])}
              >
                <ChevronLeft size={15} aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                className="btn outline"
                disabled={i === all.length - 1}
                onClick={() => select(all[i + 1])}
              >
                Next
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>

          <Tabs
            label="Lesson workspace sections"
            activeId={tab}
            onChange={setTab}
            items={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <>
                    <h2>Lesson overview</h2>
                    <p>{l.summary}</p>
                    <h2>Course outcomes</h2>
                    {c.outcomes.map((t) => (
                      <div className="includes" key={t}>
                        <Check size={15} aria-hidden="true" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </>
                ),
              },
              {
                id: "resources",
                label: "Resources",
                content: (
                  <>
                    <h2>Workbooks &amp; visual attachments</h2>
                    {resources.length ? (
                      resources.map((r) => <Attachment key={r.src} r={r} />)
                    ) : (
                      <p>No supplemental files for this lesson.</p>
                    )}
                  </>
                ),
              },
              {
                id: "notes",
                label: "My Notes",
                content: (
                  <>
                    <h2>Anchored studio notes</h2>
                    <form
                      className="note-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!note.trim()) return;
                        const n = {
                          id: crypto.randomUUID(),
                          body: note.trim(),
                          at: pos.current,
                        };
                        change((prev) => ({
                          ...prev,
                          notes: {
                            ...prev.notes,
                            [key]: [...(prev.notes[key] || []), n],
                          },
                        }));
                        setNote("");
                        toast("Studio note saved at " + n.at);
                      }}
                    >
                      <label htmlFor="lesson-note-input" className="visually-hidden">
                        Write a note at your current lesson position
                      </label>
                      <textarea
                        id="lesson-note-input"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Capture a thought anchored to your current timestamp or page…"
                      />
                      <button
                        type="submit"
                        className="btn primary"
                        disabled={!note.trim()}
                      >
                        Save note
                      </button>
                    </form>
                    {(s.notes[key] || []).map((n) => (
                      <article className="note-card" key={n.id}>
                        <div className="row spread">
                          <span className="tag">{n.at}</span>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="Delete note"
                            onClick={() =>
                              change((prev) => ({
                                ...prev,
                                notes: {
                                  ...prev.notes,
                                  [key]: prev.notes[key].filter(
                                    (x) => x.id !== n.id,
                                  ),
                                },
                              }))
                            }
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                        <p>{n.body}</p>
                      </article>
                    ))}
                  </>
                ),
              },
              {
                id: "qa",
                label: "Cohort Q&A",
                content: (
                  <>
                    <h2>Cohort discussion</h2>
                    <p>
                      Share a question, reflection, or field observation with
                      your track cohort.
                    </p>
                    {(s.threads[key] || []).map((t, j) => (
                      <article className="note-card" key={j}>
                        <strong>Nadia Karim</strong>
                        <p>{t}</p>
                      </article>
                    ))}
                    <form
                      className="note-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!reply.trim()) return;
                        change((prev) => ({
                          ...prev,
                          threads: {
                            ...prev.threads,
                            [key]: [...(prev.threads[key] || []), reply.trim()],
                          },
                        }));
                        setReply("");
                        toast("Comment posted to local cohort thread");
                      }}
                    >
                      <label htmlFor="cohort-reply-input" className="visually-hidden">
                        Write a cohort discussion reply
                      </label>
                      <textarea
                        id="cohort-reply-input"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Add your reflection or question…"
                      />
                      <button
                        type="submit"
                        className="btn primary"
                        disabled={!reply.trim()}
                      >
                        Post to cohort
                      </button>
                    </form>
                  </>
                ),
              },
            ]}
          />
        </div>

        {side && <aside className="panel syllabus">{sideContent}</aside>}
      </div>

      {mobile && (
        <Modal title="Course syllabus" onClose={() => drawer(false)}>
          {sideContent}
        </Modal>
      )}
    </div>
  );
}

export default function Player({ id }: { id: string }) {
  const c = useCourse(id);
  const { ready, s, enroll } = useStore();
  if (!c || !ready) return <Missing />;
  if (!s.enrolled.includes(c.id))
    return (
      <div className="wrap page">
        <Empty
          title={c.title}
          body="Enroll in this course to unlock the multi-format learning studio."
        >
          <button
            type="button"
            className="btn primary"
            onClick={() => enroll(c)}
          >
            Enroll in Course
          </button>
        </Empty>
      </div>
    );
  return <Workspace c={c} key={c.id} />;
}

