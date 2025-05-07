"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RouletteWheelProps {
  isSpinning: boolean;
  resultIndex: number | null;
  spinDuration: number;
  presetWinner: number | null;
  entries: string[];
}

export default function RouletteWheel({
  isSpinning,
  resultIndex,
  spinDuration,
  presetWinner,
  entries,
}: RouletteWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [previousRotation, setPreviousRotation] = useState(0);

  // Generate colors for the wheel segments
  const getSegmentColor = (index: number) => {
    // Alternate between colors
    const colors = [
      "bg-red-600",
      "bg-black",
      "bg-blue-600",
      "bg-purple-600",
      "bg-orange-600",
    ];
    return colors[index % colors.length];
  };

  // Calculate the rotation angle for a specific index
  const getRotationForIndex = (index: number) => {
    if (index < 0 || index >= entries.length) return 0;

    // Each segment takes up 360/entries.length degrees
    // We add 180 to make the pointer land at the top of the wheel
    return 180 + index * (360 / entries.length);
  };

  useEffect(() => {
    if (isSpinning && entries.length > 0) {
      let targetRotation;

      if (presetWinner !== null && presetWinner < entries.length) {
        // Calculate exact rotation to land on preset winner
        const targetAngle = getRotationForIndex(presetWinner);
        // Add multiple full rotations plus the target angle
        targetRotation = previousRotation + (1080 + targetAngle);
      } else {
        // Random rotation (at least 3 full spins + random position)
        targetRotation = previousRotation + 1080 + Math.random() * 360;
      }

      // Start the animation
      if (wheelRef.current) {
        wheelRef.current.style.transition = `transform ${
          spinDuration / 1000
        }s cubic-bezier(0.32, 0.94, 0.60, 1)`;
        setRotation(targetRotation);
        setPreviousRotation(targetRotation % 360); // Store for next spin
      }
    }
  }, [
    isSpinning,
    presetWinner,
    spinDuration,
    previousRotation,
    entries.length,
  ]);

  return (
    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
      {/* Static outer ring */}
      <div className="absolute inset-0 rounded-full border-8 border-yellow-600 bg-gray-800 shadow-lg"></div>

      {/* Spinning wheel */}
      <div
        ref={wheelRef}
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Wheel segments */}
        {entries.map((text, index) => {
          const angle = (index * 360) / entries.length;
          const color = getSegmentColor(index);

          return (
            <div
              key={index}
              className={cn(
                "absolute top-0 left-1/2 w-1 h-1/2 -ml-0.5 origin-bottom",
                "flex justify-center items-start"
              )}
              style={{
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div
                className={cn(
                  "absolute top-[20%] -translate-x-1/2 -translate-y-1/2 transform rotate-90",
                  "w-[120px] text-center px-2 py-1",
                  "text-white font-medium text-xs sm:text-sm"
                )}
                style={{ transform: `rotate(${90 + angle}deg)` }}
              >
                {text}
              </div>

              {/* Segment divider line */}
              <div className="h-full w-0.5 bg-yellow-600"></div>

              {/* Colored segment background */}
              <div
                className={cn("absolute -z-10 origin-bottom", color)}
                style={{
                  width: `${Math.ceil(
                    500 * Math.tan(Math.PI / entries.length)
                  )}px`,
                  height: "100%",
                  transform: `translateX(-50%) rotate(${-(
                    180 / entries.length
                  )}deg)`,
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 rounded-full bg-yellow-600 z-10 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-yellow-800"></div>
      </div>

      {/* Pointer indicator */}
      <div className="absolute top-0 left-1/2 -ml-3 w-6 h-6 bg-white rounded-full z-20 shadow-md"></div>
    </div>
  );
}
