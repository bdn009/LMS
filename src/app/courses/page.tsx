"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, X, Compass } from "lucide-react";
import { CourseCard, Empty, Modal } from "../../ui";
import { useStore } from "../../store";
import { categories, lessons, Course } from "../../data";
const groups = [
  { title: "Category", values: [...categories] },
  { title: "Skill level", values: ["Beginner", "Intermediate", "Advanced"] },
  { title: "Content format", values: ["Video", "PDF Guides", "Visual Slides"] },
  { title: "Price", values: ["Free", "Paid"] },
];
function matches(c: Course, value: string) {
  if (value === "Free" || value === "Paid")
    return value === (c.price ? "Paid" : "Free");
  if (["Video", "PDF Guides", "Visual Slides"].includes(value))
    return lessons(c).some(
      (l) =>
        l.type ===
        { Video: "Video", "PDF Guides": "PDF", "Visual Slides": "Slides" }[
          value
        ],
    );
  return c.category === value || c.level === value;
}
export default function Catalog() {
  const { courses } = useStore(),
    [q, setQ] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [sort, setSort] = useState("Most Popular"),
    [drawer, setDrawer] = useState(false);
  function toggle(x: string) {
    setSelected((s) => (s.includes(x) ? s.filter((v) => v !== x) : [...s, x]));
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
  const form = (
    <>
      {groups.map((g) => (
        <fieldset key={g.title}>
          <legend>{g.title}</legend>
          {g.values.map((v) => (
            <label key={v}>
              <input
                type="checkbox"
                checked={selected.includes(v)}
                onChange={() => toggle(v)}
              />
              {v}
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
  return (
    <div className="wrap page">
      <div className="page-intro">
        <span className="eyebrow">
          <Compass size={16} /> Course catalog
        </span>
        <h1>
          Explore courses<span className="heading-dot">.</span>
        </h1>
        <p>
          Find your next project in design, development, data, and business.
        </p>
      </div>
      <div className="catalog-layout">
        <aside className="panel filter-panel">
          <h3>
            <SlidersHorizontal size={18} /> Filters
          </h3>
          {form}
        </aside>
        <section>
          <div className="catalog-tools">
            <label className="input-icon">
              <Search size={18} />
              <input
                aria-label="Search catalog"
                placeholder="Search courses, topics, or instructors"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <select
              aria-label="Sort courses"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {["Most Popular", "Highest Rated", "Newest"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              className="btn outline mobile-filter"
              onClick={() => setDrawer(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
          <div className="filter-summary">
            <strong>
              {list.length} {list.length === 1 ? "course" : "courses"}
            </strong>
            {selected.map((x) => (
              <button key={x} onClick={() => toggle(x)}>
                {x}
                <X size={12} />
              </button>
            ))}
            {(q || selected.length > 0) && (
              <button className="reset" onClick={reset}>
                Clear all
              </button>
            )}
          </div>
          {list.length ? (
            <div className="course-grid catalog-cards">
              {list.map((c) => (
                <CourseCard c={c} key={c.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="No matching courses"
              body="Try a different search or clear your filters."
            >
              <button className="btn outline" onClick={reset}>
                Clear filters
              </button>
            </Empty>
          )}
        </section>
      </div>
      {drawer && (
        <Modal title="Filter courses" onClose={() => setDrawer(false)}>
          <div className="drawer-filters">{form}</div>
          <button className="btn primary" onClick={() => setDrawer(false)}>
            Show {list.length} courses
          </button>
        </Modal>
      )}
    </div>
  );
}
