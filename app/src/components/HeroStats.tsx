import { useEffect, useRef, useState } from 'react';
import { sprintInfo } from '@/data/mockData';

function DigitRoller({ digit }: { digit: string }) {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="digit-roller-window">
      <div
        className="digit-roller-track"
        style={{ transform: `translateY(-${parseInt(digit) * 10}%)` }}
      >
        {digits.map((d) => (
          <div key={d} className="digit text-white">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function RollingNumber({ target }: { target: number }) {
  const targetStr = target.toString().padStart(2, '0');

  return (
    <div className="rolling-number">
      {targetStr.split('').map((char, i) => (
        <DigitRoller key={i} digit={char} />
      ))}
    </div>
  );
}

export default function HeroStats() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full h-60 flex items-center justify-center gap-16 px-6"
    >
      {/* Total Commits */}
      <div
        className={`flex flex-col items-center gap-2 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-xs font-mono text-[#969699] tracking-widest uppercase">
          累计提交
        </div>
        <div className="h-px w-24 bg-[#1f1f22]" />
        <div className="text-5xl font-bold font-mono text-white">
          {visible ? (
            <RollingNumber target={sprintInfo.totalCommits} />
          ) : (
            '0000'
          )}
        </div>
        <div className="text-xs text-[#969699]">commits</div>
      </div>

      {/* Vertical divider */}
      <div className="w-px h-24 bg-[#1f1f22]" />

      {/* Active Branches */}
      <div
        className={`flex flex-col items-center gap-2 transition-all duration-700 delay-150 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-xs font-mono text-[#969699] tracking-widest uppercase">
          活跃分支
        </div>
        <div className="h-px w-24 bg-[#1f1f22]" />
        <div className="text-5xl font-bold font-mono text-white">
          {visible ? (
            <RollingNumber target={sprintInfo.activeBranches} />
          ) : (
            '0'
          )}
        </div>
        <div className="text-xs text-[#969699]">active branches</div>
      </div>
    </section>
  );
}
