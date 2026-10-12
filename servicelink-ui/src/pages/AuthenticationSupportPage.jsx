import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Authentication-support screens handle the states surrounding real account
// registration, email verification, password confirmation and password resets.
const screenContent = {
  "verify-email": {
    eyebrow: "EMAIL VERIFICATION",
    title: "Verify your email address",
    text: "Open the verification message sent to your registered email address, then use the secure link to continue.",
  },
  "verification-sent": {
    eyebrow: "CHECK YOUR INBOX",
    title: "Verification email sent",
    text: "A new verification link has been prepared for the registered address.",
  },
  "confirm-password": {
    eyebrow: "SECURITY CHECK",
    title: "Confirm your password",
    text: "Re-enter your password before continuing to a sensitive account action.",
  },
  "registration-success": {
    eyebrow: "REGISTRATION COMPLETE",
    title: "Your account has been created",
    text: "The next destination depends on the selected account type and verification status.",
  },
  "password-reset-success": {
    eyebrow: "PASSWORD UPDATED",
    title: "Your password was reset successfully",
    text: "The previous password can no longer be used to sign in.",
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

export default function AuthenticationSupportPage({ screen = "verify-email" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notice, setNotice] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);

  // Query values temporarily demonstrate role-aware destinations until Laravel
  // obtains the authenticated user and provider status from the session.
  const accountType = searchParams.get("role") || "customer";
  const email = searchParams.get("email") || "your registered email address";
  const content = screenContent[screen] || screenContent["verify-email"];

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2700);
  };

  const resendVerification = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      navigate(`/email-verification-sent?role=${accountType}`);
    }, 650);
  };

  const continueAfterRegistration = () => {
    if (accountType === "provider") {
      navigate("/provider/application");
      return;
    }

    navigate("/customer/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f8fc] text-slate-900">
      {/* Decorative fields retain the glossy authentication design language. */}
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

      {/* Compact header provides a reliable route back to the public website. */}
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
            onClick={() => navigate("/login")}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white"
          >
            Log in
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl place-items-center px-4 py-12 sm:px-6 lg:min-h-[calc(100vh-100px)]">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <GlassPanel className="overflow-hidden">
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-7 text-white sm:p-10">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12 text-cyan-300">
                <ScreenIcon screen={screen} />
              </span>
              <p className="mt-6 text-sm font-extrabold tracking-[0.18em] text-cyan-300">
                {content.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-4 max-w-xl leading-7 text-blue-100/85">
                {content.text}
              </p>
            </div>

            <div className="p-6 sm:p-9">
              {screen === "verify-email" && (
                <VerifyEmail
                  email={email}
                  sending={sending}
                  resend={resendVerification}
                  showNotice={showNotice}
                  navigate={navigate}
                />
              )}

              {screen === "verification-sent" && (
                <VerificationSent
                  resend={resendVerification}
                  sending={sending}
                  navigate={navigate}
                />
              )}

              {screen === "confirm-password" && (
                <ConfirmPassword
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showNotice={showNotice}
                  navigate={navigate}
                />
              )}

              {screen === "registration-success" && (
                <RegistrationSuccess
                  accountType={accountType}
                  continueAction={continueAfterRegistration}
                  navigate={navigate}
                />
              )}

              {screen === "password-reset-success" && (
                <PasswordResetSuccess navigate={navigate} />
              )}
            </div>
          </GlassPanel>
        </motion.div>
      </main>
    </div>
  );
}

function ScreenIcon({ screen }) {
  if (screen === "confirm-password") return <KeyRound size={27} />;
  if (screen === "registration-success") return <UserRoundCheck size={27} />;
  if (screen === "password-reset-success") return <CheckCircle2 size={27} />;
  if (screen === "verification-sent") return <Mail size={27} />;
  return <ShieldCheck size={27} />;
}

function VerifyEmail({ email, sending, resend, showNotice, navigate }) {
  return (
    <div>
      <div className="rounded-2xl bg-blue-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
          Verification destination
        </p>
        <p className="mt-2 break-words font-extrabold text-blue-950">{email}</p>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
        <p className="flex gap-3"><Mail size={19} className="mt-0.5 shrink-0 text-blue-600" />Check the inbox and spam folder for the ServiceLink verification message.</p>
        <p className="flex gap-3"><Clock3 size={19} className="mt-0.5 shrink-0 text-violet-600" />Verification links will later expire according to Laravel security settings.</p>
        <p className="flex gap-3"><LockKeyhole size={19} className="mt-0.5 shrink-0 text-emerald-600" />Do not share the verification link with another person.</p>
      </div>

      <button
        onClick={() => showNotice("Prototype verification completed. Laravel will validate signed links later.")}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white"
      >
        <CheckCircle2 size={18} /> Simulate verified email
      </button>

      <button
        onClick={resend}
        disabled={sending}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-extrabold text-slate-700 disabled:cursor-wait disabled:opacity-60"
      >
        <RefreshCw size={18} className={sending ? "animate-spin" : ""} />
        {sending ? "Preparing verification email" : "Resend verification email"}
      </button>

      <button onClick={() => navigate("/login")} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-extrabold text-blue-700">
        Return to login <ArrowRight size={16} />
      </button>
    </div>
  );
}

function VerificationSent({ resend, sending, navigate }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-emerald-100 text-emerald-700">
        <Mail size={34} />
      </span>
      <h2 className="mt-6 text-2xl font-black">Open the newest ServiceLink email</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
        Older links may become invalid after a new link is requested. Use the most recently received message.
      </p>
      <button onClick={resend} disabled={sending} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white disabled:opacity-60">
        <RefreshCw size={18} className={sending ? "animate-spin" : ""} /> Send another link
      </button>
      <button onClick={() => navigate("/login")} className="mt-4 block w-full text-sm font-extrabold text-slate-600">Return to login</button>
    </div>
  );
}

