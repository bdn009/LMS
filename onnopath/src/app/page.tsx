"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Check,
  CheckCheck,
  Code2,
  Compass,
  FileText,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  NotebookPen,
  Palette,
  Play,
  Route,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { useStore } from "../store";
import { CourseCard, Bar, Badge } from "../ui";
import { coursePath, lessons, skillPaths } from "../data";
import { useFile } from "../files";

const categories = [
  "All Courses",
  "Design",
  "Engineering",
  "Data & AI",
  "Strategy",
];
const categoryIcons = [Grid2X2, Palette, Code2, Sparkles, TrendingUp];

export default function Home() {
  const { courses, s, progress, pathProgress } = useStore();
  const [category, setCategory] = useState("All Courses");
  const [activePathIdx, setActivePathIdx] = useState(0);

  const activePath = skillPaths[activePathIdx];
  const pathCourses = activePath.courseIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const spotlight =
    pathCourses.find((c) => c.id === s.recent) || pathCourses[0] || courses[0];
  const spotlightArt = useFile(spotlight.art);
  const selected =
    lessons(spotlight).find((l) => l.id === s.last[spotlight.id]) ||
    lessons(spotlight)[0];

  const visible =
    category === "All Courses"
      ? courses
      : courses.filter((c) => c.category === category);

  return (
    <div>
      <section className="home-hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <Route size={15} aria-hidden="true" />
            Guided Skill Paths &amp; Studio Cohorts
          </span>
          <h1 id="main-heading" tabIndex={-1}>
            Take another path.
            <br />
            Build work that <em>lasts.</em>
          </h1>
          <p>
            Follow structured skill tracks across video studios, annotated PDF
            workbooks, zoomable architecture slides, and mastery checks in one
            calm workspace.
          </p>
          <div className="hero-ctas">
            <Link className="btn primary" href="/paths/">
              <Compass size={17} aria-hidden="true" />
              Explore Skill Paths
            </Link>
            <Link className="btn outline" href="/dashboard/">
              <BookOpen size={17} aria-hidden="true" />
              Open My Studio
            </Link>
          </div>
          <div className="hero-formats">
            <span>
              <Video size={15} aria-hidden="true" />
              Captioned Video Studios
            </span>
            <span>
              <FileText size={15} aria-hidden="true" />
              Interactive PDF Workbooks
            </span>
            <span>
              <ImageIcon size={15} aria-hidden="true" />
              Visual Slide Decks
            </span>
          </div>
        </div>

        <div className="compass-card">
          <div className="compass-top">
            <span className="row">
              <Layers3 size={15} aria-hidden="true" />
              Pathway Compass
            </span>
            <span className="compass-pill">
              {pathProgress(activePath)}% track complete
            </span>
          </div>
          <div className="compass-body">
            <div className="compass-tabs" role="group" aria-label="Preview skill track">
              {skillPaths.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={activePathIdx === idx}
                  onClick={() => setActivePathIdx(idx)}
                >
                  {p.title.replace(" Track", "")}
                </button>
              ))}
            </div>

            <Link className="compass-resume" href={coursePath(spotlight, true)}>
              <img src={spotlightArt} alt="" width={72} height={72} />
              <div>
                <Badge type={selected.type} />
                <h2>{spotlight.title}</h2>
                <small>{selected.title}</small>
              </div>
              <span className="compass-play" aria-hidden="true">
                <Play size={16} fill="currentColor" />
              </span>
            </Link>

            <div>
              <div className="row spread" style={{ marginBottom: "0.45rem" }}>
                <small>Course progress</small>
                <strong>{progress(spotlight)}%</strong>
              </div>
              <Bar value={progress(spotlight)} />
            </div>

            <div className="compass-steps">
              {lessons(spotlight)
                .slice(0, 3)
                .map((l) => {
                  const isDone = s.done[spotlight.id]?.includes(l.id);
                  return (
                    <Link
                      key={l.id}
                      className="compass-step"
                      href={
                        coursePath(spotlight, true) +
                        (spotlight.custom ? "&" : "?") +
                        "lesson=" +
                        l.id
                      }
                    >
                      <span className={"step-badge " + (isDone ? "done" : "")}>
                        {isDone ? (
                          <Check size={14} aria-hidden="true" />
                        ) : l.type === "Video" ? (
                          <Video size={14} aria-hidden="true" />
                        ) : l.type === "PDF" ? (
                          <FileText size={14} aria-hidden="true" />
                        ) : (
                          <ImageIcon size={14} aria-hidden="true" />
                        )}
                      </span>
                      <span>{l.title}</span>
                      <small style={{ marginInlineStart: "auto" }}>
                        {l.type}
                      </small>
                    </Link>
                  );
                })}
            </div>
          </div>
          <div className="compass-foot">
            <span>{activePath.duration}</span>
            <Link className="text-link" href="/paths/">
              View full track
            </Link>
          </div>
        </div>
      </section>

      <section className="pillars wrap" aria-label="OnnoPath learning model">
        <div className="pillar">
          <span className="pillar-icon">
            <Route size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>Connected skill tracks</strong>
            <p>
              Sequence courses into intentional career paths instead of isolated
              one-off tutorials.
            </p>
          </div>
        </div>
        <div className="pillar">
          <span className="pillar-icon">
            <NotebookPen size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>Context-anchored notes</strong>
            <p>
              Pin notes directly to video timestamps, PDF workbook pages, or
              architecture slides.
            </p>
          </div>
        </div>
        <div className="pillar">
          <span className="pillar-icon">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>Evidence of mastery</strong>
            <p>
              Complete assessments with immediate explanations and download your
              certificate.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap section-band">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Curated Catalog</span>
            <h2>Six studio courses ready to explore.</h2>
            <p>
              Filter by discipline or jump straight into any multi-format course
              player.
            </p>
          </div>
          <Link className="text-link" href="/courses/">
            Full catalog
          </Link>
        </div>

        <div className="filter-pills">
          {categories.map((name, i) => {
            const Icon = categoryIcons[i];
            return (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                <Icon size={15} aria-hidden="true" />
                {name}
              </button>
            );
          })}
        </div>

        <div className="course-grid">
          {visible.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      <section id="studio-features" className="wrap section-band">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Studio Architecture</span>
            <h2>Every learning artifact in one workspace.</h2>
          </div>
          <p>Built for focus, accessibility, and real retention.</p>
        </div>

        <div className="studio-bento">
          <article className="bento-card tinted-emerald">
            <Layers3 size={24} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <h3>Watch, read, and inspect without switching tabs.</h3>
            <p>
              Move fluidly from a captioned video walkthrough to its PDF.js
              workbook and zoomable visual frames.
            </p>
            <div className="bento-tiles">
              <span>
                <Video size={18} aria-hidden="true" />
                Video + CC
              </span>
              <span>
                <FileText size={18} aria-hidden="true" />
                PDF Reader
              </span>
              <span>
                <ImageIcon size={18} aria-hidden="true" />
                Slide Zoom
              </span>
            </div>
          </article>

          <article className="bento-card">
            <CheckCheck size={24} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <h3>Mastery checks with clear explanations.</h3>
            <p>
              Immediate feedback explains why an engineering or design tradeoff
              works, with unlimited retry practice.
            </p>
          </article>

          <article className="bento-card">
            <NotebookPen size={24} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <h3>Timestamp &amp; page-pinned notes.</h3>
            <p>
              Every note captures where you were in the studio—whether at{" "}
              <code>0:16</code> in a video or <code>Page 2</code> of a workbook.
            </p>
          </article>

          <article className="bento-card tinted-amber">
            <Award size={24} style={{ color: "var(--accent)" }} aria-hidden="true" />
            <h3>Instructor Studio with sortable cohort analytics.</h3>
            <p>
              Switch to Instructor Studio anytime to publish courses with local
              video/PDF uploads and inspect course metrics.
            </p>
            <Link className="text-link" href="/instructor/">
              Open Instructor Studio
            </Link>
          </article>
        </div>
      </section>

      <section className="wrap cta-banner">
        <div>
          <span className="eyebrow">Ready when you are</span>
          <h2 style={{ marginTop: "0.4rem", marginBottom: "0.5rem" }}>
            Start your next skill path today.
          </h2>
          <p>Pick a structured track or sample any interactive studio lesson.</p>
        </div>
        <Link className="btn primary" href="/paths/">
          View Guided Paths
        </Link>
      </section>
    </div>
  );
}

