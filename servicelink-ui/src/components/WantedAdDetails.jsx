import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getWantedAd, closeWantedAd } from "../api/customerWantedAdApi.js";

function WantedAdDetails({ go, showNotice }) {
  const { id } = useParams();
  const publicId = id;
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await getWantedAd(publicId);
      setAd(r.data);
    } catch (e) {
      // Local error only, no global notice that leaks to dashboard
      const msg = e?.message || "Ad not found";
      setError(msg);
      setAd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [publicId]);

  const handleClose = async () => {
    if(!confirm(`Close ${publicId}? This will set status to closed.`)) return;
    try {
      await closeWantedAd(publicId);
      showNotice("Wanted ad closed");
      go("/customer/wanted-ads");
    } catch(e){
      showNotice(e.message||"Failed to close");
    }
  };

  if (loading) return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Loading {publicId}...</p></div>;

  if (error || !ad) {
    return (
      <div className="space-y-6">
        <button onClick={() => go("/customer/wanted-ads")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600">
          <ArrowLeft size={16} />Back to wanted ads
        </button>
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl text-center">
          <p className="text-lg font-black">Ad {publicId} not available</p>
          <p className="mt-2 text-sm text-slate-500">{error || "It may have been closed or you are not the owner."}</p>
          <button onClick={() => go("/customer/wanted-ads")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Go to My Wanted Ads</button>
        </div>
      </div>
    );
  }

  const isClosed = ad.status === "closed" || ad.status === "expired";
  const budget = ad.budget_type === "negotiable" ? "Negotiable" : ad.budget_type === "range" ? `LKR ${Number(ad.budget_min).toLocaleString()} - ${Number(ad.budget_max).toLocaleString()}` : `LKR ${Number(ad.budget_min || ad.budget_max).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <button onClick={() => go("/customer/wanted-ads")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600">
        <ArrowLeft size={16} />Back to wanted ads
      </button>

      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-bold text-violet-600">{ad.public_id} · {ad.category_name || `Category #${ad.category_id}`}</p>
            <h2 className="mt-1 text-3xl font-black">{ad.title}</h2>
            <p className="mt-1 text-xs text-slate-400">Created {ad.created_at ? new Date(ad.created_at).toLocaleString() : ""}</p>
          </div>
          <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-extrabold capitalize ${ad.status==="active" ? "bg-blue-100 text-blue-700" : ad.status==="offer_accepted" ? "bg-emerald-100 text-emerald-700" : ad.status==="closed" ? "bg-slate-200 text-slate-600" : ad.status==="expired" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{(ad.status||"").replace("_"," ")}</span>
        </div>

        {isClosed && (
          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm font-bold text-amber-800">
            This ad is {ad.status}. You cannot edit it, but you can still view offers received before closure.
          </div>
        )}

        <p className="mt-6 leading-7 text-slate-600">{ad.description}</p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Location</p><p className="mt-1 font-bold">{ad.district}</p><p className="text-xs text-slate-500 mt-1">{ad.exact_address || "No exact address"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Budget</p><p className="mt-1 font-bold">{budget}</p><p className="text-xs text-slate-500 mt-1">{ad.budget_type} · {ad.offers_count||0} offers</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Dates</p><p className="mt-1 font-bold">Deadline: {ad.offer_deadline ? new Date(ad.offer_deadline).toLocaleDateString() : "-"}</p><p className="text-xs text-slate-500 mt-1">Preferred: {ad.preferred_date ? new Date(ad.preferred_date).toLocaleDateString() : "-"}</p></div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => go(`/customer/wanted-ads/${ad.public_id}/offers`)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Compare {ad.offers_count||0} offers</button>
          {!isClosed && ad.status !== "offer_accepted" && (
            <>
              <button onClick={() => go(`/customer/wanted-ads/${ad.public_id}/edit`)} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold">Edit ad</button>
              <button onClick={handleClose} className="rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Close ad</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default WantedAdDetails;
