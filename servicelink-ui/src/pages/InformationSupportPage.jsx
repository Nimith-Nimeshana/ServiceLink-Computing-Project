import React, { useEffect, useMemo, useState } from "react";
import { getStoredUser, logoutUser } from "../api/authApi.js";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowRight, BadgeCheck, Bell, BookOpen, BriefcaseBusiness,
  CalendarCheck2, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, FileCheck2, FileText, Handshake, HeartHandshake, LockKeyhole,
  Mail, MapPin, Menu, MessageSquareText, Search, Send, ShieldCheck,
  Sparkles, UserRound, Users, Wrench, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Public information content is kept in structured records so it can later be
// moved into Laravel views, configuration or database-managed content.
const customerSteps = [
  { icon: Search, title: "Find a service", text: "Browse active services from approved providers by category, location, price and availability." },
  { icon: CalendarCheck2, title: "Request a booking", text: "Select an available service and send a booking request with the required task information." },
  { icon: CheckCircle2, title: "Complete and review", text: "Follow status updates, receive the completed service and leave a verified booking review." },
];

const wantedAdSteps = [
  { icon: FileText, title: "Post what you need", text: "Create a privacy-safe wanted advertisement with category, general area, timing and budget." },
  { icon: BriefcaseBusiness, title: "Compare provider offers", text: "Approved providers can submit price, schedule, duration and service terms." },
  { icon: Handshake, title: "Accept one offer", text: "Choose the most suitable offer. ServiceLink then prepares the linked booking workflow." },
];

const providerSteps = [
  { icon: UserRound, title: "Create a provider account", text: "Register with essential account and business details." },
  { icon: FileCheck2, title: "Complete the application", text: "Add a professional profile and upload relevant qualification or certification evidence." },
  { icon: ShieldCheck, title: "Administrator review", text: "An administrator reviews the submitted profile and documents before marketplace access is enabled." },
  { icon: BriefcaseBusiness, title: "Manage marketplace work", text: "Approved providers can publish services, set availability, submit offers and manage bookings." },
];

const privacySections = [
  ["Account information", "ServiceLink plans to store account identity, contact information, role and account-status data required for registration and access control."],
  ["Public profile information", "Approved provider display names, professional summaries, general coverage areas, active services and verified ratings may appear publicly."],
  ["Private provider documents", "Qualification and certification files are intended for the provider and authorized administrators only. Files must not be exposed through public URLs."],
  ["Marketplace records", "Bookings, wanted advertisements, offers, reviews, complaints and status histories are used to deliver and monitor marketplace workflows."],
  ["Customer privacy", "Exact customer addresses and contact details remain hidden from public wanted advertisements and are shared only at the appropriate confirmed-work stage."],
  ["Security and retention", "The functional Laravel system will use authorization, validation, private file storage and appropriate retention controls. Final wording must match the implemented system."],
];

const termsSections = [
  ["Account responsibility", "Users must provide accurate information, protect login credentials and use only the capabilities available to the assigned account role."],
  ["Customer conduct", "Customers should describe work accurately, use respectful communication, honour accepted commitments and use complaint tools for genuine disputes."],
  ["Provider conduct", "Providers should publish accurate services, submit realistic offers, maintain availability and use qualification evidence that is genuine and relevant."],
  ["Provider approval", "ServiceLink administrator approval permits platform participation. It must not be presented as government, industry or external professional accreditation."],
  ["Bookings and offers", "Prices, schedules, scope and additional terms should be clear before acceptance. Status changes should reflect the actual progress of the work."],
  ["Reviews and complaints", "Reviews are connected to eligible completed bookings. Complaints should present truthful information and relevant evidence."],
  ["Moderation", "ServiceLink may hide content, restrict capabilities, request changes, suspend accounts or preserve records when required for platform safety and administration."],
  ["Prototype notice", "The current interface is an academic MVP prototype. Final operational and policy wording must be reviewed against the implemented Laravel system before release."],
];

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/72 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function PageHero({ eyebrow, title, text, children }) {
  return <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-7 text-white shadow-2xl sm:p-10"><p className="text-sm font-extrabold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p><h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">{title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-blue-100/85 sm:text-lg">{text}</p>{children}</section>;
}