function ConfirmPassword({ password, setPassword, showPassword, setShowPassword, showNotice, navigate }) {
  const submit = (event) => {
    event.preventDefault();
    showNotice("Password confirmed in the UI prototype");
  };

  return (
    <form onSubmit={submit}>
      <label className="block">
        <span className="mb-2 block text-sm font-extrabold">Current password</span>
        <span className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
          <LockKeyhole size={18} className="text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full bg-transparent px-3 py-4 text-sm font-semibold outline-none"
            placeholder="Enter your password"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400" aria-label="Show or hide password">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>

      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Password confirmation will later be required before sensitive actions such as changing security details or accessing protected documents.
      </p>

      <button className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white">
        Confirm password
      </button>
      <button type="button" onClick={() => navigate(-1)} className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-extrabold text-slate-600">
        <ArrowLeft size={16} /> Cancel and return
      </button>
    </form>
  );
}

function RegistrationSuccess({ accountType, continueAction, navigate }) {
  const provider = accountType === "provider";

  return (
    <div>
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-emerald-100 text-emerald-700">
        <UserRoundCheck size={34} />
      </span>
      <h2 className="mt-6 text-center text-2xl font-black">
        {provider ? "Provider account ready for onboarding" : "Customer account ready"}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center leading-7 text-slate-500">
        {provider
          ? "Complete the professional profile and supporting documents before administrator review."
          : "Browse services, create bookings and publish wanted advertisements from the customer area."}
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="flex gap-3 text-sm leading-6 text-slate-600">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-600" />
          Email verification may be required before all account capabilities become available.
        </p>
      </div>

      <button onClick={continueAction} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white">
        {provider ? "Continue provider application" : "Open customer dashboard"} <ArrowRight size={18} />
      </button>
      <button onClick={() => navigate("/")} className="mt-4 w-full text-sm font-extrabold text-slate-600">Return to homepage</button>
    </div>
  );
}

function PasswordResetSuccess({ navigate }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={36} />
      </span>
      <h2 className="mt-6 text-2xl font-black">Password security updated</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
        Sign in again using the new password. Existing sessions may later be invalidated according to the authentication policy.
      </p>
      <button onClick={() => navigate("/login")} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white">
        Continue to login <ArrowRight size={18} />
      </button>
      <button onClick={() => navigate("/")} className="mt-4 w-full text-sm font-extrabold text-slate-600">Return to homepage</button>
    </div>
  );
}
