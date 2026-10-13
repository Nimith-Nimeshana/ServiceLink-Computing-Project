import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, BadgeCheck, Bell, BriefcaseBusiness,
  CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  LayoutDashboard, LogOut, MapPin, Menu, MessageSquareText,
  Paperclip, Pencil, Plus, Settings, Star, UserRound, WalletCards, Wrench, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getCustomerProfile, updateCustomerProfile } from "../api/authApi.js";

import CustomerDashboard from "../components/CustomerDashboard.jsx";

import WantedAdsList from "../components/WantedAdsList.jsx";
import WantedAdForm from "../components/WantedAdForm.jsx";
import WantedAdDetails from "../components/WantedAdDetails.jsx";
import OffersList from "../components/OffersList.jsx";
import OfferDetails from "../components/OfferDetails.jsx";

import CustomerBookingsList from "../components/CustomerBookingsList.jsx";
import CustomerBookingForm from "../components/CustomerBookingForm.jsx";
import CustomerBookingDetails from "../components/CustomerBookingDetails.jsx";

import CustomerReviewsList from "../components/CustomerReviewsList.jsx";
import CustomerReviewForm from "../components/CustomerReviewForm.jsx";

import CustomerComplaintsList from "../components/CustomerComplaintsList.jsx";
import CustomerComplaintForm from "../components/CustomerComplaintForm.jsx";
import CustomerComplaintDetails from "../components/CustomerComplaintDetails.jsx";

import CustomerNotifications from "../components/CustomerNotifications.jsx";
import { getCustomerNotifications } from "../api/customerNotificationApi.js";

const pageNames = {
  dashboard: "Customer Dashboard",
  profile: "My Profile",
  "profile-edit": "Edit Profile",
  bookings: "My Bookings",
  "booking-details": "Booking Details",
  "booking-create": "Create Booking",
  "wanted-ads": "My Wanted Ads",
  "wanted-ad-create": "Post Wanted Ad",
  "wanted-ad-edit": "Edit Wanted Ad",
  "wanted-ad-details": "Wanted Ad Details",
  "wanted-ad-offers": "Offers for Ad",
  offers: "Offers Received",
  "offer-details": "Offer Details",
  reviews: "My Reviews",
  "review-create": "Write Review",
  "booking-review": "Review Booking",
  complaints: "My Complaints",
  "complaint-create": "Submit a Complaint",
  "complaint-details": "Complaint Details",
  notifications: "Notifications",
};

function StatusBadge({ status }) {
  const colours = {
    accepted: "bg-blue-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
    active: "bg-blue-100 text-emerald-700",
    offer_accepted: "bg-emerald-100 text-emerald-700",
    "offer accepted": "bg-emerald-100 text-emerald-700",
    expired: "bg-slate-200 text-slate-600",
    closed: "bg-slate-200 text-slate-600",
    submitted: "bg-violet-100 text-violet-700",
    declined: "bg-rose-100 text-rose-700",
    resolved: "bg-emerald-100 text-emerald-700",
    "under review": "bg-amber-100 text-amber-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${colours[status] || "bg-slate-100 text-slate-600"}`}>{(status||"").replace("_"," ")}</span>;
}

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function Field({ label, children, help }) {
  return <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-800">{label}</span>{children}{help && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span>}</label>;
}

export default function CustomerPage({ screen = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    getCustomerProfile()
      .then((r) => { if (active) setUser(r.data.user); })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  // Poll unread notifications for blue dot
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getCustomerNotifications();
        setUnreadCount(res.data?.summary?.unread_count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const go = (path) => {
    setSidebarOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  };

  const navItems = [
    [LayoutDashboard, "Dashboard", "/customer/dashboard"],
    [CalendarDays, "My Bookings", "/customer/bookings"],
    [BriefcaseBusiness, "Wanted Ads", "/customer/wanted-ads"],
    [WalletCards, "Offers", "/customer/offers"],
    [Star, "Reviews", "/customer/reviews"],
    [AlertCircle, "Complaints", "/customer/complaints"],
    [Bell, "Notifications", "/customer/notifications"],
    [UserRound, "Profile", "/customer/profile"],
  ];

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-green-200/35 blur-3xl" /></div>

      <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{notice}</motion.div>}</AnimatePresence>
      <AnimatePresence>{sidebarOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" />}</AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-[290px] transform border-r border-white/80 bg-white/78 p-4 shadow-2xl backdrop-blur-2xl transition lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2 py-2"><button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-400 text-white"><Wrench size={20} /></span><span className="text-xl font-black">Service<span className="text-emerald-600">Link</span></span></button><button onClick={() => setSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100 lg:hidden"><X size={19} /></button></div>
          <div className="my-5 rounded-2xl bg-gradient-to-br from-emerald-700 to-green-500 p-4 text-white shadow-lg"><p className="text-xs font-bold text-emerald-100">CUSTOMER ACCOUNT</p><p className="mt-1 font-black">{user ? user.name : "Loading..."}</p><p className="mt-1 text-xs text-emerald-100">Anuradhapura</p></div>
          <nav className="space-y-1.5">{navItems.map(([Icon, label, path]) => { const active = location.pathname === path || (path !== "/customer/dashboard" && location.pathname.startsWith(path)); return <button key={path} onClick={() => go(path)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`}><Icon size={19} />{label}{label==="Notifications" && unreadCount>0 && <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-[10px] text-white">{unreadCount}</span>}</button>; })}</nav>
          <div className="mt-auto space-y-1.5 border-t border-slate-200/70 pt-4"><button onClick={() => showNotice("Settings coming soon")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-slate-600 hover:bg-slate-100"><Settings size={19} />Settings</button><button onClick={() => go("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50"><LogOut size={19} />Log out</button></div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-[290px]">
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/72 px-4 py-3 shadow-lg backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 lg:hidden"><Menu size={20} /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Customer area</p><h1 className="font-black tracking-tight sm:text-lg">{pageNames[screen]}</h1></div></div>
            <div className="flex items-center gap-2"><button onClick={() => go("/customer/wanted-ads/create")} className="hidden rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-700 sm:block">Post wanted ad</button><button onClick={() => go("/customer/notifications")} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"><Bell size={18} />{unreadCount>0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-600 ring-2 ring-white" />}</button><button onClick={() => go("/customer/profile")} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">{user?.name ? user.name.substring(0,2).toUpperCase() : "CU"}</button></div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <AnimatePresence mode="wait"><motion.div key={screen} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {screen === "dashboard" && <CustomerDashboard go={go} />}
            {screen === "profile" && <Profile go={go} user={user} />}
            {screen === "profile-edit" && <ProfileForm go={go} showNotice={showNotice} user={user} setUser={setUser} />}
            {screen === "bookings" && <CustomerBookingsList go={go} />}
            {screen === "booking-details" && <CustomerBookingDetails go={go} showNotice={showNotice} />}
            {screen === "booking-create" && <CustomerBookingForm go={go} showNotice={showNotice} />}
            {screen === "wanted-ads" && <WantedAdsList go={go} />}
            {screen === "wanted-ad-create" && <WantedAdForm mode="create" go={go} showNotice={showNotice} />}
            {screen === "wanted-ad-edit" && <WantedAdForm mode="edit" go={go} showNotice={showNotice} />}
            {screen === "wanted-ad-details" && <WantedAdDetails go={go} showNotice={showNotice} />}
            {screen === "wanted-ad-offers" && <OffersList go={go} />}
            {screen === "offers" && <OffersList go={go} />}
            {screen === "offer-details" && <OfferDetails go={go} showNotice={showNotice} />}
            {screen === "reviews" && <CustomerReviewsList go={go} />}
            {screen === "review-create" && <CustomerReviewForm go={go} showNotice={showNotice} />}
            {screen === "booking-review" && <CustomerReviewForm go={go} showNotice={showNotice} />}
            {screen === "complaints" && <CustomerComplaintsList go={go} />}
            {screen === "complaint-create" && <CustomerComplaintForm go={go} showNotice={showNotice} />}
            {screen === "complaint-details" && <CustomerComplaintDetails go={go} />}
            {screen === "notifications" && <CustomerNotifications showNotice={showNotice} onUnreadChange={setUnreadCount} />}
          </motion.div></AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ title, action, onClick }) { return <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black tracking-tight">{title}</h2>{action && <button onClick={onClick} className="text-sm font-extrabold text-emerald-700">{action}</button>}</div>; }
function Profile({ go, user }) {
  const initials = user?.name ? user.name.substring(0,2).toUpperCase() : "CU";
  return <GlassPanel className="p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-emerald-600 to-green-500 text-2xl font-black text-white">{initials}</div><div className="flex-1"><p className="text-sm font-bold text-emerald-600">CUSTOMER PROFILE</p><h2 className="mt-1 text-3xl font-black">{user?.name || "Loading..."}</h2><p className="mt-2 text-slate-500">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "recently"}</p></div><button onClick={() => go("/customer/profile/edit")} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"><Pencil size={17} />Edit profile</button></div><div className="mt-8 grid gap-4 sm:grid-cols-2"><Info label="Email" value={user?.email || "Not provided"} /><Info label="Phone" value={user?.phone || "Not provided"} /><Info label="District" value={user?.profile?.district || "Not provided"} /><Info label="Preferred contact" value={user?.profile?.preferred_contact_method || "Phone and in-app notifications"} /></div></GlassPanel>;
}
function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>; }
function ProfileForm({ go, showNotice, user, setUser }) {
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", district: user?.profile?.district || "Anuradhapura" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (user) setForm({ name: user.name || "", phone: user.phone || "", district: user.profile?.district || "Anuradhapura" }); }, [user]);
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { const r = await updateCustomerProfile(form); setUser(r.data.user); showNotice("Profile updated successfully"); go("/customer/profile"); } catch (err) { setError(err.message || "Failed"); } finally { setSaving(false); } };
  return <GlassPanel className="p-6 sm:p-8"><SectionTitle title="Update your customer profile" />{error && <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}<form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2"><Field label="Full name"><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" required /></Field><Field label="Email (Cannot be changed)"><input type="email" value={user?.email || ""} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-500 cursor-not-allowed" /></Field><Field label="Phone number"><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" /></Field><Field label="District"><span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4"><select value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"><option>Anuradhapura</option><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Other</option></select><ChevronDown size={16} /></span></Field><div className="sm:col-span-2 flex gap-3"><button type="button" onClick={() => go("/customer/profile")} disabled={saving} className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-extrabold disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-extrabold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div></form></GlassPanel>;
}
