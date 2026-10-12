import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Clock3 } from "lucide-react";
import { getComplaint } from "../api/customerComplaintApi.js";

// Complaint details CP-xxx with timeline of admin responses

function CustomerComplaintDetails({ go }) {
  const { id } = useParams();
  const publicId = id;
  const [complaint, setComplaint] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getComplaint(publicId)
      .then((r) => {
        setComplaint(r.data);
        setResponses(r.responses || []);
      })
      .catch((e) => setError(e?.message || "Not found"))
      .finally(() => setLoading(false));
  }, [publicId]);

  if (loading) return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Loading {publicId}...</p></div>;

  if (error || !complaint) {
    return (
      <div className="space-y-6">
        <button onClick={() => go("/customer/complaints")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to complaints</button>
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 text-center"><p className="text-lg font-black">Complaint {publicId} not available</p><p className="mt-2 text-sm text-slate-500">{error}</p></div>
      </div>
    );
  }

  const badgeColor = (status) => {
    const s = (status||"").toLowerCase();
    if (s.includes("resolved") || s.includes("closed")) return "bg-emerald-100 text-emerald-700";
    if (s.includes("review") || s.includes("pending")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <button onClick={() => go("/customer/complaints")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to complaints</button>

      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-bold text-amber-600">{complaint.public_id} · {complaint.category || "general"} · {complaint.booking_public_id || "No booking"}</p>
            <h2 className="mt-1 text-3xl font-black">{complaint.subject}</h2>
            <p className="mt-1 text-xs text-slate-400">Created {new Date(complaint.created_at).toLocaleString()} {complaint.booking_title ? `· ${complaint.booking_title}` : ""}</p>
          </div>
          <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-extrabold capitalize ${badgeColor(complaint.status)}`}>{(complaint.status||"").replace("_"," ")}</span>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Description</p>
          <p className="mt-2 leading-7 text-slate-700">{complaint.description}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Booking</p><p className="mt-1 font-bold">{complaint.booking_public_id || "—"}</p><p className="text-xs text-slate-500 mt-1">{complaint.booking_title || "No booking linked"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Provider</p><p className="mt-1 font-bold">{complaint.provider_name || "—"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">Status</p><p className="mt-1 font-bold capitalize">{(complaint.status||"").replace("_"," ")}</p><p className="text-xs text-slate-500 mt-1">Admin will update here</p></div>
        </div>

        {/* Responses timeline */}
        <div className="mt-8">
          <h3 className="font-black">Admin responses</h3>
          {responses.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              No admin response yet. Your complaint is <b>{complaint.status.replace("_"," ")}</b>. Administrator will review and respond here.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {responses.map((r, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Clock3 size={12} />{new Date(r.created_at).toLocaleString()} · {r.admin_name || "Admin"}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{r.message || r.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerComplaintDetails;
