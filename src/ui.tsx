"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, ReactNode } from "react";
import {
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Image as Picture,
  Layers3,
  Menu,
  Search,
  SquareCheckBig,
  Star,
  Video,
  FileText,
  X,
  SlidersHorizontal,
  Presentation,
  Mail,
} from "lucide-react";
import { Course, Format, coursePath, price, lessons } from "./data";
import { useStore } from "./store";
import { useFile } from "./files";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Forma home">
      <img src="/icon.svg" alt="" width="32" height="32" />
      Forma
    </Link>
  );
}
export function MediaIcon({
  type,
  size = 15,
}: {
  type: Format;
  size?: number;
}) {
  const I = {
    Video: Video,
    PDF: FileText,
    Slides: Picture,
    Quiz: SquareCheckBig,
  }[type];
  return <I size={size} strokeWidth={1.75} />;
}
export function Badge({ type, label }: { type: Format; label?: string }) {
  return (
    <span className={"media-badge " + type.toLowerCase()}>
      <MediaIcon type={type} size={13} />
      {label || type}
    </span>
  );
}
export function Bar({ value }: { value: number }) {
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Completion"
    >
      <i style={{ width: value + "%" }} />
    </div>
  );
}
export function Portrait({ n, size = 24 }: { n: number; size?: number }) {
  return (
    <img
      className="avatar"
      width={size}
      height={size}
      src={"/people/" + n + ".jpg"}
      alt=""
    />
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      d.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header>
        <h2>{title}</h2>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Navigation() {
  const path = usePathname(),
    router = useRouter(),
    { courses } = useStore();
  const [search, setSearch] = useState(false),
    [q, setQ] = useState(""),
    [menu, setMenu] = useState("");
  const top = useRef<HTMLElement>(null);
  useEffect(() => {
    setSearch(false);
    setMenu("");
  }, [path]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
        setQ("");
      }
      if (e.key === "Escape") setMenu("");
    }
    function outside(e: PointerEvent) {
      if (top.current && !top.current.contains(e.target as Node)) setMenu("");
    }
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", outside);
    };
  }, []);
  const nav = [
    ["/", "Home"],
    ["/courses/", "Catalog"],
    ["/dashboard/", "My Learning"],
  ];
  const active = (url: string) =>
    url === "/"
      ? path === "/"
      : path.startsWith(url.slice(0, -1)) ||
        (url === "/dashboard/" && path.startsWith("/learn"));
  return (
    <>
      <header className="topbar" ref={top}>
        <div className="wrap navbar">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([url, t]) => (
              <Link
                className={active(url) ? "active" : ""}
                key={url}
                href={url}
              >
                {t}
              </Link>
            ))}
          </nav>
          <div className="nav-tools">
            <button
              className="search-trigger"
              onClick={() => {
                setQ("");
                setSearch(true);
              }}
              aria-label="Search courses"
            >
              <Search size={16} />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="menu-anchor">
              <button
                className="role-btn"
                aria-expanded={menu === "role"}
                onClick={() => setMenu(menu === "role" ? "" : "role")}
              >
                <GraduationCap size={16} />
                <span>
                  {path.startsWith("/instructor")
                    ? "Instructor View"
                    : "Student View"}
                </span>
                <ChevronDown size={13} />
              </button>
              {menu === "role" && (
                <div className="dropdown">
                  <Link href="/dashboard/" onClick={() => setMenu("")}>
                    <GraduationCap />
                    Student View
                  </Link>
                  <Link href="/instructor/" onClick={() => setMenu("")}>
                    <Presentation />
                    Instructor View
                  </Link>
                </div>
              )}
            </div>
            <div className="menu-anchor">
              <button
                className="profile"
                onClick={() => setMenu(menu === "profile" ? "" : "profile")}
                aria-label="Open user menu"
                aria-expanded={menu === "profile"}
              >
                AM
              </button>
              {menu === "profile" && (
                <div className="dropdown">
                  <strong>Alex Morgan</strong>
                  <Link href="/dashboard/">
                    <BookOpen />
                    My Learning
                  </Link>
                  <Link href="/instructor/">
                    <SlidersHorizontal />
                    Instructor Studio
                  </Link>
                </div>
              )}
            </div>
            <button
              className="mobile-nav icon-btn"
              aria-label="Toggle navigation"
              onClick={() => setMenu(menu === "nav" ? "" : "nav")}
            >
              <Menu size={20} />
            </button>
          </div>
          {menu === "nav" && (
            <div className="dropdown mobile-links">
              {nav.map(([url, t]) => (
                <Link key={url} href={url} onClick={() => setMenu("")}>
                  {t}
                </Link>
              ))}
              <Link href="/instructor/">Instructor Studio</Link>
            </div>
          )}
        </div>
      </header>
      {search && (
        <Modal title="Search courses" onClose={() => setSearch(false)}>
          <label className="input-icon">
            <Search />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, instructor, or topic"
            />
          </label>
          <div className="results">
            {courses
              .filter((c) =>
                (c.title + c.category + c.instructor)
                  .toLowerCase()
                  .includes(q.toLowerCase()),
              )
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearch(false);
                    router.push(coursePath(c));
                  }}
                >
                  <img src={c.art} alt="" />
                  <span>
                    <strong>{c.title}</strong>
                    <small>{c.category}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
            {!courses.some((c) =>
              (c.title + c.category + c.instructor)
                .toLowerCase()
                .includes(q.toLowerCase()),
            ) && <p>No courses match your search.</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
export function CourseCard({
  c,
  learning = false,
}: {
  c: Course;
  learning?: boolean;
}) {
  const { s, bookmark, progress } = useStore(),
    saved = s.saved.includes(c.id),
    types = [...new Set(lessons(c).map((l) => l.type))].filter(
      (f) => f !== "Quiz",
    );
  const art = useFile(c.art);
  return (
    <article className="course-card">
      <div className="course-art">
        <Link href={coursePath(c)} aria-label={"View " + c.title}>
          <img src={art} alt="" />
        </Link>
        <span className="level">
          <i className={c.level.toLowerCase()} />
          {c.level}
        </span>
        <button
          className={"save " + (saved ? "selected" : "")}
          aria-label={(saved ? "Unsave " : "Save ") + c.title}
          aria-pressed={saved}
          onClick={() => bookmark(c)}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-kicker">
          {c.category}
          <span className="rating">
            <Star size={14} fill="currentColor" />
            <b>{c.rating ? c.rating.toFixed(1) : "New"}</b>
          </span>
        </div>
        <h3>
          <Link href={coursePath(c)}>{c.title}</Link>
        </h3>
        <div className="instructor-line">
          <Portrait n={c.portrait} />
          {c.instructor}
        </div>
        <div className="card-formats">
          {types.map((f) => (
            <Badge key={f} type={f} />
          ))}
        </div>
        {learning ? (
          <div className="card-foot col">
            <div className="row spread">
              <small>Course progress</small>
              <strong>{progress(c)}%</strong>
            </div>
            <Bar value={progress(c)} />
            <Link className="text-link" href={coursePath(c, true)}>
              Open course <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="card-foot">
            <span>
              <Layers3 size={15} />
              {lessons(c).length} lessons
            </span>
            <Link href={coursePath(c)}>
              {price(c.price)}
              <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
export function Empty({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <BookOpen />
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}
export function Footer() {
  const path = usePathname(),
    { change, toast } = useStore();
  const [email, setEmail] = useState("");
  if (path.startsWith("/learn/")) return null;
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <Brand />
          <p>Your space to learn by doing.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/courses/">Course catalog</Link>
          <Link href="/dashboard/">My Learning</Link>
        </div>
        <div>
          <strong>Platform</strong>
          <Link href="/instructor/">Instructor Studio</Link>
          <Link href="/#features">Learning tools</Link>
        </div>
        <div>
          <strong>Learning updates</strong>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              change((s) => ({
                ...s,
                subscribers: [
                  ...new Set([...s.subscribers, email.trim().toLowerCase()]),
                ],
              }));
              setEmail("");
              toast("Newsletter preference saved on this device");
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Newsletter email address"
              required
            />
            <button aria-label="Save newsletter signup">
              <Mail size={18} />
            </button>
          </form>
        </div>
      </div>
      <div className="wrap copyright">© 2026 Forma Learning Studio</div>
    </footer>
  );
}
