import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock3,
  FileWarning,
  FolderOpen,
  Home,
  LockKeyhole,
  LogIn,
  RefreshCw,
  SearchX,
  ServerCrash,
  ShieldAlert,
  SignalZero,
  UploadCloud,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Dedicated state definitions keep system recovery pages visually consistent.
const stateDefinitions = {
  "403": {
    code: "403",
    eyebrow: "ACCESS DENIED",
    title: "This area is not available to this account.",
    text: "The current account does not have permission to open this page or record. Protected information has not been displayed.",
    Icon: ShieldAlert,
    tone: "from-amber-500 to-orange-600",
    panel: "bg-amber-50 text-amber-900 border-amber-200",
    primary: "Return to dashboard",
    primaryAction: "dashboard",
    secondary: "Go to homepage",
    secondaryAction: "home",
  },
  "404": {
    code: "404",
    eyebrow: "PAGE NOT FOUND",
    title: "The requested page could not be found.",
    text: "The address may be incorrect, the page may have moved, or the requested public record may no longer be available.",
    Icon: SearchX,
    tone: "from-blue-600 to-cyan-500",
    panel: "bg-blue-50 text-blue-900 border-blue-200",
    primary: "Explore services",
    primaryAction: "services",
    secondary: "Go to homepage",
    secondaryAction: "home",
  },
  "500": {
    code: "500",
    eyebrow: "SYSTEM ERROR",
    title: "ServiceLink could not complete that request.",
    text: "An unexpected system problem occurred. No technical details, application paths, database information, or credentials are shown on this page.",
    Icon: ServerCrash,
    tone: "from-rose-600 to-red-700",
    panel: "bg-rose-50 text-rose-900 border-rose-200",
    primary: "Try again",
    primaryAction: "retry",
    secondary: "Contact support",
    secondaryAction: "contact",
  },
  maintenance: {
    code: "MAINTENANCE",
    eyebrow: "TEMPORARILY UNAVAILABLE",
    title: "ServiceLink is receiving an update.",
    text: "The application is temporarily unavailable while planned work is completed. Account and marketplace information remains unavailable during this period.",
    Icon: Wrench,
    tone: "from-violet-600 to-indigo-700",
    panel: "bg-violet-50 text-violet-900 border-violet-200",
    primary: "Check again",
    primaryAction: "retry",
    secondary: "View public homepage",
    secondaryAction: "home",
  },
  "session-expired": {
    code: "SESSION ENDED",
    eyebrow: "SIGN IN REQUIRED",
    title: "The secure session has expired.",
    text: "For account security, the previous session is no longer active. Sign in again before continuing to protected ServiceLink pages.",
    Icon: Clock3,
    tone: "from-cyan-600 to-blue-700",
    panel: "bg-cyan-50 text-cyan-900 border-cyan-200",
    primary: "Log in again",
    primaryAction: "login",
    secondary: "Go to homepage",
    secondaryAction: "home",
  },
  "account-restricted": {
    code: "RESTRICTED",
    eyebrow: "ACCOUNT ACCESS LIMITED",
    title: "Marketplace capabilities are currently unavailable.",
    text: "This account has been restricted or suspended. New services, offers, wanted advertisements, and bookings cannot be created until access is restored.",
    Icon: Ban,
    tone: "from-slate-700 to-slate-950",
    panel: "bg-slate-100 text-slate-900 border-slate-300",
    primary: "Contact support",
    primaryAction: "contact",
    secondary: "Return to homepage",
    secondaryAction: "home",
  },
};

