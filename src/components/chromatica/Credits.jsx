import React, { useEffect, useRef } from 'react';
import { PHOTO_CREDITS, PENDING_REVIEW_NAMES } from '@/data/photoCredits';
import { markCreditsRead } from '@/lib/chromatica-achievement';

export default function Credits({ onClose }) {
  // Latest-ref pattern keeps the keydown listener stable across re-renders
  // even if the parent doesn't memoize onClose.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Watch the scrollable credits dialog: when the user reaches the bottom,
  // mark credits as read (other half of the rainbow-finale unlock).
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight);
      if (remaining < 24) markCreditsRead();
    };
    // If the credits already fit without scrolling, count it as read.
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{
        backgroundColor: 'rgba(5, 5, 8, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'chromatica-fade-in 0.3s ease-out'
      }}
    >
      <div
        ref={scrollRef}
        role="dialog"
        aria-modal="true"
        className="relative overflow-y-auto scroll-hide"
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '88vh',
          backgroundColor: '#0A0A0F',
          border: '1px solid rgba(248, 240, 227, 0.14)',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="close credits"
          className="sticky float-right font-mono-c uppercase tracking-mono"
          style={{
            top: 16,
            right: 16,
            marginRight: 16,
            marginTop: 16,
            fontSize: 11,
            color: 'rgba(250,250,250,0.7)',
            zIndex: 2,
            backgroundColor: 'rgba(15, 12, 18, 0.7)',
            border: '1px solid rgba(248, 240, 227, 0.18)',
            borderRadius: 9999,
            padding: '6px 14px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,1)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.7)')}
        >
          × close
        </button>

        <div className="px-10 py-16">
        <Section label="an artist's statement">
          <p className="font-display italic" style={S.note}>
            Chromatica is a love letter to the future I was promised.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            The future where building and technology held hands and came to life in a holodeck. The future where JARVIS was made as a love letter to a father figure and held him past his breath. That was what AI and the world were always supposed to be to me, a love and a world built for the point of creation where the soul could hold things in abundance.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            And I love this world, and I want to keep loving this world this way. To the point of creation, to the point of invention. I want to love this world and I want to live in it and for it.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            That is what Chromatica is made out of.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            It's a tender memory to the world of colours that came before and how they came to be. This is my way of holding on and dragging them by my teeth to a world that should remember them more than we do now.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            Colour, history, mythology. These are not decorative. They are the point. They deserve to exist in the age we are building, and they deserve to matter in it. The technology should serve them, not the other way around.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            Chromatica is built to preserve. Built to evolve. Built on the conviction that the right tools, used well, free us up to do the human work. The making. The dreaming. The kindness.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            This is the love letter. This is what I am building.
          </p>
        </Section>

        <Section label="soundtrack">
          <p style={S.body}>Miyazaki (The Nature Version) by Paris Paloma in collaboration with NATURE.</p>
          <p style={S.body}>Released April 2026 in partnership with EARTHPERCENT and the Sounds Right initiative.</p>
          <p style={S.body}>Every play of this track via Chromatica contributes royalties to frontline conservation projects in the Amazon, the Congo Basin, and other vital ecosystems.</p>
          <p style={S.body}>Listen to NATURE on Spotify, Apple Music, and other streaming services.</p>
          <p style={S.body}>Learn more about Sounds Right: soundsright.earth</p>
          <p className="font-display italic mt-8" style={{ fontSize: 14, color: 'rgba(250,250,250,0.6)', lineHeight: 1.6 }}>
            This site is built using AI tools whose climate cost is part of what the song mourns. The contradiction is named. The royalties are real.
          </p>
          <p className="font-body mt-6" style={{ fontSize: 13, color: 'rgba(250,250,250,0.5)', lineHeight: 1.6 }}>
            Soundtrack streamed via the YouTube IFrame Player API. Every play of Miyazaki (Nature Version) by Paris Paloma in collaboration with NATURE contributes royalties to frontline conservation through the Sounds Right initiative.
          </p>
        </Section>

        <Section label="photography">
          <p className="font-body" style={{ ...S.body, marginBottom: 24, color: 'rgba(250,250,250,0.6)', fontSize: 14 }}>
            All images sourced from Wikimedia Commons. Photographers and licenses below.
          </p>
          <div className="space-y-6">
            {PHOTO_CREDITS.map((c) => (
              <div key={c.name}>
                <div className="font-display italic" style={{ fontSize: 16, color: '#FAFAFA', marginBottom: 4 }}>
                  {c.name}
                </div>
                <div className="font-body" style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(250,250,250,0.7)' }}>
                  {c.photographer} · {c.license}
                </div>
                <a
                  href={c.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-c break-all"
                  style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', textDecoration: 'none', wordBreak: 'break-all' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.9)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.45)')}
                >
                  {c.source}
                </a>
              </div>
            ))}
          </div>
          <div className="hairline my-10" />
          <p className="font-body" style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(250,250,250,0.5)' }}>
            Pending manual attribution review (Wikimedia Commons sources, awaiting photographer and license confirmation): {PENDING_REVIEW_NAMES.join(', ')}.
          </p>
        </Section>

        <Section label="sources">
          <ul className="space-y-3">
            <li className="font-body flex gap-3" style={S.body}>
              <span style={{ color: 'rgba(250,250,250,0.4)' }}>·</span>
              <span>Victoria Finlay, Color: A Natural History of the Palette (2002)</span>
            </li>
            <li className="font-body flex gap-3" style={S.body}>
              <span style={{ color: 'rgba(250,250,250,0.4)' }}>·</span>
              <span>Philip Ball, Bright Earth: Art and the Invention of Color (2001)</span>
            </li>
            <li className="font-body flex gap-3" style={S.body}>
              <span style={{ color: 'rgba(250,250,250,0.4)' }}>·</span>
              <span>Patrick Syme, Werner's Nomenclature of Colours (1814)</span>
            </li>
          </ul>
        </Section>

        <Section label="built with">
          <p style={S.body}>Chromatica was built using Claude (Anthropic), Base44, and Cowork over a single afternoon for the Base44 Build Battle, 27 April 2026.</p>
          <p style={S.body}>The contradictions in that fact are the subject of this site.</p>
        </Section>

        <div className="hairline my-20" />

        <div className="text-center" style={{ padding: '60px 0' }}>
          <div
            className="font-display lowercase"
            style={{ fontSize: 32, fontWeight: 300, color: '#FAFAFA' }}
          >
            chromatica
          </div>
          <div
            className="font-display italic mt-4"
            style={{ fontSize: 13, color: 'rgba(250,250,250,0.6)' }}
          >
            a love letter to color, scored by a song that asked us not to take it.
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  note: { fontSize: 22, lineHeight: 1.6, color: '#FAFAFA' },
  body: { fontSize: 16, lineHeight: 1.6, color: '#FAFAFA', marginBottom: 8, fontFamily: 'Inter, sans-serif' }
};

function Section({ label, children }) {
  return (
    <div className="mb-20">
      <div
        className="font-mono-c uppercase tracking-mono mb-8"
        style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)' }}
      >
        {label}
      </div>
      {children}
      <div className="hairline mt-20" />
    </div>
  );
}