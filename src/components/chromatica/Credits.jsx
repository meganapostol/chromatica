import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Credits({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ backgroundColor: '#050508' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button
        onClick={onClose}
        className="fixed top-6 right-8 font-mono-c uppercase tracking-mono z-10"
        style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)' }}
      >
        × close
      </button>

      <div className="max-w-[720px] mx-auto px-8 py-32">
        <Section label="an artist's note">
          <p className="font-display italic" style={S.note}>
            Chromatica is a love letter to the future I was promised.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            The one with holodecks. With JARVIS quietly orchestrating impossible things in the background while a man in a metal suit went and made beauty out of war. The one where technology was the thing that let us keep our hands on our own creation, that built the manufacturing and the robotics and the infrastructure so that human beings could spend the bulk of their lives on what actually makes us human. Color. History. Mythology. The way a song can hit on every syllable and turn three seconds of footage into something you remember for a year.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            That is not the future we are being shown. The version on offer is gray. Same sans serif. Same minimalist palette. Same flattened aesthetic dressed up as progress. A culture that mistakes restraint for taste and convenience for meaning. I understand why people are furious about it. I am one of those people.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            But I refuse to give up on what the future was meant to be, because the alternative is letting industrialism and minimalism win, and they cannot win. Not on my watch. The future has to have color in it. It has to have the Medici and Miyazaki and the rhythm of an edit where every drum hit lands on a frame so beautiful it knocks the air out of you. Things have to be FUN. They have to be wonderful. These are not decorative qualities. They are the whole point.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            Chromatica is built for that. Built to preserve. Built to evolve. Built to refuse the false choice between a future that has technology and a future that has soul. I am making this because I believe both can exist, and I am making this because I do not want to let it be taken from me.
          </p>
          <p className="font-display italic mt-6" style={S.note}>
            This is the love letter. This is the line in the sand.
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
          <p style={S.body}>[Photography credits pending]</p>
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
          <div
            className="font-mono-c uppercase tracking-mono mt-6"
            style={{ fontSize: 11, color: 'rgba(250,250,250,0.4)' }}
          >
            by Honey Digital · 2026
          </div>
        </div>
      </div>
    </motion.div>
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