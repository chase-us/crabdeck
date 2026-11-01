import React, { useEffect, useState } from 'react';

interface GooglyEyesProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  expression?: 'happy' | 'crazy' | 'normal';
}

export const GooglyEyes: React.FC<GooglyEyesProps> = ({
  size = 'md',
  label = 'MEGABRAIN EYE-TRACKER v.27',
  expression = 'normal'
}) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const eyeElements = document.querySelectorAll('.googly-eye-socket');
      eyeElements.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = Math.min(
          rect.width / 4,
          Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 10
        );

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        setPupilPos({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const eyeDimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];

  const pupilDimensions = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3 bg-[#a7e2ff]/20 border-4 border-black rounded-2xl shadow-[6px_6px_0px_#000]">
      <div className="flex items-center gap-3">
        {/* Left Eye */}
        <div className={`googly-eye-socket ${eyeDimensions} bg-white rounded-full border-4 border-black relative flex items-center justify-center overflow-hidden shadow-inner`}>
          <div
            className={`pupil ${pupilDimensions} bg-black rounded-full relative flex items-center justify-center transition-transform duration-75`}
            style={{
              transform: `translate(${pupilPos.x}px, ${pupilPos.y}px) ${
                expression === 'crazy' ? 'scale(1.2)' : ''
              }`
            }}
          >
            {/* White Specular Reflection */}
            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
          </div>
        </div>

        {/* Right Eye */}
        <div className={`googly-eye-socket ${eyeDimensions} bg-white rounded-full border-4 border-black relative flex items-center justify-center overflow-hidden shadow-inner`}>
          <div
            className={`pupil ${pupilDimensions} bg-black rounded-full relative flex items-center justify-center transition-transform duration-75`}
            style={{
              transform: `translate(${pupilPos.x * 0.9}px, ${pupilPos.y * 0.9}px) ${
                expression === 'happy' ? 'scale(0.9)' : ''
              }`
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
          </div>
        </div>
      </div>

      {label && (
        <span className="font-rubik text-xs font-bold text-black uppercase tracking-wider bg-[#ffd700] px-2 py-0.5 border-2 border-black rounded-md shadow-[2px_2px_0px_#000]">
          {label}
        </span>
      )}
    </div>
  );
};
