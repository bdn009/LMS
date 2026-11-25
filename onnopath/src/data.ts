export const categories = [
  "Design",
  "Engineering",
  "Data & AI",
  "Strategy",
] as const;

export type Format = "Video" | "PDF" | "Slides" | "Quiz";

export type Resource = {
  name: string;
  src: string;
  type: "PDF" | "Slides";
};

export type Question = {
  prompt: string;
  choices: string[];
  answer: number;
  why: string;
};

export type Lesson = {
  id: string;
  title: string;
  type: Format;
  summary: string;
  src?: string;
  seconds?: number;
  pages?: number;
  download?: boolean;
  images?: { src: string; caption: string }[];
  questions?: Question[];
  resources?: Resource[];
};

export type Module = {
  id: string;
  name: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  price: number;
  instructor: string;
  role: string;
  portrait: number;
  rating: number;
  reviews: number;
  students: number;
  updated: string;
  cohort: string;
  description: string;
  outcomes: string[];
  art: string;
  modules: Module[];
  custom?: boolean;
};

export type SkillPath = {
  id: string;
  title: string;
  tagline: string;
  level: string;
  duration: string;
  courseIds: string[];
  outcome: string;
};

export const skillPaths: SkillPath[] = [
  {
    id: "frontend-architecture",
    title: "Frontend & Design Systems Track",
    tagline:
      "Connect visual tokens, predictable React state ownership, and inclusive interface engineering.",
    level: "Beginner -> Intermediate",
    duration: "3 courses · Guided path",
    courseIds: ["modern-react", "design-systems", "interface-design"],
    outcome: "Ship an accessible, token-driven component library",
  },
  {
    id: "ai-storytelling",
    title: "Applied AI & Visual Analysis Track",
    tagline:
      "Build grounded retrieval pipelines and turn evaluation evidence into clear visual narratives.",
    level: "Intermediate -> Advanced",
    duration: "2 courses · Studio track",
    courseIds: ["applied-ai", "data-storytelling"],
    outcome: "Present audited AI outputs with decision-ready charts",
  },
  {
    id: "product-craft",
    title: "Product Strategy & Craft Track",
    tagline:
      "Frame measurable customer hypotheses and execute them through accessible, high-clarity interfaces.",
    level: "All levels",
    duration: "3 courses · Cohort path",
    courseIds: ["product-strategy", "interface-design", "design-systems"],
    outcome: "Move from opportunity sizing to tested product releases",
  },
];

