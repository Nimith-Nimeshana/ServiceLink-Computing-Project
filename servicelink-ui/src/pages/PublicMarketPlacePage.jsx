import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays,
  ChevronDown, CircleDollarSign, Clock3, Filter, Heart, ListFilter,
  MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Star, UserRound,
  Wrench, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Public demonstration records will later be replaced by approved database records.
const serviceRecords = [
  { id: "SV-101", title: "Home Electrical Repair", providerId: "PR-101", provider: "Kalana HomeTech", category: "Electrical", location: "Anuradhapura", rating: 4.8, reviews: 42, price: 2500, priceLabel: "From LKR 2,500", available: true, summary: "Inspection and repair of common household electrical faults.", tone: "from-blue-600 to-cyan-500" },
  { id: "SV-102", title: "Electrical Safety Inspection", providerId: "PR-101", provider: "Kalana HomeTech", category: "Electrical", location: "Anuradhapura", rating: 4.9, reviews: 28, price: 4500, priceLabel: "LKR 4,500", available: true, summary: "A structured inspection of household wiring, outlets and distribution boards.", tone: "from-indigo-600 to-blue-500" },
  { id: "SV-118", title: "Emergency Plumbing Visit", providerId: "PR-102", provider: "AquaPro Plumbing", category: "Plumbing", location: "Mihintale", rating: 4.7, reviews: 31, price: 4000, priceLabel: "From LKR 4,000", available: false, summary: "Diagnosis and repair support for urgent household plumbing problems.", tone: "from-cyan-500 to-blue-600" },
  { id: "SV-126", title: "Laptop Diagnostics", providerId: "PR-103", provider: "North Central TechCare", category: "Computer Repair", location: "Anuradhapura", rating: 4.8, reviews: 64, price: 1800, priceLabel: "LKR 1,800", available: true, summary: "Hardware and software diagnostics for laptops and desktop computers.", tone: "from-violet-600 to-indigo-600" },
  { id: "SV-131", title: "Individual Mathematics Tutoring", providerId: "PR-104", provider: "SkillPath Tutors", category: "Tutoring", location: "Online and local", rating: 4.7, reviews: 52, price: 1200, priceLabel: "From LKR 1,200", available: true, summary: "Individual learning support with planned lessons and progress guidance.", tone: "from-emerald-500 to-teal-600" },
  { id: "SV-138", title: "Event Photography Package", providerId: "PR-105", provider: "NorthLens Studio", category: "Photography", location: "Anuradhapura", rating: 4.6, reviews: 24, price: 25000, priceLabel: "From LKR 25,000", available: true, summary: "Event photography with edited digital image delivery.", tone: "from-fuchsia-500 to-pink-600" },
];

const wantedAdRecords = [
  { id: "WA-208", title: "Repair bedroom air conditioner", category: "Home Maintenance", area: "Anuradhapura", budget: "LKR 8,000 - 12,000", deadline: "10 Sep 2026", offers: 4, status: "active", detail: "The unit runs but does not cool properly. Inspection, cleaning and repair are required." },
  { id: "WA-211", title: "Install outdoor security lights", category: "Electrical", area: "Mihintale", budget: "Negotiable", deadline: "12 Sep 2026", offers: 2, status: "active", detail: "Two weather-resistant outdoor lights should be installed near the entrance and side path." },
  { id: "WA-214", title: "Inspect unstable power outlet", category: "Electrical", area: "Anuradhapura", budget: "LKR 3,000 - 5,000", deadline: "14 Sep 2026", offers: 1, status: "active", detail: "One wall outlet has become loose and intermittently loses power." },
  { id: "WA-218", title: "Recover files from a laptop", category: "Computer Repair", area: "Anuradhapura", budget: "LKR 4,000 - 8,000", deadline: "15 Sep 2026", offers: 3, status: "active", detail: "The laptop no longer starts. Important study documents need to be recovered where possible." },
];

const categories = ["All categories", "Electrical", "Plumbing", "Computer Repair", "Home Maintenance", "Tutoring", "Photography"];

const PUBLIC_API_BASE = "http://127.0.0.1:8000/api/public";
const providerTones = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
];
async function publicProviderRequest(path) {
  const response = await fetch(`${PUBLIC_API_BASE}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok) {
    throw new Error(result?.message || "Approved providers could not be loaded.");
  }
  return result;
}
function mapPublicProvider(item, index = 0) {
  const name = item.business_name || "Service Provider";
  const categories = String(item.categories_text || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return {
    id: item.public_id,
    name,
    title: item.professional_title || "Professional service provider",
    location: item.primary_district || "Not provided",
    coverage: item.coverage_area || "Not provided",
    rating: Number(item.average_rating || 0).toFixed(2),
    reviews: Number(item.review_count || 0),
    experience: Number(item.years_experience || 0),
    categories,
    services: Number(item.active_services_count || 0),
    summary: item.professional_summary || "No professional summary has been provided.",
    initials: name.split(" ").filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "SP",
    tone: providerTones[index % providerTones.length],
  };
}
function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/72 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

function Rating({ value, reviews }) {
  return <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-600"><Star size={15} className="fill-current" />{value} <span className="font-semibold text-slate-400">({reviews})</span></span>;
}

export default function PublicMarketplacePage({ screen = "services" }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const params = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [location, setLocation] = useState("All locations");
  const [sort, setSort] = useState("Recommended");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [saved, setSaved] = useState([]);
  const [notice, setNotice] = useState("");
  const [providerRecords, setProviderRecords] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState("");
  const [activeProvider, setActiveProvider] = useState(null);
  const [providerDetailsLoading, setProviderDetailsLoading] = useState(false);

  const activeService = serviceRecords.find((item) => item.id === params.id) || serviceRecords[0];
  useEffect(() => {
    let active = true;
    setProvidersLoading(true);
    setProvidersError("");
    publicProviderRequest("/providers")
      .then((result) => {
        if (active) setProviderRecords((result.data?.items || []).map(mapPublicProvider));
      })
      .catch((error) => active && setProvidersError(error.message))
      .finally(() => active && setProvidersLoading(false));
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (screen !== "provider-details" || !params.id) return;
    let active = true;
    setProviderDetailsLoading(true);
    setProvidersError("");
    publicProviderRequest(`/providers/${params.id}`)
      .then((result) => {
        if (!active) return;
        const provider = mapPublicProvider(result.data?.provider || {});
        provider.serviceItems = (result.data?.services || []).map((service) => ({
          id: service.public_id,
          title: service.title,
          category: service.category_name || "Service",
          summary: service.description || "No service description provided.",
          price: Number(service.price_min || 0),
          priceLabel: service.price_display || `LKR ${Number(service.price_min || 0).toLocaleString("en-LK")}`,
          providerId: provider.id,
          provider: provider.name,
          location: provider.location,
          rating: Number(provider.rating),
          reviews: provider.reviews,
          available: true,
          tone: provider.tone,
        }));
        setActiveProvider(provider);
      })
      .catch((error) => active && setProvidersError(error.message))
      .finally(() => active && setProviderDetailsLoading(false));
    return () => { active = false; };
  }, [screen, params.id]);
  const activeAd = wantedAdRecords.find((item) => item.id === params.id) || wantedAdRecords[0];

  const filteredServices = useMemo(() => {
    let items = serviceRecords.filter((item) => {
      const text = `${item.title} ${item.provider} ${item.category}`.toLowerCase();
      return text.includes(query.toLowerCase()) && (category === "All categories" || item.category === category) && (location === "All locations" || item.location.includes(location)) && (!availableOnly || item.available);
    });
    if (sort === "Rating") items = [...items].sort((a, b) => b.rating - a.rating);
    if (sort === "Price low to high") items = [...items].sort((a, b) => a.price - b.price);
    return items;
  }, [query, category, location, sort, availableOnly]);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return providerRecords.filter((provider) => {
      const searchableText = [
        provider.name,
        provider.title,
        provider.location,
        provider.coverage,
        ...provider.categories,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      const matchesCategory =
        category === "All categories" ||
        provider.categories.includes(category);

      const matchesLocation =
        location === "All locations" ||
        provider.location === location;

      return matchesQuery && matchesCategory && matchesLocation;
    });
  }, [providerRecords, query, category, location]);
  const filteredAds = useMemo(() => wantedAdRecords.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || item.category === category) && (location === "All locations" || item.area.includes(location))), [query, category, location]);

  const go = (path) => { setMobileOpen(false); navigate(path); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const showNotice = (text) => { setNotice(text); window.setTimeout(() => setNotice(""), 2500); };
  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="min-h-screen bg-[#f3f8fc] text-slate-900">
    {/* Public pages share a light glossy background and common navigation shell. */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-blue-300/30 blur-3xl" /><div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-200/35 blur-3xl" /></div>
    <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-24 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl">{notice}</motion.div>}</AnimatePresence>

    {/* Public marketplace navigation matches the homepage header and keeps the current section highlighted. */}
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_18px_50px_rgba(39,75,120,0.12)] backdrop-blur-2xl sm:px-6">
        <button onClick={() => go("/")} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
            <Wrench size={20} strokeWidth={2.4} />
          </span>
          <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
            Service<span className="text-blue-600">Link</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {[
            ["Home", "/"],
            ["Services", "/services"],
            ["Providers", "/providers"],
            ["Wanted Ads", "/wanted-ads"],
            ["How It Works", "/how-it-works"],
          ].map(([label, path]) => {
            const active =
              label === "Services"
                ? routeLocation.pathname.startsWith("/services") || routeLocation.pathname.startsWith("/categories")
                : label === "Providers"
                  ? routeLocation.pathname.startsWith("/providers")
                  : label === "Wanted Ads"
                    ? routeLocation.pathname.startsWith("/wanted-ads")
                    : label === "How It Works"
                      ? routeLocation.pathname.startsWith("/how-it-works")
                      : routeLocation.pathname === "/";

            return (
              <button
                key={path}
                onClick={() => go(path)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button onClick={() => go("/login")} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white">
            Log in
          </button>
          <button onClick={() => go("/register")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
            Create account
          </button>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Toggle navigation">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto mt-2 max-w-7xl rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-2xl lg:hidden">
            {[
              ["Home", "/"],
              ["Services", "/services"],
              ["Providers", "/providers"],
              ["Wanted Ads", "/wanted-ads"],
              ["How It Works", "/how-it-works"],
              ["Log in", "/login"],
              ["Create account", "/register"],
            ].map(([label, path]) => (
              <button key={path} onClick={() => go(path)} className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {screen === "services" && <ServicesPage items={filteredServices} query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} saved={saved} toggleSaved={toggleSaved} go={go} />}
      {screen === "service-details" && <ServiceDetails service={activeService} saved={saved.includes(activeService.id)} toggleSaved={toggleSaved} go={go} showNotice={showNotice} />}
      {screen === "categories" && <CategoriesPage go={go} />}
      {screen === "category-services" && <ServicesPage items={serviceRecords.filter((item) => item.category.toLowerCase().replaceAll(" ", "-") === params.slug)} query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} saved={saved} toggleSaved={toggleSaved} go={go} heading={`${params.slug?.replaceAll("-", " ")} services`} />}
      {screen === "providers" && <ProvidersPage items={filteredProviders} loading={providersLoading} error={providersError} query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} saved={saved} toggleSaved={toggleSaved} go={go} />}
      {screen === "provider-details" && <ProviderDetails provider={activeProvider} loading={providerDetailsLoading} error={providersError} saved={activeProvider ? saved.includes(activeProvider.id) : false} toggleSaved={toggleSaved} go={go} />}
      {screen === "wanted-ads" && <WantedAdsPage items={filteredAds} query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} go={go} />}
      {screen === "wanted-ad-details" && <WantedAdDetails ad={activeAd} go={go} />}
    </main>
  </div>;
}

function SearchFilters({ query, setQuery, category, setCategory, location, setLocation, sort, setSort, availableOnly, setAvailableOnly, showSort = true, categoryOptions = categories, locationOptions = ["All locations","Anuradhapura","Mihintale","Online"] }) {
  return <GlassPanel className="mb-7 p-4"><div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]"><label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4"><Search size={18} className="text-blue-600" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by service, provider or category" className="w-full bg-transparent py-4 text-sm outline-none" /></label><SelectControl value={category} setValue={setCategory} options={categoryOptions} /><SelectControl value={location} setValue={setLocation} options={locationOptions} />{showSort && <SelectControl value={sort} setValue={setSort} options={["Recommended","Rating","Price low to high"]} />}</div>{availableOnly !== undefined && <label className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600"><input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="accent-blue-600" />Available slots only</label>}</GlassPanel>;
}
function SelectControl({ value, setValue, options }) { return <label className="flex items-center rounded-2xl bg-slate-50 px-4"><select value={value} onChange={(e) => setValue(e.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-extrabold outline-none">{options.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></label>; }

function ServicesPage({ items, heading = "Find local services", ...props }) {
  return <div><PageHead eyebrow="SERVICE MARKETPLACE" title={heading} text="Browse active services from approved providers and compare price, rating, location and availability." action="View categories" onAction={() => props.go("/categories")} /><SearchFilters {...props} /><div className="mb-5 flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{items.length} services found</p><span className="flex items-center gap-2 text-sm font-bold text-slate-500"><SlidersHorizontal size={16} />Filters applied automatically</span></div>{items.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((service) => <ServiceCard key={service.id} service={service} saved={props.saved.includes(service.id)} toggleSaved={props.toggleSaved} go={props.go} />)}</div> : <EmptyState title="No matching services" text="Clear filters or publish a wanted advertisement so approved providers can respond." primary="Clear filters" onPrimary={() => { props.setQuery(""); props.setCategory("All categories"); props.setLocation("All locations"); }} secondary="Post wanted ad" onSecondary={() => props.go("/customer/wanted-ads/create")} />}</div>;
}
function ServiceCard({ service, saved, toggleSaved, go }) { return <motion.article whileHover={{ y: -5 }} className="overflow-hidden rounded-[1.7rem] border border-white/90 bg-white/75 shadow-xl backdrop-blur-2xl"><div className={`relative h-36 bg-gradient-to-br ${service.tone} p-5 text-white`}><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold">{service.category}</span><button onClick={() => toggleSaved(service.id)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Heart size={18} className={saved ? "fill-white" : ""} /></button><Wrench size={38} className="absolute bottom-5 right-5 text-white/40" /></div><div className="p-5"><h3 className="text-xl font-black">{service.title}</h3><button onClick={() => go(`/providers/${service.providerId}`)} className="mt-2 flex items-center gap-1.5 text-sm font-extrabold text-blue-700">{service.provider}<BadgeCheck size={16} /></button><p className="mt-3 text-sm leading-6 text-slate-500">{service.summary}</p><div className="mt-4 flex items-center justify-between"><Rating value={service.rating} reviews={service.reviews} /><span className="flex items-center gap-1 text-xs font-bold text-slate-500"><MapPin size={14} />{service.location}</span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p className="font-black">{service.priceLabel}</p><button onClick={() => go(`/services/${service.id}`)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white">View service</button></div></div></motion.article>; }

function ServiceDetails({ service, saved, toggleSaved, go, showNotice }) { return <div><Back onClick={() => go("/services")} text="Back to services" /><div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><GlassPanel className="overflow-hidden"><div className={`h-64 bg-gradient-to-br ${service.tone} p-8 text-white`}><span className="rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">{service.category}</span><h1 className="mt-8 max-w-2xl text-4xl font-black">{service.title}</h1><p className="mt-3 text-white/80">{service.summary}</p></div><div className="p-6 sm:p-8"><h2 className="text-2xl font-black">What this service includes</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2">{["Initial inspection and diagnosis","Clear explanation of recommended work","Agreed service labour","Booking-linked status updates"].map((item) => <li key={item} className="flex gap-2"><CheckCircle item={item} /></li>)}</ul><h2 className="mt-8 text-2xl font-black">Verified booking reviews</h2>{["Clear communication and completed on time.","The issue was explained before the repair began."].map((text, i) => <div key={text} className="mt-4 rounded-2xl bg-slate-50 p-4"><Rating value={i ? 4 : 5} reviews="verified" /><p className="mt-2 text-sm text-slate-600">{text}</p></div>)}</div></GlassPanel><div className="space-y-5"><GlassPanel className="p-6"><p className="text-sm text-slate-500">Service price</p><p className="mt-1 text-2xl font-black">{service.priceLabel}</p><div className="mt-5 rounded-2xl bg-blue-50 p-4"><p className="font-extrabold text-blue-900">Next available slots</p>{["08 Sep, 9:00 AM","09 Sep, 10:00 AM","10 Sep, 1:30 PM"].map((slot) => <button key={slot} onClick={() => showNotice(`${slot} selected`)} className="mt-2 block w-full rounded-xl bg-white px-3 py-2 text-left text-sm font-bold">{slot}</button>)}</div><button onClick={() => go(`/customer/bookings/create/${service.id}`)} className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 font-extrabold text-white">Book this service</button><button onClick={() => toggleSaved(service.id)} className="mt-3 w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-extrabold">{saved ? "Saved" : "Save service"}</button></GlassPanel><GlassPanel className="p-6"><div className="flex items-center gap-3"><span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${service.tone} font-black text-white`}>{service.provider.slice(0,2).toUpperCase()}</span><div><button onClick={() => go(`/providers/${service.providerId}`)} className="font-black">{service.provider}</button><p className="mt-1 text-xs text-slate-500">Approved provider</p></div><BadgeCheck className="ml-auto text-blue-600" /></div><div className="mt-4 flex justify-between"><Rating value={service.rating} reviews={service.reviews} /><span className="text-sm font-bold text-slate-500">{service.location}</span></div></GlassPanel></div></div></div>; }
function CheckCircle({ item }) { return <><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span><span>{item}</span></>; }

function CategoriesPage({ go }) { return <div><PageHead eyebrow="EXPLORE CATEGORIES" title="Browse by service category" text="Choose a category to view active services published by approved providers." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.slice(1).map((item, index) => <button key={item} onClick={() => go(`/categories/${item.toLowerCase().replaceAll(" ", "-")}`)} className="group rounded-[1.7rem] border border-white/90 bg-white/75 p-6 text-left shadow-xl backdrop-blur-2xl"><span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${["from-amber-400 to-orange-500","from-cyan-400 to-blue-500","from-violet-500 to-indigo-600","from-sky-500 to-cyan-500","from-emerald-500 to-teal-600","from-fuchsia-500 to-pink-600"][index]} text-white`}><Wrench size={23} /></span><h2 className="mt-5 text-xl font-black">{item}</h2><p className="mt-2 text-sm text-slate-500">View approved providers and active services in this category.</p><span className="mt-5 flex items-center gap-2 text-sm font-extrabold text-blue-700">Browse category <ArrowRight size={16} /></span></button>)}</div></div>; }

function ProvidersPage({ items, loading, error, query, setQuery, category, setCategory, location, setLocation, saved, toggleSaved, go }) {
  const categoryOptions = ["All categories", ...new Set(items.flatMap((provider) => provider.categories))];
  const locationOptions = ["All locations", ...new Set(items.map((provider) => provider.location).filter(Boolean))];
  if (loading) return <GlassPanel className="p-10 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><h2 className="mt-5 text-xl font-black">Loading approved providers</h2></GlassPanel>;
  if (error) return <EmptyState title="Providers unavailable" text={error} primary="Try again" onPrimary={() => window.location.reload()} secondary="Return home" onSecondary={() => go("/")} />;
  return <div><PageHead eyebrow="APPROVED PROVIDERS" title="Find trusted local providers" text="Compare real approved provider profiles, active services and verified booking ratings."/><SearchFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} showSort={false} categoryOptions={categoryOptions} locationOptions={locationOptions}/>{items.length === 0 ? <EmptyState title="No approved providers found" text="No active approved providers match the selected filters." primary="Clear filters" onPrimary={() => {setQuery("");setCategory("All categories");setLocation("All locations");}} secondary="Create provider account" onSecondary={() => go("/register/provider")}/> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((provider) => <GlassPanel key={provider.id} className="p-5"><div className="flex items-start justify-between"><span className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${provider.tone} text-lg font-black text-white`}>{provider.initials}</span><button onClick={() => toggleSaved(provider.id)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50"><Heart size={18} className={saved.includes(provider.id) ? "fill-rose-500 text-rose-500" : "text-slate-400"}/></button></div><div className="mt-5 flex items-center gap-2"><h2 className="text-xl font-black">{provider.name}</h2><BadgeCheck size={19} className="fill-blue-600 text-white"/></div><p className="mt-2 text-sm leading-6 text-slate-500">{provider.title}</p><div className="mt-4 flex items-center justify-between"><Rating value={provider.rating} reviews={provider.reviews}/><span className="text-xs font-bold text-slate-500">{provider.experience} years</span></div><p className="mt-4 text-sm text-slate-600">{provider.categories.length ? provider.categories.join(" · ") : "Professional services"}</p><p className="mt-2 text-xs font-bold text-blue-600">{provider.services} active service{provider.services === 1 ? "" : "s"} · {provider.location}</p><button onClick={() => go(`/providers/${provider.id}`)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View provider profile</button></GlassPanel>)}</div>}</div>;
}
function ProviderDetails({ provider, loading, error, saved, toggleSaved, go }) {
  if (loading) return <GlassPanel className="p-10 text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><h2 className="mt-5 text-xl font-black">Loading provider profile</h2></GlassPanel>;
  if (error || !provider) return <EmptyState title="Provider unavailable" text={error || "The approved provider could not be found."} primary="Back to providers" onPrimary={() => go("/providers")} secondary="Return home" onSecondary={() => go("/")} />;
  const items = provider.serviceItems || [];
  return <div><Back onClick={() => go("/providers")} text="Back to providers"/><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><span className={`grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br ${provider.tone} text-2xl font-black text-white`}>{provider.initials}</span><div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-3xl font-black">{provider.name}</h1><BadgeCheck size={22} className="fill-blue-600 text-white"/></div><p className="mt-2 text-slate-500">{provider.title}</p><div className="mt-3 flex flex-wrap gap-4"><Rating value={provider.rating} reviews={provider.reviews}/><span className="text-sm font-bold text-slate-500">{provider.experience} years experience</span><span className="text-sm font-bold text-slate-500">{provider.location}</span></div></div><button onClick={() => toggleSaved(provider.id)} className="rounded-2xl bg-blue-50 px-5 py-3 text-sm font-extrabold text-blue-700">{saved ? "Provider saved" : "Save provider"}</button></div><div className="mt-7 grid gap-5 xl:grid-cols-[1fr_0.7fr]"><div className="rounded-2xl bg-slate-50 p-5"><h2 className="font-black">Professional summary</h2><p className="mt-2 leading-7 text-slate-600">{provider.summary}</p><p className="mt-3 text-sm font-semibold text-slate-500">Coverage: {provider.coverage}</p></div><div className="rounded-2xl bg-emerald-50 p-5"><ShieldCheck size={21} className="text-emerald-700"/><h2 className="mt-3 font-black text-emerald-900">Platform-approved provider</h2><p className="mt-2 text-sm leading-6 text-emerald-800">Profile and submitted evidence were reviewed by ServiceLink. This is not external professional accreditation.</p></div></div></GlassPanel><h2 className="mb-5 mt-8 text-2xl font-black">Active services</h2>{items.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((service) => <ServiceCard key={service.id} service={service} saved={false} toggleSaved={() => {}} go={go}/>)}</div> : <EmptyState title="No active services" text="This approved provider has not published active services yet." primary="Back to providers" onPrimary={() => go("/providers")} secondary="Browse services" onSecondary={() => go("/services")}/>}</div>;
}
function WantedAdsPage({ items, query, setQuery, category, setCategory, location, setLocation, go }) { return <div><PageHead eyebrow="WANTED ADS" title="Discover customer work requests" text="Browse active privacy-safe requests. Only approved providers can submit offers." action="Post a wanted ad" onAction={() => go("/customer/wanted-ads/create")} /><SearchFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} location={location} setLocation={setLocation} showSort={false} /><GlassPanel className="mb-6 border-blue-200 bg-blue-50/80 p-5"><div className="flex gap-3"><ShieldCheck size={21} className="shrink-0 text-blue-600" /><p className="text-sm leading-6 text-blue-900">Exact customer addresses and contact details remain hidden until the correct accepted-offer and booking stage.</p></div></GlassPanel><div className="grid gap-5 md:grid-cols-2">{items.map((ad) => <GlassPanel key={ad.id} className="p-5"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700"><BriefcaseBusiness size={21} /></span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">{ad.status}</span></div><h2 className="mt-5 text-xl font-black">{ad.title}</h2><p className="mt-1 text-sm text-slate-500">{ad.id} · {ad.category}</p><div className="mt-4 grid gap-2 text-sm font-semibold sm:grid-cols-2"><span className="flex gap-2"><MapPin size={16} />{ad.area}</span><span className="flex gap-2"><CircleDollarSign size={16} />{ad.budget}</span><span className="flex gap-2"><Clock3 size={16} />{ad.deadline}</span><span className="flex gap-2"><BriefcaseBusiness size={16} />{ad.offers} offers</span></div><button onClick={() => go(`/wanted-ads/${ad.id}`)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">View wanted ad</button></GlassPanel>)}</div></div>; }
function WantedAdDetails({ ad, go }) { return <div><Back onClick={() => go("/wanted-ads")} text="Back to wanted ads" /><GlassPanel className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-bold text-violet-600">{ad.id} · {ad.category}</p><h1 className="mt-2 text-3xl font-black">{ad.title}</h1></div><span className="self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">{ad.status}</span></div><p className="mt-6 leading-7 text-slate-600">{ad.detail}</p><div className="mt-7 grid gap-4 sm:grid-cols-4"><Info label="General area" value={ad.area} /><Info label="Budget" value={ad.budget} /><Info label="Deadline" value={ad.deadline} /><Info label="Offers received" value={String(ad.offers)} /></div><div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900"><ShieldCheck size={21} className="mb-2 text-blue-600" />Customer identity, exact address and contact information are protected. Approved providers receive appropriate details only after an offer is accepted and a booking is created.</div><button onClick={() => go(`/provider/wanted-ads/${ad.id}/offer`)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-blue-600 px-5 py-4 text-sm font-extrabold text-white">Submit an offer <ArrowRight size={18} /></button><p className="mt-3 text-center text-xs text-slate-500">Visitors and unapproved accounts will later be redirected to the correct login or application-status page.</p></GlassPanel></div>; }
function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 font-extrabold">{value}</p></div>; }

function PageHead({ eyebrow, title, text, action, onAction }) { return <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p><h1 className="mt-2 text-4xl font-black tracking-[-0.045em]">{title}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-500">{text}</p></div>{action && <button onClick={onAction} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">{action}</button>}</div>; }
function Back({ onClick, text }) { return <button onClick={onClick} className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/75 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />{text}</button>; }
function EmptyState({ title, text, primary, onPrimary, secondary, onSecondary }) { return <GlassPanel className="p-10 text-center"><Search size={34} className="mx-auto text-slate-300" /><h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mx-auto mt-2 max-w-lg text-slate-500">{text}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={onPrimary} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">{primary}</button><button onClick={onSecondary} className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-extrabold text-blue-700">{secondary}</button></div></GlassPanel>; }
