import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Persistent YouTube IFrame player with editorial controls.
// Imperative API: { play, pause, isReady }
const MusicPlayer = forwardRef(function MusicPlayer(props, ref) {
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function init() {
      if (cancelled) return;
      // eslint-disable-next-line no-undef
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: 'ZzUPiAvUMKQ',
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: 'ZzUPiAvUMKQ',
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            playerRef.current.setVolume(50);
            setReady(true);
          },
          onStateChange: (e) => {
            // 1 = playing, 2 = paused
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2 || e.data === 0) setIsPlaying(false);
          }
        }
      });
    }

    if (window.YT && window.YT.Player) {
      init();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = init;
    }

    return () => { cancelled = true; };
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => { if (ready && playerRef.current) playerRef.current.playVideo(); },
    pause: () => { if (ready && playerRef.current) playerRef.current.pauseVideo(); },
    mute: () => { if (ready && playerRef.current) playerRef.current.mute(); },
    unmute: () => { if (ready && playerRef.current) playerRef.current.unMute(); },
    getCurrentTime: () => {
      if (!ready || !playerRef.current?.getCurrentTime) return 0;
      try { return playerRef.current.getCurrentTime() || 0; } catch { return 0; }
    },
    isReady: () => ready
  }), [ready]);

  const togglePlay = () => {
    if (!ready) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const changeVolume = (delta) => {
    if (!ready) return;
    const next = Math.max(0, Math.min(100, volume + delta));
    setVolume(next);
    playerRef.current.setVolume(next);
  };

  return (
    <>
      <div id="yt-player" style={{ position: 'absolute', top: -9999, left: -9999, width: 1, height: 1 }} />

      <div
        className="fixed z-50"
        style={{ bottom: 24, right: 24 }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center"
            aria-label="expand player"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              backgroundColor: 'rgba(10, 10, 15, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250,250,250,0.15)',
              color: 'rgba(250,250,250,0.7)',
              fontSize: 14
            }}
          >
            ♪
          </button>
        ) : (
          <div
            style={{
              width: 280,
              padding: 16,
              borderRadius: 12,
              backgroundColor: 'rgba(10, 10, 15, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250,250,250,0.15)'
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="font-mono-c uppercase tracking-mono"
                style={{ fontSize: 9, color: 'rgba(250,250,250,0.4)' }}
              >
                now playing
              </div>
              <button
                onClick={() => setCollapsed(true)}
                aria-label="collapse player"
                style={{ color: 'rgba(250,250,250,0.5)', fontSize: 12, lineHeight: 1 }}
              >
                —
              </button>
            </div>
            <div
              className="font-display italic"
              style={{ fontSize: 12, color: '#FAFAFA' }}
            >
              Miyazaki (Nature Version)
            </div>
            <div
              className="font-mono-c"
              style={{ fontSize: 10, color: 'rgba(250,250,250,0.6)', marginTop: 2 }}
            >
              Paris Paloma & NATURE
            </div>

            <div className="flex items-center gap-5 mt-3">
              <PlayerBtn onClick={togglePlay} aria-label={isPlaying ? 'pause' : 'play'}>
                {isPlaying ? '❙❙' : '▶'}
              </PlayerBtn>
              <PlayerBtn onClick={() => changeVolume(-10)} aria-label="volume down">–</PlayerBtn>
              <PlayerBtn onClick={() => changeVolume(10)} aria-label="volume up">+</PlayerBtn>
              <button
                onClick={() => changeVolume(10)}
                onWheel={(e) => { e.preventDefault(); changeVolume(e.deltaY < 0 ? 5 : -5); }}
                aria-label={`volume ${volume} percent, scroll or click to adjust`}
                className="ml-auto flex items-center gap-1.5 font-mono-c"
                style={{
                  fontSize: 10,
                  color: 'rgba(250,250,250,0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,1)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.7)')}
              >
                <SpeakerIcon level={volume} />
                <span>{volume}%</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

function SpeakerIcon({ level = 50 }) {
  // 12px speaker with 0/1/2 sound waves based on volume level
  const waves = level === 0 ? 0 : level < 40 ? 1 : 2;
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 6 H6 L9.5 3 V13 L6 10 H3 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {waves >= 1 && (
        <path d="M11.2 5.6 Q12.4 8 11.2 10.4" stroke="currentColor" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      )}
      {waves >= 2 && (
        <path d="M13 4 Q15 8 13 12" stroke="currentColor" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      )}
      {level === 0 && (
        <path d="M11 5 L15 11 M15 5 L11 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      )}
    </svg>
  );
}

function PlayerBtn({ children, ...rest }) {
  return (
    <button
      {...rest}
      className="font-mono-c transition-opacity"
      style={{
        fontSize: 14,
        color: 'rgba(250,250,250,0.5)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        lineHeight: 1
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,1)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.5)')}
    >
      {children}
    </button>
  );
}

export default MusicPlayer;