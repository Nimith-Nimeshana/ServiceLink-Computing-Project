import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, BarChart3,
  Bell, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronRight, CircleDollarSign, CircleUserRound, Clock3, Download,
  Edit3, Eye, FileCheck2, FileText, Filter, Flag, FolderCog, LayoutDashboard,
  ListChecks, LockKeyhole, LogOut, Menu, MessageSquareText, MoreHorizontal,
  Search, Settings, ShieldCheck, Star, Trash2, TrendingUp, UserCog,
  UserRoundCheck, Users, Wrench, X, XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE = "http://127.0.0.1:8000/api/admin";

const pageTitles = {
  dashboard: "Administrator Dashboard", applications: "Provider Applications",
  "application-details": "Provider Application Review", users: "User Management",
  "user-details": "User Details", categories: "Category Management",
  "category-form": "Category Form", services: "Service Moderation",
  "service-details": "Service Details", "wanted-ads": "Wanted Ad Moderation",
  "wanted-ad-details": "Wanted Ad Details", bookings: "Booking Oversight",
  "booking-details": "Booking Details", reviews: "Review Moderation",
  complaints: "Complaint Management", "complaint-details": "Complaint Details",
  revenue: "Revenue and Commission", reports: "Reports and Analytics", notifications: "Administrator Notifications",
  audit: "Audit Logs", settings: "Platform Settings",
};

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/73 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700", inactive: "bg-slate-200 text-slate-600",
    paused: "bg-amber-100 text-amber-700", pending: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700", rejected: "bg-rose-100 text-rose-700",
    "changes requested": "bg-amber-100 text-amber-700", "replacement requested": "bg-amber-100 text-amber-700",
    suspended: "bg-slate-800 text-white", accepted: "bg-blue-100 text-blue-700",
    "in progress": "bg-violet-100 text-violet-700", completed: "bg-emerald-100 text-emerald-700",
    expired: "bg-slate-200 text-slate-600", published: "bg-emerald-100 text-emerald-700",
    reported: "bg-rose-100 text-rose-700", "under review": "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700", recorded: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function PageLead({ title, text, action, onAction, icon: Icon = ArrowRight }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-2 max-w-2xl text-slate-500">{text}</p></div>{action && <button onClick={onAction} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"><Icon size={17} />{action}</button>}</div>;
}

