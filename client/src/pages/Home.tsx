import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  CloudUpload,
  Command,
  Compass,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "timetable", label: "Timetable", icon: CalendarDays, badge: "5" },
  { id: "planner", label: "Smart planner", icon: Target, badge: "3" },
  { id: "attendance", label: "Attendance", icon: CheckCircle2 },
  { id: "progress", label: "Progress lab", icon: LineChart },
  { id: "materials", label: "Materials vault", icon: FolderOpen },
];

const schedule = [
  { day: "MON", date: "16", events: [{ time: "09:00", duration: "90m", title: "Computer Networks", code: "BCS401", room: "SJT 402", tone: "violet" }, { time: "14:00", duration: "60m", title: "Deep work block", code: "AI suggested", room: "Library", tone: "mint" }] },
  { day: "TUE", date: "17", events: [{ time: "10:30", duration: "90m", title: "Data Structures", code: "BCS301", room: "AB 114", tone: "blue" }, { time: "16:00", duration: "90m", title: "Operating Systems", code: "BCS402", room: "SJT 209", tone: "orange" }] },
  { day: "WED", date: "18", events: [{ time: "09:00", duration: "90m", title: "Machine Learning", code: "BAI501", room: "TT 301", tone: "pink" }, { time: "13:00", duration: "60m", title: "Focus block", code: "Signals & systems", room: "Studio", tone: "yellow" }] },
  { day: "THU", date: "19", events: [{ time: "11:00", duration: "90m", title: "Software Engineering", code: "BCS403", room: "SJT 402", tone: "blue" }, { time: "15:30", duration: "60m", title: "Assignment sprint", code: "ML · due Friday", room: "Desk 7", tone: "mint" }] },
  { day: "FRI", date: "20", events: [{ time: "09:00", duration: "90m", title: "Probability & Stats", code: "MAT201", room: "AB 216", tone: "violet" }, { time: "12:00", duration: "90m", title: "Computer Networks", code: "BCS401", room: "Lab 3", tone: "orange" }] },
];

const initialTasks = [
  { id: 1, title: "Finish routing protocol notes", course: "Computer Networks", due: "Today, 6:00 PM", weight: "High impact", score: "92", color: "violet", done: false },
  { id: 2, title: "Submit ML mini project", course: "Machine Learning", due: "Tomorrow, 11:59 PM", weight: "CGPA +0.18", score: "86", color: "pink", done: false },
  { id: 3, title: "Review OS scheduling", course: "Operating Systems", due: "Wed, 9:00 AM", weight: "45 min focus", score: "71", color: "orange", done: true },
  { id: 4, title: "Read chapter 7 · Bayes theorem", course: "Probability & Stats", due: "Thu, 4:00 PM", weight: "Spaced review", score: "64", color: "blue", done: false },
];

const attendanceRows = [
  { code: "BCS401", name: "Computer Networks", attended: 23, total: 26, safe: "4 classes", color: "#8d7aff" },
  { code: "BAI501", name: "Machine Learning", attended: 19, total: 21, safe: "3 classes", color: "#ff6da8" },
  { code: "BCS402", name: "Operating Systems", attended: 17, total: 22, safe: "Attend next 2", color: "#f5a65b" },
  { code: "MAT201", name: "Probability & Stats", attended: 20, total: 24, safe: "2 classes", color: "#59c7ae" },
];

const materials = [
  { type: "PDF", title: "Routing Protocols — condensed notes", course: "Computer Networks", meta: "2.4 MB · parsed 98%", color: "violet", icon: FileText },
  { type: "PPT", title: "Neural Nets · Week 05", course: "Machine Learning", meta: "8.1 MB · parsed 91%", color: "pink", icon: BookOpen },
  { type: "DOC", title: "OS Scheduling Lab brief", course: "Operating Systems", meta: "460 KB · parsed 100%", color: "orange", icon: FileText },
];

function OrbitMark() {
  return <div className="orbit-mark" aria-label="Orbit logo"><span /><span /><span /></div>;
}

