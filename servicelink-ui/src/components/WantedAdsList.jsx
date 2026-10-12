import React, { useEffect, useState, useMemo } from "react";
import { BriefcaseBusiness, MapPin, Clock3, WalletCards, MessageSquareText } from "lucide-react";
import { getCustomerWantedAds } from "../api/customerWantedAdApi.js";

// Keeps your exact UI: GlassPanel, StatusBadge, FilterTabs, PageLead styles

function WantedAdsList({ go }) {
  const [ads, setAds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCustomerWantedAds()
      .then((res) => setAds(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAds = useMemo(() => {
    if (filter === "all") return ads;
    // normalize both your old demo values and standard values
    return ads.filter((a) => {
      const s = (a.status || "").toLowerCase();
      if (filter === "active") return s === "active";
      if (filter === "offer accepted") return s === "offer_accepted" || s === "offer accepted";
      if (filter === "expired") return s === "expired";
      if (filter === "closed") return s === "closed";
      return s === filter;
    });
  }, [ads, filter]);

  const formatBudget = (ad) => {
    if (ad.budget_type === "negotiable") return "Negotiable";
    if (ad.budget_type === "range" && ad.budget_min && ad.budget_max) {
      return `LKR ${Number(ad.budget_min).toLocaleString()} - ${Number(ad.budget_max).toLocaleString()}`;
    }
    if (ad.budget_min) return `LKR ${Number(ad.budget_min).toLocaleString()}`;
    if (ad.budget_display) return ad.budget_display;
    return ad.budget_type || "—";
  };

  const formatDeadline = (ad) => {
    const d = ad.offer_deadline || ad.deadline_display || ad.deadline;
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  if (loading) {
    return (
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <p className="font-bold text-slate-500">Loading your wanted ads...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">My Wanted Ads</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Publish work requests and compare offers from approved providers.</p>
        </div>
        <button onClick={() => go("/customer/wanted-ads/create")} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">
          Post wanted ad
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all","active","offer accepted","expired","closed"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${filter === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{item}</button>
        ))}
      </div>

      {filteredAds.length === 0 ? (
        <div className="mt-5 rounded-[1.7rem] border border-white/90 bg-white/70 p-10 text-center shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
          <p className="text-lg font-black">No wanted ads in {filter}</p>
          <p className="mt-2 text-sm text-slate-500">Your published ads will appear here from the database.</p>
          <button onClick={() => go("/customer/wanted-ads/create")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Post your first wanted ad</button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {filteredAds.map((ad) => (
            <div key={ad.public_id || ad.id} className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <BriefcaseBusiness size={21} />
                </span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${ad.status === "active" ? "bg-blue-100 text-blue-700" : ad.status === "offer_accepted" ? "bg-emerald-100 text-emerald-700" : ad.status === "expired" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-600"}`}>
                  {(ad.status || "").replace("_"," ")}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black">{ad.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{ad.public_id} · {ad.category_name || ad.category_id}</p>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                <span className="flex gap-2"><MapPin size={16} />{ad.district || ad.location}</span>
                <span className="flex gap-2"><Clock3 size={16} />{formatDeadline(ad)}</span>
                <span className="flex gap-2"><WalletCards size={16} />{formatBudget(ad)}</span>
                <span className="flex gap-2"><MessageSquareText size={16} />{ad.offers_count ?? ad.offers ?? 0} offers</span>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={() => go(`/customer/wanted-ads/${ad.public_id}`)} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white">Manage ad</button>
                {ad.status === "active" && (
                  <button onClick={() => go(`/customer/wanted-ads/${ad.public_id}/offers`)} className="flex-1 rounded-xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-700">View offers</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WantedAdsList;
