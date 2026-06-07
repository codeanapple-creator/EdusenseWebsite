import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import DatePicker from "./DatePicker";
import { Baby, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function ChildrenManager({ onChildrenChange }) {
  const [children, setChildren] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", date_of_birth: "", grade: "", age: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/children");
      setChildren(data);
      onChildrenChange?.(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => { setForm({ name: "", date_of_birth: "", grade: "", age: "", notes: "" }); setEditing(null); };
  const openAdd = () => { reset(); setOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      date_of_birth: c.date_of_birth || "",
      grade: c.grade || "",
      age: c.age != null ? String(c.age) : "",
      notes: c.notes || "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      name: form.name,
      date_of_birth: form.date_of_birth || null,
      grade: form.grade || null,
      age: form.age ? Number(form.age) : null,
      notes: form.notes || null,
    };
    try {
      if (editing) {
        await api.patch(`/children/${editing.id}`, body);
        toast.success("Child updated");
      } else {
        await api.post("/children", body);
        toast.success("Child added");
      }
      setOpen(false);
      reset();
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/children/${id}`);
      toast.success("Child removed");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
  };

  return (
    <Card className="rounded-3xl p-7 bg-white border-slate-100" data-testid="children-manager-card">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
            <Baby className="text-pink-600" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">My children</h2>
            <p className="text-sm text-slate-500">Add multiple children to track niche & sentiment per child.</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="rounded-full bg-[#f97316] hover:bg-[#ea580c] font-bold px-5 btn-lift" data-testid="add-child-btn">
              <Plus size={16} strokeWidth={2.5} className="mr-1.5" /> Add child
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="child-dialog">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit child" : "Add a child"}</DialogTitle>
              <DialogDescription>Track niche, sentiment and recommendations per child.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" data-testid="child-name-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Date of birth</Label>
                  <DatePicker
                    value={form.date_of_birth}
                    onChange={(v) => setForm({ ...form, date_of_birth: v })}
                    placeholder="Pick DOB"
                    testid="child-dob-input"
                    fromYear={2005}
                    toYear={new Date().getFullYear()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Age</Label>
                  <Input type="number" min={0} max={25} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="rounded-xl" data-testid="child-age-input" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Grade</Label>
                <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="rounded-xl" placeholder="e.g., 4B" data-testid="child-grade-input" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest font-bold text-slate-500">Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" data-testid="child-notes-input" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting} className="rounded-full bg-[#f97316] hover:bg-[#ea580c] font-bold" data-testid="child-save-btn">
                  {submitting ? "Saving…" : editing ? "Save" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {children.length === 0 ? (
        <div className="text-center text-slate-500 py-8">No children added yet - tap "Add child" to start.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="children-list">
          {children.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 p-4 bg-white/40" data-testid={`child-card-${c.id}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-bold text-slate-900">{c.name}</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="rounded-full" data-testid={`child-edit-${c.id}`}>
                    <Pencil size={14} className="text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(c.id)} className="rounded-full" data-testid={`child-delete-${c.id}`}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {c.grade && <Badge className="rounded-full bg-orange-100 text-[#f97316] border-orange-200 font-bold">Grade {c.grade}</Badge>}
                {c.age != null && <Badge className="rounded-full bg-orange-100 text-orange-700 border-orange-200 font-bold">{c.age} yrs</Badge>}
                {c.date_of_birth && <Badge className="rounded-full bg-[#0a1f5c]/10 text-[#0a1f5c] border-[#0a1f5c]/20 font-bold">DOB {c.date_of_birth}</Badge>}
              </div>
              {c.notes && <p className="text-xs text-slate-600 mt-2">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