function ProgressRing({ value, size = 92, stroke = 8, color = "#8d7aff" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-track" strokeWidth={stroke} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className="ring-value" stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function Sparkline({ color = "#8d7aff", points = "0,36 12,32 24,35 36,27 48,28 60,17 72,20 84,11 96,14 108,5" }: { color?: string; points?: string }) {
  return <svg className="sparkline" viewBox="0 0 108 40" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SectionHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
  return <div className="section-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function Overview({ onNavigate, tasks, toggleTask, showComposer }: { onNavigate: (id: string) => void; tasks: typeof initialTasks; toggleTask: (id: number) => void; showComposer: () => void }) {
  const completion = Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  return <>
    <SectionHeader eyebrow="Monday · 16 September 2025" title="Good morning, Arjun." copy="Your week is in orbit. Here's the clearest next move." action={<button className="primary-button" onClick={showComposer}><Plus size={16} /> Add to orbit</button>} />
    <div className="hero-card reveal-1">
      <div className="hero-noise" />
      <div className="hero-copy"><div className="status-chip"><Sparkles size={14} /> Orbit intelligence</div><h2>Protect your <em>deep work</em><br />before the noise starts.</h2><p>You've got a 90-minute window between Networks and lunch. Your focus score is strongest here.</p><button className="light-button" onClick={() => toast.success("Focus block reserved", { description: "Monday, 14:00–15:30 is now protected." })}>Reserve focus block <ArrowUpRight size={15} /></button></div>
      <div className="orbital-visual"><div className="orbit-line orbit-one" /><div className="orbit-line orbit-two" /><div className="orbit-core"><BrainCircuit size={24} /><span>focus<br />window</span></div><div className="orbit-dot dot-one" /><div className="orbit-dot dot-two" /><div className="orbit-dot dot-three" /></div>
      <div className="hero-foot"><span><span className="pulse-dot" /> AI plan refreshed 4 min ago</span><span>Based on 14 completed sessions</span></div>
    </div>
    <div className="metric-grid reveal-2">
      <div className="metric-card"><div className="metric-top"><span className="metric-label">Semester CGPA</span><span className="metric-icon lavender"><GraduationCap size={17} /></span></div><div className="metric-value">8.42 <span className="positive">+0.16</span></div><div className="metric-bottom"><Sparkline /><span>projected 8.76</span></div></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-label">Attendance health</span><span className="metric-icon mint"><CheckCircle2 size={17} /></span></div><div className="metric-value">84.7% <span className="positive">safe</span></div><div className="meter"><span style={{ width: "84.7%" }} /></div><div className="metric-caption">Keep above 75% mandate</div></div>
      <div className="metric-card"><div className="metric-top"><span className="metric-label">Weekly momentum</span><span className="metric-icon orange"><Flame size={17} /></span></div><div className="metric-value">72 <span className="muted">/ 100</span></div><div className="momentum-bars"><span /><span /><span /><span /><span /><span /><span /></div><div className="metric-caption">+12 from last week</div></div>
      <div className="metric-card focus-metric"><div className="metric-top"><span className="metric-label">Tasks completed</span><span className="metric-icon pink"><Target size={17} /></span></div><div className="metric-value">{tasks.filter((t) => t.done).length} <span className="muted">/ {tasks.length}</span></div><div className="metric-bottom"><ProgressRing value={completion} size={36} stroke={4} color="#ff6da8" /><span>{completion}% of today's plan</span></div></div>
    </div>
    <div className="content-grid reveal-3">
      <section className="panel timetable-preview"><div className="panel-heading"><div><div className="eyebrow">Next 5 days</div><h3>Weekly rhythm</h3></div><button className="ghost-button" onClick={() => onNavigate("timetable")}>Open timetable <ArrowUpRight size={15} /></button></div><div className="week-strip">{schedule.map((day, i) => <button className={`day-pill ${i === 0 ? "active" : ""}`} key={day.day} onClick={() => onNavigate("timetable")}><span>{day.day}</span><strong>{day.date}</strong>{i === 0 && <i />}</button>)}</div><div className="timeline-list">{schedule[0].events.map((event) => <div className="timeline-item" key={event.title}><span className="timeline-time">{event.time}</span><div className={`timeline-dot ${event.tone}`} /><div className="timeline-detail"><strong>{event.title}</strong><span>{event.code} · {event.room}</span></div><span className="duration">{event.duration}</span></div>)}</div></section>
      <section className="panel task-preview"><div className="panel-heading"><div><div className="eyebrow">AI-ranked queue</div><h3>Today's next moves</h3></div><button className="icon-button" aria-label="More task options" onClick={() => toast("Queue is ranked by due date, weightage, and your pace.")}><MoreHorizontal size={18} /></button></div><div className="task-list">{tasks.slice(0, 3).map((task) => <button className={`task-row ${task.done ? "done" : ""}`} key={task.id} onClick={() => toggleTask(task.id)}><span className={`check-box ${task.done ? "checked" : ""}`}>{task.done && <Check size={13} />}</span><span className="task-main"><strong>{task.title}</strong><small>{task.course} · {task.due}</small></span><span className={`impact ${task.color}`}>{task.score}</span></button>)}</div><button className="panel-link" onClick={() => onNavigate("planner")}>See all priorities <ArrowUpRight size={15} /></button></section>
    </div>
    <div className="insight-strip reveal-4"><div className="insight-icon"><Zap size={18} /></div><div><strong>Pattern found</strong><p>You complete 80% of math work between <b>8–11 PM</b>. Orbit shifted your next review into that window.</p></div><button className="text-button" onClick={() => onNavigate("progress")}>View pattern <ArrowUpRight size={14} /></button></div>
  </>;
}

function Timetable({ onBack }: { onBack: () => void }) {
  const [week, setWeek] = useState("This week");
  return <><SectionHeader eyebrow="Schedule engine · CSP optimized" title="Your weekly rhythm" copy="A compact, collision-free calendar that leaves room for the work that matters." action={<div className="button-row"><button className="secondary-button" onClick={() => toast.success("Schedule exported", { description: "Orbit calendar file is ready." })}><Upload size={15} /> Export</button><button className="primary-button" onClick={() => toast("Smart reschedule is ready when your week changes.")}><Sparkles size={15} /> Optimize</button></div>} /><div className="schedule-toolbar"><button className="back-link" onClick={onBack}>← Overview</button><div className="segmented"><button className={week === "This week" ? "selected" : ""} onClick={() => setWeek("This week")}>This week</button><button className={week === "Next week" ? "selected" : ""} onClick={() => setWeek("Next week")}>Next week</button></div><span className="toolbar-note"><span className="pulse-dot" /> 2 focus windows protected</span></div><div className="calendar-board"><div className="calendar-head"><span>GMT +5:30</span>{schedule.map((day) => <div key={day.day}><span>{day.day}</span><strong>{day.date}</strong></div>)}</div><div className="calendar-body"><div className="time-axis">{["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => <span key={time}>{time}</span>)}</div>{schedule.map((day) => <div className="calendar-column" key={day.day}>{[0, 1, 2, 3, 4, 5].map((slot) => <span className="grid-line" key={slot} />)}{day.events.map((event, index) => <button className={`calendar-event ${event.tone} event-${index}`} key={event.title} onClick={() => toast(event.title, { description: `${event.time} · ${event.room} · ${event.duration}` })}><strong>{event.title}</strong><span>{event.time} · {event.room}</span><small>{event.code}</small></button>)}</div>)}</div></div><div className="ai-note"><div className="insight-icon"><BrainCircuit size={18} /></div><div><strong>Why this layout?</strong><p>Orbit grouped your heavy cognitive sessions on Mon/Wed/Fri and protected a recovery buffer after every lab.</p></div><button className="text-button" onClick={() => toast("Constraint model: minimize gaps, protect focus, avoid back-to-back labs.")}>Explain <ArrowUpRight size={14} /></button></div></>;
}

function Planner({ tasks, toggleTask, showComposer }: { tasks: typeof initialTasks; toggleTask: (id: number) => void; showComposer: () => void }) {
  return <><SectionHeader eyebrow="Decision tree · spaced repetition" title="Smart planner" copy="Every task has a reason, a best time, and a next small action." action={<button className="primary-button" onClick={showComposer}><Plus size={16} /> New task</button>} /><div className="planner-summary"><div><span className="eyebrow">Current load</span><strong>6h 40m</strong><span className="muted">of focused work</span></div><div className="load-line"><span style={{ width: "68%" }} /></div><div className="summary-end"><span>68% capacity</span><span className="positive">healthy</span></div></div><div className="planner-grid"><div className="planner-column"><div className="column-title"><span className="column-dot today" />Today <span>{tasks.filter((t) => !t.done).length}</span></div>{tasks.slice(0, 2).map((task) => <TaskCard task={task} key={task.id} toggleTask={toggleTask} />)}<button className="dashed-add" onClick={showComposer}><Plus size={15} /> Add task</button></div><div className="planner-column"><div className="column-title"><span className="column-dot soon" />Up next <span>2</span></div>{tasks.slice(2).map((task) => <TaskCard task={task} key={task.id} toggleTask={toggleTask} />)}<div className="review-card"><div className="review-icon"><RefreshCw size={15} /></div><div><strong>2 spaced reviews</strong><span>ready for tonight</span></div><button onClick={() => toast("Review queue opened")}>Open</button></div></div><div className="planner-column"><div className="column-title"><span className="column-dot later" />Later <span>4</span></div><div className="later-card"><span className="mini-icon"><BookOpen size={15} /></span><div><strong>Read 3 research papers</strong><span>Machine Learning · Sep 23</span></div><span className="score-badge">58</span></div><div className="later-card"><span className="mini-icon"><TimerReset size={15} /></span><div><strong>Practice SQL queries</strong><span>Data Systems · Sep 24</span></div><span className="score-badge">46</span></div><div className="planner-empty"><div className="empty-orbit"><Compass size={19} /></div><strong>Your buffer is intentional.</strong><span>Orbit keeps room for the unexpected.</span></div></div></div></>;
}

function TaskCard({ task, toggleTask }: { task: (typeof initialTasks)[number]; toggleTask: (id: number) => void }) {
  return <div className={`task-card ${task.done ? "done" : ""}`}><div className="task-card-top"><span className={`task-type ${task.color}`}>{task.course.slice(0, 3).toUpperCase()}</span><button className={`check-box ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>{task.done && <Check size={13} />}</button></div><strong>{task.title}</strong><span className="task-card-meta"><Clock3 size={13} /> {task.due}</span><div className="task-card-foot"><span>{task.weight}</span><b>{task.score} <small>priority</small></b></div></div>;
}

function Attendance() {
  const [present, setPresent] = useState(false);
  return <><SectionHeader eyebrow="Predictive compliance · 75% mandate" title="Attendance, without anxiety" copy="Know your exact margin before it becomes a problem." action={<button className="secondary-button" onClick={() => setPresent((v) => !v)}><CheckCircle2 size={15} /> {present ? "Logged today" : "Log attendance"}</button>} /><div className="attendance-hero"><div><div className="status-chip mint-chip"><CheckCircle2 size={14} /> All clear</div><h2>84.7% <span>overall attendance</span></h2><p>You can safely miss <b>5 classes</b> this month and remain above the university mandate.</p></div><ProgressRing value={84.7} size={128} stroke={10} color="#59c7ae" /></div><div className="attendance-grid">{attendanceRows.map((row) => { const value = Math.round((row.attended / row.total) * 100); return <div className="attendance-card" key={row.code}><div className="attendance-card-head"><span className="course-marker" style={{ background: row.color }} /> <div><strong>{row.code}</strong><span>{row.name}</span></div><button className="icon-button" aria-label="Attendance actions" onClick={() => toast(`${row.name}: ${row.attended} of ${row.total} attended`)}><MoreHorizontal size={16} /></button></div><div className="attendance-numbers"><strong>{value}%</strong><span>{row.attended} / {row.total}</span></div><div className="meter attendance-meter"><span style={{ width: `${value}%`, background: row.color }} /></div><div className="safe-row"><span>Margin</span><b style={{ color: row.color }}>{row.safe}</b></div></div> })}</div><div className="attendance-callout"><div className="insight-icon"><TrendingUp size={18} /></div><div><strong>Small trend, useful signal</strong><p>Your morning attendance is 6% lower than afternoon attendance. Orbit will nudge you 20 minutes earlier on Tuesday.</p></div><button className="text-button" onClick={() => toast("Morning class nudge scheduled")}>Set nudge <ArrowUpRight size={14} /></button></div></>;
}

function Progress() {
  const [range, setRange] = useState("Week");
  return <><SectionHeader eyebrow="Behavioral analytics · clustering" title="Progress lab" copy="See the patterns behind your progress, not just the total." action={<div className="segmented"><button className={range === "Week" ? "selected" : ""} onClick={() => setRange("Week")}>Week</button><button className={range === "Month" ? "selected" : ""} onClick={() => setRange("Month")}>Month</button></div>} /><div className="progress-grid"><div className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Focus minutes · {range.toLowerCase()}</div><h3>Consistency is compounding</h3></div><span className="chart-legend"><i /> Focused time</span></div><div className="big-chart"><div className="chart-y"><span>8h</span><span>6h</span><span>4h</span><span>2h</span><span>0</span></div><div className="chart-area"><div className="chart-grid-lines">{[0, 1, 2, 3, 4].map((i) => <span key={i} />)}</div><svg viewBox="0 0 600 190" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8d7aff" stopOpacity=".28" /><stop offset="1" stopColor="#8d7aff" stopOpacity="0" /></linearGradient></defs><path d="M0,150 C40,148 46,112 90,120 S130,86 170,110 S208,38 250,72 S290,118 330,92 S374,65 410,79 S450,38 495,53 S548,22 600,18 L600,190 L0,190 Z" fill="url(#chartFill)" /><path d="M0,150 C40,148 46,112 90,120 S130,86 170,110 S208,38 250,72 S290,118 330,92 S374,65 410,79 S450,38 495,53 S548,22 600,18" fill="none" stroke="#8d7aff" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></div><div className="panel peaks-panel"><div className="panel-heading"><div><div className="eyebrow">Personal rhythm</div><h3>Your peak hours</h3></div><BrainCircuit size={18} className="muted-icon" /></div><div className="peak-main"><div className="peak-orb"><span>8–11</span><small>PM</small></div><div><strong>Deep focus window</strong><p>Most productive for analytical work</p></div></div><div className="heatmap">{Array.from({ length: 35 }).map((_, i) => <span key={i} className={`heat-${(i * 7) % 5}`} />)}</div><div className="heatmap-label"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div></div></div><div className="progress-bottom"><div className="stat-card"><span className="metric-icon lavender"><TimerReset size={17} /></span><div><strong>14.6h</strong><span>deep work this week</span></div><b className="positive">+18%</b></div><div className="stat-card"><span className="metric-icon mint"><CheckCircle2 size={17} /></span><div><strong>86%</strong><span>planned tasks completed</span></div><b className="positive">+9%</b></div><div className="stat-card"><span className="metric-icon orange"><Flame size={17} /></span><div><strong>6 days</strong><span>current consistency streak</span></div><b className="positive">best yet</b></div></div></>;
}

function Materials() {
  const [dragging, setDragging] = useState(false);
  return <><SectionHeader eyebrow="NLP classification · digital vault" title="Everything in its place" copy="Drop a file. Orbit reads the course code, tags the topic, and files it for you." action={<button className="primary-button" onClick={() => toast("File picker simulated", { description: "Dropzone is ready for your next lecture file." })}><CloudUpload size={16} /> Upload material</button>} /><div className={`upload-zone ${dragging ? "dragging" : ""}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDrop={() => { setDragging(false); toast.success("Material classified", { description: "Filed under Machine Learning · Week 05" }); }}><div className="upload-ring"><CloudUpload size={24} /></div><strong>Drop lecture files here</strong><span>PDF, PPTX, DOCX up to 25 MB</span><button className="secondary-button" onClick={() => toast("File picker simulated")}>Browse files</button><div className="upload-hint"><Sparkles size={13} /> Auto-classification is on</div></div><div className="vault-head"><div><div className="eyebrow">Recent files</div><h3>Your knowledge map</h3></div><div className="search-box"><Search size={15} /><input placeholder="Search materials" /></div></div><div className="materials-grid">{materials.map((material) => { const Icon = material.icon; return <button className="material-card" key={material.title} onClick={() => toast(material.title, { description: `${material.course} · ${material.meta}` })}><div className={`material-icon ${material.color}`}><Icon size={19} /></div><div className="material-copy"><strong>{material.title}</strong><span>{material.course}</span><small>{material.meta}</small></div><ArrowUpRight size={16} className="material-arrow" /></button> })}</div><div className="tag-cloud"><span className="eyebrow">Auto tags</span><span>networks</span><span>week 05</span><span>prof. mehta</span><span>revision</span><span>high priority</span><span>lab</span></div></>;
}

export default function Home() {
  const [active, setActive] = useState("overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const toggleTask = (id: number) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const activeLabel = useMemo(() => navItems.find((item) => item.id === active)?.label ?? "Overview", [active]);
  const navigate = (id: string) => { setActive(id); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const addTask = () => { if (!newTask.trim()) return; setTasks((current) => [...current, { id: Date.now(), title: newTask.trim(), course: "Personal focus", due: "Added just now", weight: "New priority", score: "78", color: "mint", done: false }]); setNewTask(""); setComposerOpen(false); toast.success("Added to your orbit"); };
  const page = active === "overview" ? <Overview onNavigate={navigate} tasks={tasks} toggleTask={toggleTask} showComposer={() => setComposerOpen(true)} /> : active === "timetable" ? <Timetable onBack={() => navigate("overview")} /> : active === "planner" ? <Planner tasks={tasks} toggleTask={toggleTask} showComposer={() => setComposerOpen(true)} /> : active === "attendance" ? <Attendance /> : active === "progress" ? <Progress /> : <Materials />;
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen ? "open" : ""}`}><div className="brand"><OrbitMark /><div><strong>orbit</strong><span>academic command center</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div><div className="workspace-switcher"><div className="workspace-avatar">AS</div><div><strong>Arjun's workspace</strong><span>VIT · 3rd year</span></div><ChevronDown size={15} /></div><nav className="primary-nav"><span className="nav-label">Workspace</span>{navItems.map((item) => { const Icon = item.icon; return <button className={`nav-item ${active === item.id ? "active" : ""}`} key={item.id} onClick={() => navigate(item.id)}><Icon size={17} /><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}</button> })}</nav><div className="sidebar-bottom"><div className="ai-status"><span className="pulse-dot" /><div><strong>Orbit is learning</strong><span>14 sessions analyzed</span></div><ArrowUpRight size={14} /></div><button className="nav-item muted-nav" onClick={() => toast("Settings are coming soon") }><Network size={17} /><span>Settings</span></button><div className="profile"><div className="profile-avatar">AS</div><div><strong>Arjun S.</strong><span>Student · online</span></div><MoreHorizontal size={17} /></div></div></aside><main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><PanelLeftClose size={19} /></button><div className="crumb"><span>Orbit</span><i>/</i><strong>{activeLabel}</strong></div></div><div className="topbar-actions"><button className="command-trigger" onClick={() => setCommandOpen(true)}><Search size={15} /><span>Quick find</span><kbd>⌘ K</kbd></button><button className="top-icon" aria-label="Notifications" onClick={() => toast("You're all caught up", { description: "No urgent academic alerts." })}><Bell size={17} /><i /></button><div className="top-avatar">AS</div></div></header><div className="page-wrap">{page}</div><footer className="footer"><span>Orbit v0.9 · built for the in-between</span><span><span className="pulse-dot" /> All systems calm</span></footer></main>{composerOpen && <div className="modal-backdrop" onClick={() => setComposerOpen(false)}><div className="composer-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">New orbit item</div><h3>What needs your attention?</h3></div><button className="icon-button" onClick={() => setComposerOpen(false)}><X size={18} /></button></div><label>Task name<input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} placeholder="e.g. revise linked lists" /></label><div className="composer-options"><button className="option-chip active"><Target size={14} /> Task</button><button className="option-chip"><CalendarDays size={14} /> Block time</button><button className="option-chip"><BookOpen size={14} /> Review</button></div><button className="primary-button full-button" onClick={addTask}>Add to orbit <ArrowUpRight size={15} /></button></div></div>}{commandOpen && <div className="modal-backdrop command-backdrop" onClick={() => setCommandOpen(false)}><div className="command-modal" onClick={(event) => event.stopPropagation()}><div className="command-input"><Search size={18} /><input autoFocus placeholder="Jump to a space or action" /><kbd>ESC</kbd></div><div className="command-list">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { navigate(item.id); setCommandOpen(false); }}><Icon size={16} /><span>Open {item.label}</span><ArrowUpRight size={14} /></button> })}</div><div className="command-foot"><Command size={14} /> Quick navigation · instant by design</div></div></div>}</div>;
}
