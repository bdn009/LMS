"use client";
import { useState } from "react";
import { Compass, Search, SlidersHorizontal, X } from "lucide-react";
import { CourseCard, Empty, Modal } from "../../ui";
import { useStore } from "../../store";
import { categories, lessons, Course } from "../../data";

const groups = [
  { title: "Category", values: [...categories] },
  { title: "Skill level", values: ["Beginner", "Intermediate", "Advanced"] },
  {
    title: "Studio format",
    values: ["Video", "PDF Workbooks", "Visual Slides"],
  },
  { title: "Access", values: ["Free", "Paid"] },
];

function matches(c: Course, value: string) {
  if (value === "Free" || value === "Paid")
    return value === (c.price ? "Paid" : "Free");
  if (["Video", "PDF Workbooks", "Visual Slides"].includes(value)) {
    const map: Record<string, string> = {
      Video: "Video",
      "PDF Workbooks": "PDF",
      "Visual Slides": "Slides",
    };
    return lessons(c).some((l) => l.type === map[value]);
  }
  return c.category === value || c.level === value;
}

export default function Catalog() {
  const { courses } = useStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState("Most Popular");
  const [drawer, setDrawer] = useState(false);

  function toggle(x: string) {
    setSelected((prev) =>
      prev.includes(x) ? prev.filter((v) => v !== x) : [...prev, x],
    );
  }

  function reset() {
    setQ("");
    setSelected([]);
  }

  const list = courses
    .filter(
      (c) =>
        (c.title + " " + c.description + " " + c.category + " " + c.instructor)
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        groups.every((g) => {
          const on = g.values.filter((x) => selected.includes(x));
          return !on.length || on.some((v) => matches(c, v));
        }),
    )
    .sort((a, b) =>
      sort === "Highest Rated"
        ? b.rating - a.rating
        : sort === "Newest"
          ? b.updated.localeCompare(a.updated)
          : b.students - a.students,
    );

  const form = (prefix: string) => (
    <>
      {groups.map((g) => (
        <fieldset key={g.title}>
          <legend>{g.title}</legend>
          {g.values.map((v) => {
            const id = prefix + "-" + v.toLowerCase().replace(/[^a-z0-9]/g, "-");
            return (
              <label key={v} className="filter-check" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={selected.includes(v)}
                  onChange={() => toggle(v)}
                />
                <span>{v}</span>
              </label>
            );
          })}
        </fieldset>
      ))}
    </>
  );

  return (
    <div className="wrap page">
      <div className="page-intro">
        <span className="eyebrow">
          <Compass size={15} aria-hidden="true" />
          Course Catalog
        </span>
        <h1 id="main-heading" tabIndex={-1}>
          Explore studio courses.
        </h1>
        <p>
          Build practical fluency across design systems, frontend architecture,
          applied AI, and product strategy.
        </p>
      </div>

      <div className="catalog-layout">
        <aside className="panel filter-panel">
          <h2>
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filters
          </h2>
          {form("desk")}
        </aside>

        <section>
          <search>
            <div className="catalog-tools">
              <label htmlFor="catalog-search" className="visually-hidden">
                Search catalog
              </label>
              <div className="input-icon">
                <Search size={17} aria-hidden="true" />
                <input
                  id="catalog-search"
                  type="search"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Search courses, topics, or instructors"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <label htmlFor="catalog-sort" className="visually-hidden">
                Sort courses
              </label>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {["Most Popular", "Highest Rated", "Newest"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn outline mobile-filter"
                onClick={() => setDrawer(true)}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
              </button>
            </div>
          </search>

          <div className="filter-summary">
            <strong>
              {list.length} {list.length === 1 ? "course" : "courses"}
            </strong>
            {selected.map((x) => (
              <button
                type="button"
                className="filter-chip"
                key={x}
                onClick={() => toggle(x)}
              >
                {x}
                <X size={12} aria-hidden="true" />
              </button>
            ))}
            {(q || selected.length > 0) && (
              <button type="button" className="text-link" onClick={reset}>
                Clear all
              </button>
            )}
          </div>

          {list.length ? (
            <div className="course-grid">
              {list.map((c) => (
                <CourseCard c={c} key={c.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="No matching courses"
              body="Try a different keyword or clear active filters."
            >
              <button type="button" className="btn outline" onClick={reset}>
                Clear filters
              </button>
            </Empty>
          )}
        </section>
      </div>

      {drawer && (
        <Modal title="Filter courses" onClose={() => setDrawer(false)}>
          <div className="drawer-filters">{form("mob")}</div>
          <button
            type="button"
            className="btn primary full"
            style={{ marginTop: "1rem" }}
            onClick={() => setDrawer(false)}
          >
            Show {list.length} courses
          </button>
        </Modal>
      )}
    </div>
  );
}

