import React, {
useEffect,
useMemo,
useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRoundCheck,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


import {
createProviderQualification,
deleteProviderQualification,
getProviderApplication,
getProviderQualifications,
getQualificationDownloadUrl,
getQualificationPreviewUrl,
submitProviderApplication,
updateProviderQualification,
} from "../api/providerApi.js";

// Demo qualification records let every provider-application screen be tested
// before private uploads and database records are implemented in Laravel.


const pageTitles = {
  dashboard: "Provider Application Dashboard",
  profile: "Professional Profile",
  qualifications: "Qualifications and Certifications",
  "qualification-form": "Add Qualification",
  "qualification-details": "Qualification Details",
  review: "Review and Submit Application",
  status: "Application Status",
};

// A consistent status badge communicates provider and document decisions.
function StatusBadge({ status }) {
  const colours = {
    draft: "bg-slate-200 text-slate-700",
    incomplete: "bg-slate-200 text-slate-700",
    pending: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    "changes requested": "bg-amber-100 text-amber-700",
    "replacement requested": "bg-amber-100 text-amber-700",
    suspended: "bg-slate-800 text-white",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
        colours[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

// Reusable frosted panel preserves the approved ServiceLink visual system.
function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

// Shared input wrapper keeps provider forms consistent and ready for Laravel errors.
function Field({ label, help, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-800">
        {label} {required && <span className="text-blue-600">*</span>}
      </span>
      {children}
      {help && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {help}
        </span>
      )}
    </label>
  );
}

export default function ProviderApplicationPage({ screen = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [applicationData, setApplicationData] = useState(null);
const [apiQualifications, setApiQualifications] = useState([]);
const [applicationLoading, setApplicationLoading] = useState(true);
const [applicationError, setApplicationError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [qualifications, setQualifications] =
useState([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
 
  // The profile state is temporary and will later be stored in provider_profiles.
  const [profile, setProfile] = useState({
    displayName: "Kalana HomeTech",
    professionalTitle: "Electrical and Home Maintenance Technician",
    summary:
      "Independent technician providing household electrical installation, inspection and general maintenance services.",
    experience: "4",
    phone: "071 234 5678",
    email: "kalana.provider@example.com",
    district: "Anuradhapura",
    coverage: "Anuradhapura, Mihintale and nearby areas",
    categories: ["Electrical", "Home Maintenance"],
  });

  // Find the qualification referenced by the current direct URL.
  const activeQualification = useMemo(() => {
if (!qualifications.length) {
return null;
}

return (
qualifications.find(
(item) => item.id === params.id
) || qualifications[0]
);
}, [params.id, qualifications]);

  // Completion data drives the dashboard checklist and review screen.
  const completion = useMemo(() => {
    const profileComplete = Boolean(
      profile.displayName &&
        profile.professionalTitle &&
        profile.summary &&
        profile.phone &&
        profile.email &&
        profile.district &&
        profile.categories.length
    );
    const qualificationComplete = qualifications.length > 0;

    return {
      account: true,
      profile: profileComplete,
      qualifications: qualificationComplete,
      declaration: declarationAccepted,
    };
  }, [profile, qualifications, declarationAccepted]);

  const completedSteps = Object.values(completion).filter(Boolean).length;
  const completionPercent =
applicationData?.completion?.percentage ??
Math.round((completedSteps / 4) * 100);

  // Display temporary feedback until Laravel actions and persistence are connected.
  const loadProviderApplicationData = async () => {
setApplicationLoading(true);
setApplicationError("");

try {
const [
applicationResult,
qualificationsResult,
] = await Promise.all([
getProviderApplication(),
getProviderQualifications(),
]);

setApplicationData(applicationResult.data);

const qualificationItems =
qualificationsResult.data?.items || [];

setApiQualifications(qualificationItems);

setQualifications(
qualificationItems.map(mapApiQualification)
);

if (applicationResult.data?.application?.status) {
setApplicationStatus(
applicationResult.data.application.status
);
}
} catch (error) {
console.error(
"Provider application request failed:",
error
);

setApplicationError(
error.message ||
"The provider application could not be loaded."
);
} finally {
setApplicationLoading(false);
}
};
useEffect(() => {
loadProviderApplicationData();
}, []);
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  // Change pages while closing the mobile navigation and resetting scroll position.
  const go = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    [LayoutDashboard, "Application Dashboard", "/provider/application"],
    [CircleUserRound, "Professional Profile", "/provider/application/profile"],
    [GraduationCap, "Qualifications", "/provider/application/qualifications"],
    [FileCheck2, "Review Application", "/provider/application/review"],
    [Clock3, "Application Status", "/provider/application/status"],
  ];

  if (applicationLoading) {
return (
<main className="grid min-h-screen place-items-center bg-[#f3f8fc] p-6">
<section className="w-full max-w-md rounded-[1.7rem] border border-white/90 bg-white/75 p-8 text-center shadow-2xl backdrop-blur-2xl">
<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

<h1 className="mt-5 text-xl font-black">
Loading provider application
</h1>

<p className="mt-2 text-sm text-slate-500">
ServiceLink is retrieving the saved application and
qualification records.
</p>
</section>
</main>
);
}

if (applicationError) {
return (
<main className="grid min-h-screen place-items-center bg-[#f3f8fc] p-6">
<section className="w-full max-w-lg rounded-[1.7rem] border border-rose-200 bg-rose-50/90 p-8 text-center shadow-2xl">
<AlertCircle
size={34}
className="mx-auto text-rose-600"
/>

<h1 className="mt-5 text-2xl font-black text-rose-900">
Provider application unavailable
</h1>

<p className="mt-2 text-sm text-rose-700">
{applicationError}
</p>

<button
type="button"
onClick={loadProviderApplicationData}
className="mt-6 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white"
>
Try again
</button>
</section>
</main>
);
}

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
      {/* Background light fields maintain the same glossy atmosphere as other modules. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-200/25 blur-3xl" />
      </div>

      {/* Temporary success and information message for prototype interactions. */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-5 z-[100] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The mobile overlay closes the provider application sidebar. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
            aria-label="Close provider application menu"
          />
        )}
      </AnimatePresence>

      {/* Pending-provider navigation shows only application-related pages. */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] transform border-r border-white/80 bg-white/80 p-4 shadow-2xl backdrop-blur-2xl transition lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2 py-2">
            <button onClick={() => go("/")} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg">
                <Wrench size={20} />
              </span>
              <span className="text-xl font-black">
                Service<span className="text-blue-600">Link</span>
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100 lg:hidden"
            >
              <X size={19} />
            </button>
          </div>

          {/* Progress card explains what remains before the application can be reviewed. */}
          <div className="my-5 rounded-2xl bg-gradient-to-br from-violet-700 to-blue-700 p-4 text-white shadow-lg">
            <p className="text-xs font-bold text-violet-100">PROVIDER APPLICATION</p>
            <p className="mt-1 font-black">
{applicationData?.application?.business_name ||
applicationData?.provider?.name ||
"Service Provider"}
</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-violet-100">
              {completionPercent}% ready for submission
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(([Icon, label, path]) => {
              const active =
                location.pathname === path ||
                (path.includes("qualifications") &&
                  location.pathname.includes("qualifications"));

              return (
                <button
                  key={path}
                  onClick={() => go(path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <Icon size={19} />
                  {label}
                  {label === "Qualifications" && (
                    <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-700">
                      {qualifications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Locked capabilities explain what becomes available after approval. */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <LockKeyhole size={17} /> Marketplace access locked
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Services, offers, availability and new bookings unlock after administrator approval.
            </p>
          </div>

          <div className="mt-auto space-y-1.5 border-t border-slate-200/70 pt-4">
            <button
              onClick={() => go("/")}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-slate-600 hover:bg-slate-100"
            >
              <Home size={19} /> Public website
            </button>
            <button
              onClick={() => go("/")}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={19} /> Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-[300px]">
        {/* The application top bar provides page identity and quick review access. */}
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/72 px-4 py-3 shadow-lg backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Provider onboarding
                </p>
                <h1 className="font-black tracking-tight sm:text-lg">
                  {pageTitles[screen]}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                status={applicationStatus === "draft" ? "incomplete" : applicationStatus}
              />
              <button
                onClick={() => go("/provider/application/review")}
                className="hidden rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white sm:block"
              >
                Review application
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                KI
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${screen}-${params.id || "main"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {screen === "dashboard" && (
                <ApplicationDashboard
                  completion={completion}
                  completionPercent={completionPercent}
                  go={go}
                  applicationStatus={applicationStatus}
                />
              )}

              {screen === "profile" && (
                <ProfessionalProfile
                  profile={profile}
                  setProfile={setProfile}
                  showNotice={showNotice}
                  go={go}
                />
              )}

              {screen === "qualifications" && (
                <QualificationsList
                  qualifications={qualifications}
                  go={go}
                  showNotice={showNotice}
                  reload={loadProviderApplicationData}
                />
              )}

              {screen === "qualification-form" && (
                <QualificationForm
                  mode={params.id ? "edit" : "create"}
                  qualification={activeQualification}
                  showNotice={showNotice}
                  go={go}
                  reload={loadProviderApplicationData}
                />
              )}

              {screen === "qualification-details" && (
                <QualificationDetails
                  qualification={activeQualification}
                  go={go}
                  showNotice={showNotice}
                />
              )}

              {screen === "review" && (
                <ReviewApplication
                  applicationData={applicationData}
                  qualifications={qualifications}
                  declarationAccepted={declarationAccepted}
                  setDeclarationAccepted={setDeclarationAccepted}
                  applicationStatus={applicationStatus}
                  setApplicationStatus={setApplicationStatus}
                  showNotice={showNotice}
                  go={go}
                  reload={loadProviderApplicationData}
                />
              )}

              {screen === "status" && (
                <ApplicationStatus
                  status={applicationStatus}
                  setStatus={setApplicationStatus}
                  go={go}
                  showNotice={showNotice}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Dashboard communicates application progress and routes each incomplete step.
function ApplicationDashboard({ completion, completionPercent, go, applicationStatus }) {
  const steps = [
    [CheckCircle2, "Account created", "Login and contact account details", completion.account, "/register/provider"],
    [CircleUserRound, "Professional profile", "Business identity, experience and coverage", completion.profile, "/provider/application/profile"],
    [GraduationCap, "Qualifications", "At least one supporting qualification", completion.qualifications, "/provider/application/qualifications"],
    [FileCheck2, "Declaration and review", "Confirm accuracy before submission", completion.declaration, "/provider/application/review"],
  ];

  return (
    <div className="space-y-7">
      <GlassPanel className="overflow-hidden bg-gradient-to-r from-slate-950 via-violet-950 to-blue-900 p-7 text-white">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold text-cyan-300">APPLICATION PROGRESS</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Complete your professional provider profile.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Submit accurate professional details and readable qualification evidence for administrator review.
            </p>
          </div>
          <div className="min-w-44 rounded-2xl border border-white/10 bg-white/10 p-5 text-center backdrop-blur-xl">
            <p className="text-4xl font-black">{completionPercent}%</p>
            <p className="mt-1 text-xs font-bold text-slate-300">APPLICATION COMPLETE</p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">Application checklist</h2>
            <StatusBadge status={applicationStatus === "draft" ? "incomplete" : applicationStatus} />
          </div>
          <div className="space-y-3">
            {steps.map(([Icon, title, description, complete, path]) => (
              <button
                key={title}
                onClick={() => go(path)}
                className="flex w-full items-center gap-4 rounded-2xl bg-slate-50/90 p-4 text-left transition hover:bg-violet-50"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    complete
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {complete ? <Check size={20} /> : <Icon size={20} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{title}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {description}
                  </span>
                </span>
                <span className="text-xs font-extrabold text-slate-500">
                  {complete ? "Complete" : "Required"}
                </span>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            ))}
          </div>
        </GlassPanel>

        <div className="space-y-5">
          <GlassPanel className="p-6">
            <ShieldCheck size={28} className="text-violet-600" />
            <h3 className="mt-4 text-xl font-black">What happens next?</h3>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li><strong>1.</strong> Complete all required sections.</li>
              <li><strong>2.</strong> Review every uploaded document.</li>
              <li><strong>3.</strong> Submit the application.</li>
              <li><strong>4.</strong> Wait for the administrator decision.</li>
            </ol>
          </GlassPanel>

          <GlassPanel className="border-amber-200 bg-amber-50/80 p-6">
            <div className="flex gap-3">
              <AlertCircle className="shrink-0 text-amber-600" size={21} />
              <div>
                <h3 className="font-black text-amber-900">Marketplace access remains locked</h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Approval is required before publishing services, submitting offers or receiving new bookings.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

// Professional profile form captures the business information reviewed by the administrator.
function ProfessionalProfile({ profile, setProfile, showNotice, go }) {
  const categories = ["Electrical", "Plumbing", "Computer Repair", "Home Maintenance", "Tutoring", "Photography"];

  const toggleCategory = (category) => {
    setProfile((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  return (
    <GlassPanel className="p-6 sm:p-8">
      <PageHeading
        title="Professional Profile"
        text="Provide accurate information that customers will later see on the approved public profile."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          showNotice("Professional profile saved in the UI prototype");
          go("/provider/application/qualifications");
        }}
        className="grid gap-5 sm:grid-cols-2"
      >
        <InputField label="Business or display name" value={profile.displayName} onChange={(value) => setProfile({ ...profile, displayName: value })} required />
        <InputField label="Professional title" value={profile.professionalTitle} onChange={(value) => setProfile({ ...profile, professionalTitle: value })} required />
        <div className="sm:col-span-2">
          <TextAreaField label="Professional summary" value={profile.summary} onChange={(value) => setProfile({ ...profile, summary: value })} help="Explain the main services, approach and professional background." required />
        </div>
        <InputField label="Years of experience" type="number" value={profile.experience} onChange={(value) => setProfile({ ...profile, experience: value })} required />
        <InputField label="Phone number" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} required />
        <InputField label="Email address" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} required />
        <SelectField label="Primary operating district" value={profile.district} onChange={(value) => setProfile({ ...profile, district: value })} options={["Anuradhapura", "Colombo", "Kandy", "Galle", "Other"]} required />
        <div className="sm:col-span-2">
          <InputField label="Service coverage area" value={profile.coverage} onChange={(value) => setProfile({ ...profile, coverage: value })} help="Use general areas only. Do not publish a private residential address." required />
        </div>

        <div className="sm:col-span-2">
          <Field label="Service categories" required help="Select all categories supported by the submitted experience and qualifications.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const selected = profile.categories.includes(category);
                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-extrabold transition ${
                      selected
                        ? "border-violet-300 bg-violet-100 text-violet-800"
                        : "border-white bg-white/70 text-slate-600 hover:bg-violet-50"
                    }`}
                  >
                    {category}
                    <span className={`grid h-6 w-6 place-items-center rounded-full ${selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {selected && <Check size={14} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <FormActions
          cancelText="Return to dashboard"
          submitText="Save and continue"
          onCancel={() => go("/provider/application")}
        />
      </form>
    </GlassPanel>
  );
}

// Qualification list shows document status and the next action for each record.
function QualificationsList({
  qualifications,
  go,
  showNotice,
  reload,
}) {
  const [deletingId, setDeletingId] = useState("");

  const handleDelete = async (qualification) => {
    const confirmed = window.confirm(
      `Delete "${qualification.title}"? This also removes the private document.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(qualification.id);

    try {
      await deleteProviderQualification(qualification.id);

      showNotice("Qualification deleted successfully");

      await reload();
    } catch (error) {
      console.error(
        "Qualification deletion failed:",
        error
      );

      showNotice(
        error.message ||
        "The qualification could not be deleted"
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div>
      Add qualification =
      go(
      "/provider/application/qualifications/create"
      )


      <GlassPanel className="mb-6 border-blue-200 bg-blue-50/80 p-5">
        <div className="flex gap-3">
          <ShieldCheck
            className="shrink-0 text-blue-600"
            size={21}
          />

          <div>
            <h3 className="font-black text-blue-900">
              Documents remain private
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Qualification documents are available only
              through protected Laravel routes.
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="space-y-4">
        {qualifications.length === 0 && (
          <GlassPanel className="p-8 text-center">
            <GraduationCap
              size={34}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-xl font-black">
              No qualifications added
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add at least one qualification before
              submitting the application.
            </p>

            <button
              type="button"
              onClick={() =>
                go(
                  "/provider/application/qualifications/create"
                )
              }
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white"
            >
              Add qualification
            </button>
          </GlassPanel>
        )}

        {qualifications.map((qualification) => (
          <GlassPanel
            key={qualification.id}
            className="p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                <FileText size={24} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black">
                    {qualification.title}
                  </h3>

                  <StatusBadge
                    status={qualification.status}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {qualification.id} ·{" "}
                  {qualification.issuer}
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
                  <span>{qualification.fileType}</span>

                  <span>{qualification.fileName}</span>

                  <span>
                    Issued {qualification.issueDate}
                  </span>
                </div>

                {qualification.note && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                    {qualification.note}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    go(
                      `/provider/application/qualifications/${qualification.id}`
                    )
                  }
                  className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white"
                >
                  View details
                </button>

                <button
                  type="button"
                  onClick={() =>
                    go(
                      `/provider/application/qualifications/${qualification.id}/edit`
                    )
                  }
                  className="rounded-xl bg-violet-50 px-4 py-3 text-sm font-extrabold text-violet-700"
                >
                  Edit or replace
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(qualification)
                  }
                  disabled={
                    deletingId === qualification.id
                  }
                  className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete ${qualification.title}`}
                  title="Delete qualification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {qualifications.length > 0 && (
        <button
          type="button"
          onClick={() =>
            go("/provider/application/review")
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg"
        >
          Review complete application
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

function QualificationForm({
  mode,
  qualification,
  showNotice,
  go,
  reload,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    issued_on: "",
    expires_on: "",
    document: null,
  });

  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit || !qualification) {
      return;
    }

    setForm({
      title: qualification.title || "",
      issuer: qualification.issuer || "",
      issued_on:
        qualification.issueDate === "Not supplied"
          ? ""
          : qualification.issueDate || "",
      expires_on:
        qualification.expiryDate === "No expiry"
          ? ""
          : qualification.expiryDate || "",
      document: null,
    });
  }, [isEdit, qualification]);

  const setValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setRequestError("");
    setFieldErrors({});

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("issuer", form.issuer);

    if (form.issued_on) {
      formData.append("issued_on", form.issued_on);
    }

    if (form.expires_on) {
      formData.append("expires_on", form.expires_on);
    }

    if (form.document) {
      formData.append("document", form.document);
    }

    try {
      if (isEdit) {
        if (!qualification) {
          throw new Error("Qualification not found.");
        }

        await updateProviderQualification(
          qualification.id,
          formData
        );
      } else {
        await createProviderQualification(formData);
      }

      await reload();

      showNotice(
        isEdit
          ? "Qualification updated successfully"
          : "Qualification added successfully"
      );

      go("/provider/application/qualifications");
    } catch (error) {
      console.error(
        "Qualification request failed:",
        error
      );

      setRequestError(
        error.message ||
        "The qualification could not be saved."
      );

      setFieldErrors(error.errors || {});
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !qualification) {
    return (
      <GlassPanel className="p-8 text-center">
        <AlertCircle
          size={34}
          className="mx-auto text-amber-600"
        />

        <h2 className="mt-4 text-xl font-black">
          Qualification not found
        </h2>

        <button
          type="button"
          onClick={() =>
            go("/provider/application/qualifications")
          }
          className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
        >
          Return to qualifications
        </button>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-6 sm:p-8">
      <BackButton
        onClick={() =>
          go("/provider/application/qualifications")
        }
        text="Back to qualifications"
      />

      <div className="mt-6">
        <PageHeading
          title={
            isEdit
              ? "Edit or Replace Qualification"
              : "Add Qualification"
          }
          text="Provide accurate qualification details and choose a PDF, JPG, JPEG or PNG document."
        />
      </div>

      {requestError && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {requestError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <QualificationInput
            label="Qualification or certification title"
            value={form.title}
            onChange={(value) =>
              setValue("title", value)
            }
            error={fieldErrors.title?.[0]}
            required
          />
        </div>

        <QualificationInput
          label="Issuing organization"
          value={form.issuer}
          onChange={(value) =>
            setValue("issuer", value)
          }
          error={fieldErrors.issuer?.[0]}
          required
        />

        <QualificationInput
          label="Issue date"
          type="date"
          value={form.issued_on}
          onChange={(value) =>
            setValue("issued_on", value)
          }
          error={fieldErrors.issued_on?.[0]}
        />

        <QualificationInput
          label="Expiry date"
          type="date"
          value={form.expires_on}
          onChange={(value) =>
            setValue("expires_on", value)
          }
          error={fieldErrors.expires_on?.[0]}
        />

        <div className="sm:col-span-2">
          <Field
            label={
              isEdit
                ? "Replacement document"
                : "Qualification document"
            }
            help={
              isEdit
                ? "Leave empty to keep the existing document."
                : "Accepted formats: PDF, JPG, JPEG and PNG. Maximum size: 5 MB."
            }
            required={!isEdit}
          >
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-violet-200 bg-violet-50/60 p-8 text-center transition hover:bg-violet-100/70">
              <UploadCloud
                size={34}
                className="text-violet-600"
              />

              <span className="mt-3 font-black text-violet-800">
                {form.document?.name ||
                  (isEdit
                    ? qualification.fileName
                    : "Choose a document")}
              </span>

              <span className="mt-1 text-xs text-violet-600">
                The document is stored privately by Laravel.
              </span>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required={!isEdit}
                className="hidden"
                onChange={(event) =>
                  setValue(
                    "document",
                    event.target.files?.[0] || null
                  )
                }
              />
            </label>

            {fieldErrors.document?.[0] && (
              <span className="mt-2 block text-xs font-bold text-rose-600">
                {fieldErrors.document[0]}
              </span>
            )}
          </Field>
        </div>

        <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              go("/provider/application/qualifications")
            }
            className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? "Saving qualification..."
              : isEdit
                ? "Save qualification"
                : "Add qualification"}
          </button>
        </div>
      </form>
    </GlassPanel>
  );
}

function QualificationInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
}) {
  return (
    <Field label={label} required={required}>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-2xl border bg-white/75 px-4 py-4 text-sm font-semibold outline-none transition focus:ring-4 ${error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-white/90 focus:border-violet-300 focus:ring-violet-100"
          }`}
      />

      {error && (
        <span className="mt-2 block text-xs font-bold text-rose-600">
          {error}
        </span>
      )}
    </Field>
  );
}

// Qualification form handles both adding metadata and replacing an existing file.


// Qualification detail provides a protected-document preview and review information.
function QualificationDetails({
  qualification,
  go,
}) {
  if (!qualification) {
    return (
      <GlassPanel className="p-8 text-center">
        <AlertCircle
          size={34}
          className="mx-auto text-amber-600"
        />

        <h2 className="mt-4 text-xl font-black">
          Qualification not found
        </h2>

        <button
          type="button"
          onClick={() =>
            go("/provider/application/qualifications")
          }
          className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
        >
          Return to qualifications
        </button>
      </GlassPanel>
    );
  }

  const previewUrl = getQualificationPreviewUrl(
    qualification.id
  );

  const downloadUrl = getQualificationDownloadUrl(
    qualification.id
  );

  const openPreview = () => {
    window.open(
      previewUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadDocument = () => {
    window.open(
      downloadUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="space-y-6">
      <BackButton
        onClick={() =>
          go("/provider/application/qualifications")
        }
        text="Back to qualifications"
      />

      <GlassPanel className="overflow-hidden">
        <div className="bg-gradient-to-r from-violet-700 to-blue-700 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold text-violet-100">
                {qualification.id}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {qualification.title}
              </h2>

              <p className="mt-2 text-violet-100">
                {qualification.issuer}
              </p>
            </div>

            <StatusBadge
              status={qualification.status}
            />
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_0.8fr]">
          <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-slate-200 bg-slate-100 p-6 text-center">
            <div>
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-violet-700 shadow-lg">
                <FileText size={36} />
              </span>

              <h3 className="mt-5 text-xl font-black">
                Protected document
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                This document is streamed through the
                protected Laravel provider route.
              </p>

              <button
                type="button"
                onClick={openPreview}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
              >
                <Eye size={17} />
                Open preview
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <InfoCard
              label="Original filename"
              value={qualification.fileName}
            />

            <InfoCard
              label="File type"
              value={qualification.fileType}
            />

            <InfoCard
              label="Issue date"
              value={qualification.issueDate}
            />

            <InfoCard
              label="Expiry date"
              value={qualification.expiryDate}
            />

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administrator review note
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {qualification.note ||
                  "No administrator note available."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                go(
                  `/provider/application/qualifications/${qualification.id}/edit`
                )
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 text-sm font-extrabold text-white"
            >
              <Pencil size={17} />
              Edit or replace document
            </button>

            <button
              type="button"
              onClick={downloadDocument}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-extrabold text-slate-700"
            >
              <Download size={17} />
              Download my document
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function mapApiQualification(item) {
  const fileName =
    item.original_filename || "Qualification document";

  const extension =
    fileName.includes(".")
      ? fileName.split(".").pop().toUpperCase()
      : "FILE";

  return {
    id: item.public_id,
    databaseId: item.id,
    applicationId: item.provider_application_id,
    providerId: item.provider_id,
    title: item.title,
    issuer: item.issuer,
    issueDate: item.issued_on || "Not supplied",
    expiryDate: item.expires_on || "No expiry",
    fileName,
    fileType: extension,
    fileSize: "Private document",
    status: String(item.status || "pending").replaceAll(
      "_",
      " "
    ),
    note:
      item.review_note ||
      "Waiting for administrator review.",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

// Review screen summarizes the complete application before final submission.
function ReviewApplication({
  applicationData,
  qualifications,
  declarationAccepted,
  setDeclarationAccepted,
  applicationStatus,
  setApplicationStatus,
  showNotice,
  go,
  reload,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const provider = applicationData?.provider || {};
  const application = applicationData?.application || {};
  const profile = applicationData?.profile || {};
  const completionData = applicationData?.completion || {};

  const normalizedStatus = String(
    applicationStatus || application.status || ""
  )
    .toLowerCase()
    .replaceAll("_", " ");

  const canSubmit = [
    "draft",
    "incomplete",
    "changes requested",
  ].includes(normalizedStatus);

  const profileComplete =
    completionData.profile_complete ?? false;

  const qualificationsComplete =
    completionData.qualifications_complete ??
    qualifications.length > 0;

  const handleSubmit = async () => {
    if (!declarationAccepted) {
      setSubmitError(
        "Accept the provider declaration before submitting."
      );
      return;
    }

    if (!profileComplete) {
      setSubmitError(
        "Complete the professional profile before submitting."
      );
      return;
    }

    if (!qualificationsComplete) {
      setSubmitError(
        "Add at least one qualification before submitting."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const result =
        await submitProviderApplication();

      setApplicationStatus(
        result.data?.application?.status || "pending"
      );

      await reload();

      showNotice(
        "Provider application submitted successfully"
      );

      go("/provider/application/status");
    } catch (error) {
      console.error(
        "Application submission failed:",
        error
      );

      setSubmitError(
        error.message ||
        "The provider application could not be submitted."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Review and Submit Application"
        text="Check the saved professional profile and qualification documents before submitting the application."
      />

      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {submitError}
        </div>
      )}

      <GlassPanel className="p-6 sm:p-8">
        Edit profile =
        go("/provider/profile/edit")


        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <InfoCard
            label="Business name"
            value={
              profile.business_name ||
              application.business_name ||
              "Not supplied"
            }
          />

          <InfoCard
            label="Account name"
            value={provider.name || "Not supplied"}
          />

          <InfoCard
            label="Professional title"
            value={
              profile.professional_title ||
              "Not supplied"
            }
          />

          <InfoCard
            label="Operating district"
            value={
              profile.primary_district ||
              "Not supplied"
            }
          />

          <InfoCard
            label="Years of experience"
            value={`${profile.years_experience ?? 0} years`}
          />

          <InfoCard
            label="Coverage area"
            value={
              profile.coverage_area ||
              "Not supplied"
            }
          />

          <div className="sm:col-span-2">
            <InfoCard
              label="Professional summary"
              value={
                profile.professional_summary ||
                application.summary ||
                "Not supplied"
              }
            />
          </div>

          <div className="sm:col-span-2">
            <InfoCard
              label="Service categories"
              value={
                application.categories_text ||
                "Not supplied"
              }
            />
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 sm:p-8">
        Manage qualifications =
        go(
        "/provider/application/qualifications"
        )


        <div className="mt-5 space-y-3">
          {qualifications.length === 0 && (
            <div className="rounded-2xl bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              At least one qualification document is
              required.
            </div>
          )}

          {qualifications.map((qualification) => (
            <button
              type="button"
              key={qualification.id}
              onClick={() =>
                go(
                  `/provider/application/qualifications/${qualification.id}`
                )
              }
              className="flex w-full items-center gap-4 rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-violet-50"
            >
              <FileText
                size={20}
                className="shrink-0 text-violet-600"
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">
                  {qualification.title}
                </span>

                <span className="text-sm text-slate-500">
                  {qualification.fileName}
                </span>
              </span>

              <StatusBadge
                status={qualification.status}
              />

              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 sm:p-8">
        <h3 className="text-xl font-black">
          Provider declaration
        </h3>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
          <input
            type="checkbox"
            checked={declarationAccepted}
            onChange={(event) => {
              setDeclarationAccepted(
                event.target.checked
              );

              if (event.target.checked) {
                setSubmitError("");
              }
            }}
            className="mt-1 h-4 w-4 accent-violet-600"
          />

          <span className="text-sm leading-6 text-slate-700">
            I confirm that the submitted professional
            information and qualification documents are
            accurate. I understand that administrator
            approval is platform approval and not external
            professional accreditation.
          </span>
        </label>
      </GlassPanel>

      {!canSubmit && (
        <GlassPanel className="border-blue-200 bg-blue-50/80 p-5">
          <div className="flex gap-3">
            <Info
              size={21}
              className="shrink-0 text-blue-600"
            />

            <div>
              <h3 className="font-black text-blue-900">
                Application already submitted
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Current status:{" "}
                <strong className="capitalize">
                  {normalizedStatus || "pending"}
                </strong>
                . The application can be resubmitted only
                when changes are requested.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          submitting ||
          !canSubmit ||
          !declarationAccepted ||
          !profileComplete ||
          !qualificationsComplete
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
      >
        <Send size={18} />

        {submitting
          ? "Submitting application..."
          : canSubmit
            ? "Submit application for review"
            : "Application already submitted"}
      </button>
    </div>
  );
}


// Status screen demonstrates the state eventually returned from the database.
function ApplicationStatus({ status, setStatus, go, showNotice }) {
  const effectiveStatus = status === "draft" ? "pending" : status;
  const states = {
    pending: {
      icon: Clock3,
      title: "Application under review",
      text: "An administrator will review the professional profile and each supporting document.",
      colour: "from-blue-600 to-cyan-500",
      action: "View submitted application",
    },
    "changes requested": {
      icon: AlertCircle,
      title: "Changes requested",
      text: "Update the requested profile information or replace the identified qualification file.",
      colour: "from-amber-500 to-orange-500",
      action: "Review requested changes",
    },
    approved: {
      icon: BadgeCheck,
      title: "Provider application approved",
      text: "Marketplace capabilities are now available through the approved provider panel.",
      colour: "from-emerald-500 to-teal-500",
      action: "Open provider dashboard",
    },
    rejected: {
      icon: XCircle,
      title: "Application not approved",
      text: "The administrator decision and any permitted resubmission steps are displayed below.",
      colour: "from-rose-500 to-red-600",
      action: "View decision details",
    },
    suspended: {
      icon: LockKeyhole,
      title: "Provider access suspended",
      text: "New services, offers and bookings remain unavailable while the account is suspended.",
      colour: "from-slate-700 to-slate-950",
      action: "View suspension details",
    },
  };
  const config = states[effectiveStatus] || states.pending;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* These controls exist only to inspect each visual state during UI testing. */}
      <GlassPanel className="p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Prototype state preview
        </p>
        <div className="flex flex-wrap gap-2">
          {["pending", "changes requested", "approved", "rejected", "suspended"].map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`rounded-xl px-3 py-2 text-xs font-extrabold capitalize ${
                effectiveStatus === item
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="overflow-hidden">
        <div className={`bg-gradient-to-r ${config.colour} p-7 text-white sm:p-9`}>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
            <Icon size={30} />
          </span>
          <h2 className="mt-6 text-3xl font-black tracking-tight">{config.title}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/80">{config.text}</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <ProgressBox icon={CheckCircle2} title="Account created" complete />
            <ProgressBox icon={FileCheck2} title="Application submitted" complete />
            <ProgressBox
              icon={effectiveStatus === "approved" ? BadgeCheck : Clock3}
              title={effectiveStatus === "approved" ? "Review completed" : "Decision recorded"}
              complete={effectiveStatus !== "pending"}
            />
          </div>

          {effectiveStatus === "changes requested" && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-black text-amber-900">Administrator request</h3>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Replace the Workplace Safety Training scan because the issuer section is unclear, then resubmit the application.
              </p>
            </div>
          )}

          {effectiveStatus === "rejected" && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <h3 className="font-black text-rose-900">Decision reason</h3>
              <p className="mt-2 text-sm leading-6 text-rose-800">
                Required evidence for the selected professional service categories was not provided. Resubmission policy will be shown here.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (effectiveStatus === "approved") {
                showNotice("The approved provider dashboard will be created in the next UI module");
              } else if (effectiveStatus === "changes requested") {
                go("/provider/application/qualifications");
              } else {
                go("/provider/application/review");
              }
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-extrabold text-white hover:bg-violet-700"
          >
            {config.action} <ArrowRight size={18} />
          </button>
        </div>
      </GlassPanel>

      <GlassPanel className="border-blue-200 bg-blue-50/80 p-5">
        <div className="flex gap-3">
          <Info className="shrink-0 text-blue-600" size={21} />
          <p className="text-sm leading-6 text-blue-900">
            Pending, changes-requested, rejected and suspended providers cannot publish services, submit offers, set availability or accept new bookings. These restrictions will also be enforced by Laravel middleware and authorization policies.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}

// Shared helper components reduce page duplication and simplify future Blade conversion.
function PageHeading({ title, text, action, onAction }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2>
        <p className="mt-2 max-w-2xl text-slate-500">{text}</p>
      </div>
      {action && (
        <button onClick={onAction} className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white">
          <Plus size={17} /> {action}
        </button>
      )}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, help, required = false }) {
  return (
    <Field label={label} help={help} required={required}>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
    </Field>
  );
}

function TextAreaField({ label, value, onChange, help, required = false }) {
  return (
    <Field label={label} help={help} required={required}>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
    </Field>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <Field label={label} required={required}>
      <span className="flex items-center rounded-2xl border border-white/90 bg-white/75 px-4">
        <select value={value} onChange={(event) => onChange(event.target.value)} required={required} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={16} className="text-slate-400" />
      </span>
    </Field>
  );
}

function FormActions({ onCancel, cancelText, submitText }) {
  return (
    <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold text-slate-700">{cancelText}</button>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg"><Save size={17} /> {submitText}</button>
    </div>
  );
}

function BackButton({ onClick, text }) {
  return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600 shadow-sm"><ArrowLeft size={16} /> {text}</button>;
}

function InfoCard({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-words font-extrabold text-slate-800">{value}</p></div>;
}

function ReviewHeader({ title, complete, action, onAction }) {
  return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{complete ? <Check size={18} /> : <AlertCircle size={18} />}</span><h3 className="text-xl font-black">{title}</h3></div><button onClick={onAction} className="text-sm font-extrabold text-violet-700">{action}</button></div>;
}

function ProgressBox({ icon: Icon, title, complete }) {
  return <div className={`rounded-2xl p-4 ${complete ? "bg-emerald-50" : "bg-slate-50"}`}><Icon size={19} className={complete ? "text-emerald-600" : "text-slate-400"} /><p className="mt-2 text-xs font-extrabold text-slate-700">{title}</p></div>;
}
