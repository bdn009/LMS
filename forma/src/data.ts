export const categories = [
  "UI/UX Design",
  "Web Development",
  "Data & AI",
  "Business",
] as const;
export type Format = "Video" | "PDF" | "Slides" | "Quiz";
export type Resource = { name: string; src: string; type: "PDF" | "Slides" };
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
export type Module = { id: string; name: string; lessons: Lesson[] };
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
  description: string;
  outcomes: string[];
  art: string;
  modules: Module[];
  custom?: boolean;
};
const records = [
  {
    id: "design-systems",
    title: "Design Systems in Practice",
    category: "UI/UX Design",
    level: "Intermediate",
    price: 49,
    instructor: "Maya Chen",
    role: "Design systems lead",
    description:
      "Build a shared visual language, from primitive tokens to accessible components that scale across products.",
    outcomes: [
      "Define a practical token hierarchy",
      "Map semantic colors to interface states",
      "Document component variants",
      "Audit a system for consistency",
    ],
    topics: [
      "From tokens to components",
      "The token mapping workbook",
      "Anatomy of a component",
    ],
    choices: [
      "Use semantic tokens",
      "Copy individual hex codes",
      "Name values after screens",
    ],
    why: "Semantic names express intent and let the underlying palette change independently.",
  },
  {
    id: "modern-react",
    title: "Modern React Foundations",
    category: "Web Development",
    level: "Beginner",
    price: 39,
    instructor: "James Wilson",
    role: "Frontend engineer",
    description:
      "Build interactive interfaces with reusable components, predictable state, and a clear flow of data.",
    outcomes: [
      "Break a screen into components",
      "Pass data through typed props",
      "Choose the right owner for state",
      "Trace an event through a component tree",
    ],
    topics: [
      "Thinking in components",
      "Component planning workbook",
      "Mapping data flow",
    ],
    choices: [
      "Lift shared state to a common parent",
      "Duplicate state in each child",
      "Put all state in the DOM",
    ],
    why: "The closest common parent can coordinate its children through props and callbacks.",
  },
  {
    id: "applied-ai",
    title: "Applied AI Engineering",
    category: "Data & AI",
    level: "Intermediate",
    price: 59,
    instructor: "Priya Patel",
    role: "Machine learning engineer",
    description:
      "Design a retrieval workflow that grounds AI responses in a curated collection of source documents.",
    outcomes: [
      "Map a retrieval pipeline",
      "Choose a chunking strategy",
      "Inspect retrieved context",
      "Evaluate grounded responses",
    ],
    topics: [
      "A grounded generation workflow",
      "Retrieval evaluation workbook",
      "The retrieval pipeline",
    ],
    choices: [
      "Inspect the retrieved context",
      "Always increase temperature",
      "Remove all references",
    ],
    why: "Inspecting retrieval results separates missing evidence from errors in generation.",
  },
  {
    id: "interface-design",
    title: "Accessible Interface Design",
    category: "UI/UX Design",
    level: "Beginner",
    price: 0,
    instructor: "Theo Martin",
    role: "Product designer",
    description:
      "Create inclusive interfaces with readable typography, visible focus, and clear interaction states.",
    outcomes: [
      "Build a readable type scale",
      "Design keyboard focus states",
      "Review contrast pairs",
      "Document input feedback",
    ],
    topics: [
      "Accessible interaction states",
      "Interface audit workbook",
      "Focus and feedback patterns",
    ],
    choices: [
      "Provide a visible focus indicator",
      "Disable keyboard navigation",
      "Use hover for every action",
    ],
    why: "Visible focus helps keyboard users identify their current target.",
  },
  {
    id: "data-storytelling",
    title: "Visual Storytelling with Data",
    category: "Data & AI",
    level: "Advanced",
    price: 45,
    instructor: "Amelia Reed",
    role: "Data visualization designer",
    description:
      "Translate a dataset into an accurate visual story, from chart selection to meaningful annotations.",
    outcomes: [
      "Frame an analytical question",
      "Match a chart to a comparison",
      "Annotate the important change",
      "Review visual scales",
    ],
    topics: [
      "Choosing a visual comparison",
      "Chart critique workbook",
      "Reading chart patterns",
    ],
    choices: [
      "Use a common baseline for bar lengths",
      "Compare only the colors",
      "Hide the measurement units",
    ],
    why: "A common baseline preserves accurate comparisons between lengths.",
  },
  {
    id: "product-strategy",
    title: "Product Strategy Essentials",
    category: "Business",
    level: "Beginner",
    price: 0,
    instructor: "Daniel Brooks",
    role: "Product strategy lead",
    description:
      "Turn customer evidence into a focused product bet with a clear outcome and a measurable experiment.",
    outcomes: [
      "Frame a customer problem",
      "Compare competing opportunities",
      "Draft a testable hypothesis",
      "Choose a success metric",
    ],
    topics: [
      "From opportunity to experiment",
      "Strategy planning workbook",
      "Mapping a product bet",
    ],
    choices: [
      "Define a measurable user outcome",
      "Ship every suggested feature",
      "Count meetings as impact",
    ],
    why: "A measurable outcome lets a team evaluate whether its experiment changed user behavior.",
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
    reviews: [128, 94, 86, 62, 51, 45][i],
    students: [1824, 1590, 1286, 904, 763, 640][i],
    updated: "2026-10-0" + (i + 1),
    art: base + "cover.webp",
    modules: [
      {
        id: "foundations",
        name: "Foundations",
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
              "Read the worked example and use the prompts to apply it to your own project.",
          },
        ],
      },
      {
        id: "practice",
        name: "Practice & assessment",
        lessons: [
          {
            id: "diagrams",
            title: r.topics[2],
            type: "Slides",
            images: slides,
            summary:
              "Inspect each visual reference and trace how the individual decisions fit together.",
          },
          {
            id: "quiz",
            title: "Knowledge check",
            type: "Quiz",
            summary:
              "Check your understanding and review the explanation for each answer.",
            questions: [
              {
                prompt: "Which approach best supports this course’s workflow?",
                choices: [r.choices[1], r.choices[0], r.choices[2]],
                answer: 1,
                why: r.why,
              },
              {
                prompt:
                  "Which task belongs in a project review for " + r.title + "?",
                choices: [
                  "Skip checking the outcome",
                  r.outcomes[3],
                  "Avoid documenting decisions",
                ],
                answer: 1,
                why:
                  r.outcomes[3] +
                  " to check the quality of your work before sharing it.",
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
        ? (l.images?.length || 0) + " images"
        : (l.questions?.length || 0) + " questions";
export function clock(v: number) {
  return Math.floor(v / 60) + ":" + String(Math.floor(v % 60)).padStart(2, "0");
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
