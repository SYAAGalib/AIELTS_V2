import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Headphones, BookOpen, PenLine, Mic, HelpCircle, X, ChevronUp, ChevronDown } from "lucide-react";
import {
  adminListModules, adminUpsertModule, adminDeleteModule, type Module,
  adminListQuestions, type Question,
  adminListModuleQuestions, adminAddQuestionToModule, adminRemoveQuestionFromModule, 
  adminUpdateModuleQuestionPosition, type ModuleQuestion,
} from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/modules")({
  head: () => ({ meta: [{ title: "Modules — AIELTS Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ModulesPage,
});

const ICONS = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic } as const;

const EMPTY: Partial<Module> = {
  slug: "", title: "", skill: "listening", summary: "", icon: "", position: 0, status: "draft",
};

function ModulesPage() {
  const list = useServerFn(adminListModules);
  const upsert = useServerFn(adminUpsertModule);
  const del = useServerFn(adminDeleteModule);
  const listQuestions = useServerFn(adminListQuestions);
  const listModuleQuestions = useServerFn(adminListModuleQuestions);
  const addQuestionToModule = useServerFn(adminAddQuestionToModule);
  const removeQuestionFromModule = useServerFn(adminRemoveQuestionFromModule);
  const updateQuestionPosition = useServerFn(adminUpdateModuleQuestionPosition);
  
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-modules"], queryFn: () => list() });
  const { data: allQuestions = [] } = useQuery({ queryKey: ["admin-questions"], queryFn: () => listQuestions() });
  
  const [form, setForm] = useState<Partial<Module>>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const { data: moduleQuestions = [], isLoading: loadingModuleQuestions } = useQuery({
    queryKey: ["module-questions", selectedModule?.id],
    queryFn: () => selectedModule ? listModuleQuestions({ data: { moduleId: selectedModule.id } }) : Promise.resolve([]),
    enabled: !!selectedModule,
  });

  async function save() {
    if (!form.slug || !form.title) { toast.error("Slug and title required"); return; }
    setBusy(true);
    try {
      await upsert({ data: {
        id: form.id, slug: form.slug!, title: form.title!, skill: form.skill as any,
        summary: form.summary || null, icon: form.icon || null,
        position: Number(form.position ?? 0), status: form.status as any,
      }});
      toast.success(form.id ? "Updated" : "Created");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-modules"] });
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }
  
  async function remove(id: string) {
    if (!confirm("Delete this module?")) return;
    await del({ data: { id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-modules"] });
    if (selectedModule?.id === id) setSelectedModule(null);
  }

  async function addQuestion(questionId: string) {
    if (!selectedModule) return;
    try {
      await addQuestionToModule({ data: { moduleId: selectedModule.id, questionId } });
      toast.success("Question added to module");
      qc.invalidateQueries({ queryKey: ["module-questions", selectedModule.id] });
      setShowAddQuestion(false);
    } catch (e: any) { toast.error(e.message ?? "Failed to add question"); }
  }

  async function removeQuestion(mqId: string) {
    if (!selectedModule) return;
    try {
      await removeQuestionFromModule({ data: { id: mqId } });
      toast.success("Question removed from module");
      qc.invalidateQueries({ queryKey: ["module-questions", selectedModule.id] });
    } catch (e: any) { toast.error(e.message ?? "Failed to remove question"); }
  }

  async function moveQuestion(mqId: string, currentPos: number, direction: "up" | "down") {
    if (!selectedModule) return;
    const newPos = direction === "up" ? currentPos - 1 : currentPos + 1;
    if (newPos < 0) return;
    try {
      await updateQuestionPosition({ data: { id: mqId, position: newPos } });
      qc.invalidateQueries({ queryKey: ["module-questions", selectedModule.id] });
    } catch (e: any) { toast.error(e.message ?? "Failed to reorder"); }
  }

  const availableQuestions = allQuestions.filter(q => 
    !moduleQuestions.some(mq => mq.question_id === q.id) &&
    q.skill === selectedModule?.skill
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">IELTS</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Modules</h2>
          <p className="text-sm text-white/50">Manage practice modules and assign questions.</p>
        </div>
        <Link to="/admin/questions" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
          <HelpCircle className="h-4 w-4" /> Question bank
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
          {form.id ? "Edit module" : "Add module"}
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Slug" value={form.slug ?? ""} onChange={(v) => setForm({ ...form, slug: v })} />
          <Field label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
          <Select label="Skill" value={form.skill ?? "listening"} onChange={(v) => setForm({ ...form, skill: v as any })}
            options={["listening","reading","writing","speaking"]} />
          <Select label="Status" value={form.status ?? "draft"} onChange={(v) => setForm({ ...form, status: v as any })}
            options={["draft","published","archived"]} />
          <Field label="Icon (lucide name)" value={form.icon ?? ""} onChange={(v) => setForm({ ...form, icon: v })} />
          <Field label="Position" type="number" value={String(form.position ?? 0)} onChange={(v) => setForm({ ...form, position: Number(v) })} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/70">Summary</label>
            <textarea rows={3} value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-[var(--teal)]" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold disabled:opacity-60">
            <Plus className="h-4 w-4" /> {busy ? "Saving…" : form.id ? "Save" : "Add module"}
          </button>
          {form.id && <button onClick={() => setForm(EMPTY)} className="rounded-lg border border-white/15 px-4 py-2 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Modules List */}
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-wider text-white/60">
            All modules ({data.length})
          </div>
          {isLoading ? <p className="p-6 text-sm text-white/60">Loading…</p> :
           data.length === 0 ? <p className="p-6 text-sm text-white/60">No modules yet. Add your first above.</p> : (
            <ul className="divide-y divide-white/5">
              {data.map((m) => {
                const Icon = ICONS[m.skill as keyof typeof ICONS] ?? Headphones;
                const isSelected = selectedModule?.id === m.id;
                return (
                  <li key={m.id} className={`flex items-center justify-between gap-4 p-4 cursor-pointer transition-colors ${isSelected ? "bg-white/10" : "hover:bg-white/5"}`}
                    onClick={() => setSelectedModule(m)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-10 w-10 place-items-center rounded-lg gradient-brand"><Icon className="h-5 w-5" /></span>
                      <div className="min-w-0">
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-xs text-white/50">{m.skill} · {m.slug} {m.status !== "published" && `· ${m.status}`}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setForm(m)} className="rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10">
                        <Edit3 className="h-3 w-3 inline mr-1" />Edit
                      </button>
                      <button onClick={() => remove(m.id)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-3 w-3 inline mr-1" />Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Module Questions */}
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                {selectedModule ? `${selectedModule.title} Questions` : "Select a module"}
              </h3>
              {selectedModule && (
                <button onClick={() => setShowAddQuestion(!showAddQuestion)}
                  className="flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs hover:bg-white/10">
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
            </div>
          </div>

          {!selectedModule ? (
            <p className="p-6 text-sm text-white/60 text-center">← Select a module to manage its questions</p>
          ) : loadingModuleQuestions ? (
            <p className="p-6 text-sm text-white/60">Loading questions…</p>
          ) : (
            <div className="p-4 space-y-4">
              {showAddQuestion && (
                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Add Question</h4>
                    <button onClick={() => setShowAddQuestion(false)} className="text-white/40 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableQuestions.length === 0 ? (
                      <p className="text-xs text-white/50">No available {selectedModule.skill} questions. Create questions first.</p>
                    ) : (
                      availableQuestions.map(q => (
                        <div key={q.id} 
                          className="flex items-start justify-between gap-2 p-2 rounded border border-white/10 hover:bg-white/5 cursor-pointer"
                          onClick={() => addQuestion(q.id)}>
                          <div className="min-w-0">
                            <p className="text-xs font-medium line-clamp-2">{q.prompt}</p>
                            <p className="text-xs text-white/40 mt-1">{q.type} · Difficulty: {q.difficulty}</p>
                          </div>
                          <Plus className="h-4 w-4 shrink-0 text-teal-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {moduleQuestions.length === 0 ? (
                <p className="text-sm text-white/60 text-center py-8">No questions in this module yet.</p>
              ) : (
                <div className="space-y-2">
                  {moduleQuestions.map((mq, idx) => (
                    <div key={mq.id} className="flex items-start gap-2 p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveQuestion(mq.id, mq.position, "up")}
                          disabled={idx === 0}
                          className="text-white/40 hover:text-white disabled:opacity-30">
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => moveQuestion(mq.id, mq.position, "down")}
                          disabled={idx === moduleQuestions.length - 1}
                          className="text-white/40 hover:text-white disabled:opacity-30">
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium line-clamp-2">{(mq as any).question?.prompt}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {(mq as any).question?.type} · Difficulty: {(mq as any).question?.difficulty} · Position: {mq.position}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeQuestion(mq.id)}
                        className="shrink-0 text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--teal)]">
        {options.map((o) => <option key={o} value={o} className="bg-[#0B1224]">{o}</option>)}
      </select>
    </div>
  );
}