function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/90 bg-white/75 shadow-[0_28px_80px_rgba(30,64,120,0.16)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

export default function SystemStatePage({ screen = "404" }) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const [galleryState, setGalleryState] = useState("loading");
  const definition = stateDefinitions[screen] || stateDefinitions["404"];

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const goToDashboard = () => {
    // Laravel will later determine the authenticated role and correct dashboard.
    navigate("/login");
  };

  const runAction = (action) => {
    const actions = {
      home: () => navigate("/"),
      login: () => navigate("/login"),
      contact: () => navigate("/contact"),
      services: () => navigate("/services"),
      dashboard: goToDashboard,
      retry: () => {
        showNotice("Retry requested in the UI prototype");
        window.setTimeout(() => window.location.reload(), 500);
      },
    };

    actions[action]?.();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f8fc] text-slate-900">
      {/* Decorative fields preserve the ServiceLink glossy visual language. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-blue-300/35 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-15rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact system header always provides a safe route to the homepage. */}
      <header className="relative z-10 px-4 pt-5 sm:px-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/72 px-4 py-3 shadow-xl backdrop-blur-2xl sm:px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg">
              <Wrench size={20} />
            </span>
            <span className="text-xl font-black tracking-[-0.04em]">
              Service<span className="text-blue-600">Link</span>
            </span>
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm"
          >
            Support
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {screen === "gallery" ? (
          <StateGallery
            selected={galleryState}
            setSelected={setGalleryState}
            showNotice={showNotice}
            navigate={navigate}
          />
        ) : (
          <DedicatedState
            definition={definition}
            runAction={runAction}
            navigate={navigate}
          />
        )}
      </main>
    </div>
  );
}

function DedicatedState({ definition, runAction, navigate }) {
  const Icon = definition.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <GlassPanel className="overflow-hidden">
        <div className={`bg-gradient-to-br ${definition.tone} p-7 text-white sm:p-10`}>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <span className="grid h-16 w-16 place-items-center rounded-[1.4rem] bg-white/15">
              <Icon size={31} />
            </span>
            <span className="text-right text-2xl font-black text-white/30 sm:text-3xl">
              {definition.code}
            </span>
          </div>

          <p className="mt-7 text-sm font-extrabold tracking-[0.18em] text-white/70">
            {definition.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            {definition.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/80">
            {definition.text}
          </p>
        </div>

        <div className="p-6 sm:p-9">
          <div className={`rounded-2xl border p-5 ${definition.panel}`}>
            <div className="flex gap-3">
              <ShieldAlert size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-6">
                If this message appears unexpectedly, return to a safe page and try again. Do not repeatedly submit the same sensitive action.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => runAction(definition.primaryAction)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-extrabold text-white"
            >
              {definition.primaryAction === "login" ? <LogIn size={18} /> : <RefreshCw size={18} />}
              {definition.primary}
            </button>
            <button
              onClick={() => runAction(definition.secondaryAction)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-extrabold text-blue-700"
            >
              <Home size={18} /> {definition.secondary}
            </button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-extrabold text-slate-500"
          >
            <ArrowLeft size={16} /> Return to previous page
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// The gallery documents reusable component-level states before API integration.
function StateGallery({ selected, setSelected, showNotice, navigate }) {
  const tabs = [
    ["loading", "Loading"],
    ["empty", "Empty"],
    ["no-results", "No results"],
    ["network", "Network failure"],
    ["upload", "Upload failure"],
    ["validation", "Validation"],
    ["locked", "Locked feature"],
  ];

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">
          SYSTEM STATE LIBRARY
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">
          Reusable loading, empty and failure states
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-500">
          These state patterns will be reused inside marketplace lists, dashboards, forms, uploads, and protected capabilities when real API requests are connected.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSelected(value)}
            className={`rounded-xl px-4 py-2.5 text-sm font-extrabold ${
              selected === value
                ? "bg-slate-950 text-white"
                : "bg-white/75 text-slate-600 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <GalleryPreview
            state={selected}
            showNotice={showNotice}
            navigate={navigate}
          />
        </motion.div>
      </AnimatePresence>

      <GlassPanel className="mt-6 p-6">
        <h2 className="text-xl font-black">Dedicated page shortcuts</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["403 Access Denied", "/403"],
            ["404 Page Not Found", "/404"],
            ["500 System Error", "/500"],
            ["Maintenance", "/maintenance"],
            ["Session Expired", "/session-expired"],
            ["Account Restricted", "/account-restricted"],
          ].map(([label, path]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-left text-sm font-extrabold hover:bg-blue-50 hover:text-blue-700"
            >
              {label} <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

function GalleryPreview({ state, showNotice, navigate }) {
  if (state === "loading") return <LoadingPreview />;
  if (state === "empty") return <EmptyPreview navigate={navigate} />;
  if (state === "no-results") return <NoResultsPreview showNotice={showNotice} />;
  if (state === "network") return <NetworkPreview showNotice={showNotice} />;
  if (state === "upload") return <UploadPreview showNotice={showNotice} />;
  if (state === "validation") return <ValidationPreview />;
  return <LockedPreview navigate={navigate} />;
}

function LoadingPreview() {
  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Loading services</h2>
          <p className="mt-2 text-sm text-slate-500">Skeleton cards preserve the page layout while records are requested.</p>
        </div>
        <RefreshCw size={22} className="animate-spin text-blue-600" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="animate-pulse rounded-2xl bg-slate-50 p-4">
            <div className="h-28 rounded-xl bg-slate-200" />
            <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function EmptyPreview({ navigate }) {
  return (
    <GlassPanel className="p-10 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-700">
        <FolderOpen size={28} />
      </span>
      <h2 className="mt-5 text-2xl font-black">No bookings yet</h2>
      <p className="mx-auto mt-2 max-w-lg text-slate-500">When a customer requests or accepts a service, the booking will appear here.</p>
      <button onClick={() => navigate("/services")} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Browse services</button>
    </GlassPanel>
  );
}

function NoResultsPreview({ showNotice }) {
  return (
    <GlassPanel className="p-10 text-center">
      <SearchX size={38} className="mx-auto text-slate-300" />
      <h2 className="mt-5 text-2xl font-black">No services match these filters</h2>
      <p className="mx-auto mt-2 max-w-lg text-slate-500">Records exist, but none match the current keyword, category, location, price, or availability selections.</p>
      <button onClick={() => showNotice("Filters cleared in the UI prototype")} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Clear all filters</button>
    </GlassPanel>
  );
}

function NetworkPreview({ showNotice }) {
  return (
    <GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center">
      <SignalZero size={38} className="mx-auto text-rose-600" />
      <h2 className="mt-5 text-2xl font-black text-rose-950">Services could not be loaded</h2>
      <p className="mx-auto mt-2 max-w-lg text-rose-800">The request failed before records were received. Existing page data should remain available where possible.</p>
      <button onClick={() => showNotice("Network request retried in the prototype")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white"><RefreshCw size={17} />Retry</button>
    </GlassPanel>
  );
}

function UploadPreview({ showNotice }) {
  return (
    <GlassPanel className="p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700"><FileWarning size={28} /></span>
        <div className="flex-1"><h2 className="text-2xl font-black">Document upload failed</h2><p className="mt-2 text-sm leading-6 text-slate-500">The selected file is larger than the planned 5 MB limit or uses an unsupported format. Select a PDF, JPG, JPEG, or PNG file.</p></div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => showNotice("File selector opened in the prototype")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white"><UploadCloud size={17} />Choose another file</button><button onClick={() => showNotice("Failed file removed")} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold">Remove file</button></div>
    </GlassPanel>
  );
}

function ValidationPreview() {
  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex gap-3"><AlertCircle size={21} className="shrink-0 text-rose-600" /><div><h2 className="font-black text-rose-950">Please correct 3 fields</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-800"><li>Email address is invalid.</li><li>Password must contain at least 8 characters.</li><li>Password confirmation does not match.</li></ul></div></div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-extrabold">Email address</span><input defaultValue="invalid-email" className="w-full rounded-2xl border border-rose-400 bg-white px-4 py-3 outline-none ring-4 ring-rose-100" /><span className="mt-1 block text-xs font-semibold text-rose-600">Enter a valid email address.</span></label><label><span className="mb-2 block text-sm font-extrabold">Password</span><input type="password" defaultValue="123" className="w-full rounded-2xl border border-rose-400 bg-white px-4 py-3 outline-none ring-4 ring-rose-100" /><span className="mt-1 block text-xs font-semibold text-rose-600">Use at least 8 characters.</span></label></div>
    </GlassPanel>
  );
}

function LockedPreview({ navigate }) {
  return (
    <GlassPanel className="p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600"><LockKeyhole size={28} /></span><div className="flex-1"><h2 className="text-2xl font-black">Create Service is locked</h2><p className="mt-2 text-sm leading-6 text-slate-500">This capability becomes available after the provider application is approved by an administrator.</p></div></div><button onClick={() => navigate("/provider/application/status")} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View application status</button>
    </GlassPanel>
  );
}
