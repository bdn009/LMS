"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Course, SkillPath, seedCourses, lessons } from "./data";

export type Note = { id: string; body: string; at: string };
type Activity = { day: string; id: string; seconds: number };

export type State = {
  enrolled: string[];
  saved: string[];
  done: Record<string, string[]>;
  last: Record<string, string>;
  recent: string;
  notes: Record<string, Note[]>;
  threads: Record<string, string[]>;
  scores: Record<string, number>;
  edits: Course[];
  activity: Activity[];
  subscribers: string[];
};

const initial: State = {
  enrolled: ["modern-react", "design-systems"],
  saved: ["applied-ai"],
  done: { "modern-react": ["intro"], "design-systems": ["intro", "workbook"] },
  last: { "modern-react": "workbook", "design-systems": "diagrams" },
  recent: "modern-react",
  notes: {
    "modern-react/intro": [
      {
        id: "seed-note-1",
        body: "Keep shared lesson selection in the parent workspace so sidebar and stage never drift out of sync.",
        at: "0:16",
      },
    ],
  },
  threads: {
    "modern-react/intro": [
      "Derived lists eliminate an entire class of stale filter bugs when categories switch rapidly.",
    ],
  },
  scores: {},
  edits: [],
  activity: [
    {
      day: new Date().toLocaleDateString("en-CA"),
      id: "modern-react/intro",
      seconds: 62,
    },
    {
      day: new Date().toLocaleDateString("en-CA"),
      id: "design-systems/intro",
      seconds: 63,
    },
  ],
  subscribers: [],
};

type Context = {
  s: State;
  ready: boolean;
  courses: Course[];
  change: (fn: (s: State) => State) => void;
  toast: (message: string) => void;
  enroll: (c: Course) => void;
  enrollPath: (p: SkillPath) => void;
  bookmark: (c: Course) => void;
  progress: (c: Course) => number;
  pathProgress: (p: SkillPath) => number;
  toggle: (c: Course, id: string) => void;
};

const Store = createContext<Context | null>(null);
export const useStore = () => useContext(Store)!;
const key = "onnopath.workspace.v1";

export function Provider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<{ text: string; time: number } | null>(null);

  const toast = useCallback(
    (text: string) => setMsg({ text, time: Date.now() }),
    [],
  );

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(key);
        set(raw ? { ...initial, ...JSON.parse(raw) } : initial);
      } catch {
        toast("Could not read saved workspace.");
      }
    }
    read();
    setReady(true);
    function sync(e: StorageEvent) {
      if (e.key === key) read();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [toast]);

  const change = useCallback(
    (fn: (old: State) => State) => {
      set((old) => {
        const next = fn(old);
        if (next === old) return old;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          queueMicrotask(() =>
            toast(
              "Browser storage is full. Changes apply for this session.",
            ),
          );
        }
        return next;
      });
    },
    [toast],
  );

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 3200);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const courses = [
    ...seedCourses.map((c) => s.edits.find((e) => e.id === c.id) || c),
    ...s.edits.filter((e) => !seedCourses.some((c) => c.id === e.id)),
  ];

  function progress(c: Course) {
    const ls = lessons(c);
    return ls.length
      ? Math.round(
          (ls.filter((l) => s.done[c.id]?.includes(l.id)).length / ls.length) *
            100,
        )
      : 0;
  }

  function pathProgress(p: SkillPath) {
    const pathCourses = p.courseIds
      .map((id) => courses.find((c) => c.id === id))
      .filter((c): c is Course => Boolean(c));
    const total = pathCourses.reduce((n, c) => n + lessons(c).length, 0);
    if (!total) return 0;
    const completed = pathCourses.reduce(
      (n, c) => n + lessons(c).filter((l) => s.done[c.id]?.includes(l.id)).length,
      0,
    );
    return Math.round((completed / total) * 100);
  }

  function enroll(c: Course) {
    change((prev) => ({
      ...prev,
      enrolled: [...new Set([...prev.enrolled, c.id])],
      recent: c.id,
    }));
    toast("Enrolled in " + c.title);
  }

  function enrollPath(p: SkillPath) {
    change((prev) => ({
      ...prev,
      enrolled: [...new Set([...prev.enrolled, ...p.courseIds])],
      recent: p.courseIds[0] || prev.recent,
    }));
    toast("Enrolled in " + p.title);
  }

  function bookmark(c: Course) {
    const saved = s.saved.includes(c.id);
    change((prev) => ({
      ...prev,
      saved: saved ? prev.saved.filter((x) => x !== c.id) : [...prev.saved, c.id],
    }));
    toast(saved ? "Removed from saved list" : "Saved to My Studio");
  }

  function toggle(c: Course, id: string) {
    const has = s.done[c.id]?.includes(id);
    change((prev) => {
      const done = new Set(prev.done[c.id]);
      if (done.has(id)) done.delete(id);
      else done.add(id);
      const lesson = lessons(c).find((l) => l.id === id);
      const activity = prev.activity.filter((a) => a.id !== c.id + "/" + id);
      if (!has)
        activity.push({
          day: new Date().toLocaleDateString("en-CA"),
          id: c.id + "/" + id,
          seconds: lesson?.seconds || 0,
        });
      return { ...prev, activity, done: { ...prev.done, [c.id]: [...done] } };
    });
    toast(
      has
        ? "Lesson marked incomplete"
        : lessons(c).every((l) => l.id === id || s.done[c.id]?.includes(l.id))
          ? "Course completed. Certificate unlocked!"
          : "Lesson completed",
    );
  }

  return (
    <Store.Provider
      value={{
        s,
        ready,
        courses,
        change,
        toast,
        enroll,
        enrollPath,
        bookmark,
        progress,
        pathProgress,
        toggle,
      }}
    >
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {msg && (
          <div className="toast">
            <span aria-hidden="true">✓</span>
            <span>{msg.text}</span>
          </div>
        )}
      </div>
    </Store.Provider>
  );
}

export function useCourse(id: string) {
  const { courses } = useStore();
  const [custom, setCustom] = useState("");
  useEffect(() => {
    setCustom(new URLSearchParams(location.search).get("course") || "");
  }, [id]);
  return courses.find((c) => c.id === (id === "studio" ? custom : id));
}

