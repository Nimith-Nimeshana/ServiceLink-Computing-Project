import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, Bell, BriefcaseBusiness,
  CalendarDays, CheckCircle2, ChevronDown, ChevronRight, CircleDollarSign,
  Clock3, FileText, Filter, Heart, Home, LayoutDashboard, LogOut, MapPin,
  Menu, MessageSquareText, MoreHorizontal, Paperclip, Pencil, Plus, Search,
  Send, Settings, ShieldCheck, Star, UserRound, WalletCards, Wrench, X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Demo records create realistic customer screens before Laravel and MySQL are connected.
const bookings = [
  { id: "BK-1042", title: "Home electrical repair", provider: "LankaFix Electrical", date: "08 Sep 2026", time: "10:30 AM", status: "accepted", source: "Direct booking", price: "LKR 3,500" },
  { id: "BK-1038", title: "Laptop diagnostics", provider: "North Central TechCare", date: "02 Sep 2026", time: "2:00 PM", status: "completed", source: "Accepted offer", price: "LKR 2,200" },
  { id: "BK-1031", title: "Kitchen tap replacement", provider: "AquaPro Plumbing", date: "28 Aug 2026", time: "9:00 AM", status: "cancelled", source: "Direct booking", price: "LKR 4,000" },
];

const wantedAds = [
  { id: "WA-208", title: "Repair bedroom air conditioner", category: "Home Maintenance", location: "Anuradhapura", deadline: "10 Sep 2026", budget: "LKR 8,000 - 12,000", status: "active", offers: 4 },
  { id: "WA-201", title: "Install two outdoor security lights", category: "Electrical", location: "Mihintale", deadline: "04 Sep 2026", budget: "Negotiable", status: "offer accepted", offers: 3 },
  { id: "WA-194", title: "One-day event photography", category: "Photography", location: "Anuradhapura", deadline: "Expired", budget: "LKR 25,000", status: "expired", offers: 2 },
];

const offers = [
  { id: "OF-501", adId: "WA-208", provider: "CoolCare Services", rating: 4.9, reviews: 74, price: "LKR 9,500", schedule: "07 Sep, 9:30 AM", duration: "2-3 hours", expiry: "2 days", status: "submitted", message: "Inspection, cleaning and standard repair labour are included." },
  { id: "OF-502", adId: "WA-208", provider: "AirTech North", rating: 4.7, reviews: 51, price: "LKR 8,750", schedule: "08 Sep, 1:00 PM", duration: "Around 3 hours", expiry: "1 day", status: "submitted", message: "Can inspect the unit first. Replacement parts will be quoted separately if required." },
  { id: "OF-503", adId: "WA-208", provider: "HomeWorks LK", rating: 4.8, reviews: 63, price: "LKR 11,000", schedule: "06 Sep, 3:30 PM", duration: "2 hours", expiry: "3 days", status: "submitted", message: "Includes transport, inspection, servicing and minor electrical corrections." },
];

const notifications = [
  { id: 1, title: "New offer received", text: "CoolCare Services submitted an offer for your air-conditioner repair ad.", time: "12 minutes ago", unread: true },
  { id: 2, title: "Booking accepted", text: "LankaFix Electrical accepted booking BK-1042.", time: "2 hours ago", unread: true },
  { id: 3, title: "Complaint updated", text: "An administrator added a response to complaint CP-081.", time: "Yesterday", unread: false },
];

const pageNames = {
  dashboard: "Customer Dashboard",
  profile: "My Profile",
  "profile-edit": "Edit Profile",
  bookings: "My Bookings",
  "booking-create": "Create Booking",
  "booking-details": "Booking Details",
  "wanted-ads": "My Wanted Ads",
  "wanted-ad-create": "Post a Wanted Ad",
  "wanted-ad-edit": "Edit Wanted Ad",
  "wanted-ad-details": "Wanted Ad Details",
  offers: "Offers Received",
  "offer-details": "Offer Details",
  reviews: "My Reviews",
  "review-create": "Write a Review",
  complaints: "My Complaints",
  "complaint-create": "Submit a Complaint",
  notifications: "Notifications",
};

