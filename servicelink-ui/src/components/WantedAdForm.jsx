import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createWantedAd, updateWantedAd, getWantedAd, getActiveCategories } from "../api/customerWantedAdApi.js";

function WantedAdForm({ mode = "create", go, showNotice }) {
  const { id } = useParams();
  const editPublicId = mode === "edit" ? id : null;
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    district: "Anuradhapura",
    exact_address: "",
    budget_type: "range",
    budget_min: 8000,
    budget_max: 12000,
    preferred_date: "",
    offer_deadline: "",
    description: "",
  });

  useEffect(() => {
    getActiveCategories()
      .then((r) => setCats(r.data))
      .catch(() => {
        setCats([
          { id: 1, name: "Electrical" },
          { id: 2, name: "Plumbing" },
          { id: 3, name: "Computer Repair" },
          { id: 4, name: "Home Maintenance" },
          { id: 5, name: "Tutoring" },
          { id: 6, name: "Photography" },
        ]);
      });
  }, []);

  useEffect(() => {
    if (mode === "edit" && editPublicId) {
      setInitialLoading(true);
      setLocalError("");
      getWantedAd(editPublicId)
        .then((res) => {
          const ad = res.data;
          if (ad.status === "closed" || ad.status === "expired" || ad.status === "offer_accepted") {
            setLocalError(`This ad is ${ad.status} and cannot be edited.`);
          }
          setForm({
            title: ad.title || "",
            category_id: ad.category_id || "",
            district: ad.district || "Anuradhapura",
            exact_address: ad.exact_address || "",
            budget_type: ad.budget_type || "range",
            budget_min: ad.budget_min || 8000,
            budget_max: ad.budget_max || 12000,
            preferred_date: ad.preferred_date ? ad.preferred_date.substring(0,10) : "",
            offer_deadline: ad.offer_deadline ? ad.offer_deadline.substring(0,10) : "",
            description: ad.description || "",
          });
        })
        .catch((e) => {
          setLocalError(e?.message || "Failed to load ad for editing");
        })
        .finally(() => setInitialLoading(false));
    }
  }, [mode, editPublicId]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleBudgetTypeChange = (type) => {
    setForm((s) => {
      // Keep values but adapt: if switching to fixed, set max = min; if negotiable, clear budgets for payload
      if (type === "fixed") {
        return { ...s, budget_type: type, budget_max: s.budget_min || s.budget_max || 8000 };
      }
      if (type === "negotiable") {
        return { ...s, budget_type: type };
      }
      return { ...s, budget_type: type };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      // Build payload per Shared Standard - only send relevant budget fields
      let payload = { ...form };
      if (payload.budget_type === "fixed") {
        payload.budget_max = payload.budget_min; // fixed = single value, store in min and copy to max for consistency
      }
      if (payload.budget_type === "negotiable") {
        payload.budget_min = null;
        payload.budget_max = null;
      }
      if (payload.budget_type === "range" && Number(payload.budget_min) > Number(payload.budget_max)) {
        throw { message: "Minimum budget cannot be greater than maximum", errors: { budget_max: ["Min > Max"] } };
      }

      if (mode === "edit") {
        const res = await updateWantedAd(editPublicId, payload);
        showNotice("Wanted ad updated: " + res.data.public_id);
      } else {
        const res = await createWantedAd(payload);
        showNotice("Wanted ad published: " + res.data.public_id);
      }
      go("/customer/wanted-ads");
    } catch (err) {
      setErrors(err.errors || {});
      showNotice(err.message || "Please correct the highlighted fields.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Loading ad {editPublicId}...</p></div>;
  }

  if (localError) {
    return (
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl shadow-[0_18px_55px_rgba(39,75,120,0.09)] text-center">
        <p className="text-lg font-black">Cannot edit</p>
        <p className="mt-2 text-sm text-slate-500">{localError}</p>
        <button onClick={() => go("/customer/wanted-ads")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Back to My Wanted Ads</button>
      </div>
    );
  }

  return (
    <div className="rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl p-6 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">{mode === "edit" ? "Edit Wanted Ad" : "Post a Wanted Ad"}</h2>
          <p className="mt-2 max-w-2xl text-slate-500">{mode === "edit" ? `Editing ${editPublicId} - Budget fields adapt to type` : "Describe the work clearly so providers can submit accurate offers."}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Advertisement title</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Example: Repair bedroom air conditioner" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            {errors.title && <span className="mt-1.5 block text-xs text-rose-600">{errors.title[0]}</span>}
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">Category</span>
          <span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4">
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">
              <option value="">Select category</option>
              {cats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </span>
          {errors.category_id && <span className="mt-1.5 block text-xs text-rose-600">{errors.category_id[0]}</span>}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">General location (district)</span>
          <input value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="Anuradhapura" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
          {errors.district && <span className="mt-1.5 block text-xs text-rose-600">{errors.district[0]}</span>}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">Exact address (private)</span>
          <input value={form.exact_address} onChange={(e) => set("exact_address", e.target.value)} placeholder="House no, street" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">Budget type</span>
          <span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4">
            <select value={form.budget_type} onChange={(e) => handleBudgetTypeChange(e.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">
              <option value="fixed">Fixed - Single price</option>
              <option value="range">Range - Min to Max</option>
              <option value="negotiable">Negotiable - Let providers quote</option>
            </select>
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">Preferred date</span>
          <input type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-800">Offer deadline *</span>
          <input type="date" value={form.offer_deadline} onChange={(e) => set("offer_deadline", e.target.value)} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" required />
          {errors.offer_deadline && <span className="mt-1.5 block text-xs text-rose-600">{errors.offer_deadline[0]}</span>}
        </label>

        {/* Adaptive budget boxes */}
        {form.budget_type === "fixed" && (
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Fixed budget (LKR)</span>
            <input type="number" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)} placeholder="e.g. 10000" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            <span className="mt-1.5 block text-xs text-slate-500">Single agreed amount - no range needed</span>
            {errors.budget_min && <span className="mt-1.5 block text-xs text-rose-600">{errors.budget_min[0]}</span>}
          </label>
        )}

        {form.budget_type === "range" && (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-800">Minimum budget (LKR)</span>
              <input type="number" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)} placeholder="8000" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
              {errors.budget_min && <span className="mt-1.5 block text-xs text-rose-600">{errors.budget_min[0]}</span>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-800">Maximum budget (LKR)</span>
              <input type="number" value={form.budget_max} onChange={(e) => set("budget_max", e.target.value)} placeholder="12000" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
              {errors.budget_max && <span className="mt-1.5 block text-xs text-rose-600">{errors.budget_max[0]}</span>}
            </label>
          </>
        )}

        {form.budget_type === "negotiable" && (
          <div className="sm:col-span-2 rounded-2xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-extrabold text-blue-800">Negotiable budget selected</p>
            <p className="mt-1 text-xs text-blue-600">No amount needed now. Providers will propose their own price in offers and you can compare.</p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Detailed description</span>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Explain the issue, expected outcome and important conditions" className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            {errors.description && <span className="mt-1.5 block text-xs text-rose-600">{errors.description[0]}</span>}
          </label>
        </div>

        <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => go("/customer/wanted-ads")} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60">
            {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Publish wanted ad"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default WantedAdForm;