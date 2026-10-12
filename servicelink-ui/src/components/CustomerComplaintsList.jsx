import React, { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Clock3, BriefcaseBusiness } from "lucide-react";
import { getMyComplaints } from "../api/customerComplaintApi.js";

// complaints list from DB
// Shows status under_review / resolved with booking link

function CustomerComplaintsList({ go }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, under_review, resolved

  useEffect(() => {
    setLoading(true);
    getMyComplaints()
      .then((r) => setComplaints(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    if (filter === "all") return true;
    return (c.status || "").toLowerCase().replace("_"," ") === filter.toLowerCase();
  });

  const badgeColor = (status) => {
    const s = (status||"").toLowerCase();
    if (s.includes("resolved") || s.includes("closed")) return "bg-emerald-100 text-emerald-700";
    if (s.includes("review") || s.includes("pending")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Loading your complaints from database...</p></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">My Complaints</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Track submitted issues and administrator responses. Real data from DB - linked to BK-xxx bookings.</p>
        </div>
        <button onClick={() => go("/customer/complaints/create")} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Submit complaint</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {["all","under review","resolved"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${filter===item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>{item}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-10 text-center shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={24} /></div>
            <p className="mt-4 text-lg font-black">No complaints in {filter}</p>
            <p className="mt-2 text-sm text-slate-500">Your complaints CP-xxx will appear here from database. Link to a booking BK-xxx for faster resolution.</p>
            <button onClick={() => go("/customer/complaints/create")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Submit your first complaint</button>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.public_id} className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={21} /></span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black truncate">{c.subject}</h3>
                  <p className="mt-1 text-sm text-slate-500">{c.public_id} · {c.booking_public_id || "No booking"} · {new Date(c.created_at).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{c.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    {c.booking_title && <span className="flex items-center gap-1"><BriefcaseBusiness size={12} />{c.booking_title}</span>}
                    <span className="flex items-center gap-1"><Clock3 size={12} />{c.category || "general"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${badgeColor(c.status)}`}>{(c.status||"").replace("_"," ")}</span>
                  <button onClick={() => go(`/customer/complaints/${c.public_id}`)} className="rounded-xl bg-slate-100 p-2"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerComplaintsList;