const records = [
  {
    id: "design-systems",
    title: "Design Systems & Token Architecture",
    category: "Design",
    level: "Intermediate",
    price: 49,
    instructor: "Maya Chen",
    role: "Staff Design Systems Architect",
    cohort: "Autumn Studio · Week 3",
    description:
      "Separate primitive palette values from semantic intent, define interaction states, and ship versioned system updates safely.",
    outcomes: [
      "Structure a layered token hierarchy",
      "Map semantic colors to interactive states",
      "Audit component variants for keyboard & touch",
      "Document system migrations for product teams",
    ],
    topics: [
      "From tokens to components",
      "Token mapping studio workbook",
      "Anatomy of component states",
    ],
    choices: [
      "Use semantic tokens",
      "Copy individual hex codes",
      "Name values after screens",
    ],
    why: "Semantic names express intent and let the underlying palette evolve independently.",
  },
  {
    id: "modern-react",
    title: "Predictable State in Modern React",
    category: "Engineering",
    level: "Beginner",
    price: 39,
    instructor: "James Wilson",
    role: "Principal Frontend Engineer",
    cohort: "Self-paced + Weekly Clinic",
    description:
      "Architect clean React interfaces with single-owner state, derived filtering during render, and stable list identity keys.",
    outcomes: [
      "Establish a single owner for shared state",
      "Derive filtered views during render without drift",
      "Preserve identity with permanent list keys",
      "Trace events cleanly across component trees",
    ],
    topics: [
      "Tracing state updates cleanly",
      "Component planning workbook",
      "Mapping unidirectional data flow",
    ],
    choices: [
      "Lift shared state to a common parent",
      "Duplicate state in each child",
      "Put all state in the DOM",
    ],
    why: "The closest common parent coordinates sibling components cleanly via props and callbacks.",
  },
  {
    id: "applied-ai",
    title: "Grounded AI Retrieval Pipelines",
    category: "Data & AI",
    level: "Intermediate",
    price: 59,
    instructor: "Priya Patel",
    role: "Lead ML Systems Engineer",
    cohort: "Cohort 08 · Open Enrollment",
    description:
      "Design evidence-backed retrieval workflows with structure-aware chunking, source citations, and repeatable retrieval evals.",
    outcomes: [
      "Ground generated answers in cited sources",
      "Design heading-aware chunking boundaries",
      "Inspect top-ranked passages before prompting",
      "Score retrieval quality with reference questions",
    ],
    topics: [
      "Grounded generation workflows",
      "Retrieval evaluation workbook",
      "Pipeline chunking & scoring slides",
    ],
    choices: [
      "Inspect the retrieved context",
      "Always increase temperature",
      "Remove all references",
    ],
    why: "Inspecting retrieved passages separates missing evidence from generation errors.",
  },
  {
    id: "interface-design",
    title: "Accessible Interface Engineering",
    category: "Design",
    level: "Beginner",
    price: 0,
    instructor: "Theo Martin",
    role: "Inclusive Product Designer",
    cohort: "Open Studio Track",
    description:
      "Craft legible, keyboard-first web interfaces with clear visual hierarchy, high-contrast focus states, and structured forms.",
    outcomes: [
      "Build a scalable, readable type hierarchy",
      "Design unmistakable keyboard focus states",
      "Verify contrast pairs across light & dark",
      "Structure accessible form feedback & layouts",
    ],
    topics: [
      "Accessible interaction states",
      "Interface audit workbook",
      "Focus & hierarchy visual guide",
    ],
    choices: [
      "Provide a visible focus indicator",
      "Disable keyboard navigation",
      "Use hover for every action",
    ],
    why: "Visible focus states allow keyboard and assistive-tech users to track their target reliably.",
  },
  {
    id: "data-storytelling",
    title: "Visual Storytelling with Evidence",
    category: "Data & AI",
    level: "Advanced",
    price: 45,
    instructor: "Amelia Reed",
    role: "Data Visualization Lead",
    cohort: "Executive Craft Cohort",
    description:
      "Transform raw metrics into accurate visual arguments through disciplined comparisons, encodings, and direct annotations.",
    outcomes: [
      "Frame a clear analytical comparison",
      "Match chart encodings to quantitative tasks",
      "Annotate key inflection points directly",
      "Audit scales and baselines for honesty",
    ],
    topics: [
      "Framing visual comparisons",
      "Chart critique studio workbook",
      "Encoding & annotation slides",
    ],
    choices: [
      "Use a common baseline for bar lengths",
      "Compare only the colors",
      "Hide the measurement units",
    ],
    why: "A shared zero baseline preserves faithful visual comparison between bar lengths.",
  },
  {
    id: "product-strategy",
    title: "Evidence-Led Product Strategy",
    category: "Strategy",
    level: "Beginner",
    price: 0,
    instructor: "Daniel Brooks",
    role: "VP of Product Strategy",
    cohort: "Founders & PM Track",
    description:
      "Convert real learner observations into prioritized opportunities, testable hypotheses, and disciplined experiments.",
    outcomes: [
      "Translate observations into clear hypotheses",
      "Compare opportunities by impact and effort",
      "Select primary outcomes and guardrails",
      "Define adopt, revise, or stop criteria upfront",
    ],
    topics: [
      "From problem to testable bet",
      "Strategy planning workbook",
      "Experiment design blueprints",
    ],
    choices: [
      "Define a measurable user outcome",
      "Ship every suggested feature",
      "Count meetings as impact",
    ],
    why: "A measurable outcome reveals whether an experiment genuinely changed user behavior.",
  },
];

