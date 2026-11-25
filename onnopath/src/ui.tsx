"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  GraduationCap,
  Image as Picture,
  Layers3,
  Menu,
  Presentation,
  Search,
  SlidersHorizontal,
  SquareCheckBig,
  Star,
  Video,
  X,
  Mail,
} from "lucide-react";
import { Course, Format, coursePath, price, lessons } from "./data";
import { useStore } from "./store";
import { useFile } from "./files";
import {
  ThemeChoice,
  applyThemeChoice,
  attachClosedByFallback,
  ensureFocusGroupPolyfill,
  ensurePopoverPolyfill,
  readStoredTheme,
} from "./platform";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="OnnoPath home">
      <img src="/icon.svg" alt="" width={32} height={32} />
      <span>
        Onno<span className="brand-accent">Path</span>
      </span>
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
  return <I size={size} strokeWidth={1.75} aria-hidden="true" />;
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
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const cleanupFallback = attachClosedByFallback(d, () => d.close());
    return () => {
      cleanupFallback();
      if (d.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-labelledby={titleId}
      {...({ closedby: "any" } as Record<string, string>)}
      onClose={() => onCloseRef.current()}
    >
      <div className="modal-header">
        <h1 id={titleId}>{title}</h1>
        <button
          type="button"
          className="icon-btn"
          onClick={() => ref.current?.close()}
          aria-label="Close"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export function Tabs({
  label,
  items,
  activeId,
  onChange,
}: {
  label: string;
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    ensureFocusGroupPolyfill();
  }, []);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    for (const item of items) {
      const panel = panelRefs.current[item.id];
      if (!panel) continue;
      const onMatch = () => onChange(item.id);
      panel.addEventListener("beforematch", onMatch);
      cleanups.push(() => panel.removeEventListener("beforematch", onMatch));
    }
    return () => cleanups.forEach((fn) => fn());
  }, [items, onChange]);

  useEffect(() => {
    const selectedBtn = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    selectedBtn?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId]);

  return (
    <div className="tabs-root">
      <div
        ref={listRef}
        className="tablist-scroller"
        aria-label={label}
        {...({ focusgroup: "tablist nomemory" } as Record<string, string>)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const idx = items.findIndex((it) => it.id === activeId);
          if (idx === -1) return;
          const nextIdx =
            e.key === "ArrowRight"
              ? (idx + 1) % items.length
              : (idx - 1 + items.length) % items.length;
          const next = items[nextIdx];
          onChange(next.id);
          const btn = document.getElementById(baseId + "-tab-" + next.id);
          btn?.focus();
        }}
      >
        {items.map((item) => {
          const isSelected = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={baseId + "-tab-" + item.id}
              aria-selected={isSelected}
              {...(isSelected
                ? ({ focusgroupstart: "" } as Record<string, string>)
                : {})}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="tab-panels">
        {items.map((item) => {
          const isSelected = item.id === activeId;
          return (
            <div
              key={item.id}
              ref={(el) => {
                panelRefs.current[item.id] = el;
              }}
              role="tabpanel"
              aria-labelledby={baseId + "-tab-" + item.id}
              tabIndex={isSelected ? 0 : undefined}
              hidden={
                isSelected ? undefined : ("until-found" as unknown as boolean)
              }
            >
              <div className="tab-panel-inner">{item.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Navigation() {
  const path = usePathname();
  const router = useRouter();
  const { courses } = useStore();
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [isWide, setIsWide] = useState(false);
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [systemDark, setSystemDark] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const lastHeaderWidth = useRef(0);

  useEffect(() => {
    ensurePopoverPolyfill();
    setTheme(readStoredTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "onnopath-color-scheme") {
        const stored = readStoredTheme();
        setTheme(stored);
        applyThemeChoice(stored);
      }
    };
    mq.addEventListener("change", onMq);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    setSearch(false);
    try {
      menuRef.current?.hidePopover?.();
      accountRef.current?.hidePopover?.();
    } catch {}
  }, [path]);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
        setQ("");
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const inner = innerRef.current;
    const menu = menuRef.current;
    if (!header || !inner || !menu) return;

    function measure() {
      if (!header || !inner || !menu) return;
      const width = header.clientWidth;
      const currentlyWide = header.classList.contains("is-wide");
      if (!currentlyWide && width <= lastHeaderWidth.current) {
        lastHeaderWidth.current = width;
        return;
      }
      lastHeaderWidth.current = width;

      let wasOpen = false;
      try {
        wasOpen = menu.matches(":popover-open");
      } catch {}

      header.classList.add("is-measuring");
      header.classList.add("is-wide");
      menu.removeAttribute("popover");

      const fits = inner.scrollWidth <= inner.clientWidth;
      if (!fits) {
        header.classList.remove("is-wide");
        menu.setAttribute("popover", "auto");
        if (wasOpen) {
          try {
            menu.showPopover?.();
          } catch {}
        }
      }
      setIsWide(fits);
      requestAnimationFrame(() => header.classList.remove("is-measuring"));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    ro.observe(menu);
    return () => ro.disconnect();
  }, []);

  const navItems: [string, string][] = [
    ["/", "Home"],
    ["/paths/", "Skill Paths"],
    ["/courses/", "Catalog"],
    ["/dashboard/", "My Studio"],
  ];

  const isCurrent = (url: string) =>
    url === "/"
      ? path === "/"
      : path.startsWith(url.slice(0, -1)) ||
        (url === "/dashboard/" && path.startsWith("/learn"));

  function chooseTheme(next: ThemeChoice) {
    setTheme(next);
    applyThemeChoice(next);
  }

  return (
    <>
      <header
        ref={headerRef}
        className={"site-header " + (isWide ? "is-wide" : "")}
      >
        <div className="wrap header-inner" ref={innerRef}>
          <Brand />
          <nav className="site-nav" aria-label="Primary">
            <button
              className="menu-button"
              type="button"
              popoverTarget="site-menu"
              popoverTargetAction="toggle"
              aria-controls="site-menu"
            >
              <Menu size={17} aria-hidden="true" />
              <span>Menu</span>
            </button>
            <ul
              id="site-menu"
              ref={menuRef}
              className="site-menu"
              popover={isWide ? undefined : "auto"}
            >
              {navItems.map(([url, label]) => (
                <li key={url}>
                  <Link
                    href={url}
                    aria-current={isCurrent(url) ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-tools">
            <button
              type="button"
              className="search-trigger"
              onClick={() => {
                setQ("");
                setSearch(true);
              }}
              aria-label="Search courses"
            >
              <Search size={16} aria-hidden="true" />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>

            <Link
              className="role-switch"
              href={path.startsWith("/instructor") ? "/dashboard/" : "/instructor/"}
            >
              {path.startsWith("/instructor") ? (
                <>
                  <GraduationCap size={16} aria-hidden="true" />
                  <span>Learner View</span>
                </>
              ) : (
                <>
                  <Presentation size={16} aria-hidden="true" />
                  <span>Instructor Studio</span>
                </>
              )}
            </Link>

            <button
              type="button"
              className="account-trigger"
              aria-label="Open account and theme settings"
              popoverTarget="account-panel"
            >
              NK
            </button>
            <div
              id="account-panel"
              ref={accountRef}
              className="account-popover"
              popover="auto"
            >
              <div className="account-head">
                <strong>Nadia Karim</strong>
                <small>Product Design Fellow · Dhaka</small>
              </div>
              <div className="account-links">
                <Link href="/dashboard/">
                  <BookOpen size={16} aria-hidden="true" />
                  My Studio
                </Link>
                <Link href="/paths/">
                  <Compass size={16} aria-hidden="true" />
                  Guided Skill Paths
                </Link>
                <Link href="/instructor/">
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Instructor Studio
                </Link>
              </div>
              <fieldset className="theme-fieldset">
                <legend>Appearance</legend>
                <div className="theme-radios">
                  <label>
                    <input
                      type="radio"
                      name="onnopath-theme"
                      checked={theme === "system"}
                      onChange={() => chooseTheme("system")}
                    />
                    <span>System ({systemDark ? "Dark" : "Light"})</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="onnopath-theme"
                      checked={theme === "light"}
                      onChange={() => chooseTheme("light")}
                    />
                    <span>Light</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="onnopath-theme"
                      checked={theme === "dark"}
                      onChange={() => chooseTheme("dark")}
                    />
                    <span>Dark</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </header>

      {search && (
        <Modal title="Search courses" onClose={() => setSearch(false)}>
          <search>
            <label htmlFor="global-course-search" className="visually-hidden">
              Search by title, instructor, or topic
            </label>
            <div className="input-icon">
              <Search size={17} aria-hidden="true" />
              <input
                id="global-course-search"
                type="search"
                autoFocus
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, instructor, or topic"
              />
            </div>
          </search>
          <div className="results">
            {courses
              .filter((c) =>
                (c.title + " " + c.category + " " + c.instructor)
                  .toLowerCase()
                  .includes(q.toLowerCase()),
              )
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setSearch(false);
                    router.push(coursePath(c));
                  }}
                >
                  <img src={c.art} alt="" />
                  <span>
                    <strong>{c.title}</strong>
                    <small>
                      {c.category} · {c.instructor}
                    </small>
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              ))}
            {!courses.some((c) =>
              (c.title + " " + c.category + " " + c.instructor)
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
  const { s, bookmark, progress } = useStore();
  const saved = s.saved.includes(c.id);
  const types = [...new Set(lessons(c).map((l) => l.type))].filter(
    (f) => f !== "Quiz",
  );
  const art = useFile(c.art);

  return (
    <article className="course-card">
      <div className="course-art">
        <Link href={coursePath(c)} aria-label={"View " + c.title}>
          <img src={art} alt="" width={400} height={250} loading="lazy" />
        </Link>
        <span className="level-pill">
          <i className={c.level.toLowerCase()} aria-hidden="true" />
          {c.level}
        </span>
        <button
          type="button"
          className={"save-btn " + (saved ? "selected" : "")}
          aria-label={(saved ? "Remove bookmark for " : "Save ") + c.title}
          aria-pressed={saved}
          onClick={() => bookmark(c)}
        >
          <Bookmark
            size={16}
            fill={saved ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="card-body">
        <div className="card-kicker">
          <span>{c.category}</span>
          <span className="rating">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            <b>{c.rating ? c.rating.toFixed(1) : "New"}</b>
          </span>
        </div>
        <h3>
          <Link href={coursePath(c)}>{c.title}</Link>
        </h3>
        <div className="instructor-line">
          <Portrait n={c.portrait} size={24} />
          <span>{c.instructor}</span>
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
              Open studio <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="card-foot">
            <span>
              <Layers3 size={15} aria-hidden="true" />
              {lessons(c).length} lessons
            </span>
            <Link href={coursePath(c)}>
              {price(c.price)}
              <ChevronRight size={15} aria-hidden="true" />
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
      <BookOpen size={26} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}

export function Footer() {
  const path = usePathname();
  const { change, toast } = useStore();
  const [email, setEmail] = useState("");
  if (path.startsWith("/learn/")) return null;

  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <Brand />
          <p>
            Guided skill paths, hands-on workbooks, and multi-format studio
            cohorts.
          </p>
        </div>
        <div>
          <strong>Learn</strong>
          <Link href="/paths/">Guided Skill Paths</Link>
          <Link href="/courses/">Course Catalog</Link>
          <Link href="/dashboard/">My Studio</Link>
        </div>
        <div>
          <strong>Teach &amp; Build</strong>
          <Link href="/instructor/">Instructor Studio</Link>
          <Link href="/#studio-features">Studio Capabilities</Link>
        </div>
        <div>
          <strong>Cohort dispatch</strong>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              change((prev) => ({
                ...prev,
                subscribers: [
                  ...new Set([...prev.subscribers, email.trim().toLowerCase()]),
                ],
              }));
              setEmail("");
              toast("Cohort digest preference saved locally");
            }}
          >
            <label htmlFor="footer-newsletter" className="visually-hidden">
              Email address for cohort digest
            </label>
            <input
              id="footer-newsletter"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
            />
            <button type="submit" aria-label="Subscribe to cohort digest">
              <Mail size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
      <div className="wrap copyright">
        © 2026 OnnoPath Academy · Client Demo Frontend
      </div>
    </footer>
  );
}
