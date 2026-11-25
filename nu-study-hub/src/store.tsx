"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Course, seedCourses, lessons } from "./data";
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
  enrolled: ["modern-react"],
  saved: [],
  done: { "modern-react": ["intro"] },
  last: { "modern-react": "workbook" },
  recent: "modern-react",
  notes: {},
  threads: {},
  scores: {},
  edits: [],
  activity: [
    {
      day: new Date().toLocaleDateString("en-CA"),
      id: "modern-react/intro",
      seconds: 62,
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
  bookmark: (c: Course) => void;
  progress: (c: Course) => number;
  toggle: (c: Course, id: string) => void;
};
const Store = createContext<Context | null>(null);
export const useStore = () => useContext(Store)!;
const key = "nu-study-hub.workspace.v1";
export function Provider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(initial),
    [ready, setReady] = useState(false),
    [msg, setMsg] = useState<{ text: string; time: number } | null>(null);
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
        toast("Could not read the saved workspace.");
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
              "Browser storage is full. Changes are available for this session.",
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
  function enroll(c: Course) {
    change((s) => ({
      ...s,
      enrolled: [...new Set([...s.enrolled, c.id])],
      recent: c.id,
    }));
    toast("Enrolled in " + c.title);
  }
  function bookmark(c: Course) {
    const saved = s.saved.includes(c.id);
    change((s) => ({
      ...s,
      saved: saved ? s.saved.filter((x) => x !== c.id) : [...s.saved, c.id],
    }));
    toast(saved ? "Removed from saved courses" : "Course saved to My Learning");
  }
  function toggle(c: Course, id: string) {
    const has = s.done[c.id]?.includes(id);
    change((s) => {
      const done = new Set(s.done[c.id]);
      if (done.has(id)) done.delete(id);
      else done.add(id);
      const lesson = lessons(c).find((l) => l.id === id);
      const activity = s.activity.filter((a) => a.id !== c.id + "/" + id);
      if (!has)
        activity.push({
          day: new Date().toLocaleDateString("en-CA"),
          id: c.id + "/" + id,
          seconds: lesson?.seconds || 0,
        });
      return { ...s, activity, done: { ...s.done, [c.id]: [...done] } };
    });
    toast(
      has
        ? "Lesson marked incomplete"
        : lessons(c).every((l) => l.id === id || s.done[c.id]?.includes(l.id))
          ? "Course complete. Your certificate is ready!"
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
        bookmark,
        progress,
        toggle,
      }}
    >
      {children}
      {msg && (
        <div className="toast" role="status">
          <span>✓</span>
          {msg.text}
        </div>
      )}
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
