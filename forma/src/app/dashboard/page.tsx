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
} from "lucide-react";
import { Course, lessons, coursePath } from "../../data";
import { useStore } from "../../store";
import { Badge, Bar, CourseCard, Empty } from "../../ui";
import { useFile } from "../../files";
function certificate(c: Course) {
  const canvas = document.createElement("canvas");
  canvas.width = 1500;
  canvas.height = 900;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f6f4ff";
  ctx.fillRect(0, 0, 1500, 900);
  ctx.strokeStyle = "#5548dd";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 1420, 820);
  ctx.textAlign = "center";
  function line(text: string, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.font = "600 " + size + "px Arial";
    ctx.fillText(text, 750, y, 1320);
  }
  line("Forma Learning Studio", 160, 34, "#5548dd");
  line("Certificate of Completion", 300, 70, "#14122e");
  line("Awarded to", 414, 28, "#5c6174");
  line("Alex Morgan", 500, 64, "#14122e");
  line("for successfully completing", 575, 28, "#5c6174");
  line(c.title, 670, 48, "#5548dd");
  line(c.instructor + "  ·  Instructor", 765, 24, "#5c6174");
  const a = document.createElement("a");
  a.download = c.id + "-certificate.png";
  a.href = canvas.toDataURL();
  a.click();
}
export default function Dashboard() {
  const { courses, s, progress } = useStore(),
    [tab, setTab] = useState("In Progress");
  const enrolled = courses.filter((c) => s.enrolled.includes(c.id)),
    complete = enrolled.filter((c) => progress(c) === 100),
    recent = enrolled.find((c) => c.id === s.recent) || enrolled[0],
    art = useFile(recent?.art);
  const allDone = enrolled.flatMap((c) =>
      lessons(c).filter((l) => s.done[c.id]?.includes(l.id)),
    ),
    minutes = Math.round(
      allDone.reduce((a, l) => a + (l.seconds || 0), 0) / 60,
    ),
    pages = allDone.reduce((a, l) => a + (l.pages || 0), 0);
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
  const visible =
    tab === "Saved"
      ? courses.filter((c) => s.saved.includes(c.id))
      : tab === "Completed"
        ? complete
        : enrolled.filter((c) => progress(c) < 100);
  return (
    <div className="wrap page">
      <div className="dashboard-head">
        <div className="page-intro">
          <span className="eyebrow">
            <BookOpen size={16} /> My Learning
          </span>
          <h1>
            Welcome back, Alex<span className="heading-dot">.</span>
          </h1>
          <p>Pick up where you left off.</p>
        </div>
        <div className="goal panel">
          <div className="row spread">
            <b>
              <Flame size={16} /> {streak}-day streak
            </b>
            <small>Weekly goal</small>
          </div>
          <Bar value={Math.min(100, (weekCount / 5) * 100)} />
          <small>
            {Math.min(5, weekCount)} of 5 lessons completed this week
          </small>
        </div>
      </div>
      <div className="kpis">
        {[
          { I: BookOpen, t: "Enrolled courses", v: enrolled.length },
          { I: CheckCheck, t: "Completed items", v: allDone.length },
          {
            I: Clock3,
            t: "Study time & pages",
            v: minutes + "m · " + pages + " pp",
          },
          { I: Award, t: "Certificates earned", v: complete.length },
        ].map(({ I, t, v }) => (
          <div className="panel kpi" key={t}>
            <span className="feature-icon">
              <I size={19} />
            </span>
            <small>{t}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      {recent && active && (
        <div className="resume">
          <img alt="" src={art} />
          <div>
            <small>Continue learning</small>
            <h2>{recent.title}</h2>
            <div className="row">
              <Badge type={active.type} />
              <span>{active.title}</span>
            </div>
            <div className="row">
              <Bar value={progress(recent)} />
              <b>{progress(recent)}%</b>
            </div>
          </div>
          <Link href={coursePath(recent, true)} className="btn primary">
            <Play size={16} />
            Resume Lesson
          </Link>
        </div>
      )}
      <h2>My courses</h2>
      <div className="tabs">
        {["In Progress", "Completed", "Saved"].map((t) => (
          <button
            key={t}
            className={t === tab ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="course-grid">
          {visible.map((c) => (
            <div key={c.id}>
              <CourseCard c={c} learning={s.enrolled.includes(c.id)} />
              {progress(c) === 100 && (
                <button
                  className="btn outline full cert"
                  onClick={() => certificate(c)}
                >
                  <Download size={16} />
                  Download certificate
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "Saved"
              ? "No saved courses yet"
              : tab === "Completed"
                ? "Your completed courses will appear here"
                : "Ready for your next course?"
          }
          body={
            tab === "Saved"
              ? "Use the bookmark on a course card to save it here."
              : "Explore a course or continue learning to build your progress."
          }
        >
          <Link href="/courses/" className="btn outline">
            Browse catalog
          </Link>
        </Empty>
      )}
    </div>
  );
}