export const seedCourses: Course[] = records.map((r, i) => {
  const base = "/media/" + r.id + "/";
  const captions = [
    [
      "Build a token hierarchy",
      "Define component states",
      "Release a system change",
    ],
    ["Trace a state update", "Derive a filtered list", "Use stable list keys"],
    [
      "Ground an answer in evidence",
      "Choose retrieval chunks",
      "Evaluate a retrieval result",
    ],
    [
      "Establish visual hierarchy",
      "Organize a form",
      "Plan a responsive layout",
    ],
    [
      "Frame a comparison",
      "Choose a clear visual encoding",
      "Annotate the finding",
    ],
    [
      "Turn a problem into a hypothesis",
      "Prioritize an opportunity",
      "Design a learning experiment",
    ],
  ];
  const slides = captions[i].map((caption, j) => ({
    src: base + "slide-" + (j + 1) + ".webp",
    caption,
  }));
  const resources: Resource[] = [
    { type: "PDF", name: r.topics[1], src: base + "workbook.pdf" },
    { type: "Slides", name: r.topics[2], src: slides[0].src },
  ];
  return {
    ...r,
    portrait: i,
    rating: [4.9, 4.8, 4.9, 4.7, 4.8, 4.7][i],
    reviews: [142, 108, 91, 76, 58, 49][i],
    students: [1940, 1680, 1340, 980, 790, 675][i],
    updated: "2026-10-1" + (i + 1),
    art: base + "cover.webp",
    modules: [
      {
        id: "foundations",
        name: "Core studio session",
        lessons: [
          {
            id: "intro",
            title: r.topics[0],
            type: "Video",
            src: base + "demo.mp4",
            seconds: [63, 62, 62, 59, 61, 59][i],
            summary: r.description,
            resources,
          },
          {
            id: "workbook",
            title: r.topics[1],
            type: "PDF",
            src: base + "workbook.pdf",
            pages: 3,
            download: true,
            summary:
              "Work through the annotated studio exercises and capture notes alongside your current page.",
          },
        ],
      },
      {
        id: "practice",
        name: "Visual synthesis & check",
        lessons: [
          {
            id: "diagrams",
            title: r.topics[2],
            type: "Slides",
            images: slides,
            summary:
              "Zoom into each visual frame to examine how structural choices come together in practice.",
          },
          {
            id: "quiz",
            title: "Pathway mastery check",
            type: "Quiz",
            summary:
              "Validate your understanding with immediate feedback and clear rationales.",
            questions: [
              {
                prompt: "Which approach best supports this course's workflow?",
                choices: [r.choices[1], r.choices[0], r.choices[2]],
                answer: 1,
                why: r.why,
              },
              {
                prompt:
                  "Which check belongs in a studio review for " + r.title + "?",
                choices: [
                  "Skip checking the outcome",
                  r.outcomes[3],
                  "Avoid documenting decisions",
                ],
                answer: 1,
                why:
                  r.outcomes[3] +
                  " to confirm real quality before shipping or sharing.",
              },
            ],
          },
        ],
      },
    ],
  };
});

export const lessons = (c: Course) => c.modules.flatMap((m) => m.lessons);

export const meta = (l: Lesson) =>
  l.type === "Video"
    ? clock(l.seconds || 0)
    : l.type === "PDF"
      ? (l.pages || 1) + " pages"
      : l.type === "Slides"
        ? (l.images?.length || 0) + " slides"
        : (l.questions?.length || 0) + " questions";

export function clock(v: number) {
  return (
    Math.floor(v / 60) + ":" + String(Math.floor(v % 60)).padStart(2, "0")
  );
}

export function coursePath(c: Course, learn = false) {
  return (
    "/" +
    (learn ? "learn" : "courses") +
    "/" +
    (c.custom ? "studio/?course=" + encodeURIComponent(c.id) : c.id + "/")
  );
}

export const price = (v: number) => (v ? "$" + v : "Free");