export default function InformationSupportPage({ screen = "how-it-works" }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { try { const u = getStoredUser(); if (u) setCurrentUser(u); } catch {} }, []);
  const [contact, setContact] = useState({ name: "", email: "", category: "General question", reference: "", message: "" });
  const [openSection, setOpenSection] = useState(null);

  const go = (path) => { setMobileOpen(false); navigate(path); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); };

  const pageTitle = useMemo(() => ({
    "how-it-works": "How ServiceLink Works",
    about: "About ServiceLink",
    contact: "Contact and Support",
    privacy: "Privacy Notice",
    terms: "Terms of Use",
  }[screen] || "ServiceLink Information"), [screen]);

  return <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
    {/* Public information pages retain the same glossy background used by the marketplace. */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-blue-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-200/35 blur-3xl" /></div>
    <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-24 z-[100] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">{notice}</motion.div>}</AnimatePresence>

    {/* Navigation matches the homepage and public marketplace exactly. */}
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_18px_50px_rgba(39,75,120,0.12)] backdrop-blur-2xl sm:px-6">
        <button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25"><Wrench size={20} strokeWidth={2.4} /></span><span className="text-xl font-black tracking-[-0.04em] text-slate-950">Service<span className="text-blue-600">Link</span></span></button>
        <div className="hidden items-center gap-1 lg:flex">{[["Home","/"],["Services","/services"],["Providers","/providers"],["Wanted Ads","/wanted-ads"],["How It Works","/how-it-works"]].map(([label,path]) => { const active = label === "How It Works" ? routeLocation.pathname === "/how-it-works" : routeLocation.pathname === path; return <button key={path} onClick={() => go(path)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}>{label}</button>; })}</div>
        <div className="hidden items-center gap-2 lg:flex">
          {currentUser ? (
            <>
              <button onClick={() => go(currentUser.role === 'provider' ? "/provider/dashboard" : currentUser.role === 'admin' ? "/admin" : "/customer/dashboard")} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Dashboard</button>
              <button onClick={() => { try{ logoutUser(); }catch{} setCurrentUser(null); go("/"); }} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">Logout</button>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">{currentUser.name ? currentUser.name.slice(0,2).toUpperCase() : "U"}</span>
            </>
          ) : (
            <>
              <button onClick={() => go("/login")} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">Log in</button>
              <button onClick={() => go("/register")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Create account</button>
            </>
          )}
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </nav>
      <AnimatePresence>{mobileOpen && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto mt-2 max-w-7xl rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-2xl lg:hidden">
        {[
          ["Home","/"],["Services","/services"],["Providers","/providers"],["Wanted Ads","/wanted-ads"],["How It Works","/how-it-works"],["About","/about"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"],
          ...(currentUser ? [["Dashboard", currentUser.role==='provider' ? "/provider/dashboard" : currentUser.role==='admin' ? "/admin" : "/customer/dashboard"], ["Logout", "/logout"]] : [["Log in","/login"],["Create account","/register"]]),
        ].map(([label,path]) => <button key={path+label} onClick={() => { if(label==="Logout"){ try{logoutUser();}catch{} setCurrentUser(null); go("/"); } else go(path); }} className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{label}</button>)}
      </motion.div>}</AnimatePresence>
    </header>

    <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {screen === "how-it-works" && <HowItWorks go={go} />}
      {screen === "about" && <About go={go} />}
      {screen === "contact" && <Contact contact={contact} setContact={setContact} showNotice={showNotice} go={go} />}
      {screen === "privacy" && <PolicyPage type="privacy" title={pageTitle} sections={privacySections} openSection={openSection} setOpenSection={setOpenSection} go={go} />}
      {screen === "terms" && <PolicyPage type="terms" title={pageTitle} sections={termsSections} openSection={openSection} setOpenSection={setOpenSection} go={go} />}
    </main>

    {/* Footer now connects to real information and support pages. */}
    <footer className="relative z-10 border-t border-white/80 bg-white/60 px-4 py-10 backdrop-blur-2xl sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]"><div><button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white"><Wrench size={17} /></span><span className="font-black">ServiceLink</span></button><p className="mt-3 max-w-md text-sm leading-6 text-slate-500">A local service marketplace connecting customers with approved providers through direct bookings and wanted advertisements.</p></div><div><p className="font-black">Explore</p><div className="mt-3 space-y-2 text-sm font-semibold text-slate-500">{[["Services","/services"],["Providers","/providers"],["Wanted Ads","/wanted-ads"],["How It Works","/how-it-works"]].map(([label,path]) => <button key={path} onClick={() => go(path)} className="block hover:text-blue-700">{label}</button>)}</div></div><div><p className="font-black">Information</p><div className="mt-3 space-y-2 text-sm font-semibold text-slate-500">{[["About","/about"],["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([label,path]) => <button key={path} onClick={() => go(path)} className="block hover:text-blue-700">{label}</button>)}</div></div></div></footer>
  </div>;
}