// Status badge provides one consistent status system throughout customer pages.
function StatusBadge({ status }) {
  const colours = {
    accepted: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
    active: "bg-blue-100 text-blue-700",
    "offer accepted": "bg-emerald-100 text-emerald-700",
    expired: "bg-slate-200 text-slate-600",
    submitted: "bg-violet-100 text-violet-700",
    resolved: "bg-emerald-100 text-emerald-700",
    "under review": "bg-amber-100 text-amber-700",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${colours[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

// Shared glass panel prevents duplicate styling across all 17 screen groups.
function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

// Reusable field forms the visual basis for future Laravel validation messages.
function Field({ label, children, help }) {
  return <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-800">{label}</span>{children}{help && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span>}</label>;
}

export default function CustomerPage({ screen = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [adFilter, setAdFilter] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState(offers[0]);
  const [decisionNote, setDecisionNote] = useState("");
  const [showDecision, setShowDecision] = useState(null);

  // Select route identifiers while allowing direct test URLs in this prototype.
  const recordId = params.id || params.bookingId || params.offerId || "BK-1042";
  const activeBooking = bookings.find((item) => item.id === recordId) || bookings[0];
  const activeAd = wantedAds.find((item) => item.id === recordId) || wantedAds[0];

  // Apply the selected booking and wanted-ad filters to local demo records.
  const filteredBookings = useMemo(() => bookingFilter === "all" ? bookings : bookings.filter((item) => item.status === bookingFilter), [bookingFilter]);
  const filteredAds = useMemo(() => adFilter === "all" ? wantedAds : wantedAds.filter((item) => item.status === adFilter), [adFilter]);

  // Temporary notifications explain actions before database functionality is added.
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const go = (path) => {
    setSidebarOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    [LayoutDashboard, "Dashboard", "/customer/dashboard"],
    [CalendarDays, "My Bookings", "/customer/bookings"],
    [BriefcaseBusiness, "My Wanted Ads", "/customer/wanted-ads"],
    [WalletCards, "Offers Received", "/customer/offers"],
    [Star, "My Reviews", "/customer/reviews"],
    [MessageSquareText, "My Complaints", "/customer/complaints"],
    [Bell, "Notifications", "/customer/notifications"],
    [UserRound, "My Profile", "/customer/profile"],
  ];

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
      {/* Background colour fields preserve the approved glossy design language. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-blue-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-200/35 blur-3xl" /></div>

      <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{notice}</motion.div>}</AnimatePresence>

      {/* Mobile overlay closes the customer sidebar when the outside area is selected. */}
      <AnimatePresence>{sidebarOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" aria-label="Close menu" />}</AnimatePresence>

      {/* Customer sidebar exposes only customer-appropriate pages and actions. */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[290px] transform border-r border-white/80 bg-white/78 p-4 shadow-2xl backdrop-blur-2xl transition lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2 py-2"><button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white"><Wrench size={20} /></span><span className="text-xl font-black">Service<span className="text-blue-600">Link</span></span></button><button onClick={() => setSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100 lg:hidden"><X size={19} /></button></div>
          <div className="my-5 rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-4 text-white shadow-lg"><p className="text-xs font-bold text-blue-100">CUSTOMER ACCOUNT</p><p className="mt-1 font-black">Kalana Induwara</p><p className="mt-1 text-xs text-blue-100">Anuradhapura</p></div>
          <nav className="space-y-1.5">{navItems.map(([Icon, label, path]) => { const active = location.pathname === path || (path !== "/customer/dashboard" && location.pathname.startsWith(path)); return <button key={path} onClick={() => go(path)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}><Icon size={19} />{label}{label === "Notifications" && <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">2</span>}</button>; })}</nav>
          <div className="mt-auto space-y-1.5 border-t border-slate-200/70 pt-4"><button onClick={() => showNotice("Account settings will be added later")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-slate-600 hover:bg-slate-100"><Settings size={19} />Settings</button><button onClick={() => go("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50"><LogOut size={19} />Log out</button></div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-[290px]">
        {/* Top bar offers mobile navigation, page identity and quick customer actions. */}
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/72 px-4 py-3 shadow-lg backdrop-blur-2xl sm:px-5">
            <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 lg:hidden"><Menu size={20} /></button><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Customer area</p><h1 className="font-black tracking-tight sm:text-lg">{pageNames[screen]}</h1></div></div>
            <div className="flex items-center gap-2"><button onClick={() => go("/customer/wanted-ads/create")} className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-extrabold text-blue-700 sm:block">Post wanted ad</button><button onClick={() => go("/customer/notifications")} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" /></button><button onClick={() => go("/customer/profile")} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">KI</button></div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <AnimatePresence mode="wait"><motion.div key={screen + recordId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {screen === "dashboard" && <Dashboard go={go} />}
            {screen === "profile" && <Profile go={go} />}
            {screen === "profile-edit" && <ProfileForm go={go} showNotice={showNotice} />}
            {screen === "bookings" && <BookingsList items={filteredBookings} filter={bookingFilter} setFilter={setBookingFilter} go={go} />}
            {screen === "booking-create" && <BookingForm go={go} showNotice={showNotice} />}
            {screen === "booking-details" && <BookingDetails booking={activeBooking} go={go} showNotice={showNotice} />}
            {screen === "wanted-ads" && <WantedAdsList items={filteredAds} filter={adFilter} setFilter={setAdFilter} go={go} />}
            {screen === "wanted-ad-create" && <WantedAdForm mode="create" go={go} showNotice={showNotice} />}
            {screen === "wanted-ad-edit" && <WantedAdForm mode="edit" go={go} showNotice={showNotice} />}
            {screen === "wanted-ad-details" && <WantedAdDetails ad={activeAd} go={go} showNotice={showNotice} />}
            {screen === "offers" && <OffersList selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} go={go} />}
            {screen === "offer-details" && <OfferDetails offer={offers.find((item) => item.id === recordId) || selectedOffer} decisionNote={decisionNote} setDecisionNote={setDecisionNote} showDecision={showDecision} setShowDecision={setShowDecision} showNotice={showNotice} go={go} />}
            {screen === "reviews" && <Reviews go={go} />}
            {screen === "review-create" && <ReviewForm go={go} showNotice={showNotice} />}
            {screen === "complaints" && <Complaints go={go} />}
            {screen === "complaint-create" && <ComplaintForm go={go} showNotice={showNotice} />}
            {screen === "notifications" && <Notifications showNotice={showNotice} />}
          </motion.div></AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Dashboard summarizes customer activity and provides direct next actions.
function Dashboard({ go }) {
  const metrics = [[CalendarDays, "Upcoming bookings", "1", "bg-blue-100 text-blue-700"], [BriefcaseBusiness, "Active wanted ads", "1", "bg-violet-100 text-violet-700"], [WalletCards, "Offers received", "4", "bg-emerald-100 text-emerald-700"], [Bell, "Unread alerts", "2", "bg-amber-100 text-amber-700"]];
  return <div className="space-y-7"><GlassPanel className="overflow-hidden bg-gradient-to-r from-slate-950 to-blue-900 p-7 text-white"><p className="text-sm font-bold text-cyan-300">WELCOME BACK</p><h2 className="mt-2 text-3xl font-black">What do you need help with today?</h2><p className="mt-3 max-w-2xl text-slate-300">Browse listed services or describe the work and receive offers from approved providers.</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => go("/services")} className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Browse services</button><button onClick={() => go("/customer/wanted-ads/create")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold">Post a wanted ad</button></div></GlassPanel><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon,label,value,colour]) => <GlassPanel key={label} className="p-5"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${colour}`}><Icon size={20} /></div><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div><div className="grid gap-6 xl:grid-cols-2"><GlassPanel className="p-6"><SectionTitle title="Upcoming booking" action="View bookings" onClick={() => go("/customer/bookings")} /><BookingRow booking={bookings[0]} go={go} /></GlassPanel><GlassPanel className="p-6"><SectionTitle title="Recent offers" action="Compare offers" onClick={() => go("/customer/offers")} />{offers.slice(0,2).map((offer) => <OfferRow key={offer.id} offer={offer} go={go} />)}</GlassPanel></div></div>;
}

function SectionTitle({ title, action, onClick }) { return <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black tracking-tight">{title}</h2>{action && <button onClick={onClick} className="text-sm font-extrabold text-blue-700">{action}</button>}</div>; }
function BookingRow({ booking, go }) { return <button onClick={() => go(`/customer/bookings/${booking.id}`)} className="flex w-full items-center gap-4 rounded-2xl bg-slate-50/90 p-4 text-left hover:bg-blue-50"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700"><CalendarDays size={21} /></span><span className="min-w-0 flex-1"><span className="block truncate font-extrabold">{booking.title}</span><span className="mt-1 block text-sm text-slate-500">{booking.provider} · {booking.date}</span></span><StatusBadge status={booking.status} /><ChevronRight size={18} className="text-slate-400" /></button>; }
function OfferRow({ offer, go }) { return <button onClick={() => go(`/customer/offers/${offer.id}`)} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-violet-50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 font-black text-violet-700">{offer.provider.slice(0,2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate font-extrabold">{offer.provider}</span><span className="text-sm text-slate-500">{offer.price} · {offer.schedule}</span></span><ChevronRight size={18} /></button>; }

function Profile({ go }) { return <GlassPanel className="p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black text-white">KI</div><div className="flex-1"><p className="text-sm font-bold text-blue-600">CUSTOMER PROFILE</p><h2 className="mt-1 text-3xl font-black">Kalana Induwara</h2><p className="mt-2 text-slate-500">Member since August 2026</p></div><button onClick={() => go("/customer/profile/edit")} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"><Pencil size={17} />Edit profile</button></div><div className="mt-8 grid gap-4 sm:grid-cols-2"><Info label="Email" value="kalana@example.com" /><Info label="Phone" value="071 234 5678" /><Info label="District" value="Anuradhapura" /><Info label="Preferred contact" value="Phone and in-app notifications" /></div></GlassPanel>; }
function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>; }
function ProfileForm({ go, showNotice }) { return <GlassPanel className="p-6 sm:p-8"><SectionTitle title="Update your customer profile" /><form onSubmit={(e) => { e.preventDefault(); showNotice("Profile changes saved in the UI prototype"); }} className="grid gap-5 sm:grid-cols-2"><Input label="Full name" defaultValue="Kalana Induwara" /><Input label="Email address" defaultValue="kalana@example.com" type="email" /><Input label="Phone number" defaultValue="0712345678" /><Select label="District" options={["Anuradhapura","Colombo","Kandy","Galle","Other"]} /><div className="sm:col-span-2 flex gap-3"><button type="button" onClick={() => go("/customer/profile")} className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-extrabold">Cancel</button><button className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 font-extrabold text-white">Save changes</button></div></form></GlassPanel>; }

function BookingsList({ items, filter, setFilter, go }) { return <div><PageLead title="My Bookings" text="Track direct bookings and work created from accepted provider offers." action="Browse services" onClick={() => go("/services")} /><FilterTabs values={["all","accepted","completed","cancelled"]} value={filter} setValue={setFilter} /><div className="mt-5 space-y-4">{items.map((booking) => <GlassPanel key={booking.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="grid h-13 w-13 place-items-center rounded-2xl bg-blue-100 text-blue-700"><CalendarDays size={22} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{booking.title}</h3><StatusBadge status={booking.status} /></div><p className="mt-1 text-sm text-slate-500">{booking.id} · {booking.provider} · {booking.source}</p><div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-600"><span className="flex items-center gap-1.5"><CalendarDays size={15} />{booking.date}</span><span className="flex items-center gap-1.5"><Clock3 size={15} />{booking.time}</span><span>{booking.price}</span></div></div><button onClick={() => go(`/customer/bookings/${booking.id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View details</button></div></GlassPanel>)}</div></div>; }
function BookingForm({ go, showNotice }) { return <GlassPanel className="p-6 sm:p-8"><PageLead title="Create a Direct Booking" text="Confirm the selected service, schedule and location before sending the request." /><form onSubmit={(e) => { e.preventDefault(); showNotice("Booking request submitted in the prototype"); }} className="grid gap-5 sm:grid-cols-2"><Input label="Selected service" defaultValue="Home electrical repair" /><Input label="Provider" defaultValue="LankaFix Electrical" /><Input label="Preferred date" type="date" /><Input label="Preferred time" type="time" /><div className="sm:col-span-2"><Input label="Service address" placeholder="Enter the service location" /></div><div className="sm:col-span-2"><TextArea label="Additional details" placeholder="Describe the issue and access information" /></div><div className="sm:col-span-2"><CustomerPaymentSummary amount="LKR 3,500" status="Pending booking acceptance" /></div><FormActions onCancel={() => go("/services")} submit="Send booking request" /></form></GlassPanel>; }
function BookingDetails({ booking, go, showNotice }) { return <div className="space-y-6"><Back onClick={() => go("/customer/bookings")} text="Back to bookings" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-blue-600">{booking.id}</p><h2 className="mt-1 text-3xl font-black">{booking.title}</h2><p className="mt-2 text-slate-500">{booking.provider} · {booking.source}</p></div><StatusBadge status={booking.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><Info label="Date" value={booking.date} /><Info label="Time" value={booking.time} /><Info label="Estimated price" value={booking.price} /></div><div className="mt-7"><CustomerPaymentSummary amount={booking.price} status={booking.status === "completed" ? "Payment recorded" : booking.status === "cancelled" ? "Cancelled" : "Pending completion"} /></div><h3 className="mt-8 text-lg font-black">Status history</h3><Timeline /><div className="mt-7 flex flex-wrap gap-3">{booking.status === "accepted" && <button onClick={() => showNotice("Cancellation confirmation will open here")} className="rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Cancel booking</button>}{booking.status === "completed" && <><button onClick={() => go(`/customer/bookings/${booking.id}/review`)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Write review</button><button onClick={() => go("/customer/complaints/create")} className="rounded-xl bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-700">Report a problem</button></>}</div></GlassPanel></div>; }
function CustomerPaymentSummary({ amount, status }) { return <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><WalletCards size={19} /></span><div><h3 className="font-black text-blue-950">Payment summary</h3><p className="mt-1 text-xs text-blue-700">Customer pays the provider directly. No separate customer platform fee.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Info label="Service amount" value={amount} /><Info label="Total payable" value={amount} /><Info label="Status" value={status} /></div><p className="mt-4 text-xs leading-5 text-blue-800">ServiceLink records the agreed booking value and calculates its commission from the provider side after successful completion.</p></div>; }
function Timeline() { return <div className="mt-4 space-y-4">{[[CheckCircle2,"Booking submitted","03 Sep 2026, 9:15 AM"],[BadgeCheck,"Provider accepted","03 Sep 2026, 10:02 AM"],[Clock3,"Service scheduled","08 Sep 2026, 10:30 AM"]].map(([Icon,title,time],i) => <div key={title} className="flex gap-4"><div className="flex flex-col items-center"><span className={`grid h-9 w-9 place-items-center rounded-full ${i < 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}><Icon size={17} /></span>{i < 2 && <span className="h-7 w-px bg-blue-200" />}</div><div><p className="font-extrabold">{title}</p><p className="mt-1 text-sm text-slate-500">{time}</p></div></div>)}</div>; }

function WantedAdsList({ items, filter, setFilter, go }) { return <div><PageLead title="My Wanted Ads" text="Publish work requests and compare offers from approved providers." action="Post wanted ad" onClick={() => go("/customer/wanted-ads/create")} /><FilterTabs values={["all","active","offer accepted","expired"]} value={filter} setValue={setFilter} /><div className="mt-5 grid gap-5 xl:grid-cols-2">{items.map((ad) => <GlassPanel key={ad.id} className="p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><BriefcaseBusiness size={21} /></span><StatusBadge status={ad.status} /></div><h3 className="mt-5 text-xl font-black">{ad.title}</h3><p className="mt-2 text-sm text-slate-500">{ad.id} · {ad.category}</p><div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2"><span className="flex gap-2"><MapPin size={16}/>{ad.location}</span><span className="flex gap-2"><Clock3 size={16}/>{ad.deadline}</span><span className="flex gap-2"><WalletCards size={16}/>{ad.budget}</span><span className="flex gap-2"><MessageSquareText size={16}/>{ad.offers} offers</span></div><div className="mt-5 flex gap-2"><button onClick={() => go(`/customer/wanted-ads/${ad.id}`)} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">Manage ad</button>{ad.status === "active" && <button onClick={() => go(`/customer/wanted-ads/${ad.id}/offers`)} className="flex-1 rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700">View offers</button>}</div></GlassPanel>)}</div></div>; }
function WantedAdForm({ mode, go, showNotice }) { return <GlassPanel className="p-6 sm:p-8"><PageLead title={mode === "edit" ? "Edit Wanted Ad" : "Post a Wanted Ad"} text="Describe the work clearly so providers can submit accurate offers." /><form onSubmit={(e) => { e.preventDefault(); showNotice(mode === "edit" ? "Wanted ad updated" : "Wanted ad published"); }} className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><Input label="Advertisement title" defaultValue={mode === "edit" ? "Repair bedroom air conditioner" : ""} placeholder="Example: Repair bedroom air conditioner" /></div><Select label="Category" options={["Electrical","Plumbing","Computer Repair","Home Maintenance","Tutoring","Photography"]} /><Input label="General location" defaultValue="Anuradhapura" /><Input label="Preferred date" type="date" /><Input label="Offer deadline" type="date" /><Input label="Minimum budget" type="number" placeholder="8000" /><Input label="Maximum budget" type="number" placeholder="12000" /><div className="sm:col-span-2"><TextArea label="Detailed description" defaultValue={mode === "edit" ? "The bedroom air conditioner is running but not cooling properly." : ""} placeholder="Explain the issue, expected outcome and important conditions" /></div><div className="sm:col-span-2"><FileBox /></div><FormActions onCancel={() => go("/customer/wanted-ads")} submit={mode === "edit" ? "Save changes" : "Publish wanted ad"} /></form></GlassPanel>; }
function WantedAdDetails({ ad, go, showNotice }) { return <div className="space-y-6"><Back onClick={() => go("/customer/wanted-ads")} text="Back to wanted ads" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-violet-600">{ad.id} · {ad.category}</p><h2 className="mt-1 text-3xl font-black">{ad.title}</h2></div><StatusBadge status={ad.status} /></div><p className="mt-6 leading-7 text-slate-600">The bedroom air conditioner is running but is not cooling properly. Inspection, cleaning and repair are required.</p><div className="mt-7 grid gap-4 sm:grid-cols-3"><Info label="Location" value={ad.location} /><Info label="Budget" value={ad.budget} /><Info label="Offer deadline" value={ad.deadline} /></div><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => go(`/customer/wanted-ads/${ad.id}/offers`)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Compare {ad.offers} offers</button><button onClick={() => go(`/customer/wanted-ads/${ad.id}/edit`)} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold">Edit ad</button><button onClick={() => showNotice("Close or cancel confirmation will open here")} className="rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Close ad</button></div></GlassPanel></div>; }

function OffersList({ setSelectedOffer, go }) { return <div><PageLead title="Offers Received" text="Compare provider price, schedule, experience and terms before choosing one." /><div className="space-y-4">{offers.map((offer) => <GlassPanel key={offer.id} className="p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 font-black text-white">{offer.provider.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{offer.provider}</h3><BadgeCheck size={18} className="fill-blue-600 text-white" /><span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={14} className="fill-current" />{offer.rating} ({offer.reviews})</span></div><p className="mt-2 text-sm text-slate-500">For wanted ad WA-208 · Expires in {offer.expiry}</p><div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold"><span>{offer.price}</span><span>{offer.schedule}</span><span>{offer.duration}</span></div></div><button onClick={() => { setSelectedOffer(offer); go(`/customer/offers/${offer.id}`); }} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View offer</button></div></GlassPanel>)}</div></div>; }
function OfferDetails({ offer, decisionNote, setDecisionNote, showDecision, setShowDecision, showNotice, go }) { return <div className="space-y-6"><Back onClick={() => go("/customer/offers")} text="Back to offers" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-2"><h2 className="text-3xl font-black">{offer.provider}</h2><BadgeCheck size={21} className="fill-blue-600 text-white" /></div><p className="mt-2 text-slate-500">Offer {offer.id} for wanted ad {offer.adId}</p></div><StatusBadge status={offer.status} /></div><div className="mt-7 grid gap-4 sm:grid-cols-4"><Info label="Proposed price" value={offer.price} /><Info label="Schedule" value={offer.schedule} /><Info label="Duration" value={offer.duration} /><Info label="Expires in" value={offer.expiry} /></div><div className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-400">Provider message</p><p className="mt-2 leading-7 text-slate-700">{offer.message}</p></div><div className="mt-7 flex gap-3"><button onClick={() => setShowDecision("accept")} className="flex-1 rounded-2xl bg-emerald-600 px-5 py-4 font-extrabold text-white">Accept offer</button><button onClick={() => setShowDecision("decline")} className="flex-1 rounded-2xl bg-rose-50 px-5 py-4 font-extrabold text-rose-700">Decline</button></div></GlassPanel><AnimatePresence>{showDecision && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"><GlassPanel className="w-full max-w-lg p-6"><h3 className="text-2xl font-black capitalize">{showDecision} offer</h3><p className="mt-2 text-sm text-slate-500">Add an optional response note for the provider.</p><textarea value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none" placeholder="Write additional instructions or a short reason" /><div className="mt-4 flex gap-3"><button onClick={() => setShowDecision(null)} className="flex-1 rounded-xl bg-slate-100 py-3 font-extrabold">Cancel</button><button onClick={() => { showNotice(showDecision === "accept" ? "Offer accepted and booking prepared" : "Offer declined"); setShowDecision(null); }} className={`flex-1 rounded-xl py-3 font-extrabold text-white ${showDecision === "accept" ? "bg-emerald-600" : "bg-rose-600"}`}>Confirm</button></div></GlassPanel></motion.div>}</AnimatePresence></div>; }

function Reviews({ go }) { return <div><PageLead title="My Reviews" text="Reviews can only be submitted after eligible completed bookings." /><GlassPanel className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Star size={21} className="fill-current" /></div><div className="flex-1"><h3 className="font-black">North Central TechCare</h3><p className="mt-1 text-sm text-slate-500">Laptop diagnostics · BK-1038</p><div className="mt-2 flex text-amber-500">{[1,2,3,4,5].map((n) => <Star key={n} size={16} className="fill-current" />)}</div><p className="mt-3 text-sm leading-6 text-slate-600">Clear explanation and the laptop was returned on time.</p></div></div></GlassPanel><button onClick={() => go("/customer/bookings/BK-1038/review")} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Review another completed booking</button></div>; }
function ReviewForm({ go, showNotice }) { const [rating,setRating] = useState(0); return <GlassPanel className="p-6 sm:p-8"><PageLead title="Write a Review" text="Your review will be linked to completed booking BK-1038." /><form onSubmit={(e) => { e.preventDefault(); showNotice("Review submitted in the prototype"); }}><Field label="Rating"><div className="flex gap-2">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)}><Star size={30} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} /></button>)}</div></Field><div className="mt-5"><TextArea label="Review comment" placeholder="Describe the quality, communication and overall service" /></div><div className="mt-5"><FormActions onCancel={() => go("/customer/reviews")} submit="Submit review" /></div></form></GlassPanel>; }
function Complaints({ go }) { return <div><PageLead title="My Complaints" text="Track submitted issues and administrator responses." action="Submit complaint" onClick={() => go("/customer/complaints/create")} /><div className="space-y-4">{[["CP-081","Unexpected additional charge","BK-1031","under review"],["CP-074","Provider did not attend scheduled time","BK-1022","resolved"]].map(([id,title,booking,status]) => <GlassPanel key={id} className="p-5"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={21} /></span><div className="flex-1"><h3 className="font-black">{title}</h3><p className="mt-1 text-sm text-slate-500">{id} · Related booking {booking}</p></div><StatusBadge status={status} /><ChevronRight size={18} /></div></GlassPanel>)}</div></div>; }
function ComplaintForm({ go, showNotice }) { return <GlassPanel className="p-6 sm:p-8"><PageLead title="Submit a Complaint" text="Provide accurate information so the administrator can investigate the issue." /><form onSubmit={(e) => { e.preventDefault(); showNotice("Complaint submitted in the prototype"); }} className="grid gap-5"><Select label="Related record" options={["Booking BK-1042","Booking BK-1038","Offer OF-501","Wanted ad WA-208"]} /><Input label="Subject" placeholder="Short summary of the issue" /><TextArea label="Description" placeholder="Explain what happened and what outcome you are requesting" /><FileBox /><FormActions onCancel={() => go("/customer/complaints")} submit="Submit complaint" /></form></GlassPanel>; }
function Notifications({ showNotice }) { return <div><PageLead title="Notifications" text="Booking, offer, complaint and account activity appears here." action="Mark all read" onClick={() => showNotice("All notifications marked as read in the prototype")} /><div className="space-y-3">{notifications.map((item) => <GlassPanel key={item.id} className={`p-5 ${item.unread ? "ring-2 ring-blue-200" : ""}`}><div className="flex gap-4"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.unread ? "bg-blue-600" : "bg-slate-300"}`} /><div><h3 className="font-black">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p><p className="mt-2 text-xs font-bold text-slate-400">{item.time}</p></div></div></GlassPanel>)}</div></div>; }

// Reusable headings, filters and form controls keep all customer screens consistent.
function PageLead({ title, text, action, onClick }) { return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-2 max-w-2xl text-slate-500">{text}</p></div>{action && <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white"><Plus size={17} />{action}</button>}</div>; }
function FilterTabs({ values, value, setValue }) { return <div className="flex flex-wrap gap-2">{values.map((item) => <button key={item} onClick={() => setValue(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${value === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{item}</button>)}</div>; }
function Back({ onClick, text }) { return <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />{text}</button>; }
function Input({ label, type="text", defaultValue, placeholder }) { return <Field label={label}><input type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" /></Field>; }
function Select({ label, options }) { return <Field label={label}><span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4"><select className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></span></Field>; }
function TextArea({ label, placeholder, defaultValue }) { return <Field label={label}><textarea defaultValue={defaultValue} placeholder={placeholder} className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" /></Field>; }
function FileBox() { return <Field label="Optional attachment"><button type="button" className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-sm font-extrabold text-blue-700"><Paperclip size={20} />Choose image or PDF evidence</button><p className="mt-2 text-xs text-slate-500">File validation will be connected during functional development.</p></Field>; }
function FormActions({ onCancel, submit }) { return <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold">Cancel</button><button type="submit" className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg">{submit}</button></div>; }
