import React from 'react';

// Reusable Color Card Component
const ColorCard = ({ name, hex, rgb, hsl, role, description, gradient }) => (
  <div className="overflow-hidden rounded-[20px] bg-white shadow-lg shadow-ink/10 transition-transform hover:-translate-y-1">
    <div className="flex h-[120px] items-end p-5" style={{ background: gradient }}>
      <span className="font-nunito text-lg font-extrabold text-white/90 drop-shadow-md">{name}</span>
    </div>
    <div className="grid grid-cols-2 gap-3 p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Hex</p>
        <p className="font-nunito text-sm font-bold text-ink">{hex}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Role</p>
        <p className="font-nunito text-sm font-bold text-ink">{role}</p>
      </div>
      <div className="col-span-2 mt-1 border-t border-ink/5 pt-2 text-[12px] leading-relaxed text-ink-mid">
        {description}
      </div>
    </div>
  </div>
);

export default function StudyPlatform() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-ink px-10 pt-16 pb-14 text-white">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-40" 
               style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(91,79,217,0.45) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
         Hi

          <div className="mt-9 flex flex-wrap gap-2.5">
            Hi
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-10 py-14 space-y-14">
        <h1>Overview</h1>
      </main>
    </div>
  );
}