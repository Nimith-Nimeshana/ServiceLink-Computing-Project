import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, AlertTriangle } from "lucide-react";
import { getOfferDetails, acceptOffer, declineOffer } from "../api/customerWantedAdApi.js";

function OfferDetails({ go, showNotice }) {
  const { id } = useParams();
  const offerPublicId = (id && id !== "undefined") ? id : null;

  const [offer, setOffer] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!offerPublicId) {
      setError("Invalid offer id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    getOfferDetails(offerPublicId)
      .then(r=>setOffer(r.data))
      .catch((e)=>{
        const msg = e?.message || "Offer not found";
        setError(msg);
        // Only showNotice if it's a real id, not undefined ghost
        if (showNotice && offerPublicId) showNotice(msg);
      })
      .finally(()=>setLoading(false));
  }, [offerPublicId]);

  const isExpired = offer?.expires_on && new Date(offer.expires_on) < new Date();
  const isActionable = offer?.status === "submitted" && !isExpired;

  const handleAccept = async () => {
    if (!isActionable) { showNotice("This offer can no longer be accepted"); return; }
    setActionLoading(true);
    try {
      const res = await acceptOffer(offer.wanted_ad_public_id, offerPublicId, note);
      showNotice("Offer accepted, booking "+res.data.public_id+" created");
      go("/customer/bookings");
    } catch(e){ 
      showNotice(e.message||"Accept failed"); 
      if (e.message?.toLowerCase().includes("expired") || e.message?.toLowerCase().includes("not active")) {
        setOffer(prev=> prev ? {...prev, status: "expired"} : prev);
      }
    } finally { setActionLoading(false); setDecision(null); }
  };
  const handleDecline = async () => {
    if (!isActionable) { showNotice("This offer can no longer be declined"); return; }
    setActionLoading(true);
    try {
      await declineOffer(offer.wanted_ad_public_id, offerPublicId, note);
      showNotice("Offer declined");
      go(`/customer/wanted-ads/${offer.wanted_ad_public_id}/offers`);
    } catch(e){ showNotice(e.message||"Decline failed"); }
    finally { setActionLoading(false); setDecision(null); }
  };

  if (loading) return <div className="rounded-[1.7rem] border bg-white/70 p-8">Loading offer {offerPublicId || ""} from database...</div>;
  if (error || !offer) {
    return (
      <div className="space-y-6">
        <button onClick={() => go("/customer/offers")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to offers</button>
        <div className="rounded-[1.7rem] border border-rose-200 bg-rose-50/70 p-8 text-center">
          <p className="text-lg font-black text-rose-800">{error || "Offer not found"}</p>
          <p className="mt-2 text-sm text-rose-600">Offer {offerPublicId} may have been withdrawn, expired, or you do not own the parent wanted ad.</p>
          <button onClick={() => go("/customer/offers")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Back to offers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => go("/customer/offers")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to offers</button>
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div><div className="flex items-center gap-2"><h2 className="text-3xl font-black">{offer.provider_name}</h2><BadgeCheck size={21} className="fill-blue-600 text-white" /></div><p className="mt-2 text-slate-500">Offer {offer.public_id} for wanted ad {offer.wanted_ad_public_id} - {offer.wanted_ad_title}</p></div>
          <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-extrabold capitalize ${offer.status==="submitted" ? "bg-violet-100 text-violet-700" : offer.status==="accepted" ? "bg-emerald-100 text-emerald-700" : offer.status==="declined" ? "bg-rose-100 text-rose-700" : "bg-slate-100"}`}>{offer.status}{isExpired ? " · expired" : ""}</span>
        </div>

        {!isActionable && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            <AlertTriangle size={18} className="shrink-0" />
            <span>
              {isExpired ? `This offer expired on ${new Date(offer.expires_on).toLocaleDateString()} and can no longer be accepted.` : 
               offer.status === "accepted" ? "This offer was already accepted. Booking created. Check My Bookings." :
               offer.status === "declined" ? "This offer was declined." :
               offer.status === "withdrawn" ? "Provider withdrew this offer." :
               "This offer is no longer actionable."}
            </span>
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Proposed price</p><p className="mt-1 font-bold">LKR {offer.proposed_price}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Schedule</p><p className="mt-1 font-bold">{offer.proposed_date} {offer.proposed_time}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Duration</p><p className="mt-1 font-bold">{offer.duration_minutes} mins</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Expires</p><p className="mt-1 font-bold">{offer.expires_on ? new Date(offer.expires_on).toLocaleDateString() : "-"}</p></div>
        </div>

        <p className="mt-6 leading-7 text-slate-600">{offer.message}</p>
        {offer.terms && <p className="mt-3 text-sm text-slate-500">Terms: {offer.terms}</p>}

        <div className="mt-6">
          <label className="block text-sm font-extrabold">Your note (optional)</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note for provider..." className="mt-2 w-full rounded-2xl border bg-white p-4 text-sm" rows={3} />
        </div>

        {isActionable && (
          <div className="mt-7 flex gap-3">
            {!decision && (
              <>
                <button onClick={()=>setDecision("accept")} className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Accept offer</button>
                <button onClick={()=>setDecision("decline")} className="flex-1 rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Decline</button>
              </>
            )}
            {decision==="accept" && (
              <div className="flex w-full gap-3">
                <button disabled={actionLoading} onClick={handleAccept} className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white">{actionLoading ? "Accepting..." : "Confirm Accept"}</button>
                <button onClick={()=>setDecision(null)} className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold">Cancel</button>
              </div>
            )}
            {decision==="decline" && (
              <div className="flex w-full gap-3">
                <button disabled={actionLoading} onClick={handleDecline} className="flex-1 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white">{actionLoading ? "Declining..." : "Confirm Decline"}</button>
                <button onClick={()=>setDecision(null)} className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default OfferDetails;
