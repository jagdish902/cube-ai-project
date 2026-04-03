"use client";
import { useState, useEffect, useCallback } from "react";
import Cube from "./Cube";
import HandTracker from "./HandTracker";

export default function Home() {
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED">("ACTIVE");
  const [moveCount, setMoveCount] = useState(0);

  // --- SOUND ENGINE ---
  const playTurnSound = useCallback(() => {
    const audio = new Audio("/cube-turn.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Catch block handles browser auto-play restrictions
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

      // Play Sound on Turn
      playTurnSound();

      setMoveCount(prev => prev + 1);
      setMoveHistory(prev => [move, ...prev].slice(0, 8));
    };

    window.addEventListener("cube-move", handleMove);
    return () => window.removeEventListener("cube-move", handleMove);
  }, [status, playTurnSound]);

  return (
    <main className="h-screen w-full bg-[#050505] text-white p-4 flex flex-col overflow-hidden font-sans">
      
      {/* TOP HEADER */}
      <nav className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-4 shrink-0">
        <h1 className="text-xl font-black tracking-tighter italic uppercase text-orange-500">CUBE_MASTER_V1</h1>
        
        <div className="flex items-center gap-8">
          {/* MOVE COUNTER */}
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-zinc-600 uppercase font-black tracking-[0.3em]">TOTAL_MOVES</span>
            <span className="text-2xl font-mono font-black text-white leading-none">{moveCount.toString().padStart(3, '0')}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setStatus(status === "ACTIVE" ? "PAUSED" : "ACTIVE")} 
              className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl border transition-all ${status === 'ACTIVE' ? 'border-zinc-800 text-zinc-500' : 'bg-green-600 border-green-500 text-white shadow-lg'}`}
            >
              {status === "ACTIVE" ? "Pause" : "Resume"}
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("cube-move", { detail: "RESET" }))} 
              className="text-[10px] font-black uppercase bg-red-600 px-5 py-2 rounded-xl hover:bg-red-500 transition-all shadow-lg active:scale-95"
            >
              Restart
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-1 bg-[#0a0a0a] border border-zinc-800 p-6 rounded-[2.5rem] flex flex-col h-full overflow-hidden">
          <section className="mb-6 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">/AI_SENSOR</span>
              <button onClick={() => setIsCameraOn(!isCameraOn)} className="text-[9px] text-zinc-700 font-bold">{isCameraOn ? "LIVE" : "OFF"}</button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-900 shadow-inner">
              <HandTracker isActive={isCameraOn && status === "ACTIVE"} />
            </div>
          </section>

          <section className="flex-1 flex flex-col min-h-0 border-t border-zinc-900 pt-4 overflow-hidden">
             <div className="flex justify-between items-center mb-4 shrink-0">
               <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">/HISTORY_LOG</span>
               <button onClick={() => setMoveHistory([])} className="text-[9px] text-zinc-800 hover:text-red-500 font-bold uppercase transition-colors">Clear</button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {moveHistory.map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${i === 0 ? 'bg-orange-600/10 border-orange-600 text-orange-500 shadow-lg' : 'bg-zinc-950 border-zinc-900 text-zinc-800'}`}>
                    <span className="font-black text-3xl italic leading-none">{m}</span>
                    <span className="text-[8px] font-bold uppercase opacity-30">{i === 0 ? 'NOW' : 'PAST'}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* MAIN CUBE VIEWPORT */}
        <div className="lg:col-span-4 bg-[#0a0a0a] border border-zinc-900 rounded-[3.5rem] flex items-center justify-between p-12 relative overflow-hidden shadow-inner">
          
          <div className="flex-1 flex items-center justify-center h-full">
            <Cube />
          </div>

          {/* SIDE CONTROLS */}
          <div className="flex flex-col gap-3 ml-8 shrink-0 z-10">
            <div className="h-4 flex items-center justify-center mb-2">
                <span className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.5em] rotate-90">MANUAL_CONTROL</span>
            </div>
            {["R", "L", "U", "D", "F", "B"].map((m) => (
              <button 
                key={m} 
                onClick={() => status === "ACTIVE" && window.dispatchEvent(new CustomEvent("cube-move", { detail: m }))} 
                className={`w-14 h-14 rounded-2xl font-black text-xl transition-all shadow-xl ${status === "ACTIVE" ? "bg-zinc-900 border border-zinc-800 hover:bg-orange-600 hover:text-black active:scale-90" : "bg-black text-zinc-900 border-zinc-950 pointer-events-none opacity-20"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {status === "PAUSED" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center rounded-[3.5rem]">
              <h2 className="text-4xl font-black italic uppercase text-white/5 tracking-tighter select-none">SYSTEM_STANDBY</h2>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}