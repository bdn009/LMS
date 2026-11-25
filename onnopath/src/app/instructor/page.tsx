"use client";
import { useEffect, useRef, useState } from "react";
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
import { MediaIcon, Modal, Tabs } from "../../ui";
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
          instructor: "Nadia Karim",
          role: "Studio instructor",
          cohort: "Open Cohort",
          portrait: 6,
          rating: 0,
          reviews: 0,
          students: 0,
          updated: new Date().toISOString().slice(0, 10),
          art: "/media/design-systems/cover.webp",
          outcomes: [""],
          modules: [
            { id: uid(), name: "Core studio session", lessons: [blank("Video")] },
          ],
          custom: true,
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, fail] = useState("");
  const [step, setStep] = useState("details");
  const [opened, open] = useState("");

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
      fail("The file could not be stored in browser storage.");
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
      setStep("details");
      fail("Add a course title, description, and instructor name.");
      return;
    }
    if (
      !draft.modules.length ||
      draft.modules.some((m) => !m.name.trim() || !m.lessons.length)
    ) {
      setStep("curriculum");
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
        setStep("curriculum");
        open(l.id);
        fail(
          "Every lesson needs a title, valid media source, and positive duration or page count.",
        );
        return;
      }
    }
    const c = {
      ...draft,
      title: draft.title.trim(),
      outcomes: draft.outcomes.map((x) => x.trim()).filter(Boolean),
      updated: new Date().toISOString().slice(0, 10),
    };
    change((prev) => ({
      ...prev,
      edits: [...prev.edits.filter((e) => e.id !== c.id), c],
    }));
    toast(course ? "Course updated" : "Course added to catalog");
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
      <Tabs
        label="Course builder steps"
        activeId={step}
        onChange={setStep}
        items={[
          {
            id: "details",
            label: "Course details",
            content: (
              <fieldset className="builder-form" disabled={busy}>
                <div className="field">
                  <label htmlFor="b-title">Course title</label>
                  <input
                    id="b-title"
                    type="text"
                    value={draft.title}
                    placeholder="e.g. Accessible Motion Systems"
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="b-desc">Description</label>
                  <textarea
                    id="b-desc"
                    value={draft.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </div>
                <div className="form-cols">
                  <div className="field">
                    <label htmlFor="b-cat">Category</label>
                    <select
                      id="b-cat"
                      value={draft.category}
                      onChange={(e) => patch({ category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="b-level">Skill level</label>
                    <select
                      id="b-level"
                      value={draft.level}
                      onChange={(e) => patch({ level: e.target.value })}
                    >
                      {["Beginner", "Intermediate", "Advanced"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-cols">
                  <div className="field">
                    <label htmlFor="b-price">Price (USD)</label>
                    <input
                      id="b-price"
                      type="number"
                      min="0"
                      value={draft.price}
                      onChange={(e) =>
                        patch({ price: Math.max(0, +e.target.value) })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="b-inst">Instructor</label>
                    <input
                      id="b-inst"
                      type="text"
                      value={draft.instructor}
                      onChange={(e) => patch({ instructor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="b-outcomes">
                    Learning outcomes (one per line)
                  </label>
                  <textarea
                    id="b-outcomes"
                    value={draft.outcomes.join("\n")}
                    onChange={(e) =>
                      patch({ outcomes: e.target.value.split("\n") })
                    }
                  />
                </div>
              </fieldset>
            ),
          },
          {
            id: "curriculum",
            label: "Curriculum",
            content: (
              <fieldset className="builder-form" disabled={busy}>
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
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="field">
                      <label htmlFor={"mod-" + m.id}>Module name</label>
                      <input
                        id={"mod-" + m.id}
                        type="text"
                        value={m.name}
                        onChange={(e) =>
                          modulePatch(m.id, { name: e.target.value })
                        }
                      />
                    </div>
                    {m.lessons.map((l, li) => (
                      <div className="builder-lesson" key={l.id}>
                        <div className="row">
                          <button
                            type="button"
                            className="lesson-edit"
                            onClick={() => open(opened === l.id ? "" : l.id)}
                          >
                            <MediaIcon type={l.type} />
                            <strong>
                              {l.title ||
                                "Untitled " + l.type.toLowerCase() + " lesson"}
                            </strong>
                            <ChevronDown size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={"Remove lesson " + (li + 1)}
                            className="icon-btn"
                            onClick={() =>
                              modulePatch(m.id, {
                                lessons: m.lessons.filter((x) => x.id !== l.id),
                              })
                            }
                          >
                            <X size={15} aria-hidden="true" />
                          </button>
                        </div>
                        {opened === l.id && (
                          <div className="builder-form">
                            <div className="field">
                              <label htmlFor={"lt-" + l.id}>Lesson title</label>
                              <input
                                id={"lt-" + l.id}
                                type="text"
                                value={l.title}
                                onChange={(e) =>
                                  update(m.id, l.id, { title: e.target.value })
                                }
                              />
                            </div>
                            <div className="field">
                              <label htmlFor={"ls-" + l.id}>
                                Lesson summary
                              </label>
                              <textarea
                                id={"ls-" + l.id}
                                value={l.summary}
                                onChange={(e) =>
                                  update(m.id, l.id, {
                                    summary: e.target.value,
                                  })
                                }
                              />
                            </div>
                            {l.type === "Quiz" ? (
                              <p>
                                {l.questions?.length} configured questions
                              </p>
                            ) : l.type === "Slides" ? (
                              <>
                                <div className="field">
                                  <label htmlFor={"lu-" + l.id}>
                                    Upload slide images
                                  </label>
                                  <input
                                    id={"lu-" + l.id}
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
                                            caption: f.name.replace(
                                              /\.[^.]+$/,
                                              "",
                                            ),
                                          })),
                                        );
                                        update(m.id, l.id, {
                                          images: [
                                            ...(l.images || []),
                                            ...imgs,
                                          ],
                                        });
                                      });
                                    }}
                                  />
                                </div>
                                {l.images?.map((img, j) => (
                                  <div className="row" key={img.src}>
                                    <div className="field grow">
                                      <label htmlFor={"lc-" + l.id + "-" + j}>
                                        Slide {j + 1} caption
                                      </label>
                                      <input
                                        id={"lc-" + l.id + "-" + j}
                                        type="text"
                                        value={img.caption}
                                        onChange={(e) =>
                                          update(m.id, l.id, {
                                            images: l.images?.map((x, k) =>
                                              k === j
                                                ? {
                                                    ...x,
                                                    caption: e.target.value,
                                                  }
                                                : x,
                                            ),
                                          })
                                        }
                                      />
                                    </div>
                                    <button
                                      type="button"
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
                                      <X size={15} aria-hidden="true" />
                                    </button>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                <div className="field">
                                  <label htmlFor={"lf-" + l.id}>
                                    {l.type === "PDF"
                                      ? "Upload PDF document"
                                      : "Upload video file"}
                                  </label>
                                  <input
                                    id={"lf-" + l.id}
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
                                            const pdf = await import(
                                              "pdfjs-dist"
                                            );
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
                                </div>
                                {l.src?.startsWith("local:") ? (
                                  <small>Uploaded file stored locally</small>
                                ) : (
                                  <div className="field">
                                    <label htmlFor={"lurl-" + l.id}>
                                      {l.type} URL
                                    </label>
                                    <input
                                      id={"lurl-" + l.id}
                                      type="text"
                                      placeholder="https://…"
                                      value={l.src || ""}
                                      onChange={(e) =>
                                        update(m.id, l.id, {
                                          src: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                )}
                                {l.type === "Video" ? (
                                  <>
                                    <div className="field">
                                      <label htmlFor={"lsec-" + l.id}>
                                        Duration (seconds)
                                      </label>
                                      <input
                                        id={"lsec-" + l.id}
                                        type="number"
                                        min="1"
                                        value={l.seconds || ""}
                                        onChange={(e) =>
                                          update(m.id, l.id, {
                                            seconds: +e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="field">
                                      <label htmlFor={"lres-" + l.id}>
                                        Supplemental PDFs or images
                                      </label>
                                      <input
                                        id={"lres-" + l.id}
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
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="field">
                                      <label htmlFor={"lpg-" + l.id}>
                                        Page count
                                      </label>
                                      <input
                                        id={"lpg-" + l.id}
                                        type="number"
                                        min="1"
                                        value={l.pages || ""}
                                        onChange={(e) =>
                                          update(m.id, l.id, {
                                            pages: +e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <label
                                      className="check-line"
                                      htmlFor={"ldl-" + l.id}
                                    >
                                      <input
                                        id={"ldl-" + l.id}
                                        type="checkbox"
                                        checked={!!l.download}
                                        onChange={(e) =>
                                          update(m.id, l.id, {
                                            download: e.target.checked,
                                          })
                                        }
                                      />
                                      <span>Allow PDF download</span>
                                    </label>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="row" style={{ flexWrap: "wrap" }}>
                      {(["Video", "PDF", "Slides"] as Format[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="btn outline"
                          onClick={() => {
                            const l = blank(type);
                            modulePatch(m.id, {
                              lessons: [...m.lessons, l],
                            });
                            open(l.id);
                          }}
                        >
                          <Plus size={14} aria-hidden="true" />
                          {type === "Slides" ? "Image set" : type}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
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
                  <Plus size={16} aria-hidden="true" />
                  Add module
                </button>
              </fieldset>
            ),
          },
        ]}
      />

      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}

      <div className="builder-bottom">
        <small>{busy ? "Saving file…" : "Stored in local browser studio"}</small>
        {step === "details" ? (
          <button
            type="button"
            className="btn primary"
            disabled={busy}
            onClick={() => setStep("curriculum")}
          >
            Continue to curriculum
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            className="btn primary"
            onClick={submit}
          >
            <Save size={16} aria-hidden="true" />
            Save course
          </button>
        )}
      </div>
    </Modal>
  );
}

export default function Instructor() {
  const { courses, s } = useStore();
  const [editor, setEditor] = useState<Course | "new" | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });

    function sortRows(
      rows: HTMLTableRowElement[],
      index: number,
      type: string | undefined,
      direction: "ascending" | "descending",
    ) {
      const factor = direction === "ascending" ? 1 : -1;
      const value = (row: HTMLTableRowElement) => {
        const cell = row.cells[index];
        return cell?.dataset.value ?? cell?.textContent?.trim() ?? "";
      };
      return rows.sort((a, b) =>
        factor *
        (type === "number"
          ? Number(value(a)) - Number(value(b))
          : collator.compare(value(a), value(b))),
      );
    }

    function reorder(container: HTMLTableSectionElement, rows: HTMLTableRowElement[]) {
      for (const row of rows) {
        if (typeof (container as HTMLTableSectionElement & { moveBefore?: (node: Node, child: Node | null) => void }).moveBefore === "function") {
          (container as HTMLTableSectionElement & { moveBefore: (node: Node, child: Node | null) => void }).moveBefore(row, null);
        } else {
          container.appendChild(row);
        }
      }
    }

    function sortBy(button: HTMLButtonElement) {
      const th = button.closest("th");
      if (!th || !table) return;
      const direction: "ascending" | "descending" =
        th.getAttribute("aria-sort") === "ascending"
          ? "descending"
          : "ascending";

      for (const header of Array.from(table.tHead?.rows[0]?.cells || [])) {
        header.removeAttribute("aria-sort");
      }
      th.setAttribute("aria-sort", direction);

      const rows = sortRows(
        Array.from(tbody.rows),
        th.cellIndex,
        th.dataset.type,
        direction,
      );

      const tableWithVT = table as HTMLTableElement & {
        startViewTransition?: (cb: () => void) => void;
      };
      if (typeof tableWithVT.startViewTransition === "function") {
        tableWithVT.startViewTransition(() => reorder(tbody, rows));
      } else {
        reorder(tbody, rows);
      }

      if (statusRef.current) {
        statusRef.current.textContent = `Sorted by ${button.textContent?.trim()}, ${direction}, ${rows.length} rows`;
      }
    }

    const onCommand = (e: Event) => {
      const ev = e as Event & { command?: string; source?: HTMLElement | null };
      if (ev.command === "--sort" && ev.source instanceof HTMLButtonElement) {
        sortBy(ev.source);
      }
    };
    table.addEventListener("command", onCommand);

    const fallbackCleanups: (() => void)[] = [];
    if (!("commandForElement" in HTMLButtonElement.prototype)) {
      const btns = table.tHead?.querySelectorAll<HTMLButtonElement>(
        'button[command="--sort"]',
      );
      btns?.forEach((button) => {
        const handler = () => sortBy(button);
        button.addEventListener("click", handler);
        fallbackCleanups.push(() => button.removeEventListener("click", handler));
      });
    }

    return () => {
      table.removeEventListener("command", onCommand);
      fallbackCleanups.forEach((fn) => fn());
    };
  }, [courses]);

  const rated = courses.filter((c) => c.reviews);
  const students = courses.reduce(
    (n, c) => n + c.students + (s.enrolled.includes(c.id) ? 1 : 0),
    0,
  );
  const rating =
    rated.reduce((a, c) => a + c.rating * c.reviews, 0) /
    Math.max(
      1,
      rated.reduce((a, c) => a + c.reviews, 0),
    );

  return (
    <div className="wrap page">
      <div className="section-heading">
        <div className="page-intro" style={{ marginBottom: 0 }}>
          <span className="eyebrow">
            <Presentation size={15} aria-hidden="true" />
            Instructor Studio
          </span>
          <h1 id="main-heading" tabIndex={-1}>
            Cohort &amp; Course Studio.
          </h1>
          <p>
            Publish multi-format courses, upload local PDFs or videos, and sort
            live cohort metrics.
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => setEditor("new")}
        >
          <Plus size={17} aria-hidden="true" />
          Create course
        </button>
      </div>

      <div className="kpis">
        {[
          { I: Users, t: "Total enrolled fellows", v: students.toLocaleString() },
          { I: Coins, t: "Studio revenue (est.)", v: "$4,180" },
          { I: Star, t: "Weighted rating", v: rating.toFixed(1) + "/5" },
          {
            I: Activity,
            t: "Completed lessons (local)",
            v: Object.values(s.done).flat().length,
          },
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

      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        className="visually-hidden"
      />

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="studio-table-caption"
        className="table-wrapper"
      >
        <table
          id="studio-courses-table"
          ref={tableRef}
          className="studio-table"
        >
          <caption id="studio-table-caption">
            Published Courses &amp; Cohort Metrics (click column headers to sort)
          </caption>
          <thead>
            <tr>
              <th scope="col" data-type="text">
                <button
                  type="button"
                  {...({
                    commandfor: "studio-courses-table",
                    command: "--sort",
                  } as Record<string, string>)}
                >
                  <span>Course</span>
                  <span className="sort-indicator" aria-hidden="true">
                    <ChevronDown size={14} />
                  </span>
                </button>
              </th>
              <th scope="col" data-type="text">
                <button
                  type="button"
                  {...({
                    commandfor: "studio-courses-table",
                    command: "--sort",
                  } as Record<string, string>)}
                >
                  <span>Category</span>
                  <span className="sort-indicator" aria-hidden="true">
                    <ChevronDown size={14} />
                  </span>
                </button>
              </th>
              <th scope="col" data-type="number">
                <button
                  type="button"
                  {...({
                    commandfor: "studio-courses-table",
                    command: "--sort",
                  } as Record<string, string>)}
                >
                  <span>Fellows</span>
                  <span className="sort-indicator" aria-hidden="true">
                    <ChevronDown size={14} />
                  </span>
                </button>
              </th>
              <th scope="col" data-type="number">
                <button
                  type="button"
                  {...({
                    commandfor: "studio-courses-table",
                    command: "--sort",
                  } as Record<string, string>)}
                >
                  <span>Rating</span>
                  <span className="sort-indicator" aria-hidden="true">
                    <ChevronDown size={14} />
                  </span>
                </button>
              </th>
              <th scope="col" data-type="number">
                <button
                  type="button"
                  {...({
                    commandfor: "studio-courses-table",
                    command: "--sort",
                  } as Record<string, string>)}
                >
                  <span>Price</span>
                  <span className="sort-indicator" aria-hidden="true">
                    <ChevronDown size={14} />
                  </span>
                </button>
              </th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody key={courses.map((c) => c.id + c.updated).join("|")}>
            {courses.map((c) => {
              const count = c.students + (s.enrolled.includes(c.id) ? 1 : 0);
              return (
                <tr key={c.id}>
                  <th scope="row" data-value={c.title}>
                    <Link href={coursePath(c)}>{c.title}</Link>
                  </th>
                  <td data-value={c.category}>{c.category}</td>
                  <td data-value={count}>{count.toLocaleString()}</td>
                  <td data-value={c.rating}>
                    {c.rating ? c.rating.toFixed(1) + " ★" : "New"}
                  </td>
                  <td data-value={c.price}>{price(c.price)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => setEditor(c)}
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

