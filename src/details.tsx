"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as Picture,
  Play,
  Star,
  Users,
  Video,
  Calendar,
  Bookmark,
} from "lucide-react";
import { Course, Lesson, coursePath, lessons, meta, price } from "./data";
import { useCourse, useStore } from "./store";
import { Empty, MediaIcon, Modal, Portrait } from "./ui";
import { useFile } from "./files";
export function Missing() {
  const { ready } = useStore();
  return (
    <div className="wrap page">
      {ready ? (
        <Empty
          title="Course unavailable"
          body="This course may belong to another browser workspace."
        >
          <Link className="btn primary" href="/courses/">
            Explore courses
          </Link>
        </Empty>
      ) : (
        <p>Loading course…</p>
      )}
    </div>
  );
}
function Preview({ l }: { l: Lesson }) {
  const src = useFile(l.src);
  return (
    <>
      <video
        className="preview-video"
        src={src}
        controls
        playsInline
        autoPlay
      />
      <h3>{l.title}</h3>
      <p>{l.summary}</p>
    </>
  );
}
export function Curriculum({
  c,
  active,
  done = [],
  select,
}: {
  c: Course;
  active?: string;
  done?: string[];
  select?: (l: Lesson) => void;
}) {
  return (
    <div className="curriculum">
      {c.modules.map((m, i) => (
        <details
          key={m.id}
          open={active ? m.lessons.some((l) => l.id === active) : i === 0}
        >
          <summary>
            <span>
              <small>Module {i + 1}</small>
              <strong>{m.name}</strong>
            </span>
            <ChevronDown size={16} />
          </summary>
          {m.lessons.map((l) => (
            <div
              key={l.id}
              className={"lesson-row " + (active === l.id ? "current" : "")}
            >
              <span className={"media-square " + l.type.toLowerCase()}>
                <MediaIcon type={l.type} />
              </span>
              <div className="lesson-name">
                {select ? (
                  <button onClick={() => select(l)}>{l.title}</button>
                ) : (
                  <strong>{l.title}</strong>
                )}
                <small>
                  {l.type} · {meta(l)}
                </small>
              </div>
              {done.includes(l.id) && <Check size={17} className="green" />}
              {!active &&
                l.id === lessons(c).find((x) => x.type === "Video")?.id && (
                  <span className="preview-label">Free preview</span>
                )}
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}
export default function Details({ id }: { id: string }) {
  const c = useCourse(id),
    { s, enroll, bookmark } = useStore(),
    [preview, setPreview] = useState(false);
  const art = useFile(c?.art);
  if (!c) return <Missing />;
  const all = lessons(c),
    video = all.find((l) => l.type === "Video"),
    enrolled = s.enrolled.includes(c.id),
    counts = [
      {
        I: Video,
        label:
          all.filter((l) => l.type === "Video").length +
          " video lectures · " +
          Math.ceil(all.reduce((a, l) => a + (l.seconds || 0), 0) / 60) +
          " min",
      },
      {
        I: FileText,
        label:
          all.filter((l) => l.type === "PDF").length +
          " PDF workbooks · " +
          all.reduce((a, l) => a + (l.pages || 0), 0) +
          " pages",
      },
      {
        I: Picture,
        label:
          all.reduce((a, l) => a + (l.images?.length || 0), 0) +
          " visual references",
      },
      { I: Award, label: "Certificate of completion" },
    ];
  return (
    <div className="wrap page detail-page">
      <nav className="crumb">
        <Link href="/">Home</Link>
        <ChevronRight />
        <Link href="/courses/">Catalog</Link>
        <ChevronRight />
        {c.category}
      </nav>
      <div className="details-layout">
        <div>
          <div className="detail-header">
            <span className="tag">{c.category}</span>
            <h1>{c.title}</h1>
            <p className="lead">{c.description}</p>
            <div className="author">
              <Portrait n={c.portrait} size={40} />
              <div>
                <strong>{c.instructor}</strong>
                <small>{c.role}</small>
              </div>
            </div>
            <div className="meta-row">
              <span>
                <Star size={15} className="gold" fill="currentColor" />
                {c.rating || "New"} ({c.reviews} ratings)
              </span>
              <span>
                <Users size={15} />
                {c.students.toLocaleString()} learners
              </span>
              <span>
                <Calendar size={15} />
                Updated {c.updated}
              </span>
            </div>
          </div>
          <section className="panel content-block">
            <h2>What you’ll learn</h2>
            <div className="outcomes">
              {c.outcomes.map((o) => (
                <div key={o}>
                  <Check size={17} />
                  {o}
                </div>
              ))}
            </div>
          </section>
          <section className="content-block plain">
            <h2>Course curriculum</h2>
            <p>
              {c.modules.length} modules · {all.length} lessons · {c.level}
            </p>
            <Curriculum
              c={c}
              select={(l) => {
                if (!enrolled && l === video) setPreview(true);
                else if (!enrolled)
                  document
                    .getElementById("enrollment")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                else
                  location.href =
                    coursePath(c, true) +
                    (c.custom ? "&" : "?") +
                    "lesson=" +
                    encodeURIComponent(l.id);
              }}
            />
          </section>
          <section className="content-block panel">
            <h2>Your instructor</h2>
            <div className="author">
              <Portrait n={c.portrait} size={48} />
              <div>
                <strong>{c.instructor}</strong>
                <small>{c.role}</small>
              </div>
            </div>
            <p>
              {c.instructor} teaches {c.category.toLowerCase()} through worked
              examples, visual references, and practical exercises.
            </p>
          </section>
          <section className="content-block panel">
            <h2>Learner reviews</h2>
            {c.reviews > 0 ? (
              <>
                <div className="review-summary">
                  <div>
                    <b>{c.rating.toFixed(1)}</b>
                    <div className="gold">★★★★★</div>
                    <small>{c.reviews} ratings</small>
                  </div>
                  <div className="review-bars">
                    {[5, 4, 3, 2, 1].map((v, i) => (
                      <div key={v}>
                        <small>{v} ★</small>
                        <span>
                          <i
                            style={{
                              width:
                                [
                                  (c.rating - 4) * 100,
                                  (5 - c.rating) * 100,
                                  0,
                                  0,
                                  0,
                                ][i] + "%",
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="review">
                  <strong>Alex M.</strong>
                  <small>
                    <Check size={13} /> Verified learner · sample review
                  </small>
                  <p>
                    “The visual references made it easy to revisit the lesson
                    while working through the workbook.”
                  </p>
                </div>
              </>
            ) : (
              <p>Reviews will appear here as learners finish this course.</p>
            )}
          </section>
        </div>
        <aside className="panel enrollment" id="enrollment">
          <div className="preview-art">
            <img src={art} alt="" />
            {video && (
              <button onClick={() => setPreview(true)}>
                <Play size={18} fill="currentColor" />
                Preview course
              </button>
            )}
          </div>
          <div className="enroll-body">
            <div className="row spread">
              <strong className="price">{price(c.price)}</strong>
              <button
                className="icon-btn"
                aria-label="Save course"
                aria-pressed={s.saved.includes(c.id)}
                onClick={() => bookmark(c)}
              >
                <Bookmark
                  size={19}
                  fill={s.saved.includes(c.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            {enrolled ? (
              <Link className="btn primary full" href={coursePath(c, true)}>
                <Play size={16} />
                Continue Learning
              </Link>
            ) : (
              <button className="btn primary full" onClick={() => enroll(c)}>
                Enroll Now
              </button>
            )}
            <h3>This course includes</h3>
            {counts.map(({ I, label }) => (
              <div className="includes" key={label}>
                <I size={16} />
                {label}
              </div>
            ))}
          </div>
        </aside>
      </div>
      {preview && video && (
        <Modal title="Course preview" wide onClose={() => setPreview(false)}>
          <Preview l={video} />
        </Modal>
      )}
    </div>
  );
}