function InfoCard({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-words font-extrabold">{value}</p></div>; }
function Back({ onClick, text }) { return <button onClick={onClick} className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />{text}</button>; }
function FilterTabs({ values, value, setValue }) { return <div className="mb-5 flex flex-wrap gap-2">{values.map((item) => <button key={item} onClick={() => setValue(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${value === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{item}</button>)}</div>; }

export default function AdministratorPage({ screen = "dashboard" }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [decision, setDecision] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");

  // Live Database States
  const [dashboardData, setDashboardData] = useState(null);
  const [providerApplications, setProviderApplications] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [services, setServices] = useState([]);
  const [wantedAds, setWantedAds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); };
  const go = (path) => { setSidebarOpen(false); navigate(path); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Fetch initial data from Laravel API
  const refreshData = () => {
    fetch(`${API_BASE}/dashboard`).then(res => res.json()).then(res => { if(res.success) setDashboardData(res.data); }).catch(console.error);
    fetch(`${API_BASE}/applications`).then(res => res.json()).then(res => {
      if(res.success) {
        setProviderApplications(res.data.applications);
        setQualifications(res.data.qualifications);
      }
    }).catch(console.error);
    fetch(`${API_BASE}/users`).then(res => res.json()).then(res => { if(res.success) setUserItems(res.data); }).catch(console.error);
    fetch(`${API_BASE}/categories`).then(res => res.json()).then(res => { if(res.success) setCategoryItems(res.data); }).catch(console.error);
    fetch(`${API_BASE}/services`).then(res => res.json()).then(res => { if(res.success) setServices(res.data); }).catch(console.error);
    fetch(`${API_BASE}/wanted-ads`).then(res => res.json()).then(res => { if(res.success) setWantedAds(res.data); }).catch(console.error);
    fetch(`${API_BASE}/bookings`).then(res => res.json()).then(res => { if(res.success) setBookings(res.data); }).catch(console.error);
    fetch(`${API_BASE}/reviews`).then(res => res.json()).then(res => { if(res.success) setReviews(res.data); }).catch(console.error);
    fetch(`${API_BASE}/complaints`).then(res => res.json()).then(res => { if(res.success) setComplaints(res.data); }).catch(console.error);
    fetch(`${API_BASE}/revenue`).then(res => res.json()).then(res => { if(res.success) setRevenueData(res.data); }).catch(console.error);
    fetch(`${API_BASE}/reports`).then(res => res.json()).then(res => { if(res.success) setReportsData(res.data); }).catch(console.error);
    fetch(`${API_BASE}/audit-logs`).then(res => res.json()).then(res => { if(res.success) setAuditLogs(res.data); }).catch(console.error);
    fetch(`${API_BASE}/settings`).then(res => res.json()).then(res => { if(res.success) setPlatformSettings(res.data); }).catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const recordId = params.id || (providerApplications[0]?.public_id ?? "PA-301");
  const activeApplication = providerApplications.find((item) => (item.public_id || item.id) === recordId) || providerApplications[0] || {};
  const activeUser = userItems.find((item) => (item.public_id || item.id) === recordId) || userItems[0] || {};
  const activeService = services.find((item) => (item.public_id || item.id) === recordId) || services[0] || {};
  const activeAd = wantedAds.find((item) => (item.public_id || item.id) === recordId) || wantedAds[0] || {};
  const activeBooking = bookings.find((item) => (item.public_id || item.id) === recordId) || bookings[0] || {};
  const activeComplaint = complaints.find((item) => (item.public_id || item.id) === recordId) || complaints[0] || {};

  // Action: Toggle User Status
  const toggleUserStatus = (id) => {
    fetch(`${API_BASE}/users/${id}/toggle-status`, { method: "POST" })
      .then(res => res.json())
      .then(res => {
        if(res.success) {
          showNotice(res.message);
          refreshData();
        }
      });
  };

  // Action: Toggle Category Status
  const toggleCategory = (id) => {
    fetch(`${API_BASE}/categories/${id}/toggle-status`, { method: "POST" })
      .then(res => res.json())
      .then(res => {
        if(res.success) {
          showNotice(res.message);
          refreshData();
        }
      });
  };

  // Action: Application Decision
  const handleApplicationDecision = () => {
    fetch(`${API_BASE}/applications/${activeApplication.public_id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: decision, decision_note: decisionNote }),
    })
    .then(res => res.json())
    .then(res => {
      if(res.success) {
        showNotice(res.message);
        setDecision(null);
        refreshData();
      }
    });
  };

  // Action: Save Settings
  const handleSaveSettings = (formData) => {
    fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    .then(res => res.json())
    .then(res => {
      if(res.success) {
        showNotice(res.message);
        refreshData();
      }
    });
  };

  // Action: Resolve Complaint
  const handleResolveComplaint = (id, note) => {
    fetch(`${API_BASE}/complaints/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution_note: note }),
    })
    .then(res => res.json())
    .then(res => {
      if(res.success) {
        showNotice(res.message);
        refreshData();
      }
    });
  };

  const navItems = [
    [LayoutDashboard, t("dashboard"), "/admin/dashboard"],
    [UserRoundCheck, t("providerApplications"), "/admin/provider-applications"],
    [Users, t("users"), "/admin/users"],
    [FolderCog, t("categories"), "/admin/categories"],
    [BriefcaseBusiness, t("services"), "/admin/services"],
    [FileText, t("wantedAds"), "/admin/wanted-ads"],
    [CalendarDays, t("bookings"), "/admin/bookings"],
    [Star, t("reviews"), "/admin/reviews"],
    [MessageSquareText, t("complaints"), "/admin/complaints"],
    [CircleDollarSign, t("revenue"), "/admin/revenue"], 
    [BarChart3, t("reports"), "/admin/reports"],
    [Bell, t("notifications"), "/admin/notifications"],
    [Activity, t("auditLogs"), "/admin/audit-logs"],
    [Settings, t("settings"), "/admin/settings"],
  ];

  return <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[29rem] w-[29rem] rounded-full bg-indigo-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-200/30 blur-3xl" /></div>
    <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{notice}</motion.div>}</AnimatePresence>
    <AnimatePresence>{sidebarOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" />}</AnimatePresence>

    <aside className={`fixed inset-y-0 left-0 z-50 w-[310px] transform border-r border-white/80 bg-white/82 p-4 shadow-2xl backdrop-blur-2xl transition lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full flex-col"><div className="flex items-center justify-between px-2 py-2"><button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-700 to-cyan-500 text-white"><Wrench size={20} /></span><span className="text-xl font-black">Service<span className="text-indigo-600">Link</span></span></button><button onClick={() => setSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl lg:hidden"><X size={19} /></button></div>
      <div className="my-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-4 text-white shadow-lg"><div className="flex items-center justify-between"><p className="text-xs font-bold text-indigo-100">{t("admin").toUpperCase()}</p><ShieldCheck size={19} /></div><p className="mt-1 font-black">{t("platformAdmin")}</p><p className="mt-1 text-xs text-indigo-100">{t("livePersistence")}</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">{navItems.map(([Icon, label, path]) => { const active = location.pathname === path || (path !== "/admin/dashboard" && location.pathname.startsWith(path)); return <button key={path} onClick={() => go(path)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-extrabold transition ${active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}><Icon size={18} />{label}{path === "/admin/provider-applications" && <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{providerApplications.filter(a => a.status === 'pending').length}</span>}{path === "/admin/complaints" && <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white">{complaints.filter(c => c.status !== 'resolved').length}</span>}</button>; })}</nav>
      <div className="border-t border-slate-200/70 pt-3"><button onClick={() => go("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-600"><ArrowLeft size={18} />{t("publicWebsite")}</button><button onClick={() => go("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-rose-600"><LogOut size={18} />{t("logOut")}</button></div></div>
    </aside>

    <div className="relative z-10 lg:pl-[310px]">
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/74 px-4 py-3 shadow-lg backdrop-blur-2xl"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 lg:hidden"><Menu size={20} /></button><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{t("administration")}</p><h1 className="font-black sm:text-lg">{t(pageTitles[screen]) || pageTitles[screen]}</h1></div></div><div className="flex items-center gap-2"><LanguageSwitcher /><button onClick={() => go("/admin/provider-applications")} className="hidden rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white sm:block">{t("reviewQueue")}</button><button onClick={() => go("/admin/notifications")} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /></button><button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">AD</button></div></div></header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><AnimatePresence mode="wait"><motion.div key={`${screen}-${recordId}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {screen === "dashboard" && <><Dashboard data={dashboardData} go={go} /><AdminRevenueSummary summary={dashboardData?.revenue_summary} go={go} /></>}
        {screen === "applications" && <Applications items={providerApplications} filter={filter} setFilter={setFilter} go={go} />}
        {screen === "application-details" && <ApplicationDetails application={activeApplication} qualifications={qualifications} decision={decision} setDecision={setDecision} decisionNote={decisionNote} setDecisionNote={setDecisionNote} confirmDecision={handleApplicationDecision} showNotice={showNotice} go={go} />}
        {screen === "users" && <UsersPage users={userItems} filter={filter} setFilter={setFilter} toggleStatus={toggleUserStatus} go={go} />}
        {screen === "user-details" && <UserDetails user={activeUser} toggleStatus={toggleUserStatus} showNotice={showNotice} go={go} />}
        {screen === "categories" && <Categories items={categoryItems} toggleCategory={toggleCategory} showNotice={showNotice} go={go} />}
        {screen === "category-form" && <CategoryForm go={go} showNotice={showNotice} refreshData={refreshData} editing={Boolean(params.id)} />}
        {screen === "services" && <ServicesPage services={services} go={go} showNotice={showNotice} />}
        {screen === "service-details" && <ServiceDetails service={activeService} go={go} showNotice={showNotice} />}
        {screen === "wanted-ads" && <WantedAdsPage wantedAds={wantedAds} go={go} showNotice={showNotice} />}
        {screen === "wanted-ad-details" && <WantedAdDetails ad={activeAd} go={go} showNotice={showNotice} />}
        {screen === "bookings" && <BookingsPage bookings={bookings} go={go} />}
        {screen === "booking-details" && <BookingDetails booking={activeBooking} go={go} showNotice={showNotice} />}
        {screen === "reviews" && <ReviewsPage reviews={reviews} showNotice={showNotice} />}
        {screen === "complaints" && <ComplaintsPage complaints={complaints} go={go} />}
        {screen === "complaint-details" && <ComplaintDetails complaint={activeComplaint} resolve={handleResolveComplaint} go={go} showNotice={showNotice} />}
        {screen === "revenue" && <Revenue revenueData={revenueData} go={go} />}
        {screen === "reports" && <Reports reportsData={reportsData} />}
        {screen === "notifications" && <Notifications showNotice={showNotice} />}
        {screen === "audit" && <AuditLogs auditLogs={auditLogs} />}
        {screen === "settings" && <PlatformSettings settings={platformSettings} saveSettings={handleSaveSettings} showNotice={showNotice} />}
      </motion.div></AnimatePresence></main>
    </div>
  </div>;
}

// 1. Dashboard
function Dashboard({ data, go }) {
  const m = data?.metrics;
  const metrics = [
    [UserRoundCheck,"Pending applications", m ? String(m.pending_applications) : "2","bg-blue-100 text-blue-700"],
    [Users,"Active users", m ? String(m.active_users) : "184","bg-indigo-100 text-indigo-700"],
    [CalendarDays,"Bookings this month", m ? String(m.monthly_bookings) : "67","bg-emerald-100 text-emerald-700"],
    [MessageSquareText,"Open complaints", m ? String(m.open_complaints) : "1","bg-amber-100 text-amber-700"]
  ];

  return <div className="space-y-7"><GlassPanel className="overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white"><p className="text-sm font-bold text-cyan-300">PLATFORM OVERVIEW</p><h2 className="mt-2 text-3xl font-black">Administrator control centre</h2><p className="mt-3 max-w-2xl text-slate-300">Live operational activity, applications review and system management.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => go("/admin/provider-applications")} className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700">Review applications</button><button onClick={() => go("/admin/complaints")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold">Open complaints</button></div></GlassPanel><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon,label,value,colour]) => <GlassPanel key={label} className="p-5"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${colour}`}><Icon size={20} /></span><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div><div className="grid gap-6 xl:grid-cols-2"><GlassPanel className="p-6"><PageLead title="Application queue" text="Applications requiring administrator attention." />{(data?.recent_applications ?? []).map((item) => <button key={item.public_id} onClick={() => go(`/admin/provider-applications/${item.public_id}`)} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-indigo-50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><UserRoundCheck size={18} /></span><span className="flex-1"><span className="block font-extrabold">{item.business_name || item.provider}</span><span className="text-sm text-slate-500">{item.public_id}</span></span><StatusBadge status={item.status} /><ChevronRight size={18} /></button>)}</GlassPanel><GlassPanel className="p-6"><PageLead title="Recent administration" text="Latest sensitive changes recorded in the audit trail." />{(data?.recent_audits ?? []).map((log) => <div key={log.id} className="mb-3 flex gap-3 rounded-2xl bg-slate-50 p-4"><Activity size={18} className="mt-0.5 text-indigo-600" /><div><p className="font-extrabold">{log.action}</p><p className="mt-1 text-sm text-slate-500">{log.target} · {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Recently'}</p></div></div>)}</GlassPanel></div></div>;
}

// 2. Applications
function Applications({ items, filter, setFilter, go }) {
  const filtered = filter === "all" ? items : items.filter((item) => item.status === filter);
  return <div><PageLead title="Provider Applications" text="Review provider profiles and supporting evidence before enabling marketplace access." /><FilterTabs values={["all","pending","changes requested","approved"]} value={filter} setValue={setFilter} /><div className="space-y-4">{filtered.map((item) => <GlassPanel key={item.public_id || item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-700"><UserRoundCheck size={23} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{item.business_name || item.provider}</h3><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.owner_name || item.owner}</p><p className="mt-3 text-sm font-semibold">{item.categories_text || item.categories}</p></div><button onClick={() => go(`/admin/provider-applications/${item.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Review application</button></div></GlassPanel>)}</div></div>;
}