function HowItWorks({ go }) {
  return <div><PageHero eyebrow="SIMPLE BY DESIGN" title="Two ways to find the right local service." text="Customers can directly book an active provider service or publish a wanted advertisement and compare offers. Providers complete an approval process before marketplace capabilities are enabled."><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => go("/services")} className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Browse services</button><button onClick={() => go("/register/provider")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold">Become a provider</button></div></PageHero><Journey title="Direct service booking" text="Use this path when an active service already matches the customer requirement." steps={customerSteps} /><Journey title="Wanted advertisements and offers" text="Use this path when the customer wants providers to propose price, timing and terms." steps={wantedAdSteps} /><section className="mt-8"><h2 className="text-3xl font-black">Provider approval journey</h2><p className="mt-2 text-slate-500">Marketplace access remains locked until the application is reviewed.</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{providerSteps.map((step,index) => <GlassPanel key={step.title} className="p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><step.icon size={20} /></span><span className="text-sm font-black text-slate-300">0{index+1}</span></div><h3 className="mt-5 text-lg font-black">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p></GlassPanel>)}</div></section><GlassPanel className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 p-7 text-white"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><h2 className="text-2xl font-black">Ready to use ServiceLink?</h2><p className="mt-2 text-blue-100">Browse existing services, create a customer account or begin a provider application.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => go("/services")} className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Find a service</button><button onClick={() => go("/register")} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Create account</button></div></div></GlassPanel></div>;
}

