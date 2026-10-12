import React, {
useEffect,
useMemo,
useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Bell,
  BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronRight, CircleDollarSign, CircleUserRound, Clock3, Edit3,
  Eye, FileCheck2, FileText, Filter, GraduationCap, LayoutDashboard,
  ListChecks, LogOut, MapPin, Menu, MessageSquareText, MoreHorizontal,
  Paperclip, Plus, Search, Send, Settings, ShieldCheck, Star, ToggleLeft,
  ToggleRight, Trash2, TrendingUp, UploadCloud, UserRound, WalletCards,
  Wrench, X, XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createProviderAvailability,
  createProviderOffer,
  createProviderService,
  getProviderBooking,
  getProviderBookingRequests,
  getProviderBookings,
  getProviderComplaint,
  getProviderComplaints,
  getProviderEarnings,
  getProviderOffer,
  getProviderNotifications,
  getProviderOffers,
  getProviderWantedAd,
  getProviderWantedAds,
  deleteProviderAvailability,
  getProviderAvailability,
  getProviderProfile,
  getProviderReviews,
  getProviderService,
  getProviderServices,
  getProviderStatistics,
  getServiceCategories,
  toggleProviderServiceStatus,
  updateProviderOffer,
  updateProviderBookingStatus,
  markAllProviderNotificationsAsRead,
  markProviderNotificationAsRead,
  saveProviderComplaintResponse,
  updateProviderProfile,
  withdrawProviderOffer,
  updateProviderService,
} from "../api/providerApi.js";

// Remaining prototype records will be replaced as their backend modules are connected.

const qualifications = [
  { id: "QL-101", title: "National Certificate in Electrical Installation", issuer: "Technical Training Institute", status: "approved", expiry: "No expiry" },
  { id: "QL-102", title: "Workplace Safety Training", issuer: "Skills Development Centre", status: "approved", expiry: "08 Jun 2027" },
];

const pageTitles = {
  dashboard: "Provider Dashboard", profile: "Provider Profile", "profile-edit": "Edit Provider Profile",
  qualifications: "My Qualifications", services: "My Services", "service-form": "Service Form",
  availability: "Availability", "wanted-ads": "Browse Wanted Ads", "wanted-ad-details": "Wanted Ad Details",
  "offer-form": "Create or Edit Offer", offers: "My Offers", "offer-details": "Offer Details",
  "booking-requests": "Booking Requests", bookings: "All Bookings", "booking-details": "Booking Details",
  reviews: "Reviews", complaints: "Complaints", notifications: "Notifications", statistics: "Statistics", earnings: "Earnings",
};

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/72 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function StatusBadge({ status }) {
  const styles = { active: "bg-emerald-100 text-emerald-700", paused: "bg-amber-100 text-amber-700", inactive: "bg-slate-200 text-slate-600", available: "bg-emerald-100 text-emerald-700", reserved: "bg-blue-100 text-blue-700", pending: "bg-amber-100 text-amber-700", accepted: "bg-blue-100 text-blue-700", "in progress": "bg-violet-100 text-violet-700", completed: "bg-emerald-100 text-emerald-700", submitted: "bg-violet-100 text-violet-700", declined: "bg-rose-100 text-rose-700", withdrawn: "bg-slate-200 text-slate-600", approved: "bg-emerald-100 text-emerald-700", "under review": "bg-amber-100 text-amber-700", resolved: "bg-emerald-100 text-emerald-700", recorded: "bg-emerald-100 text-emerald-700" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function PageLead({ title, text, action, onAction, icon: Icon = Plus }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-2 max-w-2xl text-slate-500">{text}</p></div>{action && <button onClick={onAction} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white"><Icon size={17} />{action}</button>}</div>;
}

function Field({ label, children, help }) { return <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-800">{label}</span>{children}{help && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span>}</label>; }
function Input({ label, type = "text", defaultValue = "", placeholder = "" }) { return <Field label={label}><input type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-2xl border border-white/90 bg-white/75 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" /></Field>; }
function Select({ label, options }) { return <Field label={label}><span className="flex rounded-2xl border border-white/90 bg-white/75 px-4"><select className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">{options.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} className="my-auto text-slate-400" /></span></Field>; }
function TextArea({ label, defaultValue = "", placeholder = "" }) { return <Field label={label}><textarea defaultValue={defaultValue} placeholder={placeholder} className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" /></Field>; }
function Back({ onClick, text }) { return <button onClick={onClick} className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />{text}</button>; }
function FormActions({ onCancel, submit }) { return <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold">Cancel</button><button type="submit" className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white">{submit}</button></div>; }
function InfoCard({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>; }

export default function ProviderPage({ screen = "dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingItems, setBookingItems] = useState([]);
  const [bookingRequestItems, setBookingRequestItems] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [earningItems, setEarningItems] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState("");
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [complaintSummary, setComplaintSummary] = useState(null);
  const [complaintItems, setComplaintItems] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState("");
  const [notificationSummary, setNotificationSummary] = useState(null);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [statisticsData, setStatisticsData] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState("");
  const [offerFilter, setOfferFilter] = useState("all");
  const [wantedAdItems, setWantedAdItems] = useState([]);
  const [wantedAdsLoading, setWantedAdsLoading] = useState(true);
  const [wantedAdsError, setWantedAdsError] = useState("");
  const [offerItems, setOfferItems] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");
  const [serviceItems, setServiceItems] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [availabilityItems, setAvailabilityItems] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [decisionModal, setDecisionModal] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // The requested route identifiers select the correct demo record on detail pages.
  const recordId = params.id || params.bookingId || "SV-101";
  const activeService = serviceItems.find((item) => item.id === recordId) || null;
  const activeAd = wantedAdItems.find((item) => item.id === recordId) || null;
  const activeOffer = offerItems.find((item) => item.id === recordId) || null;


  const loadProviderProfile = async () => {
setProfileLoading(true);
setProfileError("");

try {
const result = await getProviderProfile();
setProviderProfile(result.data);
} catch (error) {
console.error("Provider profile request failed:", error);

setProfileError(
error.message ||
"The provider profile could not be loaded."
);
} finally {
setProfileLoading(false);
}
};
useEffect(() => {
loadProviderProfile();
}, []);

  const mapService = (item) => ({
    id: item.public_id,
    databaseId: item.id,
    categoryId: item.category_id,
    categoryPublicId: item.category_public_id,
    category: item.category_name,
    title: item.title,
    slug: item.slug,
    description: item.description || "",
    price: item.price_display,
    priceMin: item.price_min,
    status: item.status,
    reportsCount: item.reports_count || 0,
    bookings: 0,
  });

  const loadProviderServices = async () => {
    setServicesLoading(true);
    setServicesError("");

    try {
      const [servicesResult, categoriesResult] = await Promise.all([
        getProviderServices(),
        getServiceCategories(),
      ]);

      setServiceItems(
        (servicesResult.data?.items || []).map(mapService)
      );
      setServiceCategories(categoriesResult.data?.items || []);
    } catch (error) {
      console.error("Provider services request failed:", error);
      setServicesError(
        error.message || "Provider services could not be loaded."
      );
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    loadProviderServices();
  }, []);

  const mapAvailabilitySlot = (item) => ({
    id: item.public_id,
    date: item.slot_date,
    start: String(item.start_time || "").slice(0, 5),
    end: String(item.end_time || "").slice(0, 5),
    status: item.status,
    bookingId: item.booking_id,
    note: item.note || "",
  });

  const loadProviderAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const result = await getProviderAvailability();
      setAvailabilityItems(
        (result.data?.items || []).map(mapAvailabilitySlot)
      );
    } catch (error) {
      console.error("Provider availability request failed:", error);
      setAvailabilityError(
        error.message || "Provider availability could not be loaded."
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    loadProviderAvailability();
  }, []);

  const mapWantedAd = (item) => ({
    id: item.public_id,
    databaseId: item.id,
    categoryId: item.category_id,
    categoryPublicId: item.category_public_id,
    category: item.category_name,
    title: item.title,
    description: item.description || "",
    area: item.district,
    budget: item.budget_display,
    deadline: item.deadline_display,
    status: item.status,
    offers: item.offers_count || 0,
    providerOfferId: item.provider_offer_public_id || null,
    providerOfferStatus: item.provider_offer_status || null,
  });

  const mapOffer = (item) => ({
    id: item.public_id,
    adId: item.wanted_ad_public_id,
    title: item.wanted_ad_title,
    category: item.category_name,
    area: item.district,
    budget: item.budget_display,
    deadline: item.deadline_display,
    wantedAdStatus: item.wanted_ad_status,
    priceValue: item.proposed_price,
    price: `LKR ${Number(item.proposed_price || 0).toLocaleString("en-LK")}`,
    proposedDate: item.proposed_date,
    proposedTime: String(item.proposed_time || "").slice(0, 5),
    durationMinutes: item.duration_minutes,
    message: item.message || "",
    terms: item.terms || "",
    expiresOn: item.expires_on || "",
    status: item.status,
    response: item.customer_response || "No decision yet",
    bookingId: item.booking_id,
  });

  const loadProviderWantedAds = async () => {
    setWantedAdsLoading(true);
    setWantedAdsError("");
    try {
      const result = await getProviderWantedAds();
      setWantedAdItems((result.data?.items || []).map(mapWantedAd));
    } catch (error) {
      console.error("Provider wanted ads request failed:", error);
      setWantedAdsError(error.message || "Wanted advertisements could not be loaded.");
    } finally {
      setWantedAdsLoading(false);
    }
  };

  const loadProviderOffers = async () => {
    setOffersLoading(true);
    setOffersError("");
    try {
      const result = await getProviderOffers();
      setOfferItems((result.data?.items || []).map(mapOffer));
    } catch (error) {
      console.error("Provider offers request failed:", error);
      setOffersError(error.message || "Provider offers could not be loaded.");
    } finally {
      setOffersLoading(false);
    }
  };

  useEffect(() => {
    loadProviderWantedAds();
    loadProviderOffers();
  }, []);

  const mapBooking = (item) => ({
    id: item.public_id,
    customer: item.customer_name || "Customer",
    customerPublicId: item.customer_public_id,
    title: item.title,
    serviceId: item.service_public_id,
    serviceTitle: item.service_title,
    offerId: item.offer_public_id,
    source: item.source,
    scheduledDate: item.scheduled_date,
    scheduledTime: String(item.scheduled_time || "").slice(0, 5),
    durationMinutes: item.duration_minutes,
    district: item.district,
    date: item.date_display || item.scheduled_date || "Not scheduled",
    time: String(item.scheduled_time || "").slice(0, 5),
    amount: item.agreed_amount,
    price: `LKR ${Number(item.agreed_amount || 0).toLocaleString("en-LK")}`,
    commissionRate: item.commission_rate,
    commissionAmount: item.commission_amount,
    providerNetAmount: item.provider_net_amount,
    status: item.status,
    taskDescription: item.task_description || "",
    customerNote: item.customer_note || "",
  });

  const loadProviderBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const [bookingsResult, requestsResult] = await Promise.all([
        getProviderBookings(),
        getProviderBookingRequests(),
      ]);
      setBookingItems((bookingsResult.data?.items || []).map(mapBooking));
      setBookingRequestItems((requestsResult.data?.items || []).map(mapBooking));
    } catch (error) {
      console.error("Provider bookings request failed:", error);
      setBookingsError(error.message || "Provider bookings could not be loaded.");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderBookings();
  }, []);

  const mapEarning = (item) => ({
    id: item.public_id,
    bookingId: item.booking_public_id,
    bookingTitle: item.booking_title,
    date: item.date_display || item.scheduled_date || "Not scheduled",
    scheduledDate: item.scheduled_date,
    scheduledTime: String(item.scheduled_time || "").slice(0, 5),
    bookingStatus: item.booking_status,
    source: item.source,
    grossAmount: item.gross_amount,
    commissionRate: item.commission_rate,
    commissionAmount: item.commission_amount,
    providerNetAmount: item.provider_net_amount,
    status: item.status,
    recordedAt: item.recorded_at,
  });

  const loadProviderEarnings = async () => {
    setEarningsLoading(true);
    setEarningsError("");
    try {
      const result = await getProviderEarnings();
      setEarningsSummary(result.data?.summary || null);
      setEarningItems((result.data?.items || []).map(mapEarning));
    } catch (error) {
      console.error("Provider earnings request failed:", error);
      setEarningsError(error.message || "Provider earnings could not be loaded.");
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderEarnings();
  }, []);

  const mapReview = (item) => ({
    id: item.public_id,
    bookingId: item.booking_public_id,
    bookingTitle: item.booking_title,
    serviceId: item.service_public_id,
    service: item.service_title || item.booking_title,
    customerId: item.customer_public_id,
    customer: item.customer_name || "Customer",
    rating: Number(item.rating || 0),
    comment: item.comment || "",
    status: item.status,
    date: item.created_at,
  });

  const loadProviderReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const result = await getProviderReviews();
      setReviewSummary(result.data?.summary || null);
      setReviewItems((result.data?.items || []).map(mapReview));
      if (result.data?.summary && providerProfile) {
        setProviderProfile((current) => current ? {
          ...current,
          average_rating: result.data.summary.average_rating,
          review_count: result.data.summary.review_count,
        } : current);
      }
    } catch (error) {
      console.error("Provider reviews request failed:", error);
      setReviewsError(error.message || "Provider reviews could not be loaded.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderReviews();
  }, []);

  const mapComplaint = (item) => ({
    id: item.public_id,
    complainant: item.complainant_name || "Customer",
    complainantId: item.complainant_public_id,
    bookingId: item.booking_public_id || item.record_reference,
    bookingTitle: item.booking_title,
    bookingStatus: item.booking_status,
    bookingAvailable: Boolean(item.booking_available),
    recordReference: item.record_reference,
    subject: item.subject,
    description: item.description,
    status: item.normalized_status || String(item.status || "").replaceAll("_", " "),
    resolutionNote: item.resolution_note,
    resolvedAt: item.resolved_at,
    canRespond: Boolean(item.can_respond),
    hasResponse: Boolean(item.has_response),
    responseId: item.response_public_id,
    responseText: item.response_text || "",
    responseStatus: item.response_status,
    submittedAt: item.submitted_at,
    lastEditedAt: item.last_edited_at,
    createdAt: item.created_at,
  });

  const loadProviderComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError("");
    try {
      const result = await getProviderComplaints();
      setComplaintSummary(result.data?.summary || null);
      setComplaintItems((result.data?.items || []).map(mapComplaint));
    } catch (error) {
      console.error("Provider complaints request failed:", error);
      setComplaintsError(error.message || "Provider complaints could not be loaded.");
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderComplaints();
  }, []);

  const mapNotification = (item) => ({
    id: item.public_id,
    type: item.type || "general",
    title: item.title,
    message: item.message,
    relatedType: item.related_type,
    relatedPublicId: item.related_public_id,
    actionPath: item.action_path,
    isRead: Boolean(item.is_read),
    readAt: item.read_at,
    createdAt: item.created_at,
  });

  const loadProviderNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const result = await getProviderNotifications();
      setNotificationSummary(result.data?.summary || null);
      setNotificationItems((result.data?.items || []).map(mapNotification));
    } catch (error) {
      console.error("Provider notifications request failed:", error);
      setNotificationsError(error.message || "Provider notifications could not be loaded.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderNotifications();
  }, []);

  const loadProviderStatistics = async () => {
    setStatisticsLoading(true);
    setStatisticsError("");
    try {
      const result = await getProviderStatistics();
      setStatisticsData(result.data || null);
    } catch (error) {
      console.error("Provider statistics request failed:", error);
      setStatisticsError(error.message || "Provider statistics could not be loaded.");
    } finally {
      setStatisticsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderStatistics();
  }, []);

  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2700); };
  const go = (path) => { setSidebarOpen(false); navigate(path); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const providerName = providerProfile?.business_name || "Service Provider";
  const providerTitle = providerProfile?.professional_title || "Professional service provider";
  const providerInitials = providerName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  const navItems = [
    [LayoutDashboard, "Dashboard", "/provider/dashboard"], [CircleUserRound, "Provider Profile", "/provider/profile"],
    [GraduationCap, "Qualifications", "/provider/qualifications"], [BriefcaseBusiness, "My Services", "/provider/services"],
    [CalendarDays, "Availability", "/provider/availability"], [Search, "Wanted Ads", "/provider/wanted-ads"],
    [WalletCards, "My Offers", "/provider/offers"], [Bell, "Booking Requests", "/provider/bookings/requests"],
    [ListChecks, "All Bookings", "/provider/bookings"], [CircleDollarSign, "Earnings", "/provider/earnings"], [Star, "Reviews", "/provider/reviews"],
    [MessageSquareText, "Complaints", "/provider/complaints"], [Bell, "Notifications", "/provider/notifications"],
    [BarChart3, "Statistics", "/provider/statistics"],
  ];

  return <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
    {/* Decorative colour fields preserve the approved glossy ServiceLink appearance. */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[29rem] w-[29rem] rounded-full bg-blue-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-200/35 blur-3xl" /></div>
    <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl">{notice}</motion.div>}</AnimatePresence>
    <AnimatePresence>{sidebarOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" />}</AnimatePresence>

    {/* Approved-provider sidebar exposes marketplace tools that remain unavailable before approval. */}
    <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] transform border-r border-white/80 bg-white/80 p-4 shadow-2xl backdrop-blur-2xl transition lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full flex-col"><div className="flex items-center justify-between px-2 py-2"><button onClick={() => go("/")} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white"><Wrench size={20} /></span><span className="text-xl font-black">Service<span className="text-blue-600">Link</span></span></button><button onClick={() => setSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl lg:hidden"><X size={19} /></button></div>
      <div className="my-5 rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 p-4 text-white shadow-lg"><div className="flex items-center justify-between"><p className="text-xs font-bold text-blue-100">APPROVED PROVIDER</p><BadgeCheck size={19} /></div><p className="mt-1 truncate font-black">{providerName}</p><p className="mt-1 truncate text-xs text-blue-100">{providerTitle}</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">{navItems.map(([Icon,label,path]) => { const active = location.pathname === path || (path !== "/provider/dashboard" && location.pathname.startsWith(path)); return <button key={path} onClick={() => go(path)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-extrabold transition ${active ? "bg-slate-950 text-white shadow-lg" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}><Icon size={18} />{label}{label === "Booking Requests" && bookingRequestItems.length > 0 && <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white">{bookingRequestItems.length}</span>}{label === "Notifications" && Number(notificationSummary?.unread_count || 0) > 0 && <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{notificationSummary.unread_count}</span>}</button>; })}</nav>
      <div className="border-t border-slate-200/70 pt-3"><button onClick={() => showNotice("Provider settings will be added later")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-600"><Settings size={18} />Settings</button><button onClick={() => go("/")} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-rose-600"><LogOut size={18} />Log out</button></div></div>
    </aside>

    <div className="relative z-10 lg:pl-[300px]">
      {/* Provider top bar identifies the active page and exposes quick creation actions. */}
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-white/90 bg-white/72 px-4 py-3 shadow-lg backdrop-blur-2xl"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 lg:hidden"><Menu size={20} /></button><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Approved provider</p><h1 className="font-black sm:text-lg">{pageTitles[screen]}</h1></div></div><div className="flex items-center gap-2"><button onClick={() => go("/provider/services/create")} className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white sm:block">Add service</button><button onClick={() => go("/provider/notifications")} className="relative grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"><Bell size={18} />{Number(notificationSummary?.unread_count || 0) > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">{notificationSummary.unread_count}</span>}</button><button onClick={() => go("/provider/profile")} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">{providerInitials}</button></div></div></header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><AnimatePresence mode="wait"><motion.div key={`${screen}-${recordId}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {screen === "dashboard" && <><Dashboard go={go} wantedAds={wantedAdItems} bookings={bookingItems} bookingRequests={bookingRequestItems} reviewSummary={reviewSummary} services={serviceItems} offers={offerItems} profile={providerProfile} /><ProviderEarningsSummary go={go} summary={earningsSummary} loading={earningsLoading} error={earningsError} retry={loadProviderEarnings} /></>}
        {screen === "profile" && (
<Profile
go={go}
profile={providerProfile}
loading={profileLoading}
error={profileError}
retry={loadProviderProfile}
/>
)}
        {screen === "profile-edit" && (
<ProfileForm
go={go}
showNotice={showNotice}
profile={providerProfile}
loading={profileLoading}
error={profileError}
retry={loadProviderProfile}
onProfileUpdated={setProviderProfile}
/>
)}
        {screen === "qualifications" && <Qualifications go={go} showNotice={showNotice} />}
        {screen === "services" && (
          <Services
            items={serviceItems}
            loading={servicesLoading}
            error={servicesError}
            reload={loadProviderServices}
            go={go}
            showNotice={showNotice}
          />
        )}
        {screen === "service-form" && (
          <ServiceForm
            serviceId={params.id || null}
            initialService={params.id ? activeService : null}
            categories={serviceCategories}
            categoriesLoading={servicesLoading}
            go={go}
            showNotice={showNotice}
            reload={loadProviderServices}
          />
        )}
        {screen === "availability" && (
          <Availability
            items={availabilityItems}
            loading={availabilityLoading}
            error={availabilityError}
            reload={loadProviderAvailability}
            showNotice={showNotice}
          />
        )}
        {screen === "wanted-ads" && (
          <WantedAds items={wantedAdItems} loading={wantedAdsLoading} error={wantedAdsError} reload={loadProviderWantedAds} go={go} />
        )}
        {screen === "wanted-ad-details" && (
          <WantedAdDetails wantedAdId={params.id} initialAd={activeAd} go={go} />
        )}
        {screen === "offer-form" && (
          <OfferForm
            wantedAdId={location.pathname.startsWith("/provider/wanted-ads/") ? params.id : null}
            offerId={location.pathname.startsWith("/provider/offers/") ? (params.offerId || params.id) : null}
            initialAd={activeAd}
            initialOffer={activeOffer}
            go={go}
            showNotice={showNotice}
            reloadWantedAds={loadProviderWantedAds}
            reloadOffers={loadProviderOffers}
          />
        )}
        {screen === "offers" && (
          <Offers items={offerItems} loading={offersLoading} error={offersError} reload={loadProviderOffers} filter={offerFilter} setFilter={setOfferFilter} go={go} />
        )}
        {screen === "offer-details" && (
          <OfferDetails offerId={params.id} initialOffer={activeOffer} go={go} showNotice={showNotice} reloadOffers={loadProviderOffers} reloadWantedAds={loadProviderWantedAds} />
        )}
        {screen === "booking-requests" && <BookingRequests items={bookingRequestItems} loading={bookingsLoading} error={bookingsError} reload={loadProviderBookings} go={go} decisionModal={decisionModal} setDecisionModal={setDecisionModal} showNotice={showNotice} />}
        {screen === "bookings" && <Bookings items={bookingItems} loading={bookingsLoading} error={bookingsError} reload={loadProviderBookings} filter={bookingFilter} setFilter={setBookingFilter} go={go} />}
        {screen === "booking-details" && <BookingDetails bookingId={params.bookingId || params.id} go={go} showNotice={showNotice} reloadBookings={loadProviderBookings} />}
        {screen === "reviews" && <Reviews summary={reviewSummary} items={reviewItems} loading={reviewsLoading} error={reviewsError} reload={loadProviderReviews} go={go} />}
        {screen === "complaints" && <Complaints summary={complaintSummary} items={complaintItems} loading={complaintsLoading} error={complaintsError} reload={loadProviderComplaints} go={go} showNotice={showNotice} />}
        {screen === "notifications" && <Notifications summary={notificationSummary} items={notificationItems} loading={notificationsLoading} error={notificationsError} reload={loadProviderNotifications} go={go} showNotice={showNotice} />}
        {screen === "statistics" && <Statistics data={statisticsData} loading={statisticsLoading} error={statisticsError} reload={loadProviderStatistics} />}
        {screen === "earnings" && <Earnings go={go} summary={earningsSummary} items={earningItems} loading={earningsLoading} error={earningsError} reload={loadProviderEarnings} />}
      </motion.div></AnimatePresence></main>
    </div>
  </div>;
}

// Dashboard summarizes provider workload, business performance and urgent actions.
function Dashboard({ go, wantedAds, bookings, bookingRequests, reviewSummary, services, offers, profile }) {
  const providerName = profile?.business_name || "Service Provider";
  const providerTitle = profile?.professional_title || "Professional service provider";
  const activeServices = services.filter((item) => item.status === "active").length;
  const activeOffers = offers.filter((item) => ["submitted", "accepted"].includes(item.status)).length;
  const metrics = [
    [BriefcaseBusiness,"Active services",String(activeServices),"bg-blue-100 text-blue-700"],
    [Bell,"Booking requests",String(bookingRequests.length),"bg-amber-100 text-amber-700"],
    [WalletCards,"Active offers",String(activeOffers),"bg-violet-100 text-violet-700"],
    [Star,"Average rating",reviewSummary?.average_rating || "0.00","bg-emerald-100 text-emerald-700"],
  ];
  const now = new Date();
  const bookingTimestamp = (booking) => {
    if (!booking.scheduledDate) return Number.POSITIVE_INFINITY;
    const time = booking.scheduledTime || "23:59";
    const value = new Date(`${booking.scheduledDate}T${time}:00`).getTime();
    return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
  };
  const nextBooking = bookings
    .filter((booking) => ["accepted", "in progress"].includes(booking.status))
    .filter((booking) => {
      const timestamp = bookingTimestamp(booking);
      return booking.status === "in progress" || timestamp >= now.getTime() || timestamp === Number.POSITIVE_INFINITY;
    })
    .sort((left, right) => {
      if (left.status === "in progress" && right.status !== "in progress") return -1;
      if (right.status === "in progress" && left.status !== "in progress") return 1;
      return bookingTimestamp(left) - bookingTimestamp(right);
    })[0] || null;

  return <div className="space-y-7">
    <GlassPanel className="overflow-hidden bg-gradient-to-r from-slate-950 to-blue-900 p-7 text-white">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div><div className="flex items-center gap-2 text-cyan-300"><BadgeCheck size={18}/><span className="text-sm font-bold">APPROVED PROVIDER</span></div><h2 className="mt-3 text-3xl font-black">Welcome back, {providerName}.</h2><p className="mt-2 text-sm font-bold text-cyan-200">{providerTitle}</p><p className="mt-3 max-w-2xl text-slate-300">Manage services, availability, offers and customer bookings from one panel.</p></div>
        <div className="flex gap-3"><button onClick={() => go("/provider/services/create")} className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700">Add service</button><button onClick={() => go("/provider/wanted-ads")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold">Find work</button></div>
      </div>
    </GlassPanel>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon,label,value,colour]) => <GlassPanel key={label} className="p-5"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${colour}`}><Icon size={20}/></span><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div>
    <div className="grid gap-6 xl:grid-cols-2">
      <GlassPanel className="p-6"><PageLead title="Next booking" text="Your nearest confirmed or active appointment." />{nextBooking ? <BookingRow booking={nextBooking} go={go}/> : <div className="rounded-2xl bg-slate-50 p-7 text-center"><CalendarDays size={30} className="mx-auto text-slate-400"/><h3 className="mt-4 font-black">No upcoming booking</h3><p className="mt-2 text-sm text-slate-500">Accepted and in-progress bookings will appear here.</p><button type="button" onClick={() => go("/provider/bookings")} className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View all bookings</button></div>}</GlassPanel>
      <GlassPanel className="p-6"><PageLead title="New work nearby" text="Wanted advertisements matching your categories." />{wantedAds.length === 0 ? <div className="rounded-2xl bg-slate-50 p-7 text-center"><Search size={30} className="mx-auto text-slate-400"/><h3 className="mt-4 font-black">No active wanted ads</h3><p className="mt-2 text-sm text-slate-500">New customer work requests will appear here.</p></div> : wantedAds.slice(0,2).map((ad) => <button key={ad.id} onClick={() => go(`/provider/wanted-ads/${ad.id}`)} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-4 text-left hover:bg-blue-50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><Search size={18}/></span><span className="min-w-0 flex-1"><span className="block truncate font-extrabold">{ad.title}</span><span className="text-sm text-slate-500">{ad.area} · {ad.budget}</span></span><ChevronRight size={18}/></button>)}</GlassPanel>
    </div>
  </div>;
}
function Profile({
go,
profile,
loading,
error,
retry,
}) {
if (loading) {
return (
<GlassPanel className="p-8 text-center">
<div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

<h2 className="mt-5 text-xl font-black">
Loading provider profile
</h2>

<p className="mt-2 text-sm text-slate-500">
ServiceLink is retrieving the saved profile.
</p>
</GlassPanel>
);
}

if (error) {
return (
<GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center">
<AlertCircle
size={32}
className="mx-auto text-rose-600"
/>

<h2 className="mt-4 text-xl font-black text-rose-900">
Provider profile unavailable
</h2>

<p className="mt-2 text-sm text-rose-700">
{error}
</p>

<button
type="button"
onClick={retry}
className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white"
>
Try again
</button>
</GlassPanel>
);
}

if (!profile) {
return (
<GlassPanel className="p-8 text-center">
<CircleUserRound
size={32}
className="mx-auto text-slate-400"
/>

<h2 className="mt-4 text-xl font-black">
No provider profile found
</h2>

<p className="mt-2 text-sm text-slate-500">
A provider profile has not been created for this
account.
</p>
</GlassPanel>
);
}

const initials = profile.business_name
.split(" ")
.map((word) => word.charAt(0))
.join("")
.slice(0, 2)
.toUpperCase();

return (
<GlassPanel className="p-6 sm:p-8">
<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
<div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black text-white">
{initials || "SP"}
</div>

<div className="flex-1">
<div className="flex flex-wrap items-center gap-2">
<h2 className="text-3xl font-black">
{profile.business_name}
</h2>

{profile.account_status === "active" && (
<BadgeCheck
size={22}
className="fill-blue-600 text-white"
/>
)}
</div>

<p className="mt-2 text-slate-500">
{profile.professional_title ||
"Professional service provider"}
</p>

<div className="mt-3 flex items-center gap-2 text-sm font-bold text-amber-600">
<Star
size={16}
className="fill-current"
/>

{profile.average_rating || "0.00"} from{" "}
{profile.review_count || 0} reviews
</div>
</div>

<button
type="button"
onClick={() => go("/provider/profile/edit")}
className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
>
<Edit3 size={17} />
Edit profile
</button>
</div>

<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
<InfoCard
label="District"
value={profile.primary_district || "Not provided"}
/>

<InfoCard
label="Experience"
value={`${profile.years_experience || 0} years`}
/>

<InfoCard
label="Account status"
value={profile.account_status || "Unknown"}
/>

<InfoCard
label="Public contact"
value={
profile.public_phone ||
profile.public_email ||
"Not provided"
}
/>
</div>

<div className="mt-6 rounded-2xl bg-slate-50 p-5">
<p className="text-xs font-bold uppercase text-slate-400">
Professional summary
</p>

<p className="mt-2 leading-7 text-slate-600">
{profile.professional_summary ||
"No professional summary has been provided."}
</p>
</div>

<div className="mt-5 rounded-2xl bg-blue-50 p-5">
<p className="text-xs font-bold uppercase text-blue-600">
Service coverage
</p>

<p className="mt-2 text-sm font-semibold text-blue-900">
{profile.coverage_area || "Not provided"}
</p>
</div>
</GlassPanel>
);
}
function ProfileForm({
go,
showNotice,
profile,
loading,
error,
retry,
onProfileUpdated,
}) {
const [form, setForm] = useState({
business_name: "",
professional_title: "",
professional_summary: "",
primary_district: "",
coverage_area: "",
years_experience: 0,
public_email: "",
public_phone: "",
});

const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState("");
const [fieldErrors, setFieldErrors] = useState({});

useEffect(() => {
if (!profile) {
return;
}

setForm({
business_name: profile.business_name || "",
professional_title:
profile.professional_title || "",
professional_summary:
profile.professional_summary || "",
primary_district:
profile.primary_district || "",
coverage_area: profile.coverage_area || "",
years_experience:
profile.years_experience ?? 0,
public_email: profile.public_email || "",
public_phone: profile.public_phone || "",
});
}, [profile]);

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
setSaveError("");
setFieldErrors({});

try {
const result = await updateProviderProfile({
...form,
years_experience: Number(
form.years_experience
),
});

onProfileUpdated(result.data);

showNotice(
"Provider profile saved successfully"
);

go("/provider/profile");
} catch (requestError) {
console.error(
"Provider profile update failed:",
requestError
);

setSaveError(
requestError.message ||
"The provider profile could not be saved."
);

setFieldErrors(
requestError.errors || {}
);
} finally {
setSaving(false);
}
};

if (loading) {
return (
<GlassPanel className="p-8 text-center">
<div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

<h2 className="mt-5 text-xl font-black">
Loading profile form
</h2>
</GlassPanel>
);
}

if (error) {
return (
<GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center">
<AlertCircle
size={32}
className="mx-auto text-rose-600"
/>

<h2 className="mt-4 text-xl font-black text-rose-900">
Profile form unavailable
</h2>

<p className="mt-2 text-sm text-rose-700">
{error}
</p>

<button
type="button"
onClick={retry}
className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white"
>
Try again
</button>
</GlassPanel>
);
}

if (!profile) {
return (
<GlassPanel className="p-8 text-center">
<h2 className="text-xl font-black">
No provider profile found
</h2>
</GlassPanel>
);
}

return (
<GlassPanel className="p-6 sm:p-8">
<PageLead
title="Edit Provider Profile"
text="Update public professional details without changing administrator approval history."
/>

{saveError && (
<div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
{saveError}
</div>
)}

<form
onSubmit={handleSubmit}
className="grid gap-5 sm:grid-cols-2"
>
<ControlledProfileField
label="Business or display name"
value={form.business_name}
onChange={(value) =>
setValue("business_name", value)
}
error={fieldErrors.business_name?.[0]}
required
/>

<ControlledProfileField
label="Professional title"
value={form.professional_title}
onChange={(value) =>
setValue("professional_title", value)
}
error={fieldErrors.professional_title?.[0]}
/>

<ControlledProfileField
label="Phone number"
value={form.public_phone}
onChange={(value) =>
setValue("public_phone", value)
}
error={fieldErrors.public_phone?.[0]}
/>

<ControlledProfileField
label="Public email"
type="email"
value={form.public_email}
onChange={(value) =>
setValue("public_email", value)
}
error={fieldErrors.public_email?.[0]}
/>

<ControlledProfileSelect
label="Primary district"
value={form.primary_district}
onChange={(value) =>
setValue("primary_district", value)
}
options={[
"",
"Anuradhapura",
"Colombo",
"Kandy",
"Galle",
"Other",
]}
error={fieldErrors.primary_district?.[0]}
/>

<ControlledProfileField
label="Years of experience"
type="number"
value={form.years_experience}
onChange={(value) =>
setValue("years_experience", value)
}
error={fieldErrors.years_experience?.[0]}
required
/>

<div className="sm:col-span-2">
<ControlledProfileField
label="Coverage area"
value={form.coverage_area}
onChange={(value) =>
setValue("coverage_area", value)
}
error={fieldErrors.coverage_area?.[0]}
/>
</div>

<div className="sm:col-span-2">
<ControlledProfileTextArea
label="Professional summary"
value={form.professional_summary}
onChange={(value) =>
setValue("professional_summary", value)
}
error={fieldErrors.professional_summary?.[0]}
/>
</div>

<div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
<button
type="button"
onClick={() => go("/provider/profile")}
disabled={saving}
className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold text-slate-700 disabled:opacity-50"
>
Cancel
</button>

<button
type="submit"
disabled={saving}
className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
>
{saving
? "Saving profile..."
: "Save profile"}
</button>
</div>
</form>
</GlassPanel>
);
}
function Qualifications({ go, showNotice }) { return <div><PageLead title="My Qualifications" text="Review approved evidence and replace expiring or requested documents." action="Manage application documents" onAction={() => go("/provider/application/qualifications")} icon={GraduationCap} /><div className="space-y-4">{qualifications.map((q) => <GlassPanel key={q.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><FileCheck2 size={22} /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{q.title}</h3><StatusBadge status={q.status} /></div><p className="mt-1 text-sm text-slate-500">{q.issuer} · Expires: {q.expiry}</p></div><button onClick={() => showNotice("Protected qualification preview will open here")} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View document</button></div></GlassPanel>)}</div></div>; }

function Services({ items, loading, error, reload, go, showNotice }) {
  const [togglingId, setTogglingId] = useState("");

  const toggle = async (service) => {
    setTogglingId(service.id);
    try {
      const result = await toggleProviderServiceStatus(service.id);
      showNotice(result.message || "Service status updated");
      await reload();
    } catch (requestError) {
      console.error("Service status update failed:", requestError);
      showNotice(requestError.message || "Service status could not be updated");
    } finally {
      setTogglingId("");
    }
  };

  if (loading) {
    return <GlassPanel className="p-8 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /><h2 className="mt-5 text-xl font-black">Loading provider services</h2></GlassPanel>;
  }

  if (error) {
    return <GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center"><AlertCircle size={32} className="mx-auto text-rose-600" /><h2 className="mt-4 text-xl font-black text-rose-900">Provider services unavailable</h2><p className="mt-2 text-sm text-rose-700">{error}</p><button type="button" onClick={reload} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white">Try again</button></GlassPanel>;
  }

  return <div>
    <PageLead title="My Services" text="Publish, update and pause service listings shown to customers." action="Create service" onAction={() => go("/provider/services/create")} />

    {items.length === 0 && <GlassPanel className="p-8 text-center"><BriefcaseBusiness size={34} className="mx-auto text-slate-400" /><h3 className="mt-4 text-xl font-black">No services created</h3><p className="mt-2 text-sm text-slate-500">Create the first provider service to begin receiving bookings.</p><button type="button" onClick={() => go("/provider/services/create")} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Create service</button></GlassPanel>}

    <div className="grid gap-5 xl:grid-cols-2">
      {items.map((service) => <GlassPanel key={service.id} className="p-5">
        <div className="flex items-start justify-between"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-blue-100 text-blue-700"><Wrench size={22} /></span><StatusBadge status={service.status} /></div>
        <h3 className="mt-5 text-xl font-black">{service.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{service.id} - {service.category}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{service.description || "No description supplied."}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><span>{service.price}</span></div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => go(`/provider/services/${service.id}/edit`)} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">Edit service</button>
          <button type="button" disabled={togglingId === service.id} onClick={() => toggle(service)} className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700 disabled:opacity-50">
            {service.status === "active" ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
            {togglingId === service.id ? "Updating..." : service.status === "active" ? "Pause" : "Activate"}
          </button>
        </div>
      </GlassPanel>)}
    </div>
  </div>;
}

function ServiceForm({ serviceId, initialService, categories, categoriesLoading, go, showNotice, reload }) {
  const isEdit = Boolean(serviceId);
  const [service, setService] = useState(initialService);
  const [loadingService, setLoadingService] = useState(isEdit && !initialService);
  const [form, setForm] = useState({ category_id: "", title: "", description: "", price_min: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit || initialService) return;
    let active = true;
    setLoadingService(true);
    getProviderService(serviceId)
      .then((result) => {
        if (!active) return;
        setService({
          id: result.data.public_id,
          categoryId: result.data.category_id,
          title: result.data.title,
          description: result.data.description || "",
          priceMin: result.data.price_min,
          status: result.data.status,
        });
      })
      .catch((error) => active && setRequestError(error.message || "Service could not be loaded."))
      .finally(() => active && setLoadingService(false));
    return () => { active = false; };
  }, [isEdit, initialService, serviceId]);

  useEffect(() => {
    if (!service) return;
    setForm({
      category_id: String(service.categoryId || ""),
      title: service.title || "",
      description: service.description || "",
      price_min: String(service.priceMin || ""),
      status: service.status || "active",
    });
  }, [service]);

  const setValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setRequestError("");
    setFieldErrors({});
    const payload = {
      category_id: Number(form.category_id),
      title: form.title,
      description: form.description,
      price_min: Number(form.price_min),
      status: form.status,
    };

    try {
      if (isEdit) {
        await updateProviderService(serviceId, payload);
      } else {
        await createProviderService(payload);
      }
      await reload();
      showNotice(isEdit ? "Service updated successfully" : "Service created successfully");
      go("/provider/services");
    } catch (error) {
      console.error("Service save failed:", error);
      setRequestError(error.message || "The service could not be saved.");
      setFieldErrors(error.errors || {});
    } finally {
      setSaving(false);
    }
  };

  if (loadingService || categoriesLoading) {
    return <GlassPanel className="p-8 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /><h2 className="mt-5 text-xl font-black">Loading service form</h2></GlassPanel>;
  }

  return <GlassPanel className="p-6 sm:p-8">
    <Back onClick={() => go("/provider/services")} text="Back to services" />
    <PageLead title={isEdit ? "Edit Service" : "Create Service"} text="Provide clear service information that customers can compare and book." />
    {requestError && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{requestError}</div>}
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <ServiceSelect label="Category" value={form.category_id} onChange={(value) => setValue("category_id", value)} options={categories} error={fieldErrors.category_id?.[0]} required />
      <ServiceField label="Service title" value={form.title} onChange={(value) => setValue("title", value)} error={fieldErrors.title?.[0]} required />
      <ServiceField label="Starting price (LKR)" type="number" value={form.price_min} onChange={(value) => setValue("price_min", value)} error={fieldErrors.price_min?.[0]} required />
      <ServiceSelect label="Status" value={form.status} onChange={(value) => setValue("status", value)} options={[{ id: "active", name: "Active" }, { id: "paused", name: "Paused" }]} error={fieldErrors.status?.[0]} required />
      <div className="sm:col-span-2">
        <ServiceTextArea label="Service description" value={form.description} onChange={(value) => setValue("description", value)} error={fieldErrors.description?.[0]} />
      </div>
      <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => go("/provider/services")} disabled={saving} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving service..." : isEdit ? "Save changes" : "Publish service"}</button>
      </div>
    </form>
  </GlassPanel>;
}

function ServiceField({ label, type = "text", value, onChange, error, required = false }) {
  return <Field label={label}><input type={type} value={value} required={required} min={type === "number" ? "0" : undefined} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-2xl border bg-white/75 px-4 py-4 text-sm font-semibold outline-none focus:ring-4 ${error ? "border-rose-300 focus:ring-rose-100" : "border-white/90 focus:border-blue-300 focus:ring-blue-100"}`} />{error && <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span>}</Field>;
}