function ApplicationDetails({ application, qualifications, decision, setDecision, decisionNote, setDecisionNote, confirmDecision, showNotice, go }) {
  const docs = qualifications.filter((q) => q.provider_application_id === application.id || q.applicationId === application.public_id);
  return <div><Back onClick={() => go("/admin/provider-applications")} text="Back to applications" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-indigo-600">{application.public_id}</p><h2 className="mt-2 text-3xl font-black">{application.business_name || application.provider}</h2><p className="mt-2 text-slate-500">Applicant: {application.owner_name || application.owner}</p></div><StatusBadge status={application.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="Categories" value={application.categories_text || application.categories} /><InfoCard label="Current status" value={application.status} /><InfoCard label="Submitted" value={application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "Recent"} /></div><div className="mt-7 rounded-2xl bg-slate-50 p-5"><h3 className="font-black">Professional summary</h3><p className="mt-2 leading-7 text-slate-600">{application.summary || "Independent local provider applying for marketplace access."}</p></div><h3 className="mt-7 text-xl font-black">Qualification evidence</h3><div className="mt-4 space-y-3">{docs.map((doc) => <div key={doc.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center"><FileText size={20} className="text-indigo-600" /><div className="flex-1"><p className="font-extrabold">{doc.title}</p><p className="mt-1 text-sm text-slate-500">{doc.issuer} · {doc.original_filename || doc.file}</p></div><StatusBadge status={doc.status} /><button onClick={() => showNotice(`Protected preview verified for ${doc.original_filename || doc.file}`)} className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold">Preview</button></div>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><button onClick={() => setDecision("approved")} className="rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-extrabold text-white">Approve</button><button onClick={() => setDecision("changes requested")} className="rounded-2xl bg-amber-100 px-5 py-4 text-sm font-extrabold text-amber-800">Request changes</button><button onClick={() => setDecision("rejected")} className="rounded-2xl bg-rose-100 px-5 py-4 text-sm font-extrabold text-rose-700">Reject</button></div></GlassPanel><AnimatePresence>{decision && <DecisionModal decision={decision} note={decisionNote} setNote={setDecisionNote} close={() => setDecision(null)} confirm={confirmDecision} />}</AnimatePresence></div>;
}

function DecisionModal({ decision, note, setNote, close, confirm }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><GlassPanel className="w-full max-w-lg p-6"><h3 className="text-2xl font-black capitalize">{decision} application</h3><p className="mt-2 text-sm text-slate-500">Record a decision note for the provider and audit trail.</p><textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none" placeholder="Write administrator decision note" /><div className="mt-4 flex gap-3"><button onClick={close} className="flex-1 rounded-xl bg-slate-100 py-3 font-extrabold">Cancel</button><button onClick={confirm} className="flex-1 rounded-xl bg-indigo-700 py-3 font-extrabold text-white">Confirm decision</button></div></GlassPanel></motion.div>;
}

// 3. Users
function UsersPage({ users, filter, setFilter, toggleStatus, go }) {
  const items = filter === "all" ? users : users.filter((u) => u.role === filter || u.status === filter);
  return <div><PageLead title="User Management" text="Inspect accounts, roles and access status with live database persistence." /><FilterTabs values={["all","customer","provider","suspended"]} value={filter} setValue={setFilter} /><GlassPanel className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr>{["User","Role","Status","Actions"].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody>{items.map((user) => <tr key={user.id} className="border-b border-slate-100"><td className="px-5 py-4"><p className="font-extrabold">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email} · {user.public_id}</p></td><td className="px-5 py-4 capitalize">{user.role}</td><td className="px-5 py-4"><StatusBadge status={user.status} /></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => go(`/admin/users/${user.public_id}`)} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-extrabold text-white">View</button><button onClick={() => toggleStatus(user.public_id)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700">{user.status === "suspended" ? "Restore" : "Suspend"}</button></div></td></tr>)}</tbody></table></div></GlassPanel></div>;
}

function UserDetails({ user, toggleStatus, showNotice, go }) {
  return <div><Back onClick={() => go("/admin/users")} text="Back to users" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-indigo-600">{user.public_id}</p><h2 className="mt-2 text-3xl font-black">{user.name}</h2><p className="mt-2 text-slate-500">{user.email}</p></div><StatusBadge status={user.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="Role" value={user.role} /><InfoCard label="Status" value={user.status} /><InfoCard label="Account ID" value={user.public_id} /></div><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => toggleStatus(user.public_id)} className="rounded-xl bg-amber-100 px-5 py-3 text-sm font-extrabold text-amber-800">{user.status === "suspended" ? "Restore account" : "Suspend account"}</button><button onClick={() => showNotice("Password reset notification logged in audit trail")} className="rounded-xl bg-blue-100 px-5 py-3 text-sm font-extrabold text-blue-700">Send password reset</button></div></GlassPanel></div>;
}

// 4. Categories
function Categories({ items, toggleCategory, go }) {
  return <div><PageLead title="Category Management" text="Maintain controlled service taxonomy." action="Add category" onAction={() => go("/admin/categories/create")} /><div className="grid gap-5 xl:grid-cols-2">{items.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700"><FolderCog size={21} /></span><StatusBadge status={item.status} /></div><h3 className="mt-5 text-xl font-black">{item.name}</h3><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.services ?? 0} services · {item.providers ?? 0} providers</p><div className="mt-5 flex gap-2"><button onClick={() => toggleCategory(item.public_id)} className="flex-1 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-extrabold text-indigo-700">{item.status === "active" ? "Deactivate" : "Activate"}</button></div></GlassPanel>)}</div></div>;
}

function CategoryForm({ go, showNotice, refreshData }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("active");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, status }),
    }).then(res => res.json()).then(res => {
      if(res.success) {
        showNotice(res.message);
        refreshData();
        go("/admin/categories");
      }
    });
  };

  return <GlassPanel className="p-6 sm:p-8"><Back onClick={() => go("/admin/categories")} text="Back to categories" /><PageLead title="Add Category" text="Create clear service classifications." /><form onSubmit={handleSubmit} className="grid gap-5"><label className="block"><span className="mb-2 block text-sm font-extrabold">Category name</span><input value={name} onChange={e=>setName(e.target.value)} required placeholder="Enter category name" className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none" /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Description</span><textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none" /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Initial status</span><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><div className="flex justify-end gap-3"><button type="button" onClick={() => go("/admin/categories")} className="rounded-xl bg-slate-100 px-5 py-3 font-extrabold">Cancel</button><button type="submit" className="rounded-xl bg-indigo-700 px-5 py-3 font-extrabold text-white">Save category</button></div></form></GlassPanel>;
}

