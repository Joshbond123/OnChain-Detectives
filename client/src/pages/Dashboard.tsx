import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const tabs = ["Dashboard", "Generator", "Video Scripts", "Scheduler", "Settings", "API Keys", "Facebook", "AI Providers", "System Logs", "Asset Management"];

export default function Dashboard() {
  const [state, setState] = useState<any>(null);
  const [topic, setTopic] = useState("New crypto phishing trend")
  const [active, setActive] = useState("Dashboard");

  const load = async () => {
    const res = await fetch("/api/state");
    setState(await res.json());
  };

  useEffect(() => {
    load();
    const token = localStorage.getItem("sseToken") || "local-dev-token";
    const es = new EventSource(`/api/stream?token=${token}`);
    es.onmessage = () => load();
    return () => es.close();
  }, []);

  const analyticsData = useMemo(() => {
    if (!state?.posts) return [];
    return state.posts.slice(0, 12).reverse().map((p: any, idx: number) => ({ idx, ms: p.generationMs || 0 }));
  }, [state]);

  const trigger = async () => {
    await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="grid md:grid-cols-[260px_1fr]">
        <aside className="border-r border-cyan-400/20 p-4 backdrop-blur-xl bg-slate-900/50">
          <h1 className="text-xl font-bold text-cyan-300">OnChain Automator</h1>
          <nav className="mt-4 space-y-2">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActive(tab)} className={`w-full text-left rounded px-3 py-2 ${active === tab ? "bg-cyan-500/20 text-cyan-300" : "hover:bg-slate-800"}`}>
                {tab}
              </button>
            ))}
          </nav>
        </aside>
        <main className="p-6 space-y-6">
          <section className="rounded-xl bg-slate-900/60 border border-cyan-400/30 p-4 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
            <h2 className="text-lg font-semibold">AI Scam-Awareness Generator</h2>
            <div className="mt-3 flex gap-2">
              <input className="flex-1 bg-slate-950 border border-cyan-700 rounded px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <button onClick={trigger} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded font-semibold">Generate Now</button>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <Metric label="Published" value={state?.analytics?.published ?? 0} />
            <Metric label="Failures" value={state?.analytics?.failures ?? 0} />
            <Metric label="Success Rate" value={`${Math.round(((state?.analytics?.published ?? 0) / Math.max(1, state?.analytics?.generated ?? 1)) * 100)}%`} />
          </section>

          <section className="rounded-xl bg-slate-900/60 border border-cyan-400/30 p-4 h-64">
            <h3 className="mb-3">Generation Time Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid stroke="#164e63" />
                <XAxis dataKey="idx" stroke="#67e8f9" />
                <YAxis stroke="#67e8f9" />
                <Tooltip />
                <Line type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-slate-900/60 border border-cyan-400/30 p-4"><p className="text-slate-400">{label}</p><p className="text-2xl font-bold text-cyan-300">{value}</p></div>;
}
