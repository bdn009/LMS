"use client";
import Link from "next/link";
import { Check, ChevronRight, Compass, Play, Route } from "lucide-react";
import { coursePath, lessons, skillPaths } from "../../data";
import { useStore } from "../../store";
import { Bar } from "../../ui";

export default function PathsPage() {
  const { courses, s, progress, pathProgress, enrollPath } = useStore();

  return (
    <div className="wrap page">
      <div className="page-intro">
        <span className="eyebrow">
          <Route size={15} aria-hidden="true" />
          Guided Skill Tracks
        </span>
        <h1 id="main-heading" tabIndex={-1}>
          Structured paths from basics to craft.
        </h1>
        <p>
          Each OnnoPath track sequences multi-format studio courses into a clear
          milestone sequence. Enroll in a full track or jump into individual
          steps.
        </p>
      </div>

      <div className="path-grid">
        {skillPaths.map((p) => {
          const trackCourses = p.courseIds
            .map((id) => courses.find((c) => c.id === id))
            .filter((c): c is NonNullable<typeof c> => Boolean(c));
          const allEnrolled = trackCourses.every((c) =>
            s.enrolled.includes(c.id),
          );
          const pct = pathProgress(p);

          return (
            <section className="panel path-card" key={p.id}>
              <div className="row spread" style={{ flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <span className="tag">{p.duration}</span>
                  <h2 style={{ marginTop: "0.6rem" }}>{p.title}</h2>
                  <p style={{ marginTop: "0.35rem", maxWidth: "60ch" }}>
                    {p.tagline}
                  </p>
                </div>
                <div className="row">
                  {allEnrolled ? (
                    <Link
                      className="btn primary"
                      href={coursePath(trackCourses[0], true)}
                    >
                      <Play size={16} aria-hidden="true" />
                      Continue Track
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => enrollPath(p)}
                    >
                      <Compass size={16} aria-hidden="true" />
                      Enroll in Full Path
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="row spread" style={{ marginBottom: "0.45rem" }}>
                  <small>
                    Outcome: <strong>{p.outcome}</strong>
                  </small>
                  <strong>{pct}% complete</strong>
                </div>
                <Bar value={pct} />
              </div>

              <div className="path-steps">
                {trackCourses.map((c, idx) => {
                  const pctCourse = progress(c);
                  const enrolled = s.enrolled.includes(c.id);
                  return (
                    <article className="path-step-card" key={c.id}>
                      <div className="row spread">
                        <small>Step {idx + 1}</small>
                        {pctCourse === 100 ? (
                          <span className="tag">
                            <Check size={12} aria-hidden="true" />
                            Done
                          </span>
                        ) : (
                          <small>{pctCourse}%</small>
                        )}
                      </div>
                      <h3>
                        <Link href={coursePath(c)}>{c.title}</Link>
                      </h3>
                      <small>
                        {c.instructor} · {lessons(c).length} lessons · {c.level}
                      </small>
                      <Link
                        className="text-link"
                        href={coursePath(c, enrolled)}
                        style={{ marginTop: "0.35rem" }}
                      >
                        {enrolled ? "Open studio" : "View syllabus"}
                        <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

