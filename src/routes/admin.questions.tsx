import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, type ElementType, type ReactNode, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, Eye, Upload, Image as ImageIcon, Music,
  ChevronDown, HelpCircle, BookOpen, Headphones, PenLine, Mic, Layers, X,
  List, Loader2,
} from "lucide-react";
import {
  adminListModules,
  adminListModuleQuestions,
  adminListQuestions,
  adminAddQuestionToModule,
  adminUpsertQuestion,
  adminDeleteQuestion,
  adminCreateMediaUploadUrl,
  type ModuleQuestion,
  type Question,
} from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank — AIELTS Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuestionsPage,
});

// ─── Constants ───────────────────────────────────────────────────────────────

type Skill = "listening" | "reading" | "writing" | "speaking";

const SKILL_LABEL: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

const ICONS: Record<Skill, ElementType> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

const PARTS: Record<string, string[]> = {
  Listening: ["Section 1", "Section 2", "Section 3", "Section 4"],
  Reading: ["Passage 1", "Passage 2", "Passage 3"],
  Writing: ["Task 1 (Academic)", "Task 1 (General)", "Task 2"],
  Speaking: ["Part 1", "Part 2 (Cue card)", "Part 3"],
};

const Q_TYPES: Record<string, string[]> = {
  Listening: [
    "Multiple Choice",
    "Matching",
    "Plan/Map/Diagram Labeling",
    "Form Completion",
    "Sentence Completion",
    "Short Answer",
  ],
  Reading: [
    "Multiple Choice",
    "True/False/Not Given",
    "Yes/No/Not Given",
    "Matching Headings",
    "Matching Information",
    "Matching Features",
    "Matching Sentence Endings",
    "Sentence Completion",
    "Summary/Table/Flowchart Completion",
    "Short Answer",
  ],
  Writing: [
    "Task 1 Academic (chart/graph/process)",
    "Task 1 General (letter)",
    "Task 2 Essay (opinion/discussion/problem-solution)",
  ],
  Speaking: [
    "Part 1 — General question",
    "Part 2 — Cue card",
    "Part 3 — Discussion question",
  ],
};

function defaultOptionsForType(type: string): string[] {
  if (type.includes("True/False/Not Given")) return ["True", "False", "Not Given"];
  if (type.includes("Yes/No/Not Given")) return ["Yes", "No", "Not Given"];
  return [];
}

// ─── Draft type ──────────────────────────────────────────────────────────────

type QuestionDraft = {
  id?: string;
  skill: Skill;
  type: string;
  part: string;
  prompt: string;
  options: string[];
  bulletPoints: string[];
  answer: string;
  explanation: string;
  difficulty: number;
  status: "draft" | "published" | "archived";
  media?: { kind: "audio" | "image"; name: string; url?: string };
};

function emptyDraft(skill: Skill): QuestionDraft {
  const label = SKILL_LABEL[skill];
  return {
    skill,
    type: Q_TYPES[label][0],
    part: PARTS[label][0],
    prompt: "",
    options: defaultOptionsForType(Q_TYPES[label][0]),
    bulletPoints: [],
    answer: "",
    explanation: "",
    difficulty: 3,
    status: "published",
  };
}

function qToDraft(q: Question): QuestionDraft {
  const skill = q.skill as Skill;
  const label = SKILL_LABEL[skill];
  return {
    id: q.id,
    skill,
    type: q.type || Q_TYPES[label][0],
    part: (q.body?.part as string) || PARTS[label]?.[0] || "",
    prompt: q.prompt || "",
    options: (q.body?.options as string[]) || [],
    bulletPoints: (q.body?.bulletPoints as string[]) || [],
    answer: (q.answer_key?.answer as string) || "",
    explanation: (q.answer_key?.explanation as string) || "",
    difficulty: q.difficulty || 3,
    status: q.status || "draft",
    media: q.body?.media as QuestionDraft["media"] | undefined,
  };
}

