"use client";
import { useState, useEffect, useCallback } from "react";
import Cube from "./Cube";
import HandTracker from "./HandTracker";

export default function Home() {
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
  const [moveCount, setMoveCount] = useState(0);

  const playTurnSound = useCallback(() => {
    const audio = new Audio("/cube-turn.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {}); 
  }, []);

  useEffect(() => {
    const handleMove = (e: any) => {
      const move = e.detail;
      if (status === "PAUSED" && move !== "RESET") return;
      if (move === "RESET") {
        setMoveHistory([]);
        setMoveCount(0);
        return;
      }
      playTurnSound();
      setMoveCount(prev => prev + 1);
      setMoveHistory(prev => [move, ...prev].slice(0, 8));
    };
    window.addEventListener("cube-move", handleMove);
    return () => window.removeEventListener("cube-move", handleMove);
  }, [status, playTurnSound]);

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white p-4 flex flex-col font-sans overflow-x-hidden">
      
      {/* TOP NAVIGATION: Works for Mobile (Wrap) and Desktop (Space-between) */}
      <nav className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-zinc-900 pb-4">
        <h1 className="text-xl font-black italic uppercase text-orange-500 tracking-tighter">CUBE_MASTER_V1</h1>
        
        <div className="flex items-center gap-4 sm:gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">TOTAL_MOVES</span>
            <span className="text-2xl font-mono font-black">{moveCount.toString().padStart(3, '0')}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setStatus(status === "ACTIVE" ? "PAUSED" : "ACTIVE")} 
              className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border transition-all ${status === 'ACTIVE' ? 'border-zinc-800 text-zinc-500 hover:bg-zinc-900' : 'bg-green-600 border-green-500 text-white animate-pulse'}`}
            >
              {status === "ACTIVE" ? "Pause" : "Resume"}
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("cube-move", { detail: "RESET" }))} 
              className="text-[10px] font-black uppercase bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-red-900/20"
            >
              Restart
            </button>
          </div>
        </div>
      </nav>

      {/* RESPONSIVE GRID: 1 Column on Mobile, 5 Columns on Desktop */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 gap-4">
        
        {/* LEFT PANEL: Sensor & History */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* AI SENSOR BOX */}
          <section className="bg-[#0a0a0a] border border-zinc-800 p-4 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isCameraOn ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">/AI_SENSOR</span>
              </div>
              <span className="text-[9px] font-black text-zinc-700 italic">LIVE</span>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-zinc-900 ring-1 ring-white/5">
              <HandTracker isActive={isCameraOn && status === "ACTIVE"} />
            </div>
          </section>

          {/* HISTORY BOX */}
          <section className="flex-1 bg-[#0a0a0a] border border-zinc-800 p-4 rounded-2xl flex flex-col min-h-[200px] shadow-2xl">
             <div className="flex justify-between items-center mb-3">
               <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">/HISTORY_LOG</span>
               <button onClick={() => setMoveHistory([])} className="text-[9px] font-black uppercase text-orange-500/50 hover:text-orange-500 transition-colors">Clear</button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {moveHistory.length === 0 && <div className="text-[10px] text-zinc-800 font-bold italic mt-4 uppercase">Waiting for input...</div>}
                {moveHistory.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${i === 0 ? 'bg-orange-600/10 border-orange-600/40 text-orange-500 scale-[1.02]' : 'bg-zinc-950 border-zinc-900 text-zinc-700'}`}>
                    <span className="font-black text-2xl italic tracking-tighter">{m}</span>
                    <span className="text-[8px] font-black opacity-40 italic">{i === 0 ? 'LATEST' : 'PREV'}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* RIGHT PANEL: The 3D Cube */}
        <div className="lg:col-span-4 bg-[#0a0a0a] border border-zinc-800 rounded-3xl flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 relative overflow-hidden shadow-2xl">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-orange-600/5 blur-[120px] pointer-events-none"></div>

          {/* The Actual Cube Container */}
          <div className="w-full h-full min-h-[350px] lg:min-h-0 flex items-center justify-center z-10">
            <Cube />
          </div>

          {/* MANUAL CONTROL BUTTONS: Row on Mobile, Column on Desktop */}
          <div className="flex lg:flex-col flex-wrap justify-center gap-3 mt-8 lg:mt-0 lg:ml-10 z-10">
            {["R", "L", "U", "D", "F", "B"].map((m) => (
              <button 
                key={m} 
                onClick={() => status === "ACTIVE" && window.dispatchEvent(new CustomEvent("cube-move", { detail: m }))} 
                className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl font-black text-xl border transition-all duration-75 ${status === "ACTIVE" ? "bg-zinc-950 border-zinc-800 hover:border-orange-500 hover:text-orange-500 active:scale-90 active:bg-orange-600 active:text-white active:border-orange-400" : "opacity-5 cursor-not-allowed"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* PAUSE OVERLAY */}
          {status === "PAUSED" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center rounded-3xl border border-white/5">
              <div className="text-center animate-pulse">
                <h2 className="text-4xl font-black italic uppercase text-white/20 tracking-[1em] mb-2">SYSTEM_IDLE</h2>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Press Resume to continue</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-4 flex justify-center lg:justify-start">
        <span className="text-[8px] text-zinc-800 font-bold uppercase tracking-widest">© 2026 Developed by JAGDISH // UI_ENGINE_V1.0</span>
      </footer>
    </main>
  );
}