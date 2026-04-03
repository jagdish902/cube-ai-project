"use client";
import { useEffect, useRef } from "react";
import { Holistic } from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";

export default function HandTracker({ isActive }: { isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastMoveTime = useRef(0);
  const MOVE_THRESHOLD = 0.12; 
  const MOVE_COOLDOWN = 350; 

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 0,       
      smoothLandmarks: false,   
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults((results) => {
      if (!results.rightHandLandmarks && !results.leftHandLandmarks) return;
      
      const now = Date.now();
      if (now - lastMoveTime.current < MOVE_COOLDOWN) return;

      const hand = results.rightHandLandmarks || results.leftHandLandmarks;
      const wrist = hand[0];
      const middle = hand[9];

      const dx = middle.x - wrist.x;
      const dy = middle.y - wrist.y;

      let move = "";
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > MOVE_THRESHOLD) move = dx > 0 ? "R" : "L";
      } else {
        if (Math.abs(dy) > MOVE_THRESHOLD) move = dy > 0 ? "D" : "U";
      }

      if (move) {
        window.dispatchEvent(new CustomEvent("cube-move", { detail: move }));
        lastMoveTime.current = now;
      }
    });

    const camera = new cam.Camera(videoRef.current, {
      onFrame: async () => {
        if (isActive) await holistic.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    return () => {
      camera.stop();
      holistic.close();
    };
  }, [isActive]);

  return <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />;
}