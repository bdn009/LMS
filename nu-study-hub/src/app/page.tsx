"use client";
import { useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Check, CheckCheck, Code2, FileText, Grid2X2, Image as ImageIcon, Layers3, NotebookPen, Palette, Play, Sparkles, Video } from "lucide-react";
import { useStore } from "../store";
import { CourseCard, Bar, Badge } from "../ui";
import { coursePath, lessons } from "../data";
import { useFile } from "../files";

const categories = ["All courses", "Web Development", "UI/UX Design", "Data & AI", "Business"];
const categoryIcons = [Grid2X2, Code2, Palette, Sparkles, BookOpen];

export default function Home() {
  const { courses, s, progress } = useStore();
  const [category, setCategory] = useState("All courses");
  const recent = courses.find(c => c.id === s.recent) || courses[0];
  const recentArt = useFile(recent.art);
  const selected = lessons(recent).find(l => l.id === s.last[recent.id]) || lessons(recent)[0];
  const visible = category === "All courses" ? courses : courses.filter(c => c.category === category);
  return (
    <div className="hub-home">
      <section className="hub-hero wrap">
        <div className="hub-intro">
          <span className="hub-eyebrow"><Sparkles size={16} /> A little curiosity. A world of possibility.</span>
          <h1>Your next chapter<br />starts <em>here.</em></h1>
          <p>Watch it. Read it. Put it into practice. Build skills that stay with you, in a study space that brings it all together.</p>
          <div className="hub-hero-actions">
            <Link className="btn primary" href="/courses/"><BookOpen size={18} /> Find your next course</Link>
            <Link className="btn outline" href="/dashboard/">My learning space</Link>
          </div>
          <div className="hub-format-row"><span><Video size={16} /> Video lessons</span><span><FileText size={16} /> PDF workbooks</span><span><ImageIcon size={16} /> Visual guides</span></div>
        </div>
        <div className="hub-study-preview">
          <div className="hub-preview-top"><span><Layers3 size={17} /> YOUR STUDY SPACE</span><span className="hub-preview-badge">Make room to grow</span></div>
          <div className="hub-preview-body">
            <div className="hub-preview-heading"><span className="hub-label">PICK UP WHERE YOU LEFT OFF</span><h2>A little progress,<br />every day.</h2></div>
            <Link className="hub-resume-card" href={coursePath(recent, true)}>
              <img src={recentArt} alt="" />
              <div><Badge type={selected.type} /><h3>{recent.title}</h3><p>{selected.title}</p></div>
              <span className="hub-play"><Play size={18} fill="currentColor" /></span>
            </Link>
            <div className="hub-progress-label"><span>Your course progress</span><strong>{progress(recent)}%</strong></div>
            <Bar value={progress(recent)} />
            <div className="hub-preview-lessons">{lessons(recent).slice(0, 3).map(l => <Link key={l.id} href={coursePath(recent, true) + (recent.custom ? "&" : "?") + "lesson=" + l.id}><span className={s.done[recent.id]?.includes(l.id) ? "hub-step done" : "hub-step"}>{s.done[recent.id]?.includes(l.id) ? <Check size={15} /> : l.type === "Video" ? <Video size={15} /> : l.type === "PDF" ? <FileText size={15} /> : <ImageIcon size={15} />}</span><span>{l.title}</span><small>{l.type}</small></Link>)}</div>
          </div>
          <div className="hub-preview-foot"><NotebookPen size={16} /> Your notes, resources, and progress. Together.</div>
        </div>
      </section>

      <section className="hub-principles wrap" aria-label="Ways to learn">
        <div><span className="hub-principle-icon"><Play /></span><div><strong>Learn your way</strong><p>Three formats. One connected experience.</p></div></div>
        <div><span className="hub-principle-icon"><CheckCheck /></span><div><strong>Make knowledge stick</strong><p>Practice, reflect, and check your understanding.</p></div></div>
        <div><span className="hub-principle-icon"><Award /></span><div><strong>See how far you’ve come</strong><p>Track every lesson and celebrate completion.</p></div></div>
      </section>

      <section className="wrap hub-course-section">
        <div className="section-heading"><div><span className="hub-label">FIND YOUR FOCUS</span><h2>Big ideas. Practical skills.</h2><p>Explore design, development, AI, and everything in between.</p></div><Link className="text-link" href="/courses/">Explore the catalog</Link></div>
        <div className="filter-pills">{categories.map((name, i) => { const Icon = categoryIcons[i]; return <button key={name} className={category === name ? "chosen" : ""} aria-pressed={category === name} onClick={() => setCategory(name)}><Icon size={16} />{name}</button>; })}</div>
        <div className="course-grid">{visible.map(c => <CourseCard key={c.id} c={c} />)}</div>
        <p className="hub-demo-note">Explore six sample courses with working lessons. Course profiles and ratings are illustrative demo content.</p>
      </section>

      <section id="features" className="wrap hub-features">
        <div className="section-heading"><div><span className="hub-label">BUILT AROUND THE WAY YOU LEARN</span><h2>Less switching tabs.<br />More connecting the dots.</h2></div><p>Everything you need to turn<br />a good idea into a new skill.</p></div>
        <div className="hub-feature-grid">
          <article className="hub-media-feature"><Layers3 /><h3>One lesson. More ways to understand.</h3><p>Move from a video explanation to a workbook, then zoom into the details with visual references.</p><div className="hub-media-tiles"><span><Video />Watch</span><span><FileText />Read</span><span><ImageIcon />Explore</span></div></article>
          <article><CheckCheck /><h3>Put your learning to the test.</h3><p>Interactive quizzes give you instant explanations, a clear score, and another chance to practice.</p><div className="hub-answer-preview"><Check size={16} /> That’s it. You’re making connections.</div></article>
          <article><NotebookPen /><h3>Keep the thought. Keep the context.</h3><p>Save notes alongside the exact video timestamp, workbook page, or diagram that inspired them.</p><div className="hub-note-preview"><span>MY NOTES · PAGE 2</span><p>Try this approach in my next project…</p></div></article>
          <article className="hub-certificate-feature"><Award /><h3>Make your progress visible.</h3><p>Complete your lessons, earn a downloadable certificate, and carry your momentum into what’s next.</p><Link className="text-link" href="/dashboard/">Visit My Learning</Link></article>
        </div>
      </section>
      <section className="wrap hub-final-cta"><div><span className="hub-label">YOUR NEXT CHAPTER IS WAITING</span><h2>Make today a learning day.</h2><p>Start with one lesson. See where it takes you.</p></div><Link className="btn primary" href="/courses/">Explore courses</Link></section>
    </div>
  );
}
