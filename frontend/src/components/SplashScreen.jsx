import React, { useEffect, useState } from 'react';


export default function SplashScreen({ onFinish, duration = 2600 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 400);
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow radial berdenyut di belakang logo */}
        <div className="absolute w-64 h-64 rounded-full raiflix-glow" />

        {/* Logo dengan animasi scale bounce + shimmer sweep */}
        <h1 className="relative text-5xl md:text-6xl font-black tracking-wide raiflix-logo-pop raiflix-shimmer">
          RAIFLIX
        </h1>
      </div>

      <style>{`
        @keyframes raiflixPop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes raiflixGlowPulse {
          0%, 100% {
            box-shadow: 0 0 60px 20px rgba(79, 70, 229, 0.35);
            transform: scale(0.9);
          }
          50% {
            box-shadow: 0 0 90px 35px rgba(37, 99, 235, 0.55);
            transform: scale(1.05);
          }
        }

        @keyframes raiflixShimmerSweep {
          0% { background-position: -200% center; }
          60% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .raiflix-glow {
          background: radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%);
          animation: raiflixGlowPulse 1.6s ease-in-out infinite;
        }

        .raiflix-logo-pop {
          animation: raiflixPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .raiflix-shimmer {
          background: linear-gradient(
            90deg,
            #2563eb 0%,
            #4f46e5 25%,
            #ffffff 50%,
            #4f46e5 75%,
            #2563eb 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: raiflixShimmerSweep 1.8s ease-in-out 0.9s 1 both;
        }
      `}</style>
    </div>
  );
}