import { useEffect, useRef } from 'react';

interface VimeoVideoProps {
  videoId: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  title?: string;
}

export function VimeoVideo({
  videoId,
  className = '',
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  // title is used for accessibility purposes
}: VimeoVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Load Vimeo Player API script if not already loaded
    const loadVimeoScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Vimeo) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Vimeo Player API'));
        document.head.appendChild(script);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadVimeoScript();
        
        if (containerRef.current && window.Vimeo) {
          playerRef.current = new window.Vimeo.Player(containerRef.current, {
            id: videoId,
            autoplay,
            muted,
            loop,
            controls,
            responsive: true,
            background: true,
            quality: 'auto',
            width: '100%',
            height: '100%'
          });

          // Handle player events
          playerRef.current.on('ready', () => {
            // Vimeo player ready
          });

          playerRef.current.on('error', (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Vimeo player error:', error);
          });
        }
      } catch (error) {
        console.error('Failed to initialize Vimeo player:', error);
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, muted, loop, controls]);

  return (
    <>
      <style>{`
        .vimeo-video-container iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }
      `}</style>
      <div 
        ref={containerRef}
        className={`vimeo-video-container ${className}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
        data-vimeo-id={videoId}
        data-vimeo-autoplay={autoplay}
        data-vimeo-muted={muted}
        data-vimeo-loop={loop}
        data-vimeo-controls={controls}
      />
    </>
  );
}
