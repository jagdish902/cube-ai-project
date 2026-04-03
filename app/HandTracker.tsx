"use client";
import React, { useRef, useEffect, useState } from "react";

export default function HandTracker({ isActive }: { isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const lastMove = useRef<number>(0);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (!isReady || !isActive) {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      return;
    }
    const start = async () => {
      try {
        // @ts-ignore
        if (window.Hands && !handsRef.current) {
          // @ts-ignore
          handsRef.current = new window.Hands({ locateFile: (file: any) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
          handsRef.current.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
          handsRef.current.onResults((res: any) => {
            if (!res.multiHandLandmarks?.length) return;
            const wrist = res.multiHandLandmarks[0][0];
            const finger = res.multiHandLandmarks[0][8];
            const now = Date.now();
            
            // HIGHER SENSITIVITY GESTURES
            if (now - lastMove.current > 500) {
              let move = null;
              const dx = finger.x - wrist.x;
              const dy = finger.y - wrist.y;

              if (Math.abs(dx) > Math.abs(dy)) {
                if (dx < -0.1) move = "L";
                else if (dx > 0.1) move = "R";
              } else {
                if (dy < -0.1) move = "U";
                else if (dy > 0.1) move = "D";
              }

              if (move) { 
                window.dispatchEvent(new CustomEvent("cube-move", { detail: move })); 
                lastMove.current = now; 
              }
            }
          });
        }
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => {
            const loop = async () => {
              if (videoRef.current && handsRef.current && isActive) {
                try { await handsRef.current.send({ image: videoRef.current }); requestAnimationFrame(loop); } catch (e) {}
              }
            };
            loop();
          };
        }
      } catch (err) { console.error("Camera Init Failed"); }
    };
    start();
  }, [isActive, isReady]);

  return (
    <div className="w-full h-full bg-[#050505] relative flex items-center justify-center overflow-hidden rounded-3xl">
      <video ref={videoRef} className={`w-full h-full object-cover grayscale scale-x-[-1] transition-all duration-700 ${isActive ? 'opacity-40 brightness-125' : 'opacity-0'}`} playsInline muted autoPlay />
      
      {/* CLEANER STANDBY UI */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-32 h-[1px] bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-orange-600 animate-[loading_2s_infinite]" style={{ width: '40%' }} />
          </div>
          <p className="text-[7px] font-bold tracking-[0.6em] text-zinc-700 mt-3 uppercase italic">System_Idle</p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}