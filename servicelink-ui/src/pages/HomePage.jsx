import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  Clock3,
  Computer,
  Droplets,
  GraduationCap,
  Hammer,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Sample categories display the approved homepage design.
// Laravel will later replace these records with database content.
const categories = [
  { name: "Electrical", icon: Zap, count: 42, color: "from-amber-400 to-orange-500" },
  { name: "Plumbing", icon: Droplets, count: 31, color: "from-cyan-400 to-blue-500" },
  { name: "Computer Repair", icon: Computer, count: 28, color: "from-violet-400 to-indigo-500" },
  { name: "Tutoring", icon: GraduationCap, count: 36, color: "from-emerald-400 to-teal-500" },
  { name: "Photography", icon: Camera, count: 21, color: "from-fuchsia-400 to-pink-500" },
  { name: "Home Maintenance", icon: Hammer, count: 47, color: "from-sky-400 to-cyan-500" },
];

// Sample approved providers demonstrate the reusable provider-card design.
const providers = [
  {
    name: "LankaFix Electrical",
    service: "Electrical installation and repair",
    location: "Anuradhapura",
    rating: 4.9,
    reviews: 86,
    price: "From LKR 2,500",
    initials: "LE",
    tone: "from-blue-500 to-indigo-600",
  },
  {
    name: "North Central TechCare",
    service: "Computer and mobile-device support",
    location: "Anuradhapura",
    rating: 4.8,
    reviews: 64,
    price: "From LKR 1,800",
    initials: "NT",
    tone: "from-teal-400 to-cyan-600",
  },
  {
    name: "SkillPath Tutors",
    service: "Individual and small-group tutoring",
    location: "Online and local",
    rating: 4.7,
    reviews: 52,
    price: "From LKR 1,200",
    initials: "ST",
    tone: "from-violet-500 to-fuchsia-600",
  },
];

// These cards explain the normal customer journey through ServiceLink.
const steps = [
  { icon: Search, title: "Discover", text: "Browse approved providers or search for the service you need." },
  { icon: Clock3, title: "Book", text: "Choose an available service or publish a wanted advertisement." },
  { icon: BadgeCheck, title: "Get it done", text: "Track the work, review the result and keep your records together." },
];

export default function HomePage() {
  // React Router opens the separate authentication and future marketplace pages.
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("Anuradhapura");
  const [notice, setNotice] = useState("");
  const [savedProviders, setSavedProviders] = useState([]);

  // Filter sample categories while the visitor types in the hero search field.
  const matchingCategories = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [searchText]);

  // Temporary feedback remains for actions whose pages have not been built yet.
  const showPrototypeNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  // Route each homepage navigation action to the appropriate URL.
  const navigateToPage = (pageName) => {
    const routes = {
      Home: "/",
      Services: "/services",
      Providers: "/providers",
      "Wanted Ads": "/wanted-ads",
      "How It Works": "/how-it-works",
      Login: "/login",
      Register: "/register",
      CustomerRegister: "/register/customer",
      ProviderRegister: "/register/provider",
      About: "/about",
      Contact: "/contact",
      Privacy: "/privacy",
      Terms: "/terms",
    };

    navigate(routes[pageName] || "/");
  };

  // Close the mobile menu before opening the selected route.
  const handleMobileNavigation = (item) => {
    setMobileMenuOpen(false);

    const routes = {
      Home: "/",
      Services: "/services",
      Providers: "/providers",
      "Wanted Ads": "/wanted-ads",
      "How It Works": "/how-it-works",
      "Log in": "/login",
      "Create account": "/register",
    };

    navigate(routes[item] || "/");
  };

  // Save and unsave provider cards locally for this visual prototype.
  const toggleSavedProvider = (providerName) => {
    setSavedProviders((currentProviders) =>
      currentProviders.includes(providerName)
        ? currentProviders.filter((name) => name !== providerName)
        : [...currentProviders, providerName]
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f8fc] text-slate-900 selection:bg-blue-200">
      {/* Decorative colours remain behind the page to support the glossy theme. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-96 w-96 rounded-full bg-blue-300/35 blur-3xl" />
        <div className="absolute right-[-8rem] top-36 h-[28rem] w-[28rem] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      {/* Temporary toast explains prototype actions that are not functional yet. */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="fixed left-1/2 top-24 z-[80] -translate-x-1/2 rounded-2xl border border-white/80 bg-slate-950/85 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The fixed frosted navbar connects the homepage to authentication routes. */}
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_18px_50px_rgba(39,75,120,0.12)] backdrop-blur-2xl sm:px-6">
          <button
            className="flex items-center gap-3"
            onClick={() => navigateToPage("Home")}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
              <Wrench size={20} strokeWidth={2.4} />
            </span>
            <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
              Service<span className="text-blue-600">Link</span>
            </span>
          </button>

          {/* Desktop marketplace navigation. */}
          <div className="hidden items-center gap-1 lg:flex">
            {["Home", "Services", "Providers", "Wanted Ads", "How It Works"].map(
              (item, index) => (
                <button
                  key={item}
                  onClick={() => navigateToPage(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    index === 0
                      ? "bg-slate-950 text-white shadow-lg"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* These buttons open the approved login and account-selection pages. */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={() => navigateToPage("Login")}
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
            >
              Log in
            </button>
            <button
              onClick={() => navigateToPage("Register")}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Create account
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile navigation uses the same routes as the desktop navbar. */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto mt-2 max-w-7xl rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-2xl lg:hidden"
            >
              {["Home", "Services", "Providers", "Wanted Ads", "How It Works", "Log in", "Create account"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => handleMobileNavigation(item)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item}
                  </button>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        {/* Hero image, gradients and empty right column preserve image visibility. */}
        <section
          className="relative isolate min-h-[860px] overflow-hidden bg-cover bg-[62%_center] px-4 pb-20 pt-36 sm:px-6 sm:pt-44 lg:px-8"
          style={{ backgroundImage: "url('/images/servicelink-hero.jpg')" }}
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(244,248,252,0.98)_0%,rgba(244,248,252,0.94)_32%,rgba(235,245,250,0.72)_55%,rgba(225,240,247,0.18)_100%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(244,248,252,0.18)_0%,rgba(244,248,252,0.02)_58%,rgba(244,248,252,0.96)_100%)]" />
          <div className="pointer-events-none absolute -left-28 top-8 -z-10 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-[-8rem] top-36 -z-10 h-[28rem] w-[28rem] rounded-full bg-cyan-200/15 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
            {/* Hero content introduces service discovery and wanted advertisements. */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/75 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur-xl">
                <Sparkles size={16} /> Local help, one reliable platform
              </div>

              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
                The right local service,
                <span className="block bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500 bg-clip-text text-transparent">
                  right when you need it.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                Discover approved local providers, book available services, or post what you need and compare offers in one simple place.
              </p>

              {/* Search inputs remain visual until the services page is functional. */}
              <div className="mt-9 rounded-[1.7rem] border border-white/90 bg-white/75 p-3 shadow-[0_24px_70px_rgba(34,79,131,0.16)] backdrop-blur-2xl">
                <div className="grid gap-2 md:grid-cols-[1fr_0.72fr_auto]">
                  <label className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3.5">
                    <Search className="text-blue-600" size={19} />
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                      placeholder="What service do you need?"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3.5">
                    <MapPin className="text-teal-600" size={19} />
                    <select
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="w-full appearance-none bg-transparent text-sm font-semibold text-slate-700 outline-none"
                    >
                      <option>Anuradhapura</option>
                      <option>Colombo</option>
                      <option>Kandy</option>
                      <option>Galle</option>
                      <option>Online</option>
                    </select>
                    <ChevronDown size={15} className="text-slate-400" />
                  </label>

                  <button
                    onClick={() => navigateToPage("Services")}
                    className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-slate-600">
                <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-teal-600" /> Reviewed providers</span>
                <span className="flex items-center gap-2"><Clock3 size={17} className="text-blue-600" /> Easy scheduling</span>
                <span className="flex items-center gap-2"><Star size={17} className="fill-amber-400 text-amber-400" /> Genuine booking reviews</span>
              </div>
            </motion.div>

            <div className="hidden min-h-[520px] lg:block" aria-hidden="true" />
          </div>

          {/* Wanted-ad route is ready for the future wanted-ad listing page. */}
          <div className="mx-auto mt-8 max-w-7xl lg:mt-0">
            <button
              onClick={() => navigateToPage("Wanted Ads")}
              className="group w-full rounded-[1.6rem] border border-white/85 bg-white/72 p-4 text-left shadow-[0_24px_70px_rgba(20,54,92,0.16)] backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/85 sm:max-w-[390px] lg:absolute lg:bottom-14 lg:right-8 xl:right-16"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                  <BriefcaseBusiness size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-slate-950">Cannot find the right listing?</span>
                  <span className="mt-0.5 block text-sm leading-5 text-slate-600">Post a wanted ad and compare provider offers.</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-blue-600 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </section>

        {/* Category cards reuse one visual component across all categories. */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">Explore categories</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">What can we help with?</h2>
              </div>
              <button
                onClick={() => navigateToPage("Services")}
                className="flex items-center gap-2 self-start rounded-xl bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl hover:text-blue-700"
              >
                View all categories <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(matchingCategories.length ? matchingCategories : categories).map((category, index) => {
                const Icon = category.icon;

                return (
                  <motion.button
                    key={category.name}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigateToPage("Services")}
                    className="group flex items-center gap-4 rounded-[1.5rem] border border-white/90 bg-white/70 p-5 text-left shadow-[0_12px_35px_rgba(39,75,120,0.08)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                      <Icon size={24} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-lg font-black">{category.name}</span>
                      <span className="mt-1 block text-sm text-slate-500">{category.count} providers</span>
                    </span>
                    <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dark workflow panel explains the two methods of obtaining a service. */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-white/90 bg-slate-950 px-6 py-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.20)] sm:px-10 lg:px-14 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-cyan-300">Simple by design</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">From search to completed service.</h2>
                <p className="mt-4 leading-7 text-slate-300">Use direct booking when you already know what you need, or publish a wanted ad when you want providers to compete with suitable offers.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-cyan-300"><Icon size={20} /></span>
                        <span className="text-sm font-black text-white/30">0{index + 1}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Provider cards preview public provider profiles and local save actions. */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-teal-600">Trusted locally</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl">Featured service providers</h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-600">A preview of how approved provider profiles will appear in the marketplace.</p>
            </div>

            <div className="mt-9 grid gap-5 lg:grid-cols-3">
              {providers.map((provider) => {
                const saved = savedProviders.includes(provider.name);

                return (
                  <div key={provider.name} className="rounded-[1.7rem] border border-white/90 bg-white/72 p-5 shadow-[0_18px_50px_rgba(39,75,120,0.10)] backdrop-blur-2xl transition hover:-translate-y-1.5 hover:shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${provider.tone} text-lg font-black text-white shadow-lg`}>
                        {provider.initials}
                      </div>
                      <button
                        onClick={() => toggleSavedProvider(provider.name)}
                        className={`grid h-10 w-10 place-items-center rounded-xl transition ${saved ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400 hover:text-rose-500"}`}
                        aria-label="Save provider"
                      >
                        <Heart size={18} className={saved ? "fill-current" : ""} />
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <h3 className="text-lg font-black">{provider.name}</h3>
                      <BadgeCheck size={18} className="fill-blue-600 text-white" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{provider.service}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700"><Star size={13} className="fill-current" /> {provider.rating} ({provider.reviews})</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700"><MapPin size={13} /> {provider.location}</span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-xs text-slate-400">Typical price</p>
                        <p className="mt-1 text-sm font-extrabold">{provider.price}</p>
                      </div>
                      <button
                        onClick={() => navigateToPage("Providers")}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        View profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final actions send visitors to service discovery or provider registration. */}
        <section className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-8 text-white shadow-[0_30px_80px_rgba(37,99,235,0.25)] sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-100">Ready when you are</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">Find help today, or grow your local service business.</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigateToPage("Services")}
                  className="rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
                >
                  Find a service
                </button>
                <button
                  onClick={() => navigateToPage("ProviderRegister")}
                  className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-xl transition hover:bg-white/20"
                >
                  Become a provider
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer links now open the completed information, support and policy pages. */}
      <footer className="relative z-10 border-t border-white/80 bg-white/60 px-4 py-10 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <button onClick={() => navigateToPage("Home")} className="flex items-center gap-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white"><Wrench size={17} /></span>
            <span><span className="block font-black">ServiceLink</span><span className="block text-xs text-slate-500">Local services, connected.</span></span>
          </button>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-500">
            {["About", "Contact", "Privacy", "Terms"].map((item) => (
              <button
                key={item}
                onClick={() => navigateToPage(item)}
                className="transition hover:text-blue-700"
              >
                {item}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400">Academic MVP prototype</p>
        </div>
      </footer>
    </div>
  );
}