function ServiceTextArea({ label, value, onChange, error }) {
  return <Field label={label}><textarea value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-36 w-full rounded-2xl border bg-white/75 p-4 text-sm font-semibold outline-none focus:ring-4 ${error ? "border-rose-300 focus:ring-rose-100" : "border-white/90 focus:border-blue-300 focus:ring-blue-100"}`} />{error && <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span>}</Field>;
}

function ServiceSelect({ label, value, onChange, options, error, required = false }) {
  return <Field label={label}><span className={`flex rounded-2xl border bg-white/75 px-4 ${error ? "border-rose-300" : "border-white/90"}`}><select value={value} required={required} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"><option value="">Select an option</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={16} className="my-auto text-slate-400" /></span>{error && <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span>}</Field>;
}

function Availability({ items, loading, error, reload, showNotice }) {
  const [form, setForm] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    status: "available",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const setValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      time: undefined,
    }));
    setRequestError("");
  };

  const addSlot = async (event) => {
    event.preventDefault();
    setSaving(true);
    setRequestError("");
    setFieldErrors({});

    try {
      await createProviderAvailability(form);
      showNotice("Availability slot created successfully");
      setForm({
        slot_date: "",
        start_time: "",
        end_time: "",
        status: "available",
        note: "",
      });
      await reload();
    } catch (requestFailure) {
      console.error("Availability creation failed:", requestFailure);
      setRequestError(
        requestFailure.message || "The availability slot could not be created."
      );
      setFieldErrors(requestFailure.errors || {});
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (slot) => {
    if (slot.status === "reserved" || slot.bookingId) {
      showNotice("Reserved slots cannot be removed");
      return;
    }

    if (slot.status !== "available") {
      showNotice("Only available slots can be removed");
      return;
    }

    if (!window.confirm(`Delete availability slot ${slot.id}?`)) {
      return;
    }

    setDeletingId(slot.id);
    try {
      await deleteProviderAvailability(slot.id);
      showNotice("Availability slot deleted successfully");
      await reload();
    } catch (requestFailure) {
      console.error("Availability deletion failed:", requestFailure);
      showNotice(
        requestFailure.message || "The availability slot could not be deleted"
      );
    } finally {
      setDeletingId("");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown date";
    return new Intl.DateTimeFormat("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateValue}T00:00:00`));
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "";
    const [hour, minute] = timeValue.split(":");
    return new Intl.DateTimeFormat("en-LK", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(2000, 0, 1, Number(hour), Number(minute)));
  };

  if (loading) {
    return (
      <GlassPanel className="p-8 text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <h2 className="mt-5 text-xl font-black">Loading provider availability</h2>
      </GlassPanel>
    );
  }

  if (error) {
    return (
      <GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-600" />
        <h2 className="mt-4 text-xl font-black text-rose-900">
          Provider availability unavailable
        </h2>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white"
        >
          Try again
        </button>
      </GlassPanel>
    );
  }

  return (
    <div>
      <PageLead
        title="Availability"
        text="Create future time slots and review reserved appointment periods."
      />

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <GlassPanel className="p-6">
          <h3 className="text-xl font-black">Add availability</h3>

          {requestError && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
              {requestError}
            </div>
          )}

          <form onSubmit={addSlot} className="mt-5 space-y-4">
            <AvailabilityField
              label="Date"
              type="date"
              value={form.slot_date}
              onChange={(value) => setValue("slot_date", value)}
              error={fieldErrors.slot_date?.[0]}
              required
            />
            <AvailabilityField
              label="Start time"
              type="time"
              value={form.start_time}
              onChange={(value) => setValue("start_time", value)}
              error={fieldErrors.start_time?.[0] || fieldErrors.time?.[0]}
              required
            />
            <AvailabilityField
              label="End time"
              type="time"
              value={form.end_time}
              onChange={(value) => setValue("end_time", value)}
              error={fieldErrors.end_time?.[0] || fieldErrors.time?.[0]}
              required
            />
            <Field label="Slot type">
              <span className="flex rounded-2xl border border-white/90 bg-white/75 px-4">
                <select
                  value={form.status}
                  onChange={(event) => setValue("status", event.target.value)}
                  className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"
                >
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                </select>
                <ChevronDown size={16} className="my-auto text-slate-400" />
              </span>
              {fieldErrors.status?.[0] && (
                <span className="mt-2 block text-xs font-bold text-rose-600">
                  {fieldErrors.status[0]}
                </span>
              )}
            </Field>
            <Field label="Note" help="Optional internal note, maximum 500 characters.">
              <textarea
                value={form.note}
                maxLength={500}
                onChange={(event) => setValue("note", event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-white/90 bg-white/75 p-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
              {fieldErrors.note?.[0] && (
                <span className="mt-2 block text-xs font-bold text-rose-600">
                  {fieldErrors.note[0]}
                </span>
              )}
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Adding time slot..." : "Add time slot"}
            </button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="text-xl font-black">Upcoming slots</h3>

          {items.length === 0 && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center">
              <CalendarDays size={32} className="mx-auto text-slate-400" />
              <h4 className="mt-4 font-black">No availability slots</h4>
              <p className="mt-2 text-sm text-slate-500">
                Add the first future availability period using the form.
              </p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {items.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
                  <CalendarDays size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{formatDate(slot.date)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </p>
                  {slot.note && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {slot.note}
                    </p>
                  )}
                </div>
                <StatusBadge status={slot.status} />
                <button
                  type="button"
                  onClick={() => removeSlot(slot)}
                  disabled={
                    deletingId === slot.id ||
                    slot.status !== "available" ||
                    Boolean(slot.bookingId)
                  }
                  className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                  title={
                    slot.status === "reserved" || slot.bookingId
                      ? "Reserved slots cannot be removed"
                      : slot.status !== "available"
                        ? "Only available slots can be removed"
                        : "Delete availability slot"
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function AvailabilityField({
  label,
  type,
  value,
  onChange,
  error,
  required = false,
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-white/75 px-4 py-4 text-sm font-semibold outline-none focus:ring-4 ${
          error
            ? "border-rose-300 focus:ring-rose-100"
            : "border-white/90 focus:border-blue-300 focus:ring-blue-100"
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

function WantedAds({ items, loading, error, reload, go }) {
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [district, setDistrict] = useState("all");

  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];
  const districts = [...new Set(items.map((item) => item.area).filter(Boolean))];
  const filtered = items.filter((item) => {
    const query = searchText.trim().toLowerCase();
    return (!query || item.title.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)) &&
      (category === "all" || item.category === category) &&
      (district === "all" || item.area === district);
  });

  if (loading) return <LoadingPanel title="Loading wanted advertisements" />;
  if (error) return <RequestErrorPanel title="Wanted advertisements unavailable" error={error} retry={reload} />;

  return <div>
    <PageLead title="Browse Wanted Ads" text="Discover active customer requests while customer contact details and exact addresses remain private." />
    <GlassPanel className="mb-5 p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4"><Search size={17}/><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search wanted ads" className="w-full bg-transparent py-3 text-sm outline-none" /></div>
        <FilterSelect value={category} onChange={setCategory} allLabel="All categories" options={categories} />
        <FilterSelect value={district} onChange={setDistrict} allLabel="All areas" options={districts} />
        <button type="button" onClick={() => { setSearchText(""); setCategory("all"); setDistrict("all"); }} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">Clear filters</button>
      </div>
    </GlassPanel>

    {filtered.length === 0 && <EmptyPanel icon={Search} title="No wanted advertisements found" text="No active requests match the selected filters." />}
    <div className="grid gap-5 xl:grid-cols-2">
      {filtered.map((ad) => <GlassPanel key={ad.id} className="p-5">
        <div className="flex justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Search size={20}/></span><span className="text-xs font-bold text-slate-400">{ad.deadline}</span></div>
        <h3 className="mt-5 text-xl font-black">{ad.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{ad.id} - {ad.category}</p>
        <div className="mt-4 grid gap-2 text-sm font-semibold sm:grid-cols-2"><span className="flex gap-2"><MapPin size={16}/>{ad.area}</span><span className="flex gap-2"><CircleDollarSign size={16}/>{ad.budget}</span><span className="flex gap-2"><WalletCards size={16}/>{ad.offers} current offers</span></div>
        {ad.providerOfferId && <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800"><span>Your offer: {ad.providerOfferId}</span><StatusBadge status={ad.providerOfferStatus} /></div>}
        <button type="button" onClick={() => go(`/provider/wanted-ads/${ad.id}`)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View wanted ad</button>
      </GlassPanel>)}
    </div>
  </div>;
}

function WantedAdDetails({ wantedAdId, initialAd, go }) {
  const [ad, setAd] = useState(initialAd);
  const [loading, setLoading] = useState(!initialAd);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wantedAdId) return;
    let active = true;
    setLoading(true);
    getProviderWantedAd(wantedAdId)
      .then((result) => active && setAd(mapWantedAdDetails(result.data?.wanted_ad)))
      .catch((requestError) => active && setError(requestError.message || "Wanted advertisement could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [wantedAdId]);

  if (loading) return <LoadingPanel title="Loading wanted advertisement" />;
  if (error || !ad) return <RequestErrorPanel title="Wanted advertisement unavailable" error={error || "Wanted advertisement not found."} retry={() => window.location.reload()} />;

  const hasSubmittedOffer = Boolean(ad.providerOfferId);
  return <div>
    <Back onClick={() => go("/provider/wanted-ads")} text="Back to wanted ads" />
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-violet-600">{ad.id} - {ad.category}</p><h2 className="mt-2 text-3xl font-black">{ad.title}</h2></div><StatusBadge status={ad.status} /></div>
      <p className="mt-5 leading-7 text-slate-600">{ad.description || "The customer has provided a privacy-safe description of the required work."}</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="General area" value={ad.area}/><InfoCard label="Budget" value={ad.budget}/><InfoCard label="Offer deadline" value={ad.deadline}/></div>
      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900"><ShieldCheck size={20} className="mb-2 text-blue-600"/>Customer name, contact details and exact address remain hidden at this stage.</div>
      {hasSubmittedOffer ? <button type="button" onClick={() => go(`/provider/offers/${ad.providerOfferId}`)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-extrabold text-white"><Eye size={18}/>View my offer</button> : <button type="button" onClick={() => go(`/provider/wanted-ads/${ad.id}/offer`)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-5 py-4 text-sm font-extrabold text-white"><Send size={18}/>Send an offer</button>}
    </GlassPanel>
  </div>;
}

function OfferForm({ wantedAdId, offerId, initialAd, initialOffer, go, showNotice, reloadWantedAds, reloadOffers }) {
  const isEdit = Boolean(offerId);
  const [ad, setAd] = useState(initialAd);
  const [offer, setOffer] = useState(initialOffer);
  const [loading, setLoading] = useState((isEdit && !initialOffer) || (!isEdit && !initialAd));
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({ proposed_price: "", proposed_date: "", proposed_time: "", duration_minutes: "", message: "", terms: "", expires_on: "" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (isEdit) {
          const result = await getProviderOffer(offerId);
          if (active) setOffer(mapOfferDetails(result.data));
        } else if (wantedAdId) {
          const result = await getProviderWantedAd(wantedAdId);
          if (active) setAd(mapWantedAdDetails(result.data?.wanted_ad));
        }
      } catch (error) {
        if (active) setRequestError(error.message || "Offer form could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [isEdit, offerId, wantedAdId]);

  useEffect(() => {
    if (!offer) return;
    setForm({ proposed_price: String(offer.priceValue || ""), proposed_date: offer.proposedDate || "", proposed_time: offer.proposedTime || "", duration_minutes: String(offer.durationMinutes || ""), message: offer.message || "", terms: offer.terms || "", expires_on: offer.expiresOn || "" });
  }, [offer]);

  const setValue = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setFieldErrors((current) => ({ ...current, [field]: undefined })); };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setRequestError(""); setFieldErrors({});
    const payload = { ...form, proposed_price: Number(form.proposed_price), duration_minutes: Number(form.duration_minutes), expires_on: form.expires_on || null };
    try {
      if (isEdit) await updateProviderOffer(offerId, payload); else await createProviderOffer(wantedAdId, payload);
      await Promise.all([reloadWantedAds(), reloadOffers()]);
      showNotice(isEdit ? "Offer updated successfully" : "Offer submitted successfully");
      go("/provider/offers");
    } catch (error) { setRequestError(error.message || "The offer could not be saved."); setFieldErrors(error.errors || {}); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingPanel title="Loading offer form" />;
  if (isEdit && offer?.status && offer.status !== "submitted") return <RequestErrorPanel title="Offer cannot be edited" error="Only submitted offers can be edited." retry={() => go(`/provider/offers/${offerId}`)} retryText="Return to offer" />;

  const title = isEdit ? offer?.title : ad?.title;
  return <GlassPanel className="p-6 sm:p-8">
    <Back onClick={() => go(isEdit ? `/provider/offers/${offerId}` : `/provider/wanted-ads/${wantedAdId}`)} text="Go back" />
    <PageLead title={isEdit ? "Edit Offer" : "Submit Offer"} text={title ? `Offer for: ${title}` : "Provide a realistic price, schedule, duration and clear terms."} />
    {requestError && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{requestError}</div>}
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <OfferField label="Proposed price (LKR)" type="number" value={form.proposed_price} onChange={(value) => setValue("proposed_price", value)} error={fieldErrors.proposed_price?.[0]} required />
      <OfferField label="Estimated duration (minutes)" type="number" value={form.duration_minutes} onChange={(value) => setValue("duration_minutes", value)} error={fieldErrors.duration_minutes?.[0]} required />
      <OfferField label="Proposed date" type="date" value={form.proposed_date} onChange={(value) => setValue("proposed_date", value)} error={fieldErrors.proposed_date?.[0]} required />
      <OfferField label="Proposed time" type="time" value={form.proposed_time} onChange={(value) => setValue("proposed_time", value)} error={fieldErrors.proposed_time?.[0]} required />
      <div className="sm:col-span-2"><OfferTextArea label="Offer message" value={form.message} onChange={(value) => setValue("message", value)} error={fieldErrors.message?.[0]} /></div>
      <div className="sm:col-span-2"><OfferTextArea label="Additional terms" value={form.terms} onChange={(value) => setValue("terms", value)} error={fieldErrors.terms?.[0]} /></div>
      <OfferField label="Offer expiry" type="date" value={form.expires_on} onChange={(value) => setValue("expires_on", value)} error={fieldErrors.expires_on?.[0]} />
      <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={() => go(isEdit ? `/provider/offers/${offerId}` : `/provider/wanted-ads/${wantedAdId}`)} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving offer..." : isEdit ? "Save offer changes" : "Submit offer"}</button></div>
    </form>
  </GlassPanel>;
}

function Offers({ items, loading, error, reload, filter, setFilter, go }) {
  if (loading) return <LoadingPanel title="Loading provider offers" />;
  if (error) return <RequestErrorPanel title="Provider offers unavailable" error={error} retry={reload} />;
  const filtered = filter === "all" ? items : items.filter((item) => item.status === filter);
  return <div><PageLead title="My Offers" text="Track customer decisions and manage offers while their status permits changes." /><FilterTabs values={["all","submitted","accepted","declined","withdrawn"]} value={filter} setValue={setFilter}/>{filtered.length === 0 && <div className="mt-5"><EmptyPanel icon={WalletCards} title="No offers found" text="No provider offers match this status." /></div>}<div className="mt-5 space-y-4">{filtered.map((offer) => <GlassPanel key={offer.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-violet-100 text-violet-700"><WalletCards size={21}/></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{offer.title}</h3><StatusBadge status={offer.status}/></div><p className="mt-1 text-sm text-slate-500">{offer.id} - Wanted ad {offer.adId}</p><p className="mt-3 text-sm font-semibold">{offer.price} - {formatOfferSchedule(offer)} - {formatDuration(offer.durationMinutes)}</p></div><button type="button" onClick={() => go(`/provider/offers/${offer.id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View offer</button></div></GlassPanel>)}</div></div>;
}

function OfferDetails({ offerId, initialOffer, go, showNotice, reloadOffers, reloadWantedAds }) {
  const [offer, setOffer] = useState(initialOffer);
  const [loading, setLoading] = useState(!initialOffer);
  const [error, setError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const load = async () => { setLoading(true); setError(""); try { const result = await getProviderOffer(offerId); setOffer(mapOfferDetails(result.data)); } catch (requestError) { setError(requestError.message || "Offer could not be loaded."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [offerId]);
  const withdraw = async () => { if (!window.confirm(`Withdraw offer ${offerId}?`)) return; setWithdrawing(true); try { await withdrawProviderOffer(offerId); await Promise.all([reloadOffers(), reloadWantedAds()]); showNotice("Offer withdrawn successfully"); await load(); } catch (requestError) { showNotice(requestError.message || "Offer could not be withdrawn"); } finally { setWithdrawing(false); } };
  if (loading) return <LoadingPanel title="Loading provider offer" />;
  if (error || !offer) return <RequestErrorPanel title="Provider offer unavailable" error={error || "Offer not found."} retry={load} />;
  return <div><Back onClick={() => go("/provider/offers")} text="Back to offers" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-violet-600">{offer.id} - {offer.adId}</p><h2 className="mt-2 text-3xl font-black">{offer.title}</h2></div><StatusBadge status={offer.status}/></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><InfoCard label="Proposed price" value={offer.price}/><InfoCard label="Schedule" value={formatOfferSchedule(offer)}/><InfoCard label="Duration" value={formatDuration(offer.durationMinutes)}/></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><InfoCard label="Offer expiry" value={offer.expiresOn || "No expiry"}/><InfoCard label="Customer response" value={offer.response}/></div>{offer.message && <div className="mt-6 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-400">Offer message</p><p className="mt-2 leading-7 text-slate-700">{offer.message}</p></div>}{offer.terms && <div className="mt-4 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-400">Terms</p><p className="mt-2 leading-7 text-slate-700">{offer.terms}</p></div>}<div className="mt-6 flex flex-wrap gap-3">{offer.status === "submitted" && <><button type="button" onClick={() => go(`/provider/offers/${offer.id}/edit`)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Edit offer</button><button type="button" disabled={withdrawing} onClick={withdraw} className="rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700 disabled:opacity-50">{withdrawing ? "Withdrawing..." : "Withdraw offer"}</button></>}{offer.status === "accepted" && offer.bookingId && <button type="button" onClick={() => go(`/provider/bookings/${offer.bookingId}`)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">Open linked booking</button>}</div></GlassPanel></div>;
}

function mapWantedAdDetails(item) {
  if (!item) return null;
  return { id: item.public_id, category: item.category_name, title: item.title, description: item.description || "", area: item.district, budget: item.budget_display, deadline: item.deadline_display, status: item.status, offers: item.offers_count || 0, providerOfferId: item.provider_offer_public_id || null, providerOfferStatus: item.provider_offer_status || null };
}

function mapOfferDetails(item) {
  if (!item) return null;
  return { id: item.public_id, adId: item.wanted_ad_public_id, title: item.wanted_ad_title, category: item.category_name, area: item.district, budget: item.budget_display, deadline: item.deadline_display, wantedAdStatus: item.wanted_ad_status, priceValue: item.proposed_price, price: `LKR ${Number(item.proposed_price || 0).toLocaleString("en-LK")}`, proposedDate: item.proposed_date, proposedTime: String(item.proposed_time || "").slice(0, 5), durationMinutes: item.duration_minutes, message: item.message || "", terms: item.terms || "", expiresOn: item.expires_on || "", status: item.status, response: item.customer_response || "No decision yet", bookingId: item.booking_id };
}

function formatOfferSchedule(offer) { return `${offer.proposedDate || "No date"} ${offer.proposedTime || ""}`.trim(); }
function formatDuration(minutes) { const value=Number(minutes || 0); if (!value) return "Not supplied"; const hours=Math.floor(value/60); const remaining=value%60; return [hours ? `${hours} hr${hours===1?"":"s"}` : "", remaining ? `${remaining} min` : ""].filter(Boolean).join(" "); }
function FilterSelect({ value, onChange, allLabel, options }) { return <span className="flex rounded-xl bg-slate-50 px-4"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent py-3 text-sm font-semibold outline-none"><option value="all">{allLabel}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} className="my-auto text-slate-400" /></span>; }
function OfferField({ label, type="text", value, onChange, error, required=false }) { return <Field label={label}><input type={type} value={value} required={required} min={type==="number"?"0":undefined} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-2xl border bg-white/75 px-4 py-4 text-sm font-semibold outline-none focus:ring-4 ${error?"border-rose-300 focus:ring-rose-100":"border-white/90 focus:border-blue-300 focus:ring-blue-100"}`} />{error && <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span>}</Field>; }
function OfferTextArea({ label, value, onChange, error }) { return <Field label={label}><textarea value={value} maxLength={3000} onChange={(event) => onChange(event.target.value)} className={`min-h-32 w-full rounded-2xl border bg-white/75 p-4 text-sm font-semibold outline-none focus:ring-4 ${error?"border-rose-300 focus:ring-rose-100":"border-white/90 focus:border-blue-300 focus:ring-blue-100"}`} />{error && <span className="mt-2 block text-xs font-bold text-rose-600">{error}</span>}</Field>; }
function LoadingPanel({ title }) { return <GlassPanel className="p-8 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><h2 className="mt-5 text-xl font-black">{title}</h2></GlassPanel>; }
function RequestErrorPanel({ title, error, retry, retryText="Try again" }) { return <GlassPanel className="border-rose-200 bg-rose-50/80 p-8 text-center"><AlertCircle size={32} className="mx-auto text-rose-600"/><h2 className="mt-4 text-xl font-black text-rose-900">{title}</h2><p className="mt-2 text-sm text-rose-700">{error}</p><button type="button" onClick={retry} className="mt-5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white">{retryText}</button></GlassPanel>; }
function EmptyPanel({ icon: Icon, title, text }) { return <GlassPanel className="p-8 text-center"><Icon size={34} className="mx-auto text-slate-400"/><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm text-slate-500">{text}</p></GlassPanel>; }

function BookingRequests({ items, loading, error, reload, go, decisionModal, setDecisionModal, showNotice }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const confirmDecision = async () => {
    if (!decisionModal) return;
    setSubmitting(true);
    try {
      await updateProviderBookingStatus(decisionModal.booking.id, decisionModal.type, note);
      showNotice(decisionModal.type === "accept" ? "Booking accepted successfully" : "Booking rejected successfully");
      setDecisionModal(null);
      setNote("");
      await reload();
    } catch (requestError) {
      showNotice(requestError.message || "Booking decision could not be saved");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingPanel title="Loading booking requests" />;
  if (error) return <RequestErrorPanel title="Booking requests unavailable" error={error} retry={reload} />;

  return <div>
    <PageLead title="Booking Requests" text="Review pending direct-booking requests. Contact details and exact addresses remain hidden until acceptance." />
    {items.length === 0 && <EmptyPanel icon={Bell} title="No pending booking requests" text="New customer requests will appear here." />}
    <div className="space-y-4">
      {items.map((booking) => <GlassPanel key={booking.id} className="p-5">
        <BookingRow booking={booking} go={go}/>
        {booking.taskDescription && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{booking.taskDescription}</p>}
        <div className="mt-4 flex gap-3"><button type="button" onClick={() => { setNote(""); setDecisionModal({type:"accept",booking}); }} className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">Accept</button><button type="button" onClick={() => { setNote(""); setDecisionModal({type:"reject",booking}); }} className="flex-1 rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Reject</button></div>
      </GlassPanel>)}
    </div>
    <AnimatePresence>{decisionModal && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"><GlassPanel className="w-full max-w-lg p-6"><h3 className="text-2xl font-black capitalize">{decisionModal.type} booking</h3><p className="mt-2 text-sm text-slate-500">Add an optional provider note before confirming {decisionModal.booking.id}.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none" placeholder="Optional message for the customer"/><div className="mt-4 flex gap-3"><button type="button" disabled={submitting} onClick={() => { setDecisionModal(null); setNote(""); }} className="flex-1 rounded-xl bg-slate-100 py-3 font-extrabold disabled:opacity-50">Cancel</button><button type="button" disabled={submitting} onClick={confirmDecision} className={`flex-1 rounded-xl py-3 font-extrabold text-white disabled:opacity-50 ${decisionModal.type === "accept" ? "bg-emerald-600" : "bg-rose-600"}`}>{submitting ? "Saving..." : "Confirm"}</button></div></GlassPanel></motion.div>}</AnimatePresence>
  </div>;
}

function Bookings({ items, loading, error, reload, filter, setFilter, go }) {
  if (loading) return <LoadingPanel title="Loading provider bookings" />;
  if (error) return <RequestErrorPanel title="Provider bookings unavailable" error={error} retry={reload} />;
  const filtered = filter === "all" ? items : items.filter((item) => item.status === filter);
  return <div><PageLead title="All Bookings" text="View pending, accepted, in-progress, completed and rejected work." /><FilterTabs values={["all","pending","accepted","in progress","completed","rejected"]} value={filter} setValue={setFilter}/>{filtered.length === 0 && <div className="mt-5"><EmptyPanel icon={CalendarDays} title="No bookings found" text="No bookings match this status." /></div>}<div className="mt-5 space-y-4">{filtered.map((booking) => <GlassPanel key={booking.id} className="p-5"><BookingRow booking={booking} go={go}/></GlassPanel>)}</div></div>;
}

function BookingRow({ booking, go }) {
  return <button type="button" onClick={() => go(`/provider/bookings/${booking.id}`)} className="flex w-full flex-col gap-4 text-left sm:flex-row sm:items-center"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-blue-100 text-blue-700"><CalendarDays size={21}/></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-black">{booking.title}</span><StatusBadge status={booking.status}/></span><span className="mt-1 block text-sm text-slate-500">{booking.id} - {booking.customer} - {booking.source}</span><span className="mt-2 block text-sm font-semibold">{formatBookingSchedule(booking)} - {booking.price}</span></span><ChevronRight size={18}/></button>;
}

function BookingDetails({ bookingId, go, showNotice, reloadBookings }) {
  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const result = await getProviderBooking(bookingId);
      setBooking(mapBookingDetails(result.data?.booking));
      setHistory(result.data?.history || []);
    } catch (requestError) { setError(requestError.message || "Booking could not be loaded."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [bookingId]);

  const performAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      await updateProviderBookingStatus(bookingId, actionModal, note);
      showNotice(actionModal === "start" ? "Booking changed to in progress" : "Booking marked completed");
      setActionModal(null); setNote("");
      await Promise.all([load(), reloadBookings()]);
    } catch (requestError) { showNotice(requestError.message || "Booking status could not be updated"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingPanel title="Loading booking details" />;
  if (error || !booking) return <RequestErrorPanel title="Booking unavailable" error={error || "Booking not found."} retry={load} />;

  return <div><Back onClick={() => go("/provider/bookings")} text="Back to bookings" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-blue-600">{booking.id}</p><h2 className="mt-2 text-3xl font-black">{booking.title}</h2><p className="mt-2 text-slate-500">Customer: {booking.customer} - {booking.source}</p></div><StatusBadge status={booking.status}/></div><div className="mt-7 grid gap-4 sm:grid-cols-4"><InfoCard label="Date" value={booking.date}/><InfoCard label="Time" value={booking.time}/><InfoCard label="Price" value={booking.price}/><InfoCard label="Duration" value={formatDuration(booking.durationMinutes)}/></div><div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-bold uppercase text-emerald-700">Earnings breakdown</p><div className="mt-4 grid gap-3 sm:grid-cols-4"><InfoCard label="Gross value" value={booking.price}/><InfoCard label="Commission rate" value={`${booking.commissionRate}%`}/><InfoCard label="ServiceLink fee" value={formatLkr(booking.commissionAmount)}/><InfoCard label="Provider net" value={formatLkr(booking.providerNetAmount)}/></div><p className="mt-4 text-xs text-emerald-800">Commission is recorded after successful completion. Customer payment is made directly to the provider in this MVP.</p></div><div className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase text-slate-400">Customer task details</p><p className="mt-2 leading-7 text-slate-700">{booking.taskDescription || "No task description supplied."}</p>{booking.customerNote && <p className="mt-3 text-sm text-slate-500">Customer note: {booking.customerNote}</p>}</div><div className="rounded-2xl bg-blue-50 p-5"><p className="text-xs font-bold uppercase text-blue-600">Contact and location</p>{booking.contactVisible ? <div className="mt-2 space-y-2 text-sm text-blue-900"><p>{booking.customerPhone || "No phone supplied"}</p><p>{booking.customerEmail || "No email supplied"}</p><p>{booking.address || booking.district || "No address supplied"}</p></div> : <p className="mt-2 text-sm leading-6 text-blue-900">Contact details and exact address remain hidden until the booking is accepted.</p>}</div></div><div className="mt-6 flex flex-wrap gap-3">{booking.status === "accepted" && <button type="button" onClick={() => { setNote(""); setActionModal("start"); }} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-extrabold text-white">Start work</button>}{booking.status === "in progress" && <button type="button" onClick={() => { setNote(""); setActionModal("complete"); }} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">Mark completed</button>}</div></GlassPanel><GlassPanel className="mt-6 p-6"><h3 className="text-xl font-black">Status history</h3>{history.length === 0 ? <p className="mt-4 text-sm text-slate-500">No status changes have been recorded yet.</p> : <div className="mt-5 space-y-3">{history.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.from_status || "created"}/><ChevronRight size={16}/><StatusBadge status={item.to_status}/></div><p className="mt-2 text-xs text-slate-500">{formatDateTime(item.changed_at)} - {item.changed_by_name || item.changed_by_role || "System"}</p>{item.note && <p className="mt-2 text-sm text-slate-700">{item.note}</p>}</div>)}</div>}</GlassPanel><AnimatePresence>{actionModal && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"><GlassPanel className="w-full max-w-lg p-6"><h3 className="text-2xl font-black">{actionModal === "start" ? "Start booking work" : "Complete booking"}</h3><p className="mt-2 text-sm text-slate-500">Add an optional provider note before continuing.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none"/><div className="mt-4 flex gap-3"><button type="button" disabled={submitting} onClick={() => setActionModal(null)} className="flex-1 rounded-xl bg-slate-100 py-3 font-extrabold disabled:opacity-50">Cancel</button><button type="button" disabled={submitting} onClick={performAction} className="flex-1 rounded-xl bg-blue-600 py-3 font-extrabold text-white disabled:opacity-50">{submitting ? "Saving..." : "Confirm"}</button></div></GlassPanel></motion.div>}</AnimatePresence></div>;
}

function mapBookingDetails(item) {
  if (!item) return null;
  return { id:item.public_id, customer:item.customer_name || "Customer", customerPhone:item.customer_phone, customerEmail:item.customer_email, contactVisible:Boolean(item.contact_details_visible), title:item.title, source:item.source, serviceId:item.service_public_id, offerId:item.offer_public_id, scheduledDate:item.scheduled_date, scheduledTime:String(item.scheduled_time || "").slice(0,5), date:item.date_display || item.scheduled_date || "Not scheduled", time:String(item.scheduled_time || "").slice(0,5) || "Not supplied", durationMinutes:item.duration_minutes, taskDescription:item.task_description || "", district:item.district, address:item.address, customerNote:item.customer_note || "", providerNote:item.provider_note || "", price:`LKR ${Number(item.agreed_amount || 0).toLocaleString("en-LK")}`, commissionRate:item.commission_rate, commissionAmount:item.commission_amount, providerNetAmount:item.provider_net_amount, status:item.status };
}
function formatBookingSchedule(booking) { return `${booking.date || booking.scheduledDate || "Not scheduled"}${booking.time ? ` - ${booking.time}` : ""}`; }
function formatLkr(value) { return `LKR ${Number(value || 0).toLocaleString("en-LK")}`; }
function formatDateTime(value) { if (!value) return "Unknown time"; return new Intl.DateTimeFormat("en-LK", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value.replace(" ","T"))); }

function Reviews({ summary, items, loading, error, reload, go }) {
  if (loading) return <LoadingPanel title="Loading provider reviews" />;
  if (error) return <RequestErrorPanel title="Provider reviews unavailable" error={error} retry={reload} />;
  if (!summary) return <EmptyPanel icon={Star} title="No review summary" text="Review information is not available yet." />;

  const distribution = summary.distribution || [];
  return <div>
    <PageLead title="Reviews" text="View published customer ratings from eligible completed bookings. Provider reviews are read-only." />
    <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
      <GlassPanel className="p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Overall rating</p>
        <div className="mt-4 flex items-end gap-3"><span className="text-5xl font-black">{summary.average_rating || "0.00"}</span><span className="pb-1 text-sm font-semibold text-slate-500">out of 5</span></div>
        <div className="mt-3 flex text-amber-500">{[1,2,3,4,5].map((number) => <Star key={number} size={21} className={number <= Math.round(Number(summary.average_rating || 0)) ? "fill-current" : "text-slate-200"}/>)}</div>
        <p className="mt-3 text-sm text-slate-500">Based on {summary.review_count || 0} published review{Number(summary.review_count || 0) === 1 ? "" : "s"}.</p>
      </GlassPanel>
      <GlassPanel className="p-6">
        <h3 className="text-xl font-black">Rating distribution</h3>
        <div className="mt-5 space-y-3">{distribution.map((row) => <div key={row.rating} className="grid grid-cols-[70px_1fr_48px] items-center gap-3"><span className="flex items-center gap-1 text-sm font-bold">{row.rating}<Star size={14} className="fill-amber-400 text-amber-400"/></span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{width:`${row.percentage}%`}}/></div><span className="text-right text-xs font-bold text-slate-500">{row.count}</span></div>)}</div>
      </GlassPanel>
    </div>
    {items.length === 0 ? <div className="mt-6"><EmptyPanel icon={Star} title="No published reviews" text="Published reviews from completed bookings will appear here." /></div> : <div className="mt-6 grid gap-5 xl:grid-cols-2">{items.map((review) => <GlassPanel key={review.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black">{review.customer}</h3><p className="mt-1 text-sm text-slate-500">{review.id} - {formatReviewDate(review.date)}</p></div><div className="flex text-amber-500">{[1,2,3,4,5].map((number) => <Star key={number} size={17} className={number <= review.rating ? "fill-current" : "text-slate-200"}/>)}</div></div><p className="mt-4 leading-7 text-slate-600">{review.comment}</p><div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center"><div><p className="text-sm font-extrabold">{review.service}</p><p className="mt-1 text-xs text-slate-500">Booking {review.bookingId}</p></div><button type="button" onClick={() => go(`/provider/bookings/${review.bookingId}`)} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View booking</button></div></GlassPanel>)}</div>}
  </div>;
}
function formatReviewDate(value) { if (!value) return "Unknown date"; return new Intl.DateTimeFormat("en-LK", {day:"2-digit",month:"short",year:"numeric"}).format(new Date(value.replace(" ","T"))); }
function Complaints({ summary, items, loading, error, reload, go, showNotice }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [responseText, setResponseText] = useState("");
  const [responseError, setResponseError] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  const openComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.responseText || "");
    setDetailsError("");
    setResponseError("");
    setDetailsLoading(true);
    try {
      const result = await getProviderComplaint(complaint.id);
      const detail = mapComplaintDetails(result.data);
      setSelectedComplaint(detail);
      setResponseText(detail.responseText || "");
    } catch (requestError) {
      setDetailsError(requestError.message || "Complaint details could not be loaded.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setResponseText("");
    setResponseError("");
    setDetailsError("");
  };

  const saveResponse = async () => {
    if (!selectedComplaint) return;
    setSavingResponse(true);
    setResponseError("");
    try {
      const result = await saveProviderComplaintResponse(selectedComplaint.id, responseText);
      const updated = mapComplaintDetails(result.data);
      setSelectedComplaint(updated);
      setResponseText(updated.responseText || "");
      showNotice(result.message || "Complaint response saved successfully");
      await reload();
    } catch (requestError) {
      setResponseError(requestError.errors?.response_text?.[0] || requestError.message || "Complaint response could not be saved.");
    } finally {
      setSavingResponse(false);
    }
  };

  if (loading) return <LoadingPanel title="Loading provider complaints" />;
  if (error) return <RequestErrorPanel title="Provider complaints unavailable" error={error} retry={reload} />;

  const filtered = statusFilter === "all" ? items : items.filter((item) => {
    if (statusFilter === "open") return ["open", "under review"].includes(item.status);
    if (statusFilter === "resolved") return ["resolved", "closed"].includes(item.status);
    return item.hasResponse;
  });

  return <div>
    <PageLead title="Complaints" text="Review complaint cases linked to your provider account, submit responses, and view administrator resolution information." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      [AlertCircle,"Total complaints",summary?.total || 0,"text-slate-700"],
      [Clock3,"Open or under review",summary?.open_count || 0,"text-amber-600"],
      [MessageSquareText,"Responded",summary?.responded_count || 0,"text-blue-600"],
      [CheckCircle2,"Resolved or closed",summary?.resolved_count || 0,"text-emerald-600"],
    ].map(([Icon,label,value,colour]) => <GlassPanel key={label} className="p-5"><Icon size={22} className={colour}/><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div>
    <div className="mt-6"><FilterTabs values={["all","open","responded","resolved"]} value={statusFilter} setValue={setStatusFilter}/></div>
    {filtered.length === 0 ? <div className="mt-5"><EmptyPanel icon={MessageSquareText} title="No complaints found" text="No provider complaints match this filter." /></div> : <div className="mt-5 space-y-4">{filtered.map((complaint) => <GlassPanel key={complaint.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={21}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{complaint.subject}</h3><StatusBadge status={complaint.status}/>{complaint.hasResponse && <StatusBadge status="submitted"/>}</div><p className="mt-1 text-sm text-slate-500">{complaint.id} - {complaint.complainant} - Reference {complaint.recordReference}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{complaint.description}</p></div><button type="button" onClick={() => openComplaint(complaint)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View case</button></div></GlassPanel>)}</div>}

    <AnimatePresence>{selectedComplaint && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-3xl items-center py-6"><GlassPanel className="w-full p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-blue-600">{selectedComplaint.id}</p><h3 className="mt-2 text-2xl font-black">{selectedComplaint.subject}</h3></div><button type="button" onClick={closeComplaint} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X size={18}/></button></div>{detailsLoading ? <div className="py-12 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-4 text-sm font-bold text-slate-500">Loading complaint details...</p></div> : detailsError ? <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700">{detailsError}</div> : <><div className="mt-6 grid gap-4 sm:grid-cols-3"><InfoCard label="Status" value={selectedComplaint.status}/><InfoCard label="Customer" value={selectedComplaint.complainant}/><InfoCard label="Record reference" value={selectedComplaint.recordReference}/></div><div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Complaint description</p><p className="mt-3 leading-7 text-slate-700">{selectedComplaint.description}</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><InfoCard label="Created" value={formatComplaintDate(selectedComplaint.createdAt)}/><InfoCard label="Booking status" value={selectedComplaint.bookingStatus || "Legacy booking unavailable"}/></div>{selectedComplaint.bookingAvailable ? <button type="button" onClick={() => go(`/provider/bookings/${selectedComplaint.bookingId}`)} className="mt-5 rounded-xl bg-blue-50 px-5 py-3 text-sm font-extrabold text-blue-700">Open linked booking</button> : <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">The legacy booking record is unavailable. The original reference is {selectedComplaint.recordReference}.</div>}{selectedComplaint.resolutionNote && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-bold uppercase text-emerald-700">Administrator resolution</p><p className="mt-3 leading-7 text-emerald-900">{selectedComplaint.resolutionNote}</p></div>}<div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">Provider response</p>{selectedComplaint.hasResponse && <StatusBadge status={selectedComplaint.responseStatus || "submitted"}/>}</div>{selectedComplaint.canRespond ? <><textarea value={responseText} onChange={(event) => {setResponseText(event.target.value);setResponseError("");}} maxLength={5000} className="mt-4 min-h-36 w-full rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-100" placeholder="Explain the provider's position and any relevant work details."/>{responseError && <p className="mt-2 text-xs font-bold text-rose-600">{responseError}</p>}<div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={closeComplaint} disabled={savingResponse} className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold disabled:opacity-50">Close</button><button type="button" onClick={saveResponse} disabled={savingResponse} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{savingResponse ? "Saving response..." : selectedComplaint.hasResponse ? "Update response" : "Submit response"}</button></div></> : selectedComplaint.hasResponse ? <div className="mt-4 rounded-2xl bg-white p-4"><p className="leading-7 text-slate-700">{selectedComplaint.responseText}</p><p className="mt-3 text-xs text-slate-500">Submitted {formatComplaintDate(selectedComplaint.submittedAt)}{selectedComplaint.lastEditedAt ? ` - edited ${formatComplaintDate(selectedComplaint.lastEditedAt)}` : ""}</p></div> : <p className="mt-4 text-sm leading-6 text-slate-600">This complaint is resolved or closed and no provider response can be added.</p>}</div></>}</GlassPanel></div></motion.div>}</AnimatePresence>
  </div>;
}
function mapComplaintDetails(item) { if (!item) return null; return { id:item.public_id, complainant:item.complainant_name || "Customer", complainantId:item.complainant_public_id, bookingId:item.booking_public_id || item.record_reference, bookingTitle:item.booking_title, bookingStatus:item.booking_status, bookingAvailable:Boolean(item.booking_available), recordReference:item.record_reference, subject:item.subject, description:item.description, status:item.normalized_status || String(item.status || "").replaceAll("_"," "), resolutionNote:item.resolution_note, resolvedAt:item.resolved_at, canRespond:Boolean(item.can_respond), hasResponse:Boolean(item.has_response), responseId:item.response_public_id, responseText:item.response_text || "", responseStatus:item.response_status, submittedAt:item.submitted_at, lastEditedAt:item.last_edited_at, createdAt:item.created_at }; }
function formatComplaintDate(value) { if (!value) return "Not recorded"; return new Intl.DateTimeFormat("en-LK", {dateStyle:"medium",timeStyle:"short"}).format(new Date(value.replace(" ","T"))); }
function Notifications({ summary, items, loading, error, reload, go, showNotice }) {
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  if (loading) return <LoadingPanel title="Loading provider notifications" />;
  if (error) return <RequestErrorPanel title="Provider notifications unavailable" error={error} retry={reload} />;
  const filtered = filter === "all" ? items : items.filter((item) => filter === "unread" ? !item.isRead : item.isRead);
  const openNotification = async (notification) => {
    setUpdatingId(notification.id);
    try {
      if (!notification.isRead) await markProviderNotificationAsRead(notification.id);
      await reload();
      if (notification.actionPath) go(notification.actionPath);
    } catch (requestError) {
      showNotice(requestError.message || "Notification could not be updated");
    } finally { setUpdatingId(""); }
  };
  const markOne = async (notification) => {
    setUpdatingId(notification.id);
    try {
      await markProviderNotificationAsRead(notification.id);
      showNotice("Notification marked as read");
      await reload();
    } catch (requestError) { showNotice(requestError.message || "Notification could not be updated"); }
    finally { setUpdatingId(""); }
  };
  const markAll = async () => {
    setMarkingAll(true);
    try {
      const result = await markAllProviderNotificationsAsRead();
      showNotice(result.message || "All notifications marked as read");
      await reload();
    } catch (requestError) { showNotice(requestError.message || "Notifications could not be updated"); }
    finally { setMarkingAll(false); }
  };
  return <div>
    <PageLead title="Notifications" text="View provider alerts for bookings, offers, reviews, complaints, applications and qualifications." action={Number(summary?.unread_count || 0) > 0 ? (markingAll ? "Marking all..." : "Mark all read") : null} onAction={markAll} icon={CheckCheckIcon}/>
    <div className="grid gap-4 sm:grid-cols-3"><InfoCard label="Total notifications" value={String(summary?.total_count || 0)}/><InfoCard label="Unread" value={String(summary?.unread_count || 0)}/><InfoCard label="Read" value={String(summary?.read_count || 0)}/></div>
    <div className="mt-6"><FilterTabs values={["all","unread","read"]} value={filter} setValue={setFilter}/></div>
    {filtered.length === 0 ? <div className="mt-5"><EmptyPanel icon={Bell} title="No notifications found" text="No notifications match this filter." /></div> : <div className="mt-5 space-y-3">{filtered.map((notification) => { const Icon=notificationIcon(notification.type); return <GlassPanel key={notification.id} className={`p-5 ${!notification.isRead ? "ring-2 ring-blue-200" : ""}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${notificationColour(notification.type)}`}><Icon size={20}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{notification.title}</h3>{!notification.isRead && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">Unread</span>}</div><p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p><p className="mt-2 text-xs font-bold text-slate-400">{formatNotificationTime(notification.createdAt)}{notification.relatedPublicId ? ` - ${notification.relatedPublicId}` : ""}</p></div><div className="flex shrink-0 gap-2">{!notification.isRead && <button type="button" disabled={updatingId===notification.id} onClick={() => markOne(notification)} className="rounded-xl bg-blue-50 px-4 py-3 text-xs font-extrabold text-blue-700 disabled:opacity-50">Mark read</button>}{notification.actionPath && <button type="button" disabled={updatingId===notification.id} onClick={() => openNotification(notification)} className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50">{updatingId===notification.id ? "Opening..." : "Open"}</button>}</div></div></GlassPanel>;})}</div>}
  </div>;
}
function CheckCheckIcon(props) { return <CheckCircle2 {...props}/>; }
function notificationIcon(type) { const icons={booking_request:CalendarDays,booking_status:ListChecks,offer_status:WalletCards,review_received:Star,complaint_created:MessageSquareText,complaint_updated:MessageSquareText,application_status:FileCheck2,qualification_status:GraduationCap}; return icons[type] || Bell; }
function notificationColour(type) { if (type.includes("complaint")) return "bg-amber-100 text-amber-700"; if (type.includes("review")) return "bg-yellow-100 text-yellow-700"; if (type.includes("booking")) return "bg-blue-100 text-blue-700"; if (type.includes("offer")) return "bg-violet-100 text-violet-700"; return "bg-emerald-100 text-emerald-700"; }
function formatNotificationTime(value) { if (!value) return "Unknown time"; const date=new Date(value.replace(" ","T")); const seconds=Math.max(0,Math.floor((Date.now()-date.getTime())/1000)); if(seconds<60)return "Just now"; if(seconds<3600)return `${Math.floor(seconds/60)} min ago`; if(seconds<86400)return `${Math.floor(seconds/3600)} hr ago`; if(seconds<604800)return `${Math.floor(seconds/86400)} day${Math.floor(seconds/86400)===1?"":"s"} ago`; return new Intl.DateTimeFormat("en-LK",{day:"2-digit",month:"short",year:"numeric"}).format(date); }
function Statistics({ data, loading, error, reload }) {
  if (loading) return <LoadingPanel title="Loading provider statistics" />;
  if (error) return <RequestErrorPanel title="Provider statistics unavailable" error={error} retry={reload} />;
  if (!data?.summary) return <EmptyPanel icon={BarChart3} title="No statistics available" text="Provider activity has not been recorded yet." />;

  const summary = data.summary;
  const bookingStatuses = data.booking_statuses || {};
  const offerStatuses = data.offer_statuses || {};
  const monthly = data.monthly_activity || [];
  const services = data.service_performance || [];
  const maxBookings = Math.max(1, ...monthly.map((item) => Number(item.booking_count || 0)));
  const maxNet = Math.max(1, ...monthly.map((item) => Number(item.net_value || 0)));
  const totalBookings = Number(summary.total_bookings || 0);
  const statusRows = [
    ["Pending", bookingStatuses.pending || 0, "bg-amber-400"],
    ["Accepted", bookingStatuses.accepted || 0, "bg-blue-500"],
    ["In progress", bookingStatuses.in_progress || 0, "bg-violet-500"],
    ["Completed", bookingStatuses.completed || 0, "bg-emerald-500"],
    ["Rejected", bookingStatuses.rejected || 0, "bg-rose-500"],
  ];

  return <div>
    <PageLead title="Provider Statistics" text="Real operational performance calculated from bookings, offers, transactions, services and published reviews." />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      [WalletCards,"Total bookings",String(summary.total_bookings || 0)],
      [CheckCircle2,"Completed bookings",String(summary.completed_bookings || 0)],
      [TrendingUp,"Completion rate",`${Number(summary.completion_rate || 0)}%`],
      [CircleDollarSign,"Net booking value",formatLkr(summary.net_value || 0)],
    ].map(([Icon,label,value]) => <GlassPanel key={label} className="p-5"><Icon size={22} className="text-blue-600"/><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InfoCard label="Gross booking value" value={formatLkr(summary.gross_value || 0)}/>
      <InfoCard label="Platform commission" value={formatLkr(summary.commission_value || 0)}/>
      <InfoCard label="Average rating" value={`${summary.average_rating || "0.00"} from ${summary.review_count || 0} review${Number(summary.review_count || 0) === 1 ? "" : "s"}`}/>
      <InfoCard label="Offer acceptance" value={`${Number(summary.offer_acceptance_rate || 0)}% (${summary.accepted_offers || 0}/${summary.total_offers || 0})`}/>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <GlassPanel className="p-6">
        <h3 className="text-xl font-black">Monthly booking activity</h3>
        <p className="mt-2 text-sm text-slate-500">Bookings created during the latest six calendar months.</p>
        <div className="mt-8 flex h-56 items-end gap-3">{monthly.map((item) => {
          const value=Number(item.booking_count || 0);
          const height=value > 0 ? Math.max(10,(value/maxBookings)*100) : 3;
          return <div key={item.key} className="flex h-full flex-1 flex-col justify-end text-center"><span className="mb-2 text-xs font-black text-slate-600">{value}</span><div className={`w-full rounded-t-xl ${value > 0 ? "bg-gradient-to-t from-blue-700 to-cyan-400" : "bg-slate-100"}`} style={{height:`${height}%`}}/><span className="mt-2 text-xs font-bold text-slate-400">{item.label}</span></div>;
        })}</div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h3 className="text-xl font-black">Monthly net value</h3>
        <p className="mt-2 text-sm text-slate-500">Provider net value recorded from monthly transactions.</p>
        <div className="mt-8 flex h-56 items-end gap-3">{monthly.map((item) => {
          const value=Number(item.net_value || 0);
          const height=value > 0 ? Math.max(10,(value/maxNet)*100) : 3;
          return <div key={item.key} className="flex h-full flex-1 flex-col justify-end text-center"><span className="mb-2 truncate text-[10px] font-black text-emerald-700">{value > 0 ? formatLkr(value) : "0"}</span><div className={`w-full rounded-t-xl ${value > 0 ? "bg-gradient-to-t from-emerald-700 to-teal-400" : "bg-slate-100"}`} style={{height:`${height}%`}}/><span className="mt-2 text-xs font-bold text-slate-400">{item.label}</span></div>;
        })}</div>
      </GlassPanel>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <GlassPanel className="p-6">
        <h3 className="text-xl font-black">Booking status distribution</h3>
        <div className="mt-6 space-y-4">{statusRows.map(([label,count,colour]) => {
          const percentage=totalBookings > 0 ? (Number(count)/totalBookings)*100 : 0;
          return <div key={label}><div className="mb-2 flex justify-between text-sm font-bold"><span>{label}</span><span>{count}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colour}`} style={{width:`${percentage}%`}}/></div></div>;
        })}</div>
        <div className="mt-6 grid grid-cols-2 gap-3"><InfoCard label="Submitted offers" value={String(offerStatuses.submitted || 0)}/><InfoCard label="Withdrawn offers" value={String(offerStatuses.withdrawn || 0)}/></div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">Service performance</h3><p className="mt-2 text-sm text-slate-500">Booking volume and value grouped by provider service.</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{summary.active_services || 0} active</span></div>
        <div className="mt-5 space-y-4">{services.map((service,index) => <div key={service.service_public_id || `legacy-${index}`} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-black">{service.service_title}</p><p className="mt-1 text-xs text-slate-500">{service.service_public_id || "Custom records"}{service.price_display ? ` - ${service.price_display}` : ""}</p></div><StatusBadge status={service.service_status}/></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><InfoCard label="Bookings" value={String(service.booking_count || 0)}/><InfoCard label="Completed" value={String(service.completed_count || 0)}/><InfoCard label="Gross" value={formatLkr(service.gross_value || 0)}/><InfoCard label="Net" value={formatLkr(service.provider_net_value || 0)}/></div></div>)}</div>
      </GlassPanel>
    </div>
  </div>;
}
function ProviderEarningsSummary({ go, summary, loading, error, retry }) {
  if (loading) {
    return <GlassPanel className="mt-7 p-6"><div className="flex items-center gap-4"><div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"/><div><p className="text-sm font-bold text-emerald-600">EARNINGS</p><p className="mt-1 text-sm text-slate-500">Loading real earnings summary...</p></div></div></GlassPanel>;
  }
  if (error || !summary) {
    return <GlassPanel className="mt-7 border-rose-200 bg-rose-50/80 p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-rose-700">EARNINGS UNAVAILABLE</p><p className="mt-2 text-sm text-rose-700">{error || "Earnings summary could not be loaded."}</p></div><button type="button" onClick={retry} className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white">Try again</button></div></GlassPanel>;
  }
  return <GlassPanel className="mt-7 p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-emerald-600">RECORDED EARNINGS</p><h3 className="mt-2 text-2xl font-black">{formatLkr(summary.recorded_net)} net</h3><p className="mt-2 text-sm text-slate-500">Total net value {formatLkr(summary.net_value)} with {formatLkr(summary.pending_net)} still pending completion.</p></div><button type="button" onClick={() => go("/provider/earnings")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">View earnings</button></div></GlassPanel>;
}

function Earnings({ go, summary, items, loading, error, reload }) {
  const [statusFilter, setStatusFilter] = useState("all");
  if (loading) return <LoadingPanel title="Loading provider earnings" />;
  if (error) return <RequestErrorPanel title="Provider earnings unavailable" error={error} retry={reload} />;
  if (!summary) return <EmptyPanel icon={CircleDollarSign} title="No earnings summary" text="Earnings data is not available yet." />;

  const filtered = statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter);
  const metrics = [
    [CircleDollarSign, "Gross booking value", formatLkr(summary.gross_value)],
    [WalletCards, "Platform commission", formatLkr(summary.commission_value)],
    [TrendingUp, "Recorded net earnings", formatLkr(summary.recorded_net)],
    [Clock3, "Pending net earnings", formatLkr(summary.pending_net)],
  ];

  return <div>
    <PageLead title="Earnings" text="Review real booking value, ServiceLink commission, recorded earnings and amounts pending booking completion." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon,label,value]) => <GlassPanel key={label} className="p-5"><Icon size={22} className="text-emerald-600"/><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></GlassPanel>)}</div>
    <div className="mt-5 grid gap-4 sm:grid-cols-3"><InfoCard label="Total net value" value={formatLkr(summary.net_value)}/><InfoCard label="Recorded transactions" value={String(summary.recorded_count || 0)}/><InfoCard label="Pending transactions" value={String(summary.pending_count || 0)}/></div>
    <GlassPanel className="mt-6 overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h3 className="text-xl font-black">Earnings records</h3><p className="mt-1 text-sm text-slate-500">{summary.transaction_count || 0} booking-based transactions synchronized with MySQL.</p></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold"><option value="all">All statuses</option><option value="pending">Pending</option><option value="recorded">Recorded</option></select></div>
      {filtered.length === 0 ? <div className="p-8"><EmptyPanel icon={WalletCards} title="No earnings records" text="No transactions match this status." /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr>{["Transaction","Booking / service","Date","Gross","Fee","Net earnings","Status"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody>{filtered.map((record) => <tr key={record.id} className="border-b border-slate-100"><td className="px-5 py-4 font-extrabold">{record.id}</td><td className="px-5 py-4"><button type="button" onClick={() => go(`/provider/bookings/${record.bookingId}`)} className="font-extrabold text-blue-700">{record.bookingId}</button><p className="mt-1 text-xs text-slate-500">{record.bookingTitle}</p><p className="mt-1 text-xs text-slate-400">{record.source} - {record.bookingStatus}</p></td><td className="px-5 py-4">{record.date}</td><td className="px-5 py-4 font-bold">{formatLkr(record.grossAmount)}</td><td className="px-5 py-4 text-rose-600">{formatLkr(record.commissionAmount)}</td><td className="px-5 py-4 font-black text-emerald-700">{formatLkr(record.providerNetAmount)}</td><td className="px-5 py-4"><StatusBadge status={record.status}/></td></tr>)}</tbody></table></div>}
    </GlassPanel>
  </div>;
}

function FilterTabs({ values, value, setValue }) { return <div className="flex flex-wrap gap-2">{values.map((item) => <button key={item} onClick={() => setValue(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${value === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{item}</button>)}</div>; }
function ControlledProfileField({
label,
type = "text",
value,
onChange,
error,
required = false,
}) {
return (
<Field label={label}>
<input
type={type}
value={value}
onChange={(event) =>
onChange(event.target.value)
}
required={required}
className={`w-full rounded-2xl border bg-white/75 px-4 py-4 text-sm font-semibold outline-none transition focus:ring-4 ${
error
? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
: "border-white/90 focus:border-blue-300 focus:ring-blue-100"
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

function ControlledProfileTextArea({
label,
value,
onChange,
error,
}) {
return (
<Field label={label}>
<textarea
value={value}
onChange={(event) =>
onChange(event.target.value)
}
className={`min-h-36 w-full rounded-2xl border bg-white/75 p-4 text-sm font-semibold outline-none transition focus:ring-4 ${
error
? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
: "border-white/90 focus:border-blue-300 focus:ring-blue-100"
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

function ControlledProfileSelect({
label,
value,
onChange,
options,
error,
}) {
return (
<Field label={label}>
<span
className={`flex rounded-2xl border bg-white/75 px-4 ${
error
? "border-rose-300"
: "border-white/90"
}`}
>
<select
value={value}
onChange={(event) =>
onChange(event.target.value)
}
className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none"
>
{options.map((option) => (
<option
key={option || "empty"}
value={option}
>
{option || "Select district"}
</option>
))}
</select>

<ChevronDown
size={16}
className="my-auto text-slate-400"
/>
</span>

{error && (
<span className="mt-2 block text-xs font-bold text-rose-600">
{error}
</span>
)}
</Field>
);
}