import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness,
  Check, CheckCircle2, ChevronDown, CircleUserRound, Clock3, Eye,
  EyeOff, FileCheck2, KeyRound, LockKeyhole, Mail, MapPin, Phone,
  RefreshCw, Send, ShieldCheck, Sparkles, UserRound, Wrench, XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { loginUser, registerProvider, registerCustomer, saveAuthSession } from "../api/authApi.js";

// These values identify every authentication screen used by React Router.
const SCREENS = {
  CHOOSE_ROLE: "choose-role",
  CUSTOMER_REGISTER: "customer-register",
  PROVIDER_REGISTER: "provider-register",
  LOGIN: "login",
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
  ACCOUNT_STATUS: "account-status",
};

// This reusable field keeps labels, icons, inputs and helper text consistent.
function FormField({ label, icon: Icon, type = "text", placeholder, value, onChange, suffix, help, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
        {label}{required && <span className="text-blue-600">*</span>}
      </span>
      <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/90 bg-white/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-xl transition focus-within:border-blue-300 focus-within:bg-white/90 focus-within:ring-4 focus-within:ring-blue-100/80">
        <Icon size={19} className="shrink-0 text-blue-600" />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="min-w-0 flex-1 bg-transparent py-4 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
        {suffix}
      </span>
      {help && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span>}
    </label>
  );
}

// Password visibility is controlled locally while passwords remain hidden by default.
function PasswordField({ label, value, onChange, placeholder, help }) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField label={label} icon={LockKeyhole} type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} help={help} required suffix={
      <button type="button" onClick={() => setVisible((current) => !current)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    } />
  );
}

// The shared header connects every authentication route back to home or login.
function AuthHeader({ onHome, onLogin }) {
  return (
    <header className="relative z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_18px_50px_rgba(39,75,120,0.11)] backdrop-blur-2xl sm:px-6">
        <button onClick={onHome} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/25"><Wrench size={20} strokeWidth={2.4} /></span>
          <span className="text-xl font-black tracking-[-0.04em] text-slate-950">Service<span className="text-blue-600">Link</span></span>
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-slate-500 sm:inline">Already registered?</span>
          <button onClick={onLogin} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700">Log in</button>
        </div>
      </nav>
    </header>
  );
}

// This visual panel communicates the platform's provider-review and booking model.
function AuthVisualPanel() {
  return (
    <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-9 text-white shadow-[0_30px_90px_rgba(30,64,115,0.25)] lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur-xl"><Sparkles size={16} /> One account, reliable local help</span>
        <h2 className="mt-7 max-w-md text-4xl font-black leading-tight tracking-[-0.04em]">Join a marketplace designed around trust.</h2>
        <p className="mt-5 max-w-md leading-7 text-blue-100/80">Customers can book listed services or publish wanted advertisements. Approved providers can respond with clear offers and manage work from one dashboard.</p>
      </div>
      <div className="relative space-y-3">
        {[[ShieldCheck, "Administrator-reviewed providers"], [FileCheck2, "Secure qualification submission"], [Clock3, "Bookings and offers tracked together"]].map(([Icon, text]) => (
          <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-cyan-300"><Icon size={19} /></span><span className="text-sm font-bold text-white/90">{text}</span></div>
        ))}
      </div>
    </aside>
  );
}

