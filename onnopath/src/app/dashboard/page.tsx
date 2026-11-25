"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCheck,
  Clock3,
  Download,
  Flame,
  Play,
  Route,
} from "lucide-react";
import { Course, lessons, coursePath, skillPaths } from "../../data";
import { useStore } from "../../store";
import { Badge, Bar, CourseCard, Empty, Tabs } from "../../ui";
import { useFile } from "../../files";

function certificate(c: Course) {
  const canvas = document.createElement("canvas");
  canvas.width = 1500;
  canvas.height = 900;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f7f5f0";
  ctx.fillRect(0, 0, 1500, 900);
  ctx.strokeStyle = "#0e6b53";
  ctx.lineWidth = 6;
  ctx.strokeRect(42, 42, 1416, 816);
  ctx.strokeStyle = "#b84d10";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 1380, 780);
  ctx.textAlign = "center";

  function line(text: string, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.font = "600 " + size + "px Georgia, serif";
    ctx.fillText(text, 750, y, 1280);
  }

  line("ONNOPATH ACADEMY", 155, 30, "#0e6b53");
  line("Certificate of Mastery", 285, 68, "#14221d");
  line("Presented to", 395, 26, "#4a5953");
  line("Nadia Karim", 485, 62, "#14221d");
  line("for completing all studio modules and assessments in", 560, 26, "#4a5953");
  line(c.title, 650, 46, "#0e6b53");
  line(c.instructor + "  ·  Lead Instructor", 755, 24, "#4a5953");

  const a = document.createElement("a");
  a.download = "onnopath-" + c.id + "-certificate.png";
  a.href = canvas.toDataURL();
  a.click();
}

export default function Dashboard() {
  const { courses, s, progress, pathProgress } = useStore();
  const [tab, setTab] = useState("progress");

  const enrolled = courses.filter((c) => s.enrolled.includes(c.id));
  const complete = enrolled.filter((c) => progress(c) === 100);
  const inProgress = enrolled.filter((c) => progress(c) < 100);
  const saved = courses.filter((c) => s.saved.includes(c.id));

  const recent = enrolled.find((c) => c.id === s.recent) || enrolled[0];
  const art = useFile(recent?.art);

  const allDone = enrolled.flatMap((c) =>
    lessons(c).filter((l) => s.done[c.id]?.includes(l.id)),
  );
  const minutes = Math.round(
    allDone.reduce((a, l) => a + (l.seconds || 0), 0) / 60,
  );
  const pages = allDone.reduce((a, l) => a + (l.pages || 0), 0);

  const days = new Set(s.activity.map((a) => a.day));
  let streak = 0;
  const today = new Date();
  if (!days.has(today.toLocaleDateString("en-CA")))
    today.setDate(today.getDate() - 1);
  while (days.has(today.toLocaleDateString("en-CA"))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekCount = s.activity.filter(
    (a) => a.day >= weekStart.toLocaleDateString("en-CA"),
  ).length;

  const active =
    recent &&
    (lessons(recent).find((l) => l.id === s.last[recent.id]) ||
      lessons(recent)[0]);

  function renderGrid(items: Course[], emptyTitle: string, emptyBody: string) {
    if (!items.length)
      return (
        <Empty title={emptyTitle} body={emptyBody}>
          <Link href="/courses/" className="btn outline">
            Browse catalog
          </Link>
        </Empty>
      );
    return (
      <div className="course-grid">
        {items.map((c) => (
          <div key={c.id}>
            <CourseCard c={c} learning={s.enrolled.includes(c.id)} />
            {progress(c) === 100 && (
              <button
                type="button"
                className="btn outline full"
                style={{ marginTop: "0.65rem" }}
                onClick={() => certificate(c)}
              >
                <Download size={16} aria-hidden="true" />
                Download certificate
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="wrap page">
      <div className="dashboard-head">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <span className="eyebrow">
            <BookOpen size={15} aria-hidden="true" />
            My Studio
          </span>
          <h1 id="main-heading" tabIndex={-1}>
            Welcome back, Nadia.
          </h1>
          <p>Resume your active lessons and track your guided skill paths.</p>
        </div>

        <div className="panel goal-card">
          <div className="row spread">
            <strong className="row">
              <Flame
                size={16}
                style={{ color: "var(--accent)" }}
                aria-hidden="true"
              />
              {streak}-day streak
            </strong>
            <small>Weekly target</small>
          </div>
          <progress
            value={Math.min(5, weekCount)}
            max={5}
            aria-label="Weekly lesson target"
            style={{ inlineSize: "100%" }}
          />
          <small>
            {Math.min(5, weekCount)} of 5 lessons completed this week
          </small>
        </div>
      </div>

      <div className="kpis">
        {[
          { I: BookOpen, t: "Enrolled courses", v: enrolled.length },
          { I: CheckCheck, t: "Completed lessons", v: allDone.length },
          {
            I: Clock3,
            t: "Study time & pages",
            v: minutes + "m · " + pages + " pp",
          },
          { I: Award, t: "Certificates earned", v: complete.length },
        ].map(({ I, t, v }) => (
          <div className="panel kpi" key={t}>
            <span className="pillar-icon">
              <I size={18} aria-hidden="true" />
            </span>
            <small>{t}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {recent && active && (
        <div className="resume-banner">
          <img alt="" src={art} width={120} height={84} />
          <div className="grow">
            <small>Continue learning</small>
            <h2>{recent.title}</h2>
            <div className="row" style={{ marginBlock: "0.45rem" }}>
              <Badge type={active.type} />
              <span>{active.title}</span>
            </div>
            <div className="row">
              <Bar value={progress(recent)} />
              <strong>{progress(recent)}%</strong>
            </div>
          </div>
          <Link href={coursePath(recent, true)} className="btn primary">
            <Play size={16} aria-hidden="true" />
            Resume Lesson
          </Link>
        </div>
      )}

      <section style={{ marginBottom: "2.25rem" }}>
        <div className="row spread" style={{ marginBottom: "0.85rem" }}>
          <h2 className="row">
            <Route size={20} style={{ color: "var(--primary)" }} aria-hidden="true" />
            Active Skill Path
          </h2>
          <Link className="text-link" href="/paths/">
            All tracks
          </Link>
        </div>
        <div className="panel" style={{ padding: "1.25rem" }}>
          <div className="row spread" style={{ marginBottom: "0.6rem" }}>
            <div>
              <strong>{skillPaths[0].title}</strong>
              <p style={{ fontSize: "0.88rem" }}>{skillPaths[0].outcome}</p>
            </div>
            <strong>{pathProgress(skillPaths[0])}%</strong>
          </div>
          <Bar value={pathProgress(skillPaths[0])} />
        </div>
      </section>

      <h2>My courses</h2>
      <Tabs
        label="Course collections"
        activeId={tab}
        onChange={setTab}
        items={[
          {
            id: "progress",
            label: "In Progress (" + inProgress.length + ")",
            content: renderGrid(
              inProgress,
              "Ready for your next course?",
              "Explore the catalog or enroll in a guided skill path.",
            ),
          },
          {
            id: "completed",
            label: "Completed (" + complete.length + ")",
            content: renderGrid(
              complete,
              "No completed courses yet",
              "Finish every lesson in a course to unlock your certificate.",
            ),
          },
          {
            id: "saved",
            label: "Saved (" + saved.length + ")",
            content: renderGrid(
              saved,
              "No saved courses yet",
              "Bookmark any course card to keep it in your shortlist.",
            ),
          },
        ]}
      />
    </div>
  );
}