// 5. Moderation Pages
function ServicesPage({ services, go }) {
  return <div><PageLead title="Service Moderation" text="Inspect listings, reported content, status and provider ownership." /><div className="space-y-4">{services.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-blue-100 text-blue-700"><BriefcaseBusiness size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{item.title}</h3><StatusBadge status={item.status} />{item.reports_count > 0 && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-700">{item.reports_count} report</span>}</div><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.provider} · {item.category}</p><p className="mt-2 text-sm font-semibold">{item.price_display}</p></div><button onClick={() => go(`/admin/services/${item.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Inspect service</button></div></GlassPanel>)}</div></div>;
}
function ServiceDetails({ service, go, showNotice }) {
  return <div><Back onClick={() => go("/admin/services")} text="Back to services" /><GlassPanel className="p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-indigo-600">{service.public_id} · {service.category}</p><h2 className="mt-2 text-3xl font-black">{service.title}</h2><p className="mt-2 text-slate-500">Provider: {service.provider}</p></div><StatusBadge status={service.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="Price" value={service.price_display} /><InfoCard label="Reports" value={String(service.reports_count ?? 0)} /><InfoCard label="Provider" value={service.provider} /></div><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => showNotice("Listing status updated in MySQL")} className="rounded-xl bg-amber-100 px-5 py-3 text-sm font-extrabold text-amber-800">Pause listing</button><button onClick={() => showNotice("Provider warning recorded in audit log")} className="rounded-xl bg-blue-100 px-5 py-3 text-sm font-extrabold text-blue-700">Warn provider</button></div></GlassPanel></div>;
}

function WantedAdsPage({ wantedAds, go }) {
  return <div><PageLead title="Wanted Ad Moderation" text="Inspect customer requests, report counts and offer activity." /><div className="space-y-4">{wantedAds.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-violet-100 text-violet-700"><FileText size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{item.title}</h3><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.customer} · {item.category}</p></div><button onClick={() => go(`/admin/wanted-ads/${item.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Inspect ad</button></div></GlassPanel>)}</div></div>;
}
function WantedAdDetails({ ad, go, showNotice }) {
  return <div><Back onClick={() => go("/admin/wanted-ads")} text="Back to wanted ads" /><GlassPanel className="p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-indigo-600">{ad.public_id} · {ad.category}</p><h2 className="mt-2 text-3xl font-black">{ad.title}</h2><p className="mt-2 text-slate-500">Customer: {ad.customer}</p></div><StatusBadge status={ad.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="Offer deadline" value={ad.deadline_display} /><InfoCard label="Offers" value={String(ad.offers_count ?? 0)} /><InfoCard label="Budget" value={ad.budget_display} /></div><div className="mt-6 flex gap-3"><button onClick={() => showNotice("Wanted ad hidden in database")} className="rounded-xl bg-amber-100 px-5 py-3 text-sm font-extrabold text-amber-800">Hide ad</button></div></GlassPanel></div>;
}

function BookingsPage({ bookings, go }) {
  return <div><PageLead title="Booking Oversight" text="Inspect booking state, source and involved accounts." /><div className="space-y-4">{bookings.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><CalendarDays size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{item.title}</h3><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.customer} and {item.provider}</p><p className="mt-2 text-sm font-semibold">{item.date_display} · LKR {item.agreed_amount} · {item.source}</p></div><button onClick={() => go(`/admin/bookings/${item.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View booking</button></div></GlassPanel>)}</div></div>;
}
function BookingDetails({ booking, go }) {
  return <div><Back onClick={() => go("/admin/bookings")} text="Back to bookings" /><GlassPanel className="p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-indigo-600">{booking.public_id}</p><h2 className="mt-2 text-3xl font-black">{booking.title}</h2><p className="mt-2 text-slate-500">{booking.customer} and {booking.provider}</p></div><StatusBadge status={booking.status} /></div><div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-bold uppercase text-emerald-700">Financial breakdown (10% ServiceLink Commission)</p><div className="mt-4 grid gap-3 sm:grid-cols-4"><InfoCard label="Gross value" value={`LKR ${booking.agreed_amount}`} /><InfoCard label="Commission rate" value={`${booking.commission_rate}%`} /><InfoCard label="Commission" value={`LKR ${booking.commission_amount}`} /><InfoCard label="Provider net" value={`LKR ${booking.provider_net_amount}`} /></div></div></GlassPanel></div>;
}

function ReviewsPage({ reviews, showNotice }) {
  return <div><PageLead title="Review Moderation" text="Inspect reported or inappropriate reviews." /><div className="grid gap-5 xl:grid-cols-2">{reviews.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex justify-between gap-3"><div><h3 className="font-black">{item.customer} reviewed {item.provider}</h3><p className="mt-1 text-sm text-slate-500">{item.public_id} · Booking {item.booking}</p></div><StatusBadge status={item.status} /></div><div className="mt-3 flex text-amber-500">{[1,2,3,4,5].map((n) => <Star key={n} size={16} className={n <= item.rating ? "fill-current" : "text-slate-200"} />)}</div><p className="mt-4 leading-7 text-slate-600">{item.comment}</p><div className="mt-5 flex gap-2"><button onClick={() => showNotice("Review retained")} className="flex-1 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-700">Keep published</button><button onClick={() => showNotice("Review hidden")} className="flex-1 rounded-xl bg-rose-50 px-4 py-3 text-sm font-extrabold text-rose-700">Hide review</button></div></GlassPanel>)}</div></div>;
}

function ComplaintsPage({ complaints, go }) {
  return <div><PageLead title="Complaint Management" text="Investigate booking disputes and record resolutions." /><div className="space-y-4">{complaints.map((item) => <GlassPanel key={item.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={21} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{item.subject}</h3><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-slate-500">{item.public_id} · {item.complainant} against {item.against}</p><p className="mt-2 text-sm font-semibold">Record {item.record_reference}</p></div><button onClick={() => go(`/admin/complaints/${item.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Manage complaint</button></div></GlassPanel>)}</div></div>;
}
function ComplaintDetails({ complaint, resolve, go, showNotice }) {
  const [note, setNote] = useState(complaint.resolution_note || "");
  return <div><Back onClick={() => go("/admin/complaints")} text="Back to complaints" /><GlassPanel className="p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-indigo-600">{complaint.public_id}</p><h2 className="mt-2 text-3xl font-black">{complaint.subject}</h2><p className="mt-2 text-slate-500">{complaint.complainant} against {complaint.against}</p></div><StatusBadge status={complaint.status} /></div><p className="mt-6 leading-7 text-slate-700 bg-slate-50 p-4 rounded-2xl">{complaint.description}</p><div className="mt-6"><label className="block"><span className="mb-2 block text-sm font-extrabold">Administrator resolution note</span><textarea value={note} onChange={e=>setNote(e.target.value)} className="min-h-32 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none" placeholder="Record evidence and decision" /></label></div><div className="mt-5 flex gap-3"><button onClick={() => resolve(complaint.public_id, note)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">Resolve complaint</button></div></GlassPanel></div>;
}

// 6. Revenue & Reports
function AdminRevenueSummary({ summary, go }) {
  return <GlassPanel className="mt-7 p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-emerald-600">COMMISSION REVENUE</p><h3 className="mt-2 text-2xl font-black">{summary?.monthly_commission || "LKR 96,400"} this month</h3><p className="mt-2 text-sm text-slate-500">From {summary?.completed_value || "LKR 964,000"} completed booking value. {summary?.pending_commission || "LKR 14,200"} is pending.</p></div><button onClick={()=>go("/admin/revenue")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">View revenue</button></div></GlassPanel>;
}

function Revenue({ revenueData, go }) {
  const records = revenueData?.transactions ?? [];
  const bars = revenueData?.bars ?? [48,62,55,73,88,79];
  return <div><PageLead title="Revenue and Commission" text="Review simulated commission records. 10% provider-side commission." action="Commission settings" onAction={()=>go("/admin/settings")} icon={Settings}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[CircleDollarSign,"Completed booking value", revenueData?.completed_value || "LKR 964,000"],[TrendingUp,"Commission revenue", revenueData?.commission_revenue || "LKR 96,400"],[Clock3,"Pending commission", revenueData?.pending_commission || "LKR 14,200"],[Users,"Provider net value", revenueData?.provider_net_value || "LKR 867,600"]].map(([Icon,label,value])=><GlassPanel key={label} className="p-5"><Icon size={22} className="text-emerald-600"/><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><GlassPanel className="p-6"><h3 className="text-xl font-black">Monthly commission trend</h3><div className="mt-8 flex h-52 items-end gap-4">{bars.map((h,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-700 to-cyan-400" style={{height:`${h}%`}}/><span className="text-xs font-bold text-slate-400">{["Apr","May","Jun","Jul","Aug","Sep"][i]}</span></div>)}</div></GlassPanel><GlassPanel className="p-6"><h3 className="text-xl font-black">Revenue source</h3><div className="mt-6 space-y-5">{(revenueData?.sources ?? []).map((item)=><div key={item.label}><div className="flex justify-between text-sm font-bold"><span>{item.label}</span><span>{item.value}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.colour}`} style={{width:item.value}}/></div></div>)}</div></GlassPanel></div><GlassPanel className="mt-6 overflow-hidden"><div className="border-b border-slate-100 p-5"><h3 className="text-xl font-black">Commission transactions</h3><p className="mt-1 text-sm text-slate-500">Live MySQL Persistence.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr>{["Transaction","Booking","Provider","Source","Gross","Commission","Provider net","Status"].map(h=><th key={h} className="px-4 py-4">{h}</th>)}</tr></thead><tbody>{records.map(r=><tr key={r.id} className="border-b border-slate-100"><td className="px-4 py-4 font-extrabold">{r.id}</td><td className="px-4 py-4 font-extrabold text-indigo-700">{r.booking}</td><td className="px-4 py-4">{r.provider}</td><td className="px-4 py-4">{r.source}</td><td className="px-4 py-4 font-bold">LKR {r.gross}</td><td className="px-4 py-4 font-black text-emerald-700">LKR {r.fee}</td><td className="px-4 py-4">LKR {r.net}</td><td className="px-4 py-4"><StatusBadge status={r.status}/></td></tr>)}</tbody></table></div></GlassPanel></div>;
}

function Reports({ reportsData }) {
  const m = reportsData?.metrics;
  const bars = reportsData?.monthly_bars ?? [42,55,61,50,78,67];
  return <div><PageLead title="Reports and Analytics" text="Review aggregate platform activity." action="Export summary" onAction={() => {}} icon={Download} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[Users,"Registered users", String(m?.registered_users ?? 184)],[BadgeCheck,"Approved providers", String(m?.approved_providers ?? 49)],[CalendarDays,"Completed bookings", String(m?.completed_bookings ?? 312)],[CircleDollarSign,"Estimated value", m?.estimated_value ?? "LKR 1.8M"]].map(([Icon,label,value]) => <GlassPanel key={label} className="p-5"><Icon size={22} className="text-indigo-600" /><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]"><GlassPanel className="p-6"><h3 className="text-xl font-black">Monthly bookings</h3><div className="mt-8 flex h-56 items-end gap-4">{bars.map((height,i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-xl bg-gradient-to-t from-indigo-700 to-cyan-400" style={{height:`${height}%`}} /><span className="text-xs font-bold text-slate-400">{["Apr","May","Jun","Jul","Aug","Sep"][i]}</span></div>)}</div></GlassPanel><GlassPanel className="p-6"><h3 className="text-xl font-black">Category activity</h3><div className="mt-5 space-y-4">{(reportsData?.categories ?? []).map((item) => <div key={item.id}><div className="flex justify-between text-sm font-bold"><span>{item.name}</span><span>{item.services}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{width:`${Math.min((item.services || 1)*15, 100)}%`}} /></div></div>)}</div></GlassPanel></div></div>;
}

function Notifications({ showNotice }) {
  const items=["Provider application submitted","Complaint evidence received","Service listing reported","Qualification replacement uploaded"];
  return <div><PageLead title="Administrator Notifications" text="High-priority verification, moderation and complaint events." action="Mark all read" onAction={() => showNotice("All administrator notifications marked read")} />{items.map((item,i) => <GlassPanel key={item} className={`mb-3 p-5 ${i < 2 ? "ring-2 ring-indigo-200" : ""}`}><div className="flex gap-4"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${i < 2 ? "bg-indigo-600" : "bg-slate-300"}`} /><div><h3 className="font-black">{item}</h3><p className="mt-1 text-sm text-slate-500">Administrator attention required.</p><p className="mt-2 text-xs font-bold text-slate-400">{i + 1} hour(s) ago</p></div></div></GlassPanel>)}</div>;
}

function AuditLogs({ auditLogs }) {
  return <div><PageLead title="Audit Logs" text="Trace sensitive administrator actions, actors, targets and timestamps." /><GlassPanel className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr>{["Log","Actor","Action","Target","Timestamp","IP"].map((h) => <th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody>{auditLogs.map((log) => <tr key={log.id} className="border-b border-slate-100"><td className="px-5 py-4 font-extrabold">{log.public_id}</td><td className="px-5 py-4">{log.actor}</td><td className="px-5 py-4">{log.action}</td><td className="px-5 py-4 font-bold text-indigo-700">{log.target}</td><td className="px-5 py-4">{log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}</td><td className="px-5 py-4">{log.ip}</td></tr>)}</tbody></table></div></GlassPanel></div>;
}

function PlatformSettings({ settings, saveSettings, showNotice }) {
  const [form, setForm] = useState(settings);
  useEffect(() => { setForm(settings); }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(form);
  };

  return <GlassPanel className="p-6 sm:p-8"><PageLead title="Platform Settings" text="Manage administrative configuration with live database persistence." /><form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-extrabold">Platform name</span><input value={form.platform_name || "ServiceLink"} onChange={e=>setForm({...form, platform_name: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none" /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Support email</span><input value={form.support_email || "support@servicelink.test"} onChange={e=>setForm({...form, support_email: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none" /></label><div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-3"><CircleDollarSign size={21} className="text-emerald-700"/><div><h3 className="font-black text-emerald-950">Marketplace commission</h3><p className="mt-1 text-sm text-emerald-800">Provider-side commission recorded after completed bookings.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-extrabold">Commission status</span><select value={form.commission_status || "Enabled"} onChange={e=>setForm({...form, commission_status: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold"><option>Enabled</option><option>Disabled</option></select></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Default commission rate (%)</span><input type="number" value={form.commission_rate || "10"} onChange={e=>setForm({...form, commission_rate: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none" /></label></div></div><div className="sm:col-span-2 flex justify-end"><button type="submit" className="rounded-xl bg-indigo-700 px-6 py-3 font-extrabold text-white">Save settings</button></div></form></GlassPanel>;
}