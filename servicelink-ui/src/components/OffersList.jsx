import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, Star, ArrowLeft, WalletCards, Clock3, BriefcaseBusiness } from "lucide-react";
import { getOffersForAd, getAllOffers } from "../api/customerWantedAdApi.js";

function OffersList({ go }) {
  const { id } = useParams();
  // FIX: guard against literal string "undefined" that can happen on bad navigation
  const publicId = (id && id !== "undefined") ? id : null;

  const [offers, setOffers] = useState([]);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError("");
    if (publicId) {
      getOffersForAd(publicId)
        .then((r) => {
          setOffers(r.data || []);
          setAd(r.ad || null);
        })
        .catch((e) => {
          setError(e?.message || "Failed to load offers for " + publicId);
        })
        .finally(() => setLoading(false));
    } else {
      getAllOffers()
        .then((r) => {
          setOffers(r.data || []);
          setAd(null);
        })
        .catch((e) => {
          setError(e?.message || "Failed to load all offers");
        })
        .finally(() => setLoading(false));
    }
  }, [publicId]);

  const filteredOffers = offers.filter((o) => {
    if (filter === "all") return true;
    return (o.status || "").toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <p className="font-bold text-slate-500">
          {publicId ? `Loading offers for ${publicId}...` : "Loading all offers received..."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {publicId ? (
        <button
          onClick={() => go(`/customer/wanted-ads/${publicId}`)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"
        >
          <ArrowLeft size={16} />Back to ad {publicId}
        </button>
      ) : (
        <button
          onClick={() => go("/customer/wanted-ads")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"
        >
          <ArrowLeft size={16} />Back to My Wanted Ads
        </button>
      )}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">
            {publicId ? `Offers for ${publicId}` : "Offers Received"}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            {publicId
              ? `Compare provider price, schedule, experience and terms before choosing one. For ${ad?.title || publicId}`
              : "All offers from approved providers across your wanted ads. Compare and accept the best one to create booking BK-xxx."}
          </p>
          {ad && (
            <p className="mt-2 text-sm font-bold text-violet-600">
              {ad.public_id} · {ad.title} · {ad.offers_count || offers.length} offers
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "submitted", "accepted", "declined"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${
              filter === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {filteredOffers.length === 0 ? (
          <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-10 text-center shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
            <p className="text-lg font-black">No offers in {filter}</p>
            <p className="mt-2 text-sm text-slate-500">
              {publicId
                ? "Approved providers will submit offers here."
                : "Post a wanted ad (WA-xxx) and providers will submit offers. You can also view offers via My Wanted Ad -> View offers."}
            </p>
            {!publicId && (
              <button
                onClick={() => go("/customer/wanted-ads/create")}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
              >
                Post your first wanted ad
              </button>
            )}
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div
              key={offer.public_id}
              className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 font-black text-white">
                  {offer.provider_name?.slice(0, 2).toUpperCase() || "PR"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">{offer.provider_name || "Provider"}</h3>
                    <BadgeCheck size={18} className="fill-blue-600 text-white" />
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                      <Star size={14} className="fill-current" />
                      {offer.provider_public_id || offer.provider_id}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                      offer.status === "submitted" ? "bg-violet-100 text-violet-700" :
                      offer.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                      offer.status === "declined" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {offer.wanted_ad_title ? `${offer.wanted_ad_title} · ` : ""}
                    {offer.wanted_ad_public_id || publicId || "Wanted ad"} · Expires {offer.expires_on ? new Date(offer.expires_on).toLocaleDateString() : "-"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
                    <span className="flex items-center gap-2"><WalletCards size={16} /> LKR {Number(offer.proposed_price || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-2"><Clock3 size={16} /> {offer.proposed_date} {String(offer.proposed_time || "").slice(0,5)}</span>
                    <span className="flex items-center gap-2"><BriefcaseBusiness size={16} /> {offer.duration_minutes || 0} mins</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (offer.public_id && offer.public_id !== "undefined") {
                      go(`/customer/offers/${offer.public_id}`);
                    }
                  }}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white"
                >
                  View offer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default OffersList;