// These cards let a visitor choose the correct account type.
function RoleCard({ icon: Icon, title, description, features, colour, onClick }) {
  return (
    <motion.button whileHover={{ y: -5 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="group rounded-[1.75rem] border border-white/90 bg-white/68 p-6 text-left shadow-[0_20px_55px_rgba(39,75,120,0.10)] backdrop-blur-2xl transition hover:bg-white/85 hover:shadow-2xl">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${colour} text-white shadow-lg`}><Icon size={25} /></span>
      <h3 className="mt-5 text-2xl font-black tracking-[-0.035em] text-slate-950">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 space-y-2.5">{features.map((feature) => <span key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CheckCircle2 size={16} className="shrink-0 text-teal-500" /> {feature}</span>)}</div>
      <span className="mt-7 flex items-center justify-between border-t border-slate-200/70 pt-5 text-sm font-extrabold text-blue-700">Continue as {title.toLowerCase()}<ArrowRight size={18} className="transition group-hover:translate-x-1" /></span>
    </motion.button>
  );
}

export default function AuthenticationPage({ initialScreen = SCREENS.CHOOSE_ROLE }) {
  // React Router controls navigation between home and authentication URLs.
  const navigate = useNavigate();
  const [screen, setScreen] = useState(initialScreen);
  const [notice, setNotice] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  // Form values remain local because this is still a visual prototype.
  const [login, setLogin] = useState({ email: "", password: "", remember: false });
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", district: "Anuradhapura", password: "", confirmation: "", terms: false });
  const [provider, setProvider] = useState({ name: "", business: "", email: "", phone: "", district: "Anuradhapura", password: "", confirmation: "", terms: false });
  const [forgotEmail, setForgotEmail] = useState("");
  const [reset, setReset] = useState({ password: "", confirmation: "" });
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Keep the visible form synchronized with the route selected in App.jsx.
  useEffect(() => {
    setScreen(initialScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialScreen]);

  // Calculate a simple four-part password-strength score for visual feedback.
  const passwordScore = useMemo(() => {
    const password = screen === SCREENS.PROVIDER_REGISTER ? provider.password : customer.password;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [customer.password, provider.password, screen]);

  // Prototype notices stand in for future Laravel validation and database actions.
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  // Change the browser URL so each authentication page can be opened directly.
  const changeScreen = (nextScreen) => {
    const routes = {
      [SCREENS.CHOOSE_ROLE]: "/register",
      [SCREENS.CUSTOMER_REGISTER]: "/register/customer",
      [SCREENS.PROVIDER_REGISTER]: "/register/provider",
      [SCREENS.LOGIN]: "/login",
      [SCREENS.FORGOT_PASSWORD]: "/forgot-password",
      [SCREENS.RESET_PASSWORD]: "/reset-password/demo-token",
      [SCREENS.ACCOUNT_STATUS]: "/provider/application/status",
    };
    navigate(routes[nextScreen] || "/register");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setRequestError("");
    setFieldErrors({});
    try {
      const result = await loginUser(login);
      saveAuthSession(result.data, login.remember);
      navigate(result.data.destination || "/");
    } catch (error) {
      setRequestError(error.message || "Login failed.");
      setFieldErrors(error.errors || {});
      if (error.status === 403 && error.data?.destination) {
        navigate(error.data.destination);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerRegistration = async (event) => {
    // 1. Prevent the browser from refreshing the page when the form is submitted
    event.preventDefault();
    
    // 2. Show the "Creating account..." loading state and clear old errors
    setSubmitting(true);
    setRequestError("");
    setFieldErrors({});

    try {
      // 3. Send the data from the 'customer' state variable to our API function
      const result = await registerCustomer({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        password: customer.password,
        password_confirmation: customer.confirmation,
        district: customer.district,
      });

      // 4. Save the login token securely in the browser
      saveAuthSession(result.data, false);
      
      // 5. Send the user to the success page returned by the API
      navigate(result.data.destination || "/registration-success?role=customer");
      
    } catch (error) {
      // 6. If validation fails, capture the error messages to show under the input fields
      setRequestError(error.message || "Customer registration failed.");
      setFieldErrors(error.errors || {});
    } finally {
      // 7. Turn off the loading state regardless of success or failure
      setSubmitting(false);
    }
  };

  const handleProviderRegistration = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setRequestError("");
    setFieldErrors({});
    try {
      const result = await registerProvider({
        name: provider.name,
        business_name: provider.business,
        email: provider.email,
        phone: provider.phone || null,
        password: provider.password,
        password_confirmation: provider.confirmation,
        categories_text: "Not selected",
      });
      saveAuthSession(result.data, false);
      navigate(result.data.destination || "/provider/application");
    } catch (error) {
      setRequestError(error.message || "Provider registration failed.");
      setFieldErrors(error.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const screenTitle = {
    [SCREENS.CHOOSE_ROLE]: "Create your ServiceLink account",
    [SCREENS.CUSTOMER_REGISTER]: "Create a customer account",
    [SCREENS.PROVIDER_REGISTER]: "Start your provider application",
    [SCREENS.LOGIN]: "Welcome back",
    [SCREENS.FORGOT_PASSWORD]: "Recover your account",
    [SCREENS.RESET_PASSWORD]: "Choose a new password",
    [SCREENS.ACCOUNT_STATUS]: "Provider application status",
  }[screen];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2f7fc] text-slate-900 selection:bg-blue-200">
      {/* Background glow maintains continuity with the approved homepage. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-blue-300/35 blur-3xl" /><div className="absolute right-[-10rem] top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-3xl" /><div className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-violet-200/25 blur-3xl" /></div>

      <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="fixed left-1/2 top-24 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{notice}</motion.div>}</AnimatePresence>

      <AuthHeader onHome={() => navigate("/")} onLogin={() => navigate("/login")} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <AuthVisualPanel />
          <section className="rounded-[2rem] border border-white/90 bg-white/66 p-5 shadow-[0_30px_90px_rgba(39,75,120,0.14)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={screen} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.24 }}>
                <div className="mb-8">
                  {screen !== SCREENS.CHOOSE_ROLE && <button onClick={() => changeScreen(SCREENS.CHOOSE_ROLE)} className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm hover:text-blue-700"><ArrowLeft size={15} /> Back to account types</button>}
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">ServiceLink account</p>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">{screenTitle}</h1>
                </div>

                {requestError && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{requestError}</div>}
                {screen === SCREENS.CHOOSE_ROLE && <div><p className="mb-7 leading-7 text-slate-600">Choose the account that matches how you plan to use ServiceLink.</p><div className="grid gap-4 xl:grid-cols-2"><RoleCard icon={UserRound} title="Customer" description="Find services, request bookings and publish wanted advertisements." features={["Book provider services", "Post wanted advertisements", "Compare provider offers"]} colour="from-blue-600 to-cyan-500" onClick={() => changeScreen(SCREENS.CUSTOMER_REGISTER)} /><RoleCard icon={BriefcaseBusiness} title="Provider" description="Build a professional profile and connect with customers after approval." features={["Publish service listings", "Respond to wanted ads", "Manage bookings and offers"]} colour="from-violet-600 to-indigo-600" onClick={() => changeScreen(SCREENS.PROVIDER_REGISTER)} /></div><p className="mt-6 text-center text-sm font-semibold text-slate-500">Already registered? <button onClick={() => changeScreen(SCREENS.LOGIN)} className="font-extrabold text-blue-700">Log in</button></p></div>}
                {screen === SCREENS.CUSTOMER_REGISTER && <RegistrationForm type="customer" values={customer} setValues={setCustomer} score={passwordScore} showNotice={showNotice} submitting={submitting} fieldErrors={fieldErrors} onSubmit={handleCustomerRegistration} />}
                {screen === SCREENS.PROVIDER_REGISTER && <RegistrationForm type="provider" values={provider} setValues={setProvider} score={passwordScore} showNotice={showNotice} onSubmit={handleProviderRegistration} submitting={submitting} fieldErrors={fieldErrors} />}

                {screen === SCREENS.LOGIN && <form onSubmit={handleLogin}><p className="mb-7 leading-7 text-slate-600">Enter the email address and password connected to your ServiceLink account.</p><div className="space-y-5"><FormField label="Email address" icon={Mail} type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="name@example.com" required /><PasswordField label="Password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Enter your password" /></div><div className="mt-4 flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={login.remember} onChange={(e) => setLogin({ ...login, remember: e.target.checked })} className="accent-blue-600" /> Remember me</label><button type="button" onClick={() => changeScreen(SCREENS.FORGOT_PASSWORD)} className="text-sm font-extrabold text-blue-700">Forgot password?</button></div><div className="mt-6"><PrimaryButton text={submitting ? "Logging in..." : "Log in securely"} icon={ArrowRight} disabled={submitting} /></div><button type="button" onClick={() => changeScreen(SCREENS.CHOOSE_ROLE)} className="mt-5 w-full rounded-2xl border border-blue-200 bg-blue-50/80 px-5 py-4 text-sm font-extrabold text-blue-700">Create an account</button></form>}

                {screen === SCREENS.FORGOT_PASSWORD && <form onSubmit={(event) => { event.preventDefault(); showNotice("Password-reset link requested in the prototype."); }}><div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white"><KeyRound size={28} /></div><p className="mb-7 leading-7 text-slate-600">Enter the email connected to your account. The finished system will send a secure reset link.</p><FormField label="Email address" icon={Mail} type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" required /><div className="mt-6"><PrimaryButton text="Send reset link" icon={Send} /></div><button type="button" onClick={() => changeScreen(SCREENS.LOGIN)} className="mt-4 w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-slate-600">Return to login</button></form>}

                {screen === SCREENS.RESET_PASSWORD && <form onSubmit={(event) => { event.preventDefault(); showNotice("Password updated in the visual prototype."); }}><p className="mb-7 leading-7 text-slate-600">Choose a strong password that has not been used before.</p><div className="space-y-5"><PasswordField label="New password" value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} placeholder="Enter a new password" /><PasswordField label="Confirm new password" value={reset.confirmation} onChange={(e) => setReset({ ...reset, confirmation: e.target.value })} placeholder="Enter it again" /></div><div className="mt-6"><PrimaryButton text="Update password" icon={RefreshCw} /></div></form>}

                {screen === SCREENS.ACCOUNT_STATUS && <div><div className="mb-6 flex flex-wrap gap-2">{["pending", "changes", "approved", "rejected", "suspended"].map((status) => <button key={status} onClick={() => setSelectedStatus(status)} className={`rounded-xl px-3 py-2 text-xs font-extrabold capitalize ${selectedStatus === status ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{status}</button>)}</div><StatusCard status={selectedStatus} onContinue={() => showNotice("The relevant provider page will open here")} /></div>}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}

// Both account types reuse the same registration structure with provider additions.
function RegistrationForm({ type, values, setValues, score, showNotice, onSubmit, submitting = false, fieldErrors = {} }) {
  const provider = type === "provider";
  return (
    <form onSubmit={onSubmit}>
      {provider && <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm leading-6 text-violet-900"><strong>Approval required.</strong> Complete a profile and upload qualification evidence after account creation.</div>}
      {Object.keys(fieldErrors).length > 0 && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">Please correct the highlighted registration information.</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={provider ? "Your full name" : "Full name"} icon={CircleUserRound} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Enter your full name" required />
        {provider && <FormField label="Business or display name" icon={BriefcaseBusiness} value={values.business} onChange={(e) => setValues({ ...values, business: e.target.value })} placeholder="Business Name" required />}
        <FormField label="Email address" icon={Mail} type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="name@example.com" required />
        <FormField label="Phone number" icon={Phone} type="tel" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} placeholder="07X XXX XXXX" required />
        <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-800">{provider ? "Primary operating district" : "District"} *</span><span className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/90 bg-white/70 px-4"><MapPin size={19} className="text-teal-600" /><select value={values.district} onChange={(e) => setValues({ ...values, district: e.target.value })} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"><option>Anuradhapura</option><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Other</option></select><ChevronDown size={16} className="text-slate-400" /></span></label>
        <div className="sm:col-span-2"><PasswordField label="Password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="Create a secure password" help="Use at least eight characters with uppercase, number and symbol." /></div>
        <div className="sm:col-span-2"><PasswordMeter score={score} /></div>
        <div className="sm:col-span-2"><PasswordField label="Confirm password" value={values.confirmation} onChange={(e) => setValues({ ...values, confirmation: e.target.value })} placeholder="Enter the password again" /></div>
      </div>
      <TermsCheck checked={values.terms} onChange={(checked) => setValues({ ...values, terms: checked })} provider={provider} />
      <PrimaryButton text={submitting ? "Creating account..." : provider ? "Create provider account" : "Create customer account"} icon={ArrowRight} disabled={submitting} />
    </form>
  );
}

function PasswordMeter({ score }) {
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  const colours = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-blue-500", "bg-emerald-500"];
  return <div className="rounded-2xl border border-white/80 bg-white/50 p-4"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-slate-500">Password strength</span><span>{labels[score]}</span></div><div className="grid grid-cols-4 gap-2">{[1,2,3,4].map((level) => <span key={level} className={`h-1.5 rounded-full ${level <= score ? colours[score] : "bg-slate-200"}`} />)}</div></div>;
}

function TermsCheck({ checked, onChange, provider }) {
  return <label className="my-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/80 bg-white/50 p-4"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required className="mt-1 accent-blue-600" /><span className="text-sm leading-6 text-slate-600">I agree to the <strong className="text-blue-700">Terms of Use</strong> and <strong className="text-blue-700">Privacy Notice</strong>.{provider && " I understand that provider access requires administrator approval."}</span></label>;
}

function PrimaryButton({ text, icon: Icon }) {
  return <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-5 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{text}<Icon size={18} /></button>;
}

function StatusCard({ status, onContinue }) {
  const config = {
    pending: { icon: Clock3, title: "Application under review", text: "Profile and qualification documents await administrator review.", colour: "from-blue-600 to-cyan-500" },
    changes: { icon: AlertCircle, title: "Changes requested", text: "Updated details or replacement evidence are required.", colour: "from-amber-500 to-orange-500" },
    approved: { icon: BadgeCheck, title: "Provider account approved", text: "Provider marketplace access is now available.", colour: "from-emerald-500 to-teal-500" },
    rejected: { icon: XCircle, title: "Application not approved", text: "The decision and allowed next steps appear here.", colour: "from-red-500 to-rose-500" },
    suspended: { icon: LockKeyhole, title: "Provider access suspended", text: "New marketplace actions are temporarily unavailable.", colour: "from-slate-700 to-slate-950" },
  }[status];
  const Icon = config.icon;
  return <div className="overflow-hidden rounded-[1.7rem] border border-white/90 bg-white/66 shadow-xl"><div className={`bg-gradient-to-r ${config.colour} p-6 text-white`}><Icon size={28} /><h2 className="mt-5 text-2xl font-black">{config.title}</h2><p className="mt-2 text-sm text-white/80">{config.text}</p></div><div className="p-6"><div className="grid gap-3 sm:grid-cols-3">{[[Check,"Account created"],[FileCheck2,"Documents submitted"],[CheckCircle2,"Decision state"]].map(([StepIcon,label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><StepIcon size={18} className="text-blue-600" /><p className="mt-2 text-xs font-extrabold">{label}</p></div>)}</div><button onClick={onContinue} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-extrabold text-white">Continue</button></div></div>;
}
