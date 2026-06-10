import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Video, Mic, MessageSquare, Users, UserPlus, Search, Shield, Flag, Phone, PhoneOff,
  MicOff, VideoOff, Send, MoreHorizontal, Sparkles, ScanSearch, ShieldAlert, QrCode, Mail,
  Globe2, Volume2, Smile, Image as ImageIcon, Paperclip, Check, CheckCheck, MonitorUp,
  RefreshCw, Wand2, BookOpen, ChevronRight, Pencil, Trash2, Reply, Download, FileText, X,
  Maximize2, Minimize2, Signal, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/live")({
  head: () => ({
    meta: [
      { title: "Spik Buddy — AIELTS Dashboard" },
      { name: "description", content: "Spik Buddy — 1-to-1, end-to-end encrypted voice, video and chat with real IELTS candidates." },
      { property: "og:title", content: "Spik Buddy — AIELTS Dashboard" },
      { property: "og:description", content: "1-to-1, end-to-end encrypted voice, video and chat — built only for IELTS speaking practice." },
      { property: "og:url", content: "/dashboard/live" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LivePage,
});

type Mode = "video" | "voice" | "chat";
type Friend = { id: string; name: string; country: string; band: number; online: boolean; last: string; initials: string };
type Attachment = { name: string; size: number; type: string; url: string };
type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  t: string;
  read?: boolean;
  delivered?: boolean;
  editedAt?: string;
  deleted?: boolean;
  reactions?: Record<string, ("me" | "them")[]>;
  replyTo?: { id: string; text: string; from: "me" | "them" };
  attachment?: Attachment;
};

const COUNTRIES = ["Any", "India", "Vietnam", "Brazil", "Japan", "Saudi Arabia", "Spain", "Nigeria", "Italy"];
const LEVELS = ["Any", "Band 4–5", "Band 5–6", "Band 6–7", "Band 7+"];
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const FRIENDS: Friend[] = [
  { id: "1", name: "Priya N.", country: "🇮🇳 India", band: 6.5, online: true, last: "now", initials: "PN" },
  { id: "2", name: "Lucas M.", country: "🇧🇷 Brazil", band: 7.0, online: true, last: "2m", initials: "LM" },
  { id: "3", name: "Akari S.", country: "🇯🇵 Japan", band: 6.0, online: false, last: "1h", initials: "AS" },
  { id: "4", name: "Yusuf K.", country: "🇸🇦 KSA", band: 5.5, online: true, last: "now", initials: "YK" },
  { id: "5", name: "Elena R.", country: "🇪🇸 Spain", band: 7.5, online: false, last: "3h", initials: "ER" },
];

const REQUESTS = [
  { id: "r1", name: "Minh T.", country: "🇻🇳", band: 6.0, initials: "MT" },
  { id: "r2", name: "Chiamaka O.", country: "🇳🇬", band: 6.5, initials: "CO" },
];

function LivePage() {
  return (
    <div className="space-y-8">
      <Header />
      <Tabs defaultValue="random" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="random"><Sparkles className="mr-1.5 h-4 w-4" />Random</TabsTrigger>
          <TabsTrigger value="friends"><Users className="mr-1.5 h-4 w-4" />Friends</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="mr-1.5 h-4 w-4" />Messages</TabsTrigger>
          <TabsTrigger value="safety"><Shield className="mr-1.5 h-4 w-4" />Safety</TabsTrigger>
        </TabsList>
        <TabsContent value="random"><RandomMatch /></TabsContent>
        <TabsContent value="friends"><FriendsPanel /></TabsContent>
        <TabsContent value="messages"><MessagesPanel /></TabsContent>
        <TabsContent value="safety"><SafetyPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function Header() {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Live now · 4,231 students</span>
        </div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Spik Buddy</h1>
        <p className="text-sm text-muted-foreground">1-to-1, end-to-end encrypted voice, video and chat — paired with a real IELTS candidate in under 5 seconds.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm"><QrCode className="mr-1.5 h-4 w-4" />My QR</Button>
        <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" />Add friend</Button>
      </div>
    </motion.div>
  );
}

/* ----------------------------- RANDOM MATCH (Real WebRTC) ----------------------------- */

type CallState = "idle" | "searching" | "in-call";

function RandomMatch() {
  const [mode, setMode] = useState<Mode>("video");
  const [country, setCountry] = useState("Any");
  const [level, setLevel] = useState("Any");
  const [ielts, setIelts] = useState(true);
  const [state, setState] = useState<CallState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [mute, setMute] = useState(false);
  const [cam, setCam] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [inCallMsgs, setInCallMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [permError, setPermError] = useState<string | null>(null);

  // WebRTC refs — local loopback demo (real WebRTC primitives, no signalling server needed)
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcLocalRef = useRef<RTCPeerConnection | null>(null);
  const pcRemoteRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f" && state === "in-call" && !(e.target as HTMLElement)?.closest?.("input, textarea")) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [state, toggleFullscreen]);

  /* Acquire media + build loopback peer connection */
  const startCall = useCallback(async (m: Mode) => {
    setPermError(null);
    try {
      const constraints: MediaStreamConstraints = {
        audio: m !== "chat",
        video: m === "video",
      };
      const stream = m === "chat"
        ? new MediaStream()
        : await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pcA = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      const pcB = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcLocalRef.current = pcA;
      pcRemoteRef.current = pcB;

      pcA.onicecandidate = (e) => e.candidate && pcB.addIceCandidate(e.candidate).catch(() => {});
      pcB.onicecandidate = (e) => e.candidate && pcA.addIceCandidate(e.candidate).catch(() => {});

      const remote = new MediaStream();
      remoteStreamRef.current = remote;
      pcB.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remote.addTrack(t));
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      };
      // Loopback the other way too so "remote" sees a live feed
      pcA.ontrack = (e) => {
        if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      stream.getTracks().forEach((t) => pcA.addTrack(t, stream));
      // Mirror so pcB also has tracks → remote feed (simulated peer)
      stream.getTracks().forEach((t) => pcB.addTrack(t.clone(), stream));

      const dc = pcA.createDataChannel("chat");
      dcRef.current = dc;
      dc.onmessage = (e) => {
        setInCallMsgs((prev) => [...prev, { id: String(Date.now()), from: "them", text: String(e.data), t: now() }]);
      };
      pcB.ondatachannel = (ev) => {
        ev.channel.onmessage = (e) => {
          // echo from the other side — simulates a partner reply
          setTimeout(() => ev.channel.send(`Echo: ${e.data}`), 600);
        };
      };

      const offer = await pcA.createOffer();
      await pcA.setLocalDescription(offer);
      await pcB.setRemoteDescription(offer);
      const answer = await pcB.createAnswer();
      await pcB.setLocalDescription(answer);
      await pcA.setRemoteDescription(answer);

      setState("in-call");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Permission denied";
      setPermError(msg);
      setState("idle");
      toast.error("Camera/mic unavailable", { description: msg });
    }
  }, []);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcLocalRef.current?.close();
    pcRemoteRef.current?.close();
    dcRef.current?.close();
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pcLocalRef.current = null;
    pcRemoteRef.current = null;
    dcRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCallMsgs([]);
    setChatOpen(false);
    setState("idle");
  }, []);

  /* search → call */
  useEffect(() => {
    if (state !== "searching") return;
    const t = setTimeout(() => { void startCall(mode); }, 1800);
    return () => clearTimeout(t);
  }, [state, mode, startCall]);

  useEffect(() => {
    if (state !== "in-call") return setSeconds(0);
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [state]);

  useEffect(() => () => endCall(), [endCall]);

  /* Mode switching mid-call — enable/disable tracks, or request new ones */
  const switchMode = useCallback(async (next: Mode) => {
    setMode(next);
    if (state !== "in-call") return;
    const stream = localStreamRef.current;
    if (!stream) return;

    // toggle audio
    stream.getAudioTracks().forEach((t) => (t.enabled = next !== "chat" && !mute));

    if (next === "video") {
      // ensure a video track exists
      if (stream.getVideoTracks().length === 0) {
        try {
          const v = await navigator.mediaDevices.getUserMedia({ video: true });
          const vt = v.getVideoTracks()[0];
          stream.addTrack(vt);
          const sender = pcLocalRef.current?.getSenders().find((s) => s.track?.kind === "video");
          if (sender) await sender.replaceTrack(vt);
          else pcLocalRef.current?.addTrack(vt, stream);
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (e) {
          toast.error("Couldn't enable camera");
        }
      } else {
        stream.getVideoTracks().forEach((t) => (t.enabled = cam));
      }
    } else {
      // voice or chat — disable video
      stream.getVideoTracks().forEach((t) => (t.enabled = false));
    }

    if (next === "chat") setChatOpen(true);
  }, [state, mute, cam]);

  /* mute / cam side-effects */
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !mute && mode !== "chat"));
  }, [mute, mode]);
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = cam && mode === "video"));
  }, [cam, mode]);

  const sendInCallMsg = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setInCallMsgs((m) => [...m, { id: String(Date.now()), from: "me", text, t: now() }]);
    setDraft("");
    try { dcRef.current?.send(text); } catch { /* noop */ }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={stageRef}
            className={`relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 ${isFullscreen ? "h-screen w-screen" : "aspect-video"}`}
          >
            <FloatingBubbles />
            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 grid place-items-center text-center text-white">
                  <div className="space-y-4 px-6">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10 backdrop-blur">
                      <Globe2 className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-semibold">Ready when you are</p>
                    <p className="max-w-sm text-sm text-white/70">Tap "Start" to match using real WebRTC video, voice, or text chat.</p>
                    {permError && <p className="text-xs text-red-300">{permError}</p>}
                  </div>
                </motion.div>
              )}
              {state === "searching" && (
                <motion.div key="sr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 grid place-items-center text-white">
                  <div className="space-y-5 text-center">
                    <div className="relative mx-auto h-28 w-28">
                      <motion.span className="absolute inset-0 rounded-full border-2 border-white/30"
                        animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
                      <motion.span className="absolute inset-0 rounded-full border-2 border-white/30"
                        animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} />
                      <div className="absolute inset-0 grid place-items-center rounded-full bg-white/10 backdrop-blur">
                        <ScanSearch className="h-10 w-10" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold">Connecting…</p>
                    <p className="text-sm text-white/70">Negotiating peer connection</p>
                  </div>
                </motion.div>
              )}
              {state === "in-call" && (
                <motion.div key="call" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0">
                  {mode === "video" && (
                    <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                      <RemoteVideoTile videoRef={remoteVideoRef} name="Priya N." country="🇮🇳" />
                      <SelfVideoTile videoRef={localVideoRef} camOn={cam} />
                    </div>
                  )}
                  {mode === "voice" && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex items-center gap-10">
                        <VoiceAvatar initials="PN" label="Priya N. 🇮🇳" />
                        <VoiceAvatar initials="You" label="You" self />
                      </div>
                      <audio ref={remoteVideoRef as unknown as React.RefObject<HTMLAudioElement>} autoPlay playsInline className="hidden" />
                    </div>
                  )}
                  {mode === "chat" && (
                    <div className="absolute inset-0 grid place-items-center text-white/80">
                      <div className="text-center">
                        <MessageSquare className="mx-auto mb-2 h-10 w-10 opacity-60" />
                        <p className="text-sm">Text-only chat with Priya N.</p>
                        <p className="text-xs text-white/50">Open the chat panel →</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur ring-1 ring-white/10">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      <span className="tabular-nums">{fmt(seconds)}</span>
                      <span className="text-white/40">·</span>
                      <span className="capitalize">{mode}</span>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur ring-1 ring-white/10 sm:flex">
                      <Lock className="h-3 w-3 text-emerald-300" />
                      <span>E2E</span>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur ring-1 ring-white/10 md:flex">
                      <Signal className="h-3 w-3 text-emerald-300" />
                      <span>HD</span>
                    </div>
                  </div>

                  {/* Mid-call mode switcher + fullscreen */}
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-black/50 p-1 text-white backdrop-blur ring-1 ring-white/10">
                      {(["video", "voice", "chat"] as Mode[]).map((m) => (
                        <button key={m} onClick={() => switchMode(m)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${mode === m ? "bg-white text-slate-900" : "hover:bg-white/15"}`}>
                          {m === "video" ? <Video className="inline h-3.5 w-3.5" /> : m === "voice" ? <Mic className="inline h-3.5 w-3.5" /> : <MessageSquare className="inline h-3.5 w-3.5" />}
                          <span className="ml-1 capitalize">{m}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-black/70"
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                  </div>

                  {ielts && mode !== "chat" && (
                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      className="absolute inset-x-4 bottom-24 rounded-xl border border-white/10 bg-black/50 p-4 text-white backdrop-blur">
                      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300">
                        <Wand2 className="h-3.5 w-3.5" /> IELTS Speaking · Part 2 cue card
                      </div>
                      <p className="text-sm">Describe a skill you would like to learn. You should say what it is, why you want to learn it, how you would learn it, and how it would change your life.</p>
                    </motion.div>
                  )}

                  {/* In-call chat sidebar */}
                  <AnimatePresence>
                    {(chatOpen || mode === "chat") && (
                      <motion.div initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
                        className="absolute bottom-0 right-0 top-0 flex w-80 flex-col border-l border-white/10 bg-black/60 backdrop-blur">
                        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-white">
                          <span className="text-xs font-semibold">In-call chat</span>
                          {mode !== "chat" && (
                            <button onClick={() => setChatOpen(false)} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
                          {inCallMsgs.length === 0 && <p className="text-xs text-white/50">Send the first message…</p>}
                          {inCallMsgs.map((m) => (
                            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-1.5 ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-white/15 text-white"}`}>
                                {m.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 border-t border-white/10 p-2">
                          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendInCallMsg()}
                            placeholder="Message…" className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/40 outline-none" />
                          <button onClick={sendInCallMsg} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="h-3.5 w-3.5" /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-4">
              {state === "idle" && (
                <Button size="lg" className="rounded-full px-8 shadow-xl" onClick={() => setState("searching")}>
                  <Sparkles className="mr-2 h-4 w-4" /> Start matching
                </Button>
              )}
              {state === "searching" && (
                <Button size="lg" variant="secondary" className="rounded-full px-8" onClick={() => setState("idle")}>
                  Cancel
                </Button>
              )}
              {state === "in-call" && (
                <CallBar
                  mode={mode}
                  mute={mute}
                  cam={cam}
                  isFullscreen={isFullscreen}
                  onMute={() => setMute((m) => !m)}
                  onCam={() => setCam((c) => !c)}
                  onChat={() => setChatOpen((v) => !v)}
                  onFullscreen={toggleFullscreen}
                  onEnd={endCall}
                  onSkip={() => { endCall(); setState("searching"); }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side panel — preferences */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Match preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ModePicker mode={mode} setMode={state === "in-call" ? switchMode : setMode} />
            <Field label="Country">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Skill level">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <ToggleRow label="IELTS Speaking mode" desc="Show Part 1/2/3 prompts in-call" v={ielts} onChange={setIelts} />
            <ToggleRow label="Show country flag" desc="Help partners learn about you" defaultOn />
            <ToggleRow label="Auto-translate captions" desc="Real-time subtitles" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Session boosters</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <BoosterRow icon={BookOpen} label="Get cue card suggestions" />
            <BoosterRow icon={Wand2} label="AI examiner joins as judge" />
            <BoosterRow icon={Volume2} label="Pronunciation feedback" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ModePicker({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const opts: { v: Mode; icon: typeof Video; label: string }[] = [
    { v: "video", icon: Video, label: "Video" },
    { v: "voice", icon: Mic, label: "Voice" },
    { v: "chat", icon: MessageSquare, label: "Chat" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button key={o.v} onClick={() => setMode(o.v)}
          className={`group relative flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition ${mode === o.v ? "border-primary bg-primary/5 text-foreground" : "text-muted-foreground hover:bg-accent"}`}>
          <o.icon className={`h-5 w-5 ${mode === o.v ? "text-primary" : ""}`} />
          {o.label}
          {mode === o.v && <motion.span layoutId="mode-dot" className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary" />}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, v, onChange, defaultOn }: { label: string; desc: string; v?: boolean; onChange?: (b: boolean) => void; defaultOn?: boolean }) {
  const [s, setS] = useState(Boolean(v ?? defaultOn));
  useEffect(() => { if (typeof v === "boolean") setS(v); }, [v]);
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={s} onCheckedChange={(b) => { setS(b); onChange?.(b); }} />
    </div>
  );
}

function BoosterRow({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition hover:bg-accent">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function CallBar({
  mode, mute, cam, isFullscreen, onMute, onCam, onChat, onFullscreen, onEnd, onSkip,
}: {
  mode: Mode; mute: boolean; cam: boolean; isFullscreen: boolean;
  onMute: () => void; onCam: () => void; onChat: () => void; onFullscreen: () => void; onEnd: () => void; onSkip: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/60 px-2 py-2 ring-1 ring-white/10 backdrop-blur">
      {mode !== "chat" && (
        <CircleBtn active={!mute} onClick={onMute} title="Mute (M)">{mute ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</CircleBtn>
      )}
      {mode === "video" && (
        <CircleBtn active={cam} onClick={onCam} title="Camera">{cam ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</CircleBtn>
      )}
      <CircleBtn title="Screen share"><MonitorUp className="h-4 w-4" /></CircleBtn>
      <CircleBtn title="Chat" onClick={onChat}><MessageSquare className="h-4 w-4" /></CircleBtn>
      <CircleBtn title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"} onClick={onFullscreen}>
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </CircleBtn>
      <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />
      <CircleBtn title="Add friend"><UserPlus className="h-4 w-4" /></CircleBtn>
      <CircleBtn title="Report"><Flag className="h-4 w-4" /></CircleBtn>
      <button onClick={onSkip} className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25">
        <RefreshCw className="h-3.5 w-3.5" /> Skip
      </button>
      <button onClick={onEnd} className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600">
        <PhoneOff className="h-3.5 w-3.5" /> End
      </button>
    </div>
  );
}

function CircleBtn({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      className={`grid h-10 w-10 place-items-center rounded-full text-white transition ${active === false ? "bg-red-500/80 hover:bg-red-500" : "bg-white/15 hover:bg-white/25"}`}>
      {children}
    </button>
  );
}

function RemoteVideoTile({ videoRef, name, country }: { videoRef: React.RefObject<HTMLVideoElement | null>; name: string; country: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-700 to-violet-900">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/30">
        <Avatar className="h-24 w-24 ring-4 ring-white/20">
          <AvatarFallback className="bg-white/10 text-2xl text-white">PN</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur">
        {country} {name}
      </div>
      <Waveform />
    </div>
  );
}

function SelfVideoTile({ videoRef, camOn }: { videoRef: React.RefObject<HTMLVideoElement | null>; camOn: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-800 to-teal-900">
      <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 h-full w-full -scale-x-100 object-cover ${camOn ? "" : "opacity-0"}`} />
      {!camOn && (
        <div className="absolute inset-0 grid place-items-center text-white/50">
          <Avatar className="h-20 w-20 ring-4 ring-white/20">
            <AvatarFallback className="bg-white/10 text-xl text-white">You</AvatarFallback>
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur">You</div>
    </div>
  );
}

function VoiceAvatar({ initials, label, self }: { initials: string; label: string; self?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 text-white">
      <div className="relative">
        <motion.span className={`absolute inset-0 rounded-full ${self ? "bg-emerald-400/30" : "bg-indigo-400/30"}`}
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <Avatar className="h-28 w-28 ring-4 ring-white/20">
          <AvatarFallback className={`text-2xl ${self ? "bg-emerald-700" : "bg-indigo-700"}`}>{initials}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm font-medium">{label}</p>
      <Waveform inline />
    </div>
  );
}

function Waveform({ inline }: { inline?: boolean }) {
  const bars = Array.from({ length: inline ? 18 : 28 });
  return (
    <div className={inline ? "flex h-6 items-end gap-[3px]" : "absolute bottom-3 right-3 flex h-8 items-end gap-[3px]"}>
      {bars.map((_, i) => (
        <motion.span key={i} className="w-[3px] rounded-sm bg-white/70"
          animate={{ height: [4, 6 + (i % 5) * 4, 4] }}
          transition={{ duration: 0.9 + (i % 5) * 0.1, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function FloatingBubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span key={i} className="absolute rounded-full"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            width: 6 + (i % 5) * 4,
            height: 6 + (i % 5) * 4,
            background: i % 2 ? "rgba(20,184,166,0.25)" : "rgba(99,102,241,0.25)",
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }} />
      ))}
    </div>
  );
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ----------------------------- FRIENDS ----------------------------- */

function FriendsPanel() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => FRIENDS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())), [q]);
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Friends ({FRIENDS.length})</CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" />Add friend</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search friends…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <ul className="divide-y">
            {filtered.map((f, i) => (
              <motion.li key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar><AvatarFallback>{f.initials}</AvatarFallback></Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${f.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.country} · Band {f.band} · {f.online ? "Online" : `Active ${f.last} ago`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn title="Chat"><MessageSquare className="h-4 w-4" /></IconBtn>
                  <IconBtn title="Voice"><Phone className="h-4 w-4" /></IconBtn>
                  <IconBtn title="Video"><Video className="h-4 w-4" /></IconBtn>
                  <IconBtn title="More"><MoreHorizontal className="h-4 w-4" /></IconBtn>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Friend requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {REQUESTS.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9"><AvatarFallback>{r.initials}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.country} · Band {r.band}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="outline">Decline</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddFriendDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={title} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground">
      {children}
    </button>
  );
}

function AddFriendDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a friend</DialogTitle>
          <DialogDescription>Connect by email, AIELTS ID, or QR.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-3"><TabsTrigger value="email"><Mail className="mr-1.5 h-4 w-4" />Email</TabsTrigger><TabsTrigger value="id">ID</TabsTrigger><TabsTrigger value="qr"><QrCode className="mr-1.5 h-4 w-4" />QR</TabsTrigger></TabsList>
          <TabsContent value="email" className="space-y-3 pt-3">
            <Input placeholder="friend@example.com" />
            <Textarea placeholder="Add a short message…" rows={3} />
          </TabsContent>
          <TabsContent value="id" className="pt-3"><Input placeholder="AIELTS user ID, e.g. @priya.n" /></TabsContent>
          <TabsContent value="qr" className="pt-3">
            <div className="grid aspect-square w-48 place-items-center rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground">
              <QrCode className="h-24 w-24" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Show this QR to a partner to connect instantly.</p>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- MESSAGES ----------------------------- */

const SEED_HISTORY: Record<string, Msg[]> = {
  "1": [
    { id: "h1", from: "them", text: "Hey, want to practice yesterday?", t: "Mon 18:02", read: true, delivered: true },
    { id: "h2", from: "me", text: "Sure — Part 2 cue cards?", t: "Mon 18:03", read: true, delivered: true },
    { id: "m1", from: "them", text: "Hey! Want to practice Part 2?", t: "09:14", read: true, delivered: true },
    { id: "m2", from: "me", text: "Yes! Give me a cue card 🙂", t: "09:14", read: true, delivered: true, reactions: { "👍": ["them"] } },
    { id: "m3", from: "them", text: "Describe a place you'd like to visit.", t: "09:15", read: true, delivered: true },
  ],
};

function MessagesPanel() {
  const [active, setActive] = useState(FRIENDS[0]);
  const [draft, setDraft] = useState("");
  const [chats, setChats] = useState<Record<string, Msg[]>>(() => {
    const init: Record<string, Msg[]> = {};
    FRIENDS.forEach((f) => { init[f.id] = SEED_HISTORY[f.id] ?? []; });
    return init;
  });
  const [typing, setTyping] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const msgs = chats[active.id] ?? [];

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  // Mark incoming as read when chat opens
  useEffect(() => {
    setChats((c) => ({
      ...c,
      [active.id]: (c[active.id] ?? []).map((m) => m.from === "them" ? { ...m, read: true } : m),
    }));
  }, [active.id]);

  const updateMsgs = (fn: (m: Msg[]) => Msg[]) =>
    setChats((c) => ({ ...c, [active.id]: fn(c[active.id] ?? []) }));

  const send = () => {
    if (!draft.trim()) return;
    if (editing) {
      updateMsgs((m) => m.map((x) => x.id === editing ? { ...x, text: draft, editedAt: now() } : x));
      setEditing(null);
      setDraft("");
      return;
    }
    const id = String(Date.now());
    const newMsg: Msg = {
      id, from: "me", text: draft, t: now(), delivered: false, read: false,
      replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, from: replyTo.from } : undefined,
    };
    updateMsgs((m) => [...m, newMsg]);
    setDraft("");
    setReplyTo(null);
    // simulate delivery + read receipts
    setTimeout(() => updateMsgs((m) => m.map((x) => x.id === id ? { ...x, delivered: true } : x)), 500);
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const rid = String(Date.now() + 1);
        updateMsgs((m) => [
          ...m.map((x) => x.id === id ? { ...x, read: true } : x),
          { id: rid, from: "them", text: pickReply(newMsg.text), t: now(), read: true, delivered: true },
        ]);
      }, 1400);
    }, 900);
  };

  const onDraftChange = (v: string) => {
    setDraft(v);
    // simulate "their typing" indicator by reciprocating once user is active
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { /* noop */ }, 600);
  };

  const onPickFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const id = String(Date.now());
    updateMsgs((m) => [...m, {
      id, from: "me", text: "", t: now(), delivered: false, read: false,
      attachment: { name: file.name, size: file.size, type: file.type, url },
    }]);
    setTimeout(() => updateMsgs((m) => m.map((x) => x.id === id ? { ...x, delivered: true, read: true } : x)), 1000);
    toast.success("File shared", { description: file.name });
  };

  const toggleReaction = (mid: string, emoji: string) => {
    updateMsgs((m) => m.map((x) => {
      if (x.id !== mid) return x;
      const r = { ...(x.reactions ?? {}) };
      const list = r[emoji] ?? [];
      r[emoji] = list.includes("me") ? list.filter((u) => u !== "me") : [...list, "me"];
      if (r[emoji].length === 0) delete r[emoji];
      return { ...x, reactions: r };
    }));
  };

  const deleteMsg = (mid: string) => {
    updateMsgs((m) => m.map((x) => x.id === mid ? { ...x, text: "", deleted: true, attachment: undefined } : x));
  };

  const startEdit = (m: Msg) => {
    setEditing(m.id);
    setDraft(m.text);
    setReplyTo(null);
  };

  const visibleMsgs = chatSearch
    ? msgs.filter((m) => m.text.toLowerCase().includes(chatSearch.toLowerCase()))
    : msgs;

  const filteredFriends = FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(historyQuery.toLowerCase())
    || (chats[f.id] ?? []).some((m) => m.text.toLowerCase().includes(historyQuery.toLowerCase()))
  );

  return (
    <div className="grid gap-0 overflow-hidden rounded-xl border bg-card lg:grid-cols-[300px_1fr]">
      <aside className="border-r">
        <div className="border-b p-3">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} placeholder="Search chats & history…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        <ScrollArea className="h-[520px]">
          <ul>
            {filteredFriends.map((f) => {
              const last = (chats[f.id] ?? []).at(-1);
              const unread = (chats[f.id] ?? []).filter((m) => m.from === "them" && !m.read).length;
              return (
                <li key={f.id}>
                  <button onClick={() => setActive(f)}
                    className={`flex w-full items-center gap-3 border-b px-3 py-3 text-left transition hover:bg-accent ${active.id === f.id ? "bg-accent" : ""}`}>
                    <div className="relative">
                      <Avatar className="h-10 w-10"><AvatarFallback>{f.initials}</AvatarFallback></Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${f.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">{f.name}</p>
                        <span className="text-[10px] text-muted-foreground">{last?.t ?? f.last}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground">{last?.deleted ? "Message deleted" : last?.attachment ? `📎 ${last.attachment.name}` : last?.text || "Say hi 👋"}</p>
                        {unread > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{unread}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>

      <section className="flex h-[600px] flex-col">
        <header className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback>{active.initials}</AvatarFallback></Avatar>
            <div>
              <p className="text-sm font-semibold">{active.name}</p>
              <p className="text-xs text-emerald-600">{typing ? "typing…" : `● ${active.online ? "Online" : `Active ${active.last} ago`} · ${active.country}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="mr-2 flex items-center gap-1 rounded-md border bg-background px-2 py-1">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search history…" className="w-36 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
            </div>
            <IconBtn title="Voice"><Phone className="h-4 w-4" /></IconBtn>
            <IconBtn title="Video"><Video className="h-4 w-4" /></IconBtn>
            <IconBtn title="More"><MoreHorizontal className="h-4 w-4" /></IconBtn>
          </div>
        </header>

        <div ref={ref} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
          <AnimatePresence initial={false}>
            {visibleMsgs.map((m) => (
              <MessageBubble
                key={m.id}
                m={m}
                onReact={(e) => toggleReaction(m.id, e)}
                onReply={() => setReplyTo(m)}
                onEdit={() => startEdit(m)}
                onDelete={() => deleteMsg(m.id)}
              />
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-background px-3 py-2 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(replyTo || editing) && (
          <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              {editing ? <Pencil className="h-3.5 w-3.5 text-primary" /> : <Reply className="h-3.5 w-3.5 text-primary" />}
              <span className="font-medium">{editing ? "Editing message" : `Replying to ${replyTo?.from === "me" ? "yourself" : active.name}`}</span>
              <span className="truncate text-muted-foreground">{editing ? "" : replyTo?.text}</span>
            </div>
            <button onClick={() => { setReplyTo(null); setEditing(null); setDraft(""); }} className="rounded p-1 hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <footer className="flex items-center gap-2 border-t p-3">
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])} />
          <IconBtn title="Attach file" onClick={() => fileRef.current?.click()}><Paperclip className="h-4 w-4" /></IconBtn>
          <IconBtn title="Image" onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.click(); } }}><ImageIcon className="h-4 w-4" /></IconBtn>
          <Popover>
            <PopoverTrigger asChild><button title="Emoji" className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"><Smile className="h-4 w-4" /></button></PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="flex gap-1">
                {["😀","😂","🙂","😍","🔥","👍","🙏","🎉","💯","😢"].map((e) => (
                  <button key={e} onClick={() => setDraft((d) => d + e)} className="rounded p-1 text-lg hover:bg-accent">{e}</button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <input value={draft} onChange={(e) => onDraftChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={editing ? "Edit message…" : "Type a message…"} className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          <Button size="icon" className="rounded-full" onClick={send}><Send className="h-4 w-4" /></Button>
        </footer>
      </section>
    </div>
  );
}

function MessageBubble({
  m, onReact, onReply, onEdit, onDelete,
}: {
  m: Msg; onReact: (e: string) => void; onReply: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const isMe = m.from === "me";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`group flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`relative max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        {m.replyTo && (
          <div className={`mb-1 rounded-md border-l-2 border-primary bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground ${isMe ? "ml-auto" : ""}`}>
            <span className="font-medium">{m.replyTo.from === "me" ? "You" : "Them"}: </span>
            <span className="truncate">{m.replyTo.text.slice(0, 80)}</span>
          </div>
        )}
        <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-background"} ${m.deleted ? "italic opacity-60" : ""}`}>
          {m.deleted ? (
            <p>Message deleted</p>
          ) : m.attachment ? (
            <AttachmentView a={m.attachment} />
          ) : (
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
          )}
          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {m.editedAt && <span className="italic">edited</span>}
            <span>{m.t}</span>
            {isMe && !m.deleted && (
              m.read ? <CheckCheck className="h-3 w-3 text-sky-300" />
                : m.delivered ? <CheckCheck className="h-3 w-3" />
                : <Check className="h-3 w-3" />
            )}
          </div>
          {m.reactions && Object.keys(m.reactions).length > 0 && (
            <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? "justify-end" : ""}`}>
              {Object.entries(m.reactions).map(([e, users]) => (
                <button key={e} onClick={() => onReact(e)}
                  className={`flex items-center gap-1 rounded-full border bg-background px-1.5 py-0.5 text-[11px] ${users.includes("me") ? "border-primary text-primary" : "text-foreground"}`}>
                  <span>{e}</span><span>{users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!m.deleted && (
          <div className={`absolute -top-3 ${isMe ? "right-0" : "left-0"} flex items-center gap-0.5 rounded-full border bg-card p-0.5 opacity-0 shadow-sm transition group-hover:opacity-100`}>
            <Popover>
              <PopoverTrigger asChild>
                <button title="React" className="grid h-6 w-6 place-items-center rounded-full text-xs hover:bg-accent">😊</button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" align={isMe ? "end" : "start"}>
                <div className="flex gap-1">
                  {REACTIONS.map((e) => (
                    <button key={e} onClick={() => onReact(e)} className="rounded p-1 text-base hover:bg-accent">{e}</button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button onClick={onReply} title="Reply" className="grid h-6 w-6 place-items-center rounded-full hover:bg-accent"><Reply className="h-3.5 w-3.5" /></button>
            {isMe && <button onClick={onEdit} title="Edit" className="grid h-6 w-6 place-items-center rounded-full hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>}
            {isMe && <button onClick={onDelete} title="Delete" className="grid h-6 w-6 place-items-center rounded-full text-red-500 hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /></button>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AttachmentView({ a }: { a: Attachment }) {
  const isImg = a.type.startsWith("image/");
  return isImg ? (
    <a href={a.url} target="_blank" rel="noreferrer" className="block">
      <img src={a.url} alt={a.name} className="max-h-60 rounded-lg object-cover" />
      <p className="mt-1 text-[11px] opacity-80">{a.name} · {(a.size / 1024).toFixed(1)} KB</p>
    </a>
  ) : (
    <a href={a.url} download={a.name} className="flex items-center gap-2 rounded-md bg-background/20 p-2">
      <FileText className="h-5 w-5" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{a.name}</p>
        <p className="text-[11px] opacity-80">{(a.size / 1024).toFixed(1)} KB</p>
      </div>
      <Download className="h-4 w-4" />
    </a>
  );
}

function pickReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("?")) return "Good question — let me think.";
  if (t.length < 6) return "👍";
  return "Nice — tell me more about it!";
}

/* ----------------------------- SAFETY ----------------------------- */

function SafetyPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Block list</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{ n: "Anonymous #482", r: "Inappropriate content" }, { n: "Anonymous #311", r: "Spam" }].map((u) => (
            <div key={u.n} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{u.n}</p>
                <p className="text-xs text-muted-foreground">Reason: {u.r}</p>
              </div>
              <Button size="sm" variant="outline">Unblock</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4" />AI auto-moderation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow label="Nudity detection" desc="Auto-disconnect on detection" defaultOn />
          <ToggleRow label="Hate speech filter" desc="Warn after 1st offense" defaultOn />
          <ToggleRow label="Spam detection" desc="Block repeating messages" defaultOn />
          <ToggleRow label="Violence detection" desc="Auto-disconnect" defaultOn />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Recent reports</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {[
              { t: "Harassment", u: "Anonymous #921", s: "Resolved" },
              { t: "Spam", u: "Anonymous #432", s: "Pending" },
              { t: "Fake profile", u: "Anonymous #100", s: "Resolved" },
            ].map((r, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3"><Flag className="h-4 w-4 text-amber-500" /><div><p className="font-medium">{r.t}</p><p className="text-xs text-muted-foreground">Against {r.u}</p></div></div>
                <Badge variant={r.s === "Resolved" ? "secondary" : "outline"}>{r.s}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
