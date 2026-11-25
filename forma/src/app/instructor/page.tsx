"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ChevronDown,
  Coins,
  Pencil,
  Plus,
  Presentation,
  Save,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Course,
  Format,
  Lesson,
  Module,
  Resource,
  categories,
  coursePath,
  lessons,
  price,
} from "../../data";
import { useStore } from "../../store";
import { MediaIcon, Modal } from "../../ui";
import { saveFile } from "../../files";
function uid() {
  return crypto.randomUUID();
}
function blank(type: Format): Lesson {
  return {
    id: uid(),
    title: "",
    type,
    summary: "",
    ...(type === "Video"
      ? { seconds: 60, src: "" }
      : type === "PDF"
        ? { pages: 1, src: "", download: true }
        : { images: [] }),
  };
}
function Builder({ course, close }: { course?: Course; close: () => void }) {
  const { change, toast } = useStore();
  const [draft, set] = useState<Course>(() =>
    course
      ? structuredClone(course)
      : {
          id: uid(),
          title: "",
          level: "Beginner",
          category: categories[0],
          description: "",
          price: 0,
          instructor: "Alex Morgan",
          role: "Course instructor",
          portrait: 6,
          rating: 0,
          reviews: 0,
          students: 0,
          updated: new Date().toISOString().slice(0, 10),
          art: "/media/design-systems/cover.webp",
          outcomes: [""],
          modules: [
            { id: uid(), name: "Foundations", lessons: [blank("Video")] },
          ],
          custom: true,
        },
  );
  const [busy, setBusy] = useState(false),
    [error, fail] = useState(""),
    [step, setStep] = useState(0),
    [opened, open] = useState("");
  function patch(v: Partial<Course>) {
    set((d) => ({ ...d, ...v }));
  }
  function modulePatch(id: string, v: Partial<Module>) {
    set((d) => ({
      ...d,
      modules: d.modules.map((m) => (m.id === id ? { ...m, ...v } : m)),
    }));
  }
  function update(mid: string, id: string, v: Partial<Lesson>) {
    set((d) => ({
      ...d,
      modules: d.modules.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.id === id ? { ...l, ...v } : l)),
            }
          : m,
      ),
    }));
  }
  async function upload(action: () => Promise<void>) {
    setBusy(true);
    fail("");
    try {
      await action();
    } catch {
      fail(
        "The file could not be stored. Check browser storage and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function submit() {
    if (
      !draft.title.trim() ||
      !draft.description.trim() ||
      !draft.instructor.trim()
    ) {
      setStep(0);
      fail("Add a title, description, and instructor name.");
      return;
    }
    if (
      !draft.modules.length ||
      draft.modules.some((m) => !m.name.trim() || !m.lessons.length)
    ) {
      setStep(1);
      fail("Give each module a name and at least one lesson.");
      return;
    }
    for (const l of lessons(draft)) {
      const invalid =
        !l.title.trim() ||
        (l.type === "Slides"
          ? !l.images?.length
          : l.type === "Quiz"
            ? !l.questions?.length
            : !l.src || !/^(https?:\/\/|local:|\/media\/)/.test(l.src)) ||
        (l.type === "Video" && !(Number(l.seconds) > 0)) ||
        (l.type === "PDF" && !(Number(l.pages) > 0));
      if (invalid) {
        setStep(1);
        open(l.id);
        fail(
          "Add a lesson title, a valid media source, and positive duration or page count.",
        );
        return;
      }
    }
    const c = {
      ...draft,
      title: draft.title.trim(),
      outcomes: draft.outcomes.map((s) => s.trim()).filter(Boolean),
      updated: new Date().toISOString().slice(0, 10),
    };
    change((s) => ({
      ...s,
      edits: [...s.edits.filter((e) => e.id !== c.id), c],
    }));
    toast(course ? "Course updated" : "Course added to the catalog");
    close();
  }
  return (
    <Modal
      wide
      title={course ? "Edit course" : "Create a course"}
      onClose={() => {
        if (!busy) close();
      }}
    >
      <div className="tabs builder-tabs">
        <button className={step === 0 ? "on" : ""} onClick={() => setStep(0)}>
          Course details
        </button>
        <button className={step === 1 ? "on" : ""} onClick={() => setStep(1)}>
          Curriculum
        </button>
      </div>
      <fieldset className="builder-form" disabled={busy}>
        {step === 0 ? (
          <>
            <label>
              Course title
              <input
                value={draft.title}
                placeholder="e.g. Interaction Design Foundations"
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </label>
            <div className="form-cols">
              <label>
                Category
                <select
                  value={draft.category}
                  onChange={(e) => patch({ category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Skill level
                <select
                  value={draft.level}
                  onChange={(e) => patch({ level: e.target.value })}
                >
                  {["Beginner", "Intermediate", "Advanced"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-cols">
              <label>
                Price (USD)
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(e) =>
                    patch({ price: Math.max(0, +e.target.value) })
                  }
                />
              </label>
              <label>
                Instructor
                <input
                  value={draft.instructor}
                  onChange={(e) => patch({ instructor: e.target.value })}
                />
              </label>
            </div>
            <label>
              Learning outcomes, one per line
              <textarea
                value={draft.outcomes.join("\n")}
                onChange={(e) =>
                  patch({ outcomes: e.target.value.split("\n") })
                }
              />
            </label>
          </>
        ) : (
          <>
            {draft.modules.map((m, mi) => (
              <div className="builder-module" key={m.id}>
                <div className="row spread">
                  <small>Module {mi + 1}</small>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={"Remove module " + (mi + 1)}
                    onClick={() =>
                      patch({
                        modules: draft.modules.filter((x) => x.id !== m.id),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <label>
                  Module name
                  <input
                    value={m.name}
                    onChange={(e) =>
                      modulePatch(m.id, { name: e.target.value })
                    }
                  />
                </label>
                {m.lessons.map((l, li) => (
                  <div className="builder-lesson" key={l.id}>
                    <div className="row">
                      <button
                        className="lesson-edit"
                        onClick={() => open(opened === l.id ? "" : l.id)}
                      >
                        <MediaIcon type={l.type} />
                        <strong>
                          {l.title ||
                            "Untitled " + l.type.toLowerCase() + " lesson"}
                        </strong>
                        <ChevronDown size={15} />
                      </button>
                      <button
                        aria-label={"Remove lesson " + (li + 1)}
                        className="icon-btn"
                        onClick={() =>
                          modulePatch(m.id, {
                            lessons: m.lessons.filter((x) => x.id !== l.id),
                          })
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                    {opened === l.id && (
                      <div className="lesson-fields">
                        <label>
                          Lesson title
                          <input
                            value={l.title}
                            onChange={(e) =>
                              update(m.id, l.id, { title: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Lesson summary
                          <textarea
                            value={l.summary}
                            onChange={(e) =>
                              update(m.id, l.id, { summary: e.target.value })
                            }
                          />
                        </label>
                        {l.type === "Quiz" ? (
                          <p>{l.questions?.length} configured questions</p>
                        ) : l.type === "Slides" ? (
                          <>
                            <label>
                              Upload images
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(
                                    e.target.files || [],
                                  );
                                  upload(async () => {
                                    const imgs = await Promise.all(
                                      files.map(async (f) => ({
                                        src: await saveFile(f),
                                        caption: f.name.replace(/\.[^.]+$/, ""),
                                      })),
                                    );
                                    update(m.id, l.id, {
                                      images: [...(l.images || []), ...imgs],
                                    });
                                  });
                                }}
                              />
                            </label>
                            {l.images?.map((img, j) => (
                              <div className="row" key={img.src}>
                                <label>
                                  Image {j + 1} caption
                                  <input
                                    value={img.caption}
                                    onChange={(e) =>
                                      update(m.id, l.id, {
                                        images: l.images?.map((x, k) =>
                                          k === j
                                            ? { ...x, caption: e.target.value }
                                            : x,
                                        ),
                                      })
                                    }
                                  />
                                </label>
                                <button
                                  className="icon-btn"
                                  aria-label="Remove image"
                                  onClick={() =>
                                    update(m.id, l.id, {
                                      images: l.images?.filter(
                                        (_, k) => k !== j,
                                      ),
                                    })
                                  }
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <label>
                              {l.type === "PDF" ? "PDF document" : "Video file"}
                              <input
                                type="file"
                                accept={
                                  l.type === "PDF"
                                    ? "application/pdf"
                                    : "video/*"
                                }
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f)
                                    upload(async () => {
                                      let pages: number | undefined;
                                      if (l.type === "PDF") {
                                        const pdf = await import("pdfjs-dist");
                                        pdf.GlobalWorkerOptions.workerSrc =
                                          "/pdf.worker.min.mjs";
                                        const task = pdf.getDocument({
                                          data: await f.arrayBuffer(),
                                        });
                                        const doc = await task.promise;
                                        pages = doc.numPages;
                                        await task.destroy();
                                      }
                                      const src = await saveFile(f);
                                      update(m.id, l.id, {
                                        src,
                                        ...(pages ? { pages } : {}),
                                      });
                                    });
                                }}
                              />
                            </label>
                            {l.src?.startsWith("local:") ? (
                              <small>Uploaded file attached</small>
                            ) : (
                              <label>
                                {l.type} URL
                                <input
                                  placeholder="https://…"
                                  value={l.src || ""}
                                  onChange={(e) =>
                                    update(m.id, l.id, { src: e.target.value })
                                  }
                                />
                              </label>
                            )}
                            {l.type === "Video" ? (
                              <>
                                <label>
                                  Duration in seconds
                                  <input
                                    type="number"
                                    min="1"
                                    value={l.seconds || ""}
                                    onChange={(e) =>
                                      update(m.id, l.id, {
                                        seconds: +e.target.value,
                                      })
                                    }
                                  />
                                </label>
                                <label>
                                  Supplemental PDFs or images
                                  <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    multiple
                                    onChange={(e) => {
                                      const fs = Array.from(
                                        e.target.files || [],
                                      );
                                      upload(async () => {
                                        const rs: Resource[] =
                                          await Promise.all(
                                            fs.map(async (f) => ({
                                              src: await saveFile(f),
                                              type:
                                                f.type === "application/pdf"
                                                  ? "PDF"
                                                  : "Slides",
                                              name: f.name,
                                            })),
                                          );
                                        update(m.id, l.id, {
                                          resources: [
                                            ...(l.resources || []),
                                            ...rs,
                                          ],
                                        });
                                      });
                                    }}
                                  />
                                </label>
                                {l.resources?.map((r, j) => (
                                  <div className="row spread" key={j}>
                                    <small>{r.name}</small>
                                    <button
                                      aria-label="Remove resource"
                                      className="icon-btn"
                                      onClick={() =>
                                        update(m.id, l.id, {
                                          resources: l.resources?.filter(
                                            (_, k) => k !== j,
                                          ),
                                        })
                                      }
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                <label>
                                  Page count
                                  <input
                                    type="number"
                                    min="1"
                                    value={l.pages || ""}
                                    onChange={(e) =>
                                      update(m.id, l.id, {
                                        pages: +e.target.value,
                                      })
                                    }
                                  />
                                </label>
                                <label className="check-line">
                                  <input
                                    type="checkbox"
                                    checked={!!l.download}
                                    onChange={(e) =>
                                      update(m.id, l.id, {
                                        download: e.target.checked,
                                      })
                                    }
                                  />
                                  Allow PDF download
                                </label>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="row add-lessons">
                  {(["Video", "PDF", "Slides"] as Format[]).map((type) => (
                    <button
                      key={type}
                      className="btn outline"
                      onClick={() => {
                        const l = blank(type);
                        modulePatch(m.id, { lessons: [...m.lessons, l] });
                        open(l.id);
                      }}
                    >
                      <Plus size={13} />
                      {type === "Slides" ? "Image set" : type}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="btn outline"
              onClick={() =>
                patch({
                  modules: [
                    ...draft.modules,
                    { id: uid(), name: "", lessons: [] },
                  ],
                })
              }
            >
              <Plus size={16} />
              Add module
            </button>
          </>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="builder-bottom">
        <small>
          {busy ? "Saving file…" : "Saved to this browser workspace"}
        </small>
        {step === 0 ? (
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => setStep(1)}
          >
            Continue to curriculum
          </button>
        ) : (
          <button disabled={busy} className="btn primary" onClick={submit}>
            <Save size={16} />
            Save course
          </button>
        )}
      </div>
    </Modal>
  );
}
export default function Instructor() {
  const { courses, s } = useStore(),
    [editor, setEditor] = useState<Course | "new" | null>(null);
  const rated = courses.filter((c) => c.reviews),
    students = courses.reduce(
      (n, c) => n + c.students + (s.enrolled.includes(c.id) ? 1 : 0),
      0,
    ),
    rating =
      rated.reduce((a, c) => a + c.rating * c.reviews, 0) /
      Math.max(
        1,
        rated.reduce((a, c) => a + c.reviews, 0),
      );
  return (
    <div className="wrap page">
      <div className="section-heading">
        <div className="page-intro">
          <span className="eyebrow">
            <Presentation size={16} /> Instructor view
          </span>
          <h1>
            Instructor Studio<span className="heading-dot">.</span>
          </h1>
          <p>Manage your courses, curriculum, and teaching resources.</p>
        </div>
        <button className="btn primary" onClick={() => setEditor("new")}>
          <Plus size={17} />
          Create course
        </button>
      </div>
      <div className="kpis">
        {[
          { I: Users, t: "Total students", v: students.toLocaleString() },
          { I: Coins, t: "Monthly earnings", v: "$3,240" },
          { I: Star, t: "Average rating", v: rating.toFixed(1) + "/5" },
          {
            I: Activity,
            t: "Lessons completed locally",
            v: Object.values(s.done).flat().length,
          },
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
      <h2>Your courses</h2>
      <p className="muted studio-note">
        Sample enrollment and earnings data. Course edits are stored on this
        device.
      </p>
      <div className="panel studio-list">
        {courses.map((c) => (
          <div className="studio-course" key={c.id}>
            <img src={c.art} alt="" />
            <div>
              <small>{c.category}</small>
              <h3>
                <Link href={coursePath(c)}>{c.title}</Link>
              </h3>
              <p>
                {c.modules.length} modules · {lessons(c).length} lessons ·{" "}
                {price(c.price)}
              </p>
            </div>
            <button className="btn outline" onClick={() => setEditor(c)}>
              <Pencil size={14} />
              Edit
            </button>
          </div>
        ))}
      </div>
      {editor && (
        <Builder
          course={editor === "new" ? undefined : editor}
          close={() => setEditor(null)}
        />
      )}
    </div>
  );
}
