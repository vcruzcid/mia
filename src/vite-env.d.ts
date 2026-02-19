/// <reference types="vite/client" />

// Vimeo Player API types
declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement, options: {
        id: string;
        autoplay?: boolean;
        muted?: boolean;
        loop?: boolean;
        controls?: boolean;
        responsive?: boolean;
        background?: boolean;
        quality?: string;
      }) => {
        on: (event: string, callback: (data?: unknown) => void) => void;
        destroy: () => void;
        ready: () => Promise<void>;
        play: () => Promise<void>;
        pause: () => Promise<void>;
        getCurrentTime: () => Promise<number>;
        getDuration: () => Promise<number>;
        setCurrentTime: (time: number) => Promise<number>;
        setVolume: (volume: number) => Promise<number>;
        getVolume: () => Promise<number>;
        getMuted: () => Promise<boolean>;
        setMuted: (muted: boolean) => Promise<boolean>;
      };
    };
  }
}