function mqToDraft(mq: ModuleQuestion & { question: Question }): QuestionDraft {
  const q = mq.question;
  const skill = q.skill as Skill;
  const label = SKILL_LABEL[skill];
  return {
    id: q.id,
    skill,
    type: q.type || Q_TYPES[label][0],
    part: (q.body?.part as string) || PARTS[label]?.[0] || "",
    prompt: q.prompt || "",
    options: (q.body?.options as string[]) || [],
    bulletPoints: (q.body?.bulletPoints as string[]) || [],
    answer: (q.answer_key?.answer as string) || "",
    explanation: (q.answer_key?.explanation as string) || "",
    difficulty: q.difficulty || 3,
    status: q.status || "draft",
    media: q.body?.media as QuestionDraft["media"] | undefined,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

function QuestionsPage() {
  const listModules = useServerFn(adminListModules);
  const listMQ = useServerFn(adminListModuleQuestions);
  const listAll = useServerFn(adminListQuestions);
  const upsert = useServerFn(adminUpsertQuestion);
  const delQuestion = useServerFn(adminDeleteQuestion);
  const addToModule = useServerFn(adminAddQuestionToModule);
  const qc = useQueryClient();

  const { data: modules = [], isLoading: loadingModules } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: () => listModules(),
  });

  const { data: allQuestions = [], isLoading: loadingAll } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: () => listAll(),
  });

  const [selId, setSelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuestionDraft | null>(null);
  const [previewing, setPreviewing] = useState<QuestionDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const effectiveId = selId || modules[0]?.id || null;
  const module = modules.find((m) => m.id === effectiveId) ?? null;
  const skill = (module?.skill as Skill) ?? "listening";
  const skillLabel = SKILL_LABEL[skill];
  const Icon = ICONS[skill];

  const { data: moduleQuestions = [], isLoading: loadingMQ } = useQuery({
    queryKey: ["module-questions", effectiveId],
    queryFn: () =>
      effectiveId ? listMQ({ data: { moduleId: effectiveId } }) : Promise.resolve([]),
    enabled: !!effectiveId,
  });

  function handleModuleChange(id: string) {
    setSelId(id);
    setDraft(null);
  }

  function startNew() {
    if (!module) return;
    setDraft(emptyDraft(skill));
  }

  async function save(d: QuestionDraft) {
    if (!d.prompt.trim()) { toast.error("Prompt is required"); return; }
    if (!module) { toast.error("Select a module first"); return; }
    setBusy(true);
    try {
      const body: Record<string, unknown> = { part: d.part };
      if (d.options.length) body.options = d.options;
      if (d.bulletPoints.filter(Boolean).length) body.bulletPoints = d.bulletPoints.filter(Boolean);
      if (d.media) body.media = d.media;

      const answer_key = { answer: d.answer, explanation: d.explanation };

      const result = await upsert({
        data: {
          id: d.id,
          skill: d.skill,
          type: d.type,
          difficulty: Math.min(5, Math.max(1, d.difficulty)),
          prompt: d.prompt,
          body,
          answer_key,
          tags: [d.part].filter(Boolean),
          status: d.status,
        },
      });

      if (!d.id) {
        await addToModule({ data: { moduleId: module.id, questionId: result.id } });
      }

      toast.success(d.id ? "Question updated" : "Question added to module");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["module-questions", module.id] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(questionId: string) {
    if (!confirm("Delete this question permanently? It will be removed from all modules.")) return;
    try {
      await delQuestion({ data: { id: questionId } });
      toast.success("Question deleted");
      if (draft?.id === questionId) setDraft(null);
      qc.invalidateQueries({ queryKey: ["module-questions", effectiveId] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Authoring</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
            <HelpCircle className="h-7 w-7 text-[var(--teal)]" /> Question bank
          </h2>
          <p className="text-sm text-white/50">Build IELTS question sets across all modules and types.</p>
        </div>
        <Link
          to="/admin/modules"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          <Layers className="h-4 w-4" /> Modules
        </Link>
      </div>

      {loadingModules ? (
        <p className="py-12 text-center text-sm text-white/50">Loading modules…</p>
      ) : modules.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 p-16 text-center">
          <Layers className="mx-auto h-10 w-10 text-white/30" />
          <p className="mt-3 font-display text-lg">No modules yet</p>
          <p className="text-sm text-white/50">Create a module before adding questions.</p>
          <Link
            to="/admin/modules"
            className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Create module
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          {/* ── Left panel ─────────────────────────────────────────── */}
          <aside className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Module</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <select
                  value={effectiveId || ""}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  className="w-full appearance-none bg-transparent text-sm font-semibold outline-none"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0B1224]">
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              {module && (
                <p className="mt-1 text-xs text-white/50">
                  {skillLabel} · {module.slug}
                  {module.status !== "published" && ` · ${module.status}`}
                </p>
              )}
              <button
                onClick={startNew}
                disabled={!module}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg gradient-brand py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 transition hover:shadow-[var(--teal)]/50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add question
              </button>
            </motion.div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
              {/* Tab toggle: Module set vs All questions */}
              <div className="mb-2 flex gap-1 rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => setShowAll(false)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[10px] uppercase tracking-wider transition ${
                    !showAll ? "bg-[var(--teal)]/20 text-[var(--teal)]" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Layers className="h-3 w-3" /> Module ({moduleQuestions.length})
                </button>
                <button
                  onClick={() => setShowAll(true)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-[10px] uppercase tracking-wider transition ${
                    showAll ? "bg-[var(--teal)]/20 text-[var(--teal)]" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <List className="h-3 w-3" /> All ({allQuestions.length})
                </button>
              </div>

              {showAll ? (
                // ── All questions view ──────────────────────────────
                loadingAll ? (
                  <p className="p-3 text-xs text-white/40">Loading…</p>
                ) : allQuestions.length === 0 ? (
                  <p className="p-3 text-xs text-white/40">No questions in the bank yet.</p>
                ) : (
                  <ul className="max-h-[520px] space-y-1 overflow-y-auto">
                    <AnimatePresence>
                      {allQuestions.map((q) => {
                        const isEditing = draft?.id === q.id;
                        return (
                          <motion.li
                            key={q.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            className={`group flex items-start gap-2 rounded-lg p-2 transition-colors ${
                              isEditing ? "bg-[var(--teal)]/10" : "hover:bg-white/5"
                            }`}
                          >
                            <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold capitalize ${
                              q.status === "published" ? "bg-green-400/15 text-green-400" : "bg-white/10 text-white/40"
                            }`}>
                              {q.skill[0].toUpperCase()}
                            </span>
                            <div
                              className="min-w-0 flex-1 cursor-pointer"
                              onClick={() => setDraft(qToDraft(q))}
                            >
                              <p className="truncate text-xs font-medium">
                                {q.prompt || <span className="text-white/40">Untitled</span>}
                              </p>
                              <p className="truncate text-[10px] text-white/40">
                                {q.type}{q.body?.part ? ` · ${q.body.part}` : ""} · {q.status}
                              </p>
                            </div>
                            <button
                              onClick={() => setPreviewing(qToDraft(q))}
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5 text-white/60 hover:text-[var(--teal)]" />
                            </button>
                            <button
                              onClick={() => remove(q.id)}
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-300" />
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )
              ) : (
                // ── Module questions view ───────────────────────────
                loadingMQ ? (
                  <p className="p-3 text-xs text-white/40">Loading…</p>
                ) : moduleQuestions.length === 0 ? (
                  <p className="p-3 text-xs text-white/40">
                    No questions yet — click "Add question".
                  </p>
                ) : (
                  <ul className="space-y-1">
                    <AnimatePresence>
                      {(moduleQuestions as (ModuleQuestion & { question: Question })[]).map((mq, i) => {
                        const q = mq.question;
                        const isEditing = draft?.id === q?.id;
                        return (
                          <motion.li
                            key={mq.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            className={`group flex items-start gap-2 rounded-lg p-2 transition-colors ${
                              isEditing ? "bg-[var(--teal)]/10" : "hover:bg-white/5"
                            }`}
                          >
                            <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--teal)]/15 text-[10px] font-bold text-[var(--teal)]">
                              {i + 1}
                            </span>
                            <div
                              className="min-w-0 flex-1 cursor-pointer"
                              onClick={() => setDraft(mqToDraft(mq))}
                            >
                              <p className="truncate text-xs font-medium">
                                {q?.prompt || (
                                  <span className="text-white/40">Untitled</span>
                                )}
                              </p>
                              <p className="truncate text-[10px] text-white/40">
                                {q?.type}
                                {q?.body?.part ? ` · ${q.body.part}` : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => setPreviewing(mqToDraft(mq))}
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5 text-white/60 hover:text-[var(--teal)]" />
                            </button>
                            <button
                              onClick={() => remove(q?.id)}
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-300" />
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )
              )}
            </div>
          </aside>

          {/* ── Right panel ────────────────────────────────────────── */}
          <section>
            <AnimatePresence mode="wait">
              {draft ? (
                <QuestionForm
                  key={draft.id ?? "new"}
                  draft={draft}
                  setDraft={setDraft}
                  skillLabel={skillLabel}
                  onSave={save}
                  onCancel={() => setDraft(null)}
                  onPreview={() => setPreviewing(draft)}
                  busy={busy}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-16 text-center"
                >
                  <HelpCircle className="h-10 w-10 text-white/30" />
                  <p className="mt-3 font-display text-lg">Select a module and add a question</p>
                  <p className="text-sm text-white/50">
                    Forms adapt to every IELTS question type automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      )}

      <AnimatePresence>
        {previewing && (
          <PreviewModal q={previewing} onClose={() => setPreviewing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Question form ────────────────────────────────────────────────────────────

function QuestionForm({
  draft, setDraft, skillLabel, onSave, onCancel, onPreview, busy,
}: {
  draft: QuestionDraft;
  setDraft: (q: QuestionDraft) => void;
  skillLabel: string;
  onSave: (q: QuestionDraft) => Promise<void>;
  onCancel: () => void;
  onPreview: () => void;
  busy: boolean;
}) {
  const types = Q_TYPES[skillLabel] ?? [];
  const parts = PARTS[skillLabel] ?? [];
  const isWriting = skillLabel === "Writing";
  const isSpeaking = skillLabel === "Speaking";
  const isCueCard = draft.type.includes("Cue card");
  const needsOptions =
    /Multiple Choice|True\/False|Yes\/No|Matching/.test(draft.type) && !isSpeaking;

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const getUploadUrl = useServerFn(adminCreateMediaUploadUrl);

  function handleTypeChange(newType: string) {
    setDraft({ ...draft, type: newType, options: defaultOptionsForType(newType) });
  }

  async function handleFileSelect(
    e: ChangeEvent<HTMLInputElement>,
    kind: "audio" | "image",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { signedUrl, publicUrl } = await getUploadUrl({
        data: { filename: file.name, kind },
      });
      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      setDraft({ ...draft, media: { kind, name: file.name, url: publicUrl } });
      toast.success("File uploaded successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
    >
      {/* Form header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            {skillLabel} question {draft.id ? "· editing" : "· new"}
          </p>
          <h3 className="font-display text-xl font-bold">Question editor</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {parts.length > 0 && (
            <div className="relative">
              <select
                value={draft.part}
                onChange={(e) => setDraft({ ...draft, part: e.target.value })}
                className="appearance-none rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 pr-8 text-xs outline-none focus:border-[var(--teal)]"
              >
                {parts.map((p) => (
                  <option key={p} className="bg-[#0B1224]">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-white/50" />
            </div>
          )}
          <div className="relative">
            <select
              value={draft.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 pr-8 text-sm outline-none focus:border-[var(--teal)]"
            >
              {types.map((t) => (
                <option key={t} className="bg-[#0B1224]">
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-white/50" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={draft.type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-5 space-y-4"
        >
          {/* Prompt */}
          <Field label={isSpeaking && isCueCard ? "Cue card topic" : "Question / Prompt"}>
            <textarea
              rows={isWriting ? 5 : 3}
              value={draft.prompt}
              onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              placeholder={
                isWriting
                  ? "Some people believe… Discuss both views and give your opinion."
                  : isSpeaking && isCueCard
                  ? "Describe a journey that you remember well."
                  : "Enter the question text…"
              }
              className={inputCls}
            />
          </Field>

          {/* Speaking cue card bullet points */}
          {isSpeaking && isCueCard && (
            <Field label="Bullet points (one per line)">
              <textarea
                rows={5}
                value={draft.bulletPoints.join("\n")}
                onChange={(e) =>
                  setDraft({ ...draft, bulletPoints: e.target.value.split("\n") })
                }
                placeholder={"You should say:\n— where it was\n— who you went with\n— what you did\n— why it was memorable"}
                className={inputCls}
              />
            </Field>
          )}

          {/* MCQ / T-F-NG options */}
          {needsOptions && (
            <Field label="Options">
              <div className="space-y-2">
                {draft.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      value={o}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          options: draft.options.map((x, j) =>
                            j === i ? e.target.value : x
                          ),
                        })
                      }
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          options: draft.options.filter((_, j) => j !== i),
                        })
                      }
                      className="shrink-0 rounded-md p-1.5 text-rose-300 hover:bg-rose-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, options: [...draft.options, ""] })
                  }
                  className="flex items-center gap-1 rounded-md border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              </div>
            </Field>
          )}

          {/* Correct answer (Listening / Reading) */}
          {!isWriting && !isSpeaking && (
            <Field label="Correct answer">
              <input
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                placeholder={
                  needsOptions ? "e.g. B or True" : "e.g. Marcus Hale / Section 3 / False"
                }
                className={inputCls}
              />
            </Field>
          )}

          {/* Rubric / AI instructions (Writing / Speaking) */}
          {(isWriting || isSpeaking) && (
            <Field
              label={
                isSpeaking
                  ? "AI examiner instructions"
                  : "Band 9 sample answer / grading rubric"
              }
            >
              <textarea
                rows={4}
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                placeholder={
                  isSpeaking
                    ? "Push for elaboration. Probe past tense usage. Award 7+ if vocabulary is varied."
                    : "Model answer or mark-scheme notes. Band 9 criteria: full task coverage, no errors…"
                }
                className={inputCls}
              />
            </Field>
          )}

          {/* Explanation */}
          <Field label="Explanation (shown after submission)">
            <textarea
              rows={2}
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              placeholder="Why is this the correct answer?"
              className={inputCls}
            />
          </Field>

          {/* Difficulty + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Difficulty (1 = easy · 5 = very hard)">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={draft.difficulty}
                  onChange={(e) =>
                    setDraft({ ...draft, difficulty: Number(e.target.value) })
                  }
                  className="flex-1 accent-[var(--teal)]"
                />
                <span className="w-6 text-center text-sm font-bold text-[var(--teal)]">
                  {draft.difficulty}
                </span>
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as QuestionDraft["status"],
                    })
                  }
                  className={`${inputCls} pr-8`}
                >
                  {(["draft", "published", "archived"] as const).map((s) => (
                    <option key={s} value={s} className="bg-[#0B1224] capitalize">
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-white/50" />
              </div>
            </Field>
          </div>

          {/* Media */}
          <Field label="Media attachment">
            {/* Hidden file inputs */}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "audio")}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "image")}
            />
            <div className="flex flex-wrap gap-2">
              <MediaBtn
                icon={uploading && draft.media?.kind !== "image" ? Loader2 : Music}
                label={uploading && draft.media?.kind !== "image" ? "Uploading…" : "Audio file"}
                onClick={() => !uploading && audioInputRef.current?.click()}
                active={draft.media?.kind === "audio"}
                disabled={uploading}
              />
              <MediaBtn
                icon={uploading && draft.media?.kind !== "audio" ? Loader2 : ImageIcon}
                label={uploading && draft.media?.kind !== "audio" ? "Uploading…" : "Image / diagram"}
                onClick={() => !uploading && imageInputRef.current?.click()}
                active={draft.media?.kind === "image"}
                disabled={uploading}
              />
              {draft.media && (
                <span className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/10 px-3 py-1.5 text-xs text-[var(--teal)]">
                  <Upload className="h-3.5 w-3.5" />
                  {draft.media.url ? (
                    <a
                      href={draft.media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {draft.media.name}
                    </a>
                  ) : (
                    draft.media.name
                  )}
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, media: undefined })}
                    className="ml-1 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] text-white/30">
              Files are uploaded to Supabase Storage (question-media bucket). Max size: 50 MB.
            </p>
          </Field>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-semibold shadow-lg shadow-[var(--teal)]/20 transition hover:shadow-[var(--teal)]/50 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : draft.id ? "Update question" : "Save question"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ q, onClose }: { q: QuestionDraft; onClose: () => void }) {
  const skillLabel = SKILL_LABEL[q.skill];
  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B1224] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Preview · {skillLabel} · {q.type}
            </p>
            {q.part && (
              <p className="mt-0.5 text-xs font-medium text-[var(--teal)]">{q.part}</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="font-display text-base leading-relaxed">
          {q.prompt || <span className="text-white/40">No prompt entered</span>}
        </p>

        {q.media && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
            <Upload className="h-3 w-3" /> {q.media.kind}: {q.media.name}
          </p>
        )}

        {q.bulletPoints.filter(Boolean).length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {q.bulletPoints.filter(Boolean).map((b, i) => (
              <li key={i}>• {b}</li>
            ))}
          </ul>
        )}

        {q.options.length > 0 && (
          <ul className="mt-4 space-y-2">
            {q.options.map((o, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--teal)]/15 text-xs font-bold text-[var(--teal)]">
                  {String.fromCharCode(65 + i)}
                </span>
                {o || <span className="text-white/40">Empty option</span>}
              </li>
            ))}
          </ul>
        )}

        {q.answer && (
          <div className="mt-4 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--teal)]">
              {q.skill === "speaking"
                ? "AI examiner instructions"
                : q.skill === "writing"
                ? "Rubric / sample answer"
                : "Correct answer"}
            </p>
            <p className="mt-1 text-sm text-white/80">{q.answer}</p>
          </div>
        )}

        {q.explanation && (
          <p className="mt-3 text-xs text-white/60">💡 {q.explanation}</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-white/40">
            Difficulty: {q.difficulty}/5 · Status: {q.status}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--teal)_20%,transparent)]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function MediaBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
