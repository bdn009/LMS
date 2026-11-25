"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Award,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as Picture,
  Play,
  Star,
  Users,
  Video,
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
          body="This course could not be found in your current browser workspace."
        >
          <Link className="btn primary" href="/courses/">
            Browse catalog
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
    <div className="tab-panel-inner">
      <video
        width={800}
        height={450}
        src={src}
        controls
        playsInline
        autoPlay
      />
      <h3>{l.title}</h3>
      <p>{l.summary}</p>
    </div>
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
            <ChevronDown size={16} aria-hidden="true" />
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
                  <button type="button" onClick={() => select(l)}>
                    {l.title}
                  </button>
                ) : (
                  <strong>{l.title}</strong>
                )}
                <small>
                  {l.type} · {meta(l)}
                </small>
              </div>
              {done.includes(l.id) && (
                <Check size={17} className="green" aria-label="Completed" />
              )}
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
  const c = useCourse(id);
  const { s, enroll, bookmark } = useStore();
  const [preview, setPreview] = useState(false);
  const art = useFile(c?.art);
  if (!c) return <Missing />;

  const all = lessons(c);
  const video = all.find((l) => l.type === "Video");
  const enrolled = s.enrolled.includes(c.id);
  const counts = [
    {
      I: Video,
      label:
        all.filter((l) => l.type === "Video").length +
        " video studio · " +
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
        " visual slides",
    },
    { I: Award, label: "Certificate of mastery" },
  ];

  return (
    <div className="wrap page">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href="/courses/">Catalog</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>{c.category}</span>
      </nav>
      <div className="details-layout">
        <div>
          <div className="detail-header">
            <div>
              <span className="tag">
                {c.category} · {c.cohort}
              </span>
            </div>
            <h1 id="main-heading" tabIndex={-1}>
              {c.title}
            </h1>
            <p>{c.description}</p>
            <div className="author">
              <Portrait n={c.portrait} size={42} />
              <div>
                <strong>{c.instructor}</strong>
                <small>{c.role}</small>
              </div>
            </div>
            <div className="meta-row">
              <span>
                <Star
                  size={15}
                  style={{ color: "var(--gold)" }}
                  fill="currentColor"
                  aria-hidden="true"
                />
                {c.rating || "New"} ({c.reviews} reviews)
              </span>
              <span>
                <Users size={15} aria-hidden="true" />
                {c.students.toLocaleString()} fellows
              </span>
              <span>
                <Calendar size={15} aria-hidden="true" />
                Updated {c.updated}
              </span>
            </div>
          </div>

          <section className="panel content-block">
            <h2>What you&apos;ll master</h2>
            <div className="outcomes">
              {c.outcomes.map((o) => (
                <div key={o}>
                  <Check size={17} aria-hidden="true" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="content-block">
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

          <section className="panel content-block">
            <h2>Your instructor</h2>
            <div className="author">
              <Portrait n={c.portrait} size={48} />
              <div>
                <strong>{c.instructor}</strong>
                <small>{c.role}</small>
              </div>
            </div>
            <p style={{ marginTop: "0.75rem" }}>
              {c.instructor} leads {c.category.toLowerCase()} cohorts on
              OnnoPath through structured video walkthroughs, annotated
              workbooks, and live studio reviews.
            </p>
          </section>

          <section className="panel content-block">
            <h2>Fellow feedback</h2>
            {c.reviews > 0 ? (
              <>
                <div className="review-summary">
                  <div>
                    <div className="review-score">{c.rating.toFixed(1)}</div>
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
                <div>
                  <strong>Nadia K.</strong>
                  <small style={{ display: "block", marginBottom: "0.35rem" }}>
                    Verified fellow · sample review
                  </small>
                  <p>
                    &ldquo;Having the workbook and slide diagrams right inside
                    the same player made it effortless to apply each step.&rdquo;
                  </p>
                </div>
              </>
            ) : (
              <p>Reviews will appear once fellows complete this course.</p>
            )}
          </section>
        </div>

        <aside className="panel enrollment" id="enrollment">
          <div className="preview-art">
            <img src={art} alt="" width={480} height={300} />
            {video && (
              <button type="button" onClick={() => setPreview(true)}>
                <Play size={17} fill="currentColor" aria-hidden="true" />
                Preview studio session
              </button>
            )}
          </div>
          <div className="enroll-body">
            <div className="row spread">
              <strong className="price-tag">{price(c.price)}</strong>
              <button
                type="button"
                className="icon-btn"
                aria-label="Save course"
                aria-pressed={s.saved.includes(c.id)}
                onClick={() => bookmark(c)}
              >
                <Bookmark
                  size={19}
                  fill={s.saved.includes(c.id) ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            </div>
            {enrolled ? (
              <Link className="btn primary full" href={coursePath(c, true)}>
                <Play size={16} aria-hidden="true" />
                Enter Learning Studio
              </Link>
            ) : (
              <button
                type="button"
                className="btn primary full"
                onClick={() => enroll(c)}
              >
                Enroll in Course
              </button>
            )}
            <h2>Included in this course</h2>
            {counts.map(({ I, label }) => (
              <div className="includes" key={label}>
                <I size={16} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {preview && video && (
        <Modal
          title="Course session preview"
          wide
          onClose={() => setPreview(false)}
        >
          <Preview l={video} />
        </Modal>
      )}
    </div>
  );
}

