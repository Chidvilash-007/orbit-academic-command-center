import { useMemo, useState } from "react";
import{useAuth}from"@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
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
  FileDown,
  ImageIcon,
  Settings,
  UserRound,
  LogOut,
  GripVertical,
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
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [dragged, setDragged] = useState<string | null>(null);

  const moveEvent = (from: string, toDay: number) => {
    const [fromDay, fromEvent] = from.split(":").map(Number);
    if (fromDay === toDay) return;
    setLocalSchedule((current) => {
      const next = current.map((day) => ({ ...day, events: [...day.events] }));
      const [event] = next[fromDay].events.splice(fromEvent, 1);
      if (event) next[toDay].events.push(event);
      return next;
    });
    toast.success("Class moved", { description: `Orbit rebalanced ${localSchedule[fromDay].events[fromEvent]?.title ?? "the event"}.` });
  };

  const downloadTimetableImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600; canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f6f8f4"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#18201f"; ctx.font = "700 42px Manrope"; ctx.fillText("Orbit · Weekly rhythm", 70, 78);
    ctx.fillStyle = "#78817f"; ctx.font = "20px Manrope"; ctx.fillText("Drag-and-drop optimized timetable", 70, 116);
    const x0 = 70, y0 = 170, colW = 290, rowH = 100;
    localSchedule.forEach((day, i) => {
      const x = x0 + i * colW;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y0, colW - 10, 610);
      ctx.fillStyle = "#8d7aff"; ctx.font = "700 22px Manrope"; ctx.fillText(`${day.day}  ${day.date}`, x + 18, y0 + 38);
      day.events.forEach((event, j) => {
        const y = y0 + 75 + j * rowH;
        ctx.fillStyle = event.tone === "pink" ? "#ffe9f1" : event.tone === "orange" ? "#fff0e1" : event.tone === "mint" ? "#e3f8f1" : "#eeeaff";
        ctx.roundRect(x + 14, y, colW - 38, 70, 12); ctx.fill();
        ctx.fillStyle = "#18201f"; ctx.font = "700 16px Manrope"; ctx.fillText(event.title, x + 27, y + 27);
        ctx.fillStyle = "#78817f"; ctx.font = "13px DM Mono"; ctx.fillText(`${event.time} · ${event.room}`, x + 27, y + 50);
      });
    });
    const link = document.createElement("a"); link.download = "orbit-timetable.png"; link.href = canvas.toDataURL("image/png"); link.click();
    toast.success("Timetable image downloaded");
  };

  const printPdf = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) { toast.error("Popup blocked", { description: "Allow popups to export a PDF." }); return; }
    printWindow.document.write(`<html><head><title>Orbit timetable</title><style>body{font-family:Arial;padding:30px;color:#18201f}h1{font-size:28px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.day{border:1px solid #e5e9e5;border-radius:12px;padding:14px;min-height:420px}.event{border-radius:10px;background:#eeeaff;padding:12px;margin-top:12px;font-size:12px}.event b{display:block;margin-bottom:8px}.event small{color:#65706a}</style></head><body><h1>Orbit · Weekly rhythm</h1><p>Generated timetable · ${new Date().toLocaleDateString()}</p><div class="grid">${localSchedule.map((day) => `<section class="day"><b>${day.day} ${day.date}</b>${day.events.map((event) => `<div class="event"><b>${event.title}</b><small>${event.time} · ${event.room} · ${event.code}</small></div>`).join("")}</section>`).join("")}</div><script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
    toast.success("PDF export ready", { description: "Choose ‘Save as PDF’ in the print dialog." });
  };

  return <><SectionHeader eyebrow="Schedule engine · CSP optimized" title="Your weekly rhythm" copy="A compact, collision-free calendar that leaves room for the work that matters." action={<div className="button-row"><button className="secondary-button" onClick={downloadTimetableImage}><ImageIcon size={15} /> PNG</button><button className="secondary-button" onClick={printPdf}><FileDown size={15} /> PDF</button><button className="primary-button" onClick={() => toast("Smart reschedule is ready when your week changes.")}><Sparkles size={15} /> Optimize</button></div>} /><div className="schedule-toolbar"><button className="back-link" onClick={onBack}>← Overview</button><div className="segmented"><button className={week === "This week" ? "selected" : ""} onClick={() => setWeek("This week")}>This week</button><button className={week === "Next week" ? "selected" : ""} onClick={() => setWeek("Next week")}>Next week</button></div><span className="toolbar-note"><span className="pulse-dot" /> Drag any class to another day</span></div><div className="calendar-board"><div className="calendar-head"><span>GMT +5:30</span>{localSchedule.map((day) => <div key={day.day}><span>{day.day}</span><strong>{day.date}</strong></div>)}</div><div className="calendar-body"><div className="time-axis">{["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((time) => <span key={time}>{time}</span>)}</div>{localSchedule.map((day, dayIndex) => <div className="calendar-column" key={day.day} onDragOver={(event) => event.preventDefault()} onDrop={() => dragged && moveEvent(dragged, dayIndex)}>{[0, 1, 2, 3, 4, 5].map((slot) => <span className="grid-line" key={slot} />)}{day.events.map((event, index) => <button draggable className={`calendar-event ${event.tone}`} key={`${event.title}-${index}`} onDragStart={() => setDragged(`${dayIndex}:${index}`)} onDragEnd={() => setDragged(null)} onClick={() => toast(event.title, { description: `${event.time} · ${event.room} · ${event.duration}` })}><GripVertical size={12} className="drag-handle" /><strong>{event.title}</strong><span>{event.time} · {event.room}</span><small>{event.code}</small></button>)}</div>)}</div></div><div className="ai-note"><div className="insight-icon"><BrainCircuit size={18} /></div><div><strong>Drag, then let Orbit rebalance.</strong><p>Drop a class onto another weekday to adjust your rhythm. Export the result as a PNG or print-ready PDF.</p></div><button className="text-button" onClick={() => toast("Constraint model: minimize gaps, protect focus, avoid back-to-back labs.")}>Explain <ArrowUpRight size={14} /></button></div></>;
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

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const complete = trpc.onboarding.complete.useMutation({ onSuccess: onComplete });
  const [form, setForm] = useState({ university: "Vellore Institute of Technology", program: "B.Tech Artificial Intelligence", year: "3", semester: "5", targetCgpa: "8.8", attendanceMandate: "75", courses: "BCS401 Computer Networks\nBAI501 Machine Learning\nBCS402 Operating Systems\nMAT201 Probability & Stats" });
  const submit = () => {
    const courses = form.courses.split("\n").map((line, index) => { const [code, ...name] = line.trim().split(/\s+/); return { code: code || `COURSE${index + 1}`, name: name.join(" ") || "Untitled course", credits: 3, color: ["violet", "pink", "orange", "mint"][index % 4] }; }).filter((course) => course.name !== "Untitled course");
    complete.mutate({ university: form.university, program: form.program, year: Number(form.year), semester: Number(form.semester), targetCgpa: Number(form.targetCgpa), attendanceMandate: Number(form.attendanceMandate), courses });
  };
  return <div className="onboarding-screen"><div className="onboarding-card"><div className="onboarding-brand"><OrbitMark /><span>orbit setup</span></div><div className="eyebrow">First orbit setup</div><h1>Make the planner yours.</h1><p>Tell Orbit a little about your academic world. You can refine this later in Settings.</p><div className="onboarding-grid"><label>University<input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} /></label><label>Program<input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} /></label><label>Year<input type="number" min="1" max="8" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label><label>Semester<input type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></label><label>Target CGPA<input type="number" step="0.1" value={form.targetCgpa} onChange={(e) => setForm({ ...form, targetCgpa: e.target.value })} /></label><label>Attendance mandate %<input type="number" value={form.attendanceMandate} onChange={(e) => setForm({ ...form, attendanceMandate: e.target.value })} /></label></div><label>Courses — one per line<input className="course-lines" value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} /></label><button className="primary-button full-button" disabled={complete.isPending} onClick={submit}>{complete.isPending ? "Building your orbit..." : "Build my Orbit"} <ArrowUpRight size={15} /></button></div></div>;
}

export default function Home() {
  const [active, setActive] = useState("overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [utilityModal, setUtilityModal] = useState<"settings" | "account" | null>(null);
  const auth = useAuth();
  const { logout } = auth;
  const utils = trpc.useUtils();
  const onboardingQuery = trpc.onboarding.get.useQuery(undefined, { enabled: Boolean(auth.user), retry: false });
  const tasksQuery = trpc.tasks.list.useQuery(undefined, { enabled: Boolean(auth.user), retry: false });
  const aiParse = trpc.ai.parsePlannerInput.useMutation();
  const aiCreate = trpc.ai.createFromNaturalLanguage.useMutation({ onSuccess: () => utils.tasks.list.invalidate() });
  const persistedTasks = tasksQuery.data?.map((task) => ({ id: task.id, title: task.title, course: task.course?.name ?? "Personal focus", due: task.dueAt ? new Date(task.dueAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No deadline", weight: task.priority === "high" ? "High impact" : `${task.durationMinutes} min focus`, score: task.priority === "high" ? "92" : task.priority === "medium" ? "78" : "60", color: task.priority === "high" ? "pink" : "mint", done: task.status === "DONE" })) ?? [];
  const visibleTasks = auth.user && tasksQuery.data?.length ? persistedTasks : tasks;
  const toggleTask = (id: number) => { const current = visibleTasks.find((task) => task.id === id); if (auth.user && current) { utils.tasks.list.setData(undefined, (old) => old?.map((task) => task.id === id ? { ...task, status: current.done ? "TODO" : "DONE" } : task)); void utils.tasks.list.invalidate(); } setTasks((all) => all.map((task) => task.id === id ? { ...task, done: !task.done } : task)); };
  const activeLabel = useMemo(() => navItems.find((item) => item.id === active)?.label ?? "Overview", [active]);
  const navigate = (id: string) => { setActive(id); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const parseTask = async () => { if (!newTask.trim()) return; try { const parsed = await aiParse.mutateAsync({ text: newTask }); setAiPreview(parsed); toast.success("Orbit understood it", { description: `${parsed.course} · ${parsed.dueLabel}` }); } catch { toast.error("Could not parse that yet", { description: "Try including the task, course, and deadline." }); } };
  const addTask = async () => { if (!newTask.trim()) return; const parsed = aiPreview; if (auth.user) { try { await aiCreate.mutateAsync({ text: newTask }); } catch { toast.error("Could not save task", { description: "Your AI preview is still available locally." }); } } setTasks((current) => [...current, { id: Date.now(), title: parsed?.title ?? newTask.trim(), course: parsed?.course ?? "Personal focus", due: parsed?.dueLabel ?? "Added just now", weight: parsed?.priority === "high" ? "High impact" : parsed?.durationMinutes ? `${parsed.durationMinutes} min focus` : "New priority", score: parsed?.priority === "high" ? "92" : "78", color: parsed?.priority === "high" ? "pink" : "mint", done: false }]); setNewTask(""); setAiPreview(null); setComposerOpen(false); toast.success("Added to your orbit"); };
  const page = active === "overview" ? <Overview onNavigate={navigate} tasks={visibleTasks} toggleTask={toggleTask} showComposer={() => setComposerOpen(true)} /> : active === "timetable" ? <Timetable onBack={() => navigate("overview")} /> : active === "planner" ? <Planner tasks={visibleTasks} toggleTask={toggleTask} showComposer={() => setComposerOpen(true)} /> : active === "attendance" ? <Attendance /> : active === "progress" ? <Progress /> : <Materials />;
  if (auth.isAuthenticated && onboardingQuery.data && !onboardingQuery.data.onboardingComplete) return <Onboarding onComplete={() => onboardingQuery.refetch()} />;
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen ? "open" : ""}`}><div className="brand"><OrbitMark /><div><strong>orbit</strong><span>academic command center</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div><div className="workspace-switcher"><div className="workspace-avatar">AS</div><div><strong>Arjun's workspace</strong><span>VIT · 3rd year</span></div><ChevronDown size={15} /></div><nav className="primary-nav"><span className="nav-label">Workspace</span>{navItems.map((item) => { const Icon = item.icon; return <button className={`nav-item ${active === item.id ? "active" : ""}`} key={item.id} onClick={() => navigate(item.id)}><Icon size={17} /><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}</button> })}</nav><div className="sidebar-bottom"><div className="ai-status"><span className="pulse-dot" /><div><strong>Orbit is learning</strong><span>14 sessions analyzed</span></div><ArrowUpRight size={14} /></div><button className="nav-item muted-nav" onClick={() => setUtilityModal("settings")}><Settings size={17} /><span>Settings</span></button><button className="profile" onClick={() => setUtilityModal("account")}><div className="profile-avatar">AS</div><div><strong>Arjun S.</strong><span>Student · online</span></div><MoreHorizontal size={17} /></button></div></aside><main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><PanelLeftClose size={19} /></button><div className="crumb"><span>Orbit</span><i>/</i><strong>{activeLabel}</strong></div></div><div className="topbar-actions"><button className="command-trigger" onClick={() => setCommandOpen(true)}><Search size={15} /><span>Quick find</span><kbd>⌘ K</kbd></button><button className="top-icon" aria-label="Notifications" onClick={() => toast("You're all caught up", { description: "No urgent academic alerts." })}><Bell size={17} /><i /></button><button className="top-avatar" onClick={() => setUtilityModal("account")} aria-label="Open account">AS</button></div></header><div className="page-wrap">{page}</div><footer className="footer"><span>Orbit v0.9 · built for the in-between</span><span><span className="pulse-dot" /> All systems calm</span></footer></main>{composerOpen && <div className="modal-backdrop" onClick={() => setComposerOpen(false)}><div className="composer-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">New orbit item</div><h3>What needs your attention?</h3></div><button className="icon-button" onClick={() => setComposerOpen(false)}><X size={18} /></button></div><label>Say it naturally<input autoFocus value={newTask} onChange={(event) => { setNewTask(event.target.value); setAiPreview(null); }} onKeyDown={(event) => { if (event.key === "Enter") parseTask(); }} placeholder="e.g. remind me to submit ML project by Friday" /></label><div className="ai-compose-row"><button className="secondary-button" onClick={parseTask} disabled={aiParse.isPending}><Sparkles size={14} /> {aiParse.isPending || aiCreate.isPending ? "Parsing..." : "Understand with AI"}</button><span>Orbit extracts course, date, priority, and focus time.</span></div>{aiPreview && <div className="ai-preview"><div className="preview-icon"><Check size={14} /></div><div><strong>{aiPreview.title}</strong><span>{aiPreview.course} · {aiPreview.dueLabel} · {aiPreview.durationMinutes} min</span><small>{aiPreview.rationale}</small></div></div>}<div className="composer-options"><button className="option-chip active"><Target size={14} /> Task</button><button className="option-chip"><CalendarDays size={14} /> Block time</button><button className="option-chip"><BookOpen size={14} /> Review</button></div><button className="primary-button full-button" onClick={addTask}>Add to orbit <ArrowUpRight size={15} /></button></div></div>}{commandOpen && <div className="modal-backdrop command-backdrop" onClick={() => setCommandOpen(false)}><div className="command-modal" onClick={(event) => event.stopPropagation()}><div className="command-input"><Search size={18} /><input autoFocus placeholder="Jump to a space or action" /><kbd>ESC</kbd></div><div className="command-list">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { navigate(item.id); setCommandOpen(false); }}><Icon size={16} /><span>Open {item.label}</span><ArrowUpRight size={14} /></button> })}</div><div className="command-foot"><Command size={14} /> Quick navigation · instant by design</div></div></div>}{utilityModal && <div className="modal-backdrop" onClick={() => setUtilityModal(null)}><div className="utility-modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">{utilityModal === "settings" ? "Workspace controls" : "Your orbit identity"}</div><h3>{utilityModal === "settings" ? "Settings" : "Account"}</h3></div><button className="icon-button" onClick={() => setUtilityModal(null)}><X size={18} /></button></div>{utilityModal === "settings" ? <><div className="setting-row"><span><Bell size={16} /><span><strong>Smart nudges</strong><small>Deadline and attendance reminders</small></span></span><button className="toggle active" onClick={() => toast("Smart nudges are on")}><i /></button></div><div className="setting-row"><span><Sparkles size={16} /><span><strong>AI auto-prioritization</strong><small>Rank tasks by impact and effort</small></span></span><button className="toggle active" onClick={() => toast("AI prioritization is on")}><i /></button></div><div className="setting-row"><span><Network size={16} /><span><strong>Compact schedule</strong><small>Minimize gaps between classes</small></span></span><button className="toggle" onClick={(event) => event.currentTarget.classList.toggle("active")}><i /></button></div><button className="primary-button full-button" onClick={() => { setUtilityModal(null); toast.success("Settings saved"); }}>Save preferences <Check size={15} /></button></> : <>{!auth.isAuthenticated && <button className="google-button" onClick={() => { window.location.href = `/api/auth/google/start?redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/google/callback`)}`; }}><span className="google-g">G</span> Continue with Google <ArrowUpRight size={14} /></button>}<div className="account-hero"><div className="large-avatar">AS</div><div><strong>Arjun S.</strong><span>VIT · School of Computer Science</span><small>3rd year · BAI</small></div></div><div className="account-links"><button onClick={() => toast("Profile editor opened")}><UserRound size={15} /> Edit profile <ArrowUpRight size={14} /></button><button onClick={() => toast("Your data export is being prepared")}><FileDown size={15} /> Export my data <ArrowUpRight size={14} /></button></div><button className="logout-button" onClick={() => logout()}><LogOut size={15} /> Sign out</button></>}</div></div>}</div>;
}