function Journey({ title, text, steps }) { return <section className="mt-8"><div><h2 className="text-3xl font-black">{title}</h2><p className="mt-2 text-slate-500">{text}</p></div><div className="mt-5 grid gap-4 md:grid-cols-3">{steps.map((step,index) => { const Icon = step.icon; return <GlassPanel key={step.title} className="p-6"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700"><Icon size={21} /></span><span className="text-sm font-black text-slate-300">0{index+1}</span></div><h3 className="mt-5 text-xl font-black">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p></GlassPanel>; })}</div></section>; }

function About({ go }) { return <div><PageHero eyebrow="ABOUT SERVICELINK" title="Local services, connected through one structured marketplace." text="ServiceLink is an academic MVP designed to organize local service discovery, provider approval, direct bookings, wanted advertisements, offers, reviews and complaints in one role-based system." /><div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><GlassPanel className="p-6 sm:p-8"><h2 className="text-2xl font-black">The problem ServiceLink addresses</h2><p className="mt-4 leading-7 text-slate-600">Local customers may struggle to compare service options, understand provider availability or keep booking records together. Providers may also need a clearer way to publish services, discover customer requests and manage work. ServiceLink organizes these activities into consistent customer, provider and administrator workflows.</p><h2 className="mt-8 text-2xl font-black">Trust model</h2><p className="mt-4 leading-7 text-slate-600">Provider applicants submit a professional profile and relevant evidence for administrator review. Approved status enables marketplace participation, but does not replace external licensing, professional accreditation or customer judgment.</p></GlassPanel><div className="space-y-5">{[[Users,"For customers","Find services, request bookings, publish wanted ads and compare offers."],[BriefcaseBusiness,"For providers","Publish services, manage availability, submit offers and track bookings after approval."],[ShieldCheck,"For administrators","Review applications, moderate records, manage complaints and preserve audit history."]].map(([Icon,title,text]) => <GlassPanel key={title} className="p-6"><Icon size={24} className="text-blue-600" /><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></GlassPanel>)}</div></div><GlassPanel className="mt-8 border-amber-200 bg-amber-50/80 p-6"><div className="flex gap-3"><AlertCircle size={21} className="shrink-0 text-amber-700" /><div><h3 className="font-black text-amber-900">Academic MVP disclosure</h3><p className="mt-2 text-sm leading-6 text-amber-800">The current React interface uses demonstration records. Real authentication, permissions, database persistence, private storage and operational policies will be implemented during the Laravel functional-development stage.</p></div></div></GlassPanel><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => go("/services")} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Explore marketplace</button><button onClick={() => go("/contact")} className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow">Contact support</button></div></div>; }

function Contact({ contact, setContact, showNotice, go }) {
  const submit = (event) => { event.preventDefault(); showNotice("Support enquiry submitted in the UI prototype"); setContact({ name: "", email: "", category: "General question", reference: "", message: "" }); };
  return <div><PageHero eyebrow="CONTACT AND SUPPORT" title="How can ServiceLink help?" text="Use this form for general platform questions. Booking disputes and service complaints should use the authenticated complaint workflow so the correct records remain linked." /><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><GlassPanel className="p-6 sm:p-8"><h2 className="text-2xl font-black">Send a support enquiry</h2><form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2"><ContactInput label="Full name" value={contact.name} onChange={(value) => setContact({ ...contact, name: value })} /><ContactInput label="Email address" type="email" value={contact.email} onChange={(value) => setContact({ ...contact, email: value })} /><label className="block"><span className="mb-2 block text-sm font-extrabold">Enquiry category</span><span className="flex rounded-2xl border border-white/90 bg-white/75 px-4"><select value={contact.category} onChange={(e) => setContact({ ...contact, category: e.target.value })} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"><option>General question</option><option>Account support</option><option>Provider application</option><option>Technical problem</option><option>Privacy question</option></select><ChevronDown size={16} className="my-auto" /></span></label><ContactInput label="Optional record reference" value={contact.reference} onChange={(value) => setContact({ ...contact, reference: value })} placeholder="Example: BK-1042 or PA-301" /><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold">Message</span><textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required className="min-h-40 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Explain how support can help" /></label><button className="sm:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-5 py-4 text-sm font-extrabold text-white"><Send size={18} />Send enquiry</button></form></GlassPanel><div className="space-y-5"><GlassPanel className="p-6"><Mail size={24} className="text-blue-600" /><h3 className="mt-4 text-xl font-black">General support</h3><p className="mt-2 text-sm leading-6 text-slate-500">Use the support form for account guidance, provider application questions and technical issues. Do not submit passwords or financial credentials.</p></GlassPanel><GlassPanel className="p-6"><MessageSquareText size={24} className="text-amber-600" /><h3 className="mt-4 text-xl font-black">Service complaint?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Authenticated complaints preserve the related booking, offer or evidence.</p><button onClick={() => go("/customer/complaints/create")} className="mt-4 text-sm font-extrabold text-blue-700">Open complaint form <ArrowRight size={15} className="inline" /></button></GlassPanel><GlassPanel className="p-6"><LockKeyhole size={24} className="text-violet-600" /><h3 className="mt-4 text-xl font-black">Cannot access an account?</h3><button onClick={() => go("/forgot-password")} className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-sm font-extrabold text-violet-700">Recover account access</button></GlassPanel></div></div></div>;
}
function ContactInput({ label, value, onChange, type = "text", placeholder = "" }) { return <label className="block"><span className="mb-2 block text-sm font-extrabold">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={label !== "Optional record reference"} placeholder={placeholder} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" /></label>; }

function PolicyPage({ type, title, sections, openSection, setOpenSection, go }) { const privacy = type === "privacy"; return <div><PageHero eyebrow={privacy ? "PRIVACY AND DATA" : "MARKETPLACE RULES"} title={title} text={privacy ? "This UI draft explains the planned public and private information boundaries. Final policy wording must match the implemented Laravel system before release." : "These prototype terms describe the intended responsibilities and marketplace conduct. Final wording requires review against the completed functional system."}><div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"><Clock3 size={16} />Draft for academic MVP review</div></PageHero><div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]"><GlassPanel className="h-fit p-6"><h2 className="font-black">Document navigation</h2><div className="mt-4 space-y-2">{sections.map(([heading],index) => <button key={heading} onClick={() => setOpenSection(index)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-extrabold ${openSection === index ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600"}`}>{heading}<ChevronRight size={16} /></button>)}</div><button onClick={() => go("/contact")} className="mt-5 w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700">Ask a policy question</button></GlassPanel><div className="space-y-4">{sections.map(([heading,text],index) => <GlassPanel key={heading} className="overflow-hidden"><button onClick={() => setOpenSection(openSection === index ? null : index)} className="flex w-full items-center justify-between p-5 text-left"><span className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${privacy ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>{privacy ? <ShieldCheck size={19} /> : <BookOpen size={19} />}</span><span className="font-black">{heading}</span></span><ChevronDown size={18} className={`transition ${openSection === index ? "rotate-180" : ""}`} /></button><AnimatePresence initial={false}>{openSection === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="border-t border-slate-100 px-5 py-5 leading-7 text-slate-600">{text}</p></motion.div>}</AnimatePresence></GlassPanel>)}</div></div><GlassPanel className="mt-7 border-amber-200 bg-amber-50/80 p-5"><div className="flex gap-3"><AlertCircle size={21} className="shrink-0 text-amber-700" /><p className="text-sm leading-6 text-amber-900">This is an interface and content-structure draft, not final legal advice. Before production use, update the wording to reflect the actual database, file storage, retention, notification and access-control implementation.</p></div></GlassPanel></div>; }
