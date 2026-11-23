"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCheck,
  ChevronRight,
  Code2,
  Compass,
  FilePenLine,
  Figma,
  GraduationCap,
  Grid2X2,
  Layers3,
  Palette,
  Sparkles,
  Star,
  TrendingUp,
  Triangle,
  Video,
  FileText,
  Image as Picture,
  ChartNoAxesCombined,
} from "lucide-react";
import { useStore } from "../store";
import { CourseCard, Bar } from "../ui";
import { coursePath } from "../data";
const filters = [
  { name: "All", Icon: Grid2X2 },
  { name: "Web Development", Icon: Code2 },
  { name: "UI/UX Design", Icon: Palette },
  { name: "Data & AI", Icon: Sparkles },
  { name: "Business", Icon: ChartNoAxesCombined },
];
export default function Home() {
  const { courses, s, progress } = useStore(),
    [filter, setFilter] = useState("All"),
    recent = courses.find((c) => c.id === s.recent) || courses[0];
  return (
    <div className="wrap landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-pill">
            <span className="pill-stack">
              <Layers3 size={13} />
            </span>{" "}
            Multi-format learning studio
          </div>
          <h1>
            Learn by doing.
            <br />
            <em>Grow by design.</em>
          </h1>
          <p>
            Build practical skills with expert-led video lessons,
            <br className="desktop-break" /> hands-on workbooks, and visual
            guides.
          </p>
          <div className="hero-ctas">
            <Link className="btn primary" href="/courses/">
              <Compass size={17} />
              Explore Courses
            </Link>
            <Link className="btn glass" href="/dashboard/">
              <BookOpen size={17} />
              My Dashboard
            </Link>
          </div>
        </div>
        <div className="hero-scene">
          <img
            className="hero-artwork"
            alt="Three hovering violet layers on an isometric grid"
            src="/media/hero-art.webp"
            fetchPriority="high"
          />
          <span className="floating-type tag-v">
            <Video />
            Video
          </span>
          <span className="floating-type tag-p">
            <FileText />
            PDF
          </span>
          <span className="floating-type tag-s">
            <Picture />
            Slides
          </span>
          <Link href={coursePath(recent, true)} className="floating-progress">
            <div className="progress-head">
              <span className="mini-icon">
                <TrendingUp size={15} />
              </span>
              Your progress <strong>{progress(recent)}%</strong>
            </div>
            <Bar value={progress(recent)} />
          </Link>
        </div>
      </section>
      <section
        className="proof"
        aria-label="Learning platform statistics and tools"
      >
        <div className="stat">
          <span className="stat-icon lilac">
            <BookOpen />
          </span>
          <div>
            <strong>120+</strong>
            <small>Expert courses</small>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon amber">
            <Star />
          </span>
          <div>
            <strong>
              4.9<span>/5</span>
            </strong>
            <small>Average rating</small>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon mint">
            <GraduationCap />
          </span>
          <div>
            <strong>94%</strong>
            <small>Completion rate</small>
          </div>
        </div>
        <div className="tools-logos">
          <span className="fig-logo">
            <Figma />
            Figma
          </span>
          <span>
            <i className="linear-logo" />
            Linear
          </span>
          <span>
            <Triangle fill="currentColor" size={20} />
            Vercel
          </span>
        </div>
      </section>
      <section className="featured">
        <div className="section-heading">
          <div>
            <h2>
              Featured courses<span className="heading-dot">.</span>
            </h2>
            <p>Hands-on courses for your next big step.</p>
          </div>
          <Link className="text-link" href="/courses/">
            View all courses <ChevronRight size={15} />
          </Link>
        </div>
        <div className="filter-pills">
          {filters.map(({ name, Icon }) => (
            <button
              key={name}
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
              className={filter === name ? "chosen" : ""}
            >
              <Icon size={14} />
              {name}
            </button>
          ))}
        </div>
        <div className="course-grid">
          {(filter === "All"
            ? courses.slice(0, 3)
            : courses.filter((c) => c.category === filter)
          ).map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      </section>
      <section id="features" className="features">
        <div className="section-heading">
          <div>
            <h2>
              Inside your learning studio<span className="heading-dot">.</span>
            </h2>
            <p>Tools for turning each lesson into practice.</p>
          </div>
        </div>
        <div className="bento">
          {[
            {
              I: Layers3,
              h: "One workspace, three formats",
              t: "Move between video lectures, PDF workbooks, and detailed visual references as you learn.",
            },
            {
              I: CheckCheck,
              h: "Check your understanding",
              t: "Practice with interactive quizzes and immediate answer explanations.",
            },
            {
              I: FilePenLine,
              h: "Notes that stay in context",
              t: "Save a thought alongside its video timestamp, workbook page, or visual reference.",
            },
            {
              I: Award,
              h: "A certificate for your work",
              t: "Complete every lesson to earn a certificate you can download and share.",
            },
          ].map(({ I, h, t }) => (
            <article key={h}>
              <div className="feature-icon">
                <I />
              </div>
              <h3>{h}</h3>
              <p>{t}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
