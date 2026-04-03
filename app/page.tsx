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
    audio.volume = 0.4;
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
      
      {/* HEADER */}
      <nav className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-zinc-900 pb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic uppercase text-orange-500 tracking-tighter">CUBE_MASTER_V1</h1>
          <span className="text-[7px] text-zinc-700 font-bold tracking-[0.3em] mt-1 uppercase">AI_Gesture_System_Active</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">TOTAL_MOVES</span>
            <span className="text-3xl font-mono font-black tabular-nums">{moveCount.toString().padStart(3, '0')}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setStatus(status === "ACTIVE" ? "PAUSED" : "ACTIVE")} 
              className={`text-[10px] font-black uppercase px-5 py-2.5 rounded-xl border transition-all ${status === 'ACTIVE' ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900' : 'bg-green-600 border-green-500 text-white'}`}
            >
              {status === "ACTIVE" ? "Pause" : "Resume"}
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("cube-move", { detail: "RESET" }))} 
              className="text-[10px] font-black uppercase bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl shadow-lg shadow-red-900/20"
            >
              Restart
            </button>
          </div>
        </div>
      </nav>

      {/* GRID */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 gap-6">
        
        {/* SENSOR & LOG */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="bg-[#0a0a0a] border border-zinc-800 p-5 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCameraOn && status === "ACTIVE" ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">/AI_SENSOR</span>
              </div>
              <button 
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`text-[8px] font-black uppercase px-2 py-1 rounded border transition-colors ${isCameraOn ? 'text-zinc-500 border-zinc-800' : 'text-green-500 border-green-900/50'}`}
              >
                {isCameraOn ? "[ DISABLE ]" : "[ ENABLE ]"}
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-900 relative">
              <HandTracker isActive={isCameraOn && status === "ACTIVE"} />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 text-zinc-800 text-[10px] font-black uppercase">Sensor_Off</div>
              )}
            </div>
          </section>

          <section className="flex-1 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-3xl flex flex-col min-h-[250px]">
             <div className="flex justify-between items-center mb-4">
               <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">/HISTORY</span>
               <button onClick={() => setMoveHistory([])} className="text-[9px] font-black uppercase text-orange-500/40 hover:text-orange-500">Clear</button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {moveHistory.map((m, i) => (
                  <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${i === 0 ? 'bg-orange-600/10 border-orange-600/40 text-orange-500' : 'bg-zinc-950/50 border-zinc-900 text-zinc-700'}`}>
                    <span className="font-black text-3xl italic tracking-tighter">{m}</span>
                    <span className="text-[8px] font-black opacity-40 italic">{i === 0 ? 'LATEST' : `T-${i}`}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* CUBE DISPLAY */}
        <div className="lg:col-span-4 bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="w-full h-full min-h-[400px] lg:min-h-0 flex items-center justify-center z-10">
            <Cube />
          </div>

          {/* MANUAL CONTROLS */}
          <div className="flex lg:flex-col flex-wrap justify-center gap-3 mt-10 lg:mt-0 lg:ml-12 z-10 bg-black/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
            {["R", "L", "U", "D", "F", "B"].map((m) => (
              <button 
                key={m} 
                onClick={() => status === "ACTIVE" && window.dispatchEvent(new CustomEvent("cube-move", { detail: m }))} 
                className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl font-black text-xl border transition-all ${status === "ACTIVE" ? "bg-zinc-900 border-zinc-800 hover:border-orange-500 hover:text-orange-500 active:scale-90 active:bg-orange-600" : "opacity-5 cursor-not-allowed"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {status === "PAUSED" && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-20 flex items-center justify-center rounded-[2.5rem]">
              <h2 className="text-4xl font-black italic uppercase text-white/10 tracking-[0.5em]">PAUSED</h2>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}