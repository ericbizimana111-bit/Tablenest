import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useScrollReveal, useRevealChildren } from '../../../shared/hooks/useScrollReveal';

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const YOUTUBE_VIDEO_ID = 'LDiEvqi-cmU';

/** Fraction of the video card that must be visible before playback starts/stops. */
const VISIBILITY_THRESHOLD = 0.5;

/** YouTube IFrame Player API commands used by this component. */
type YouTubePlayerCommand = 'playVideo' | 'pauseVideo' | 'mute' | 'unMute';

/** Query params that minimize YouTube chrome and enable postMessage control. */
const YOUTUBE_EMBED_PARAMS = new URLSearchParams({
    enablejsapi: '1',
    autoplay: '1',
    mute: '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    controls: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    showinfo: '0',
    cc_load_policy: '0',
});

const VIDEO_SRC = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?${YOUTUBE_EMBED_PARAMS.toString()}`;

const COPY = {
    eyebrow: null,
    headline: 'Exceptional food, from kitchens',
    headlineAccent: 'worth knowing.',
    body:
        'Exceptional dining begins in the kitchen. We partner with restaurants that hold themselves to a higher standard, so every dish that reaches you reflects genuine care and craftsmanship — a meal worth returning for.',
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OurStorySection() {
    const [isVideoInView, setIsVideoInView] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const sectionRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const videoCardRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useScrollReveal(sectionRef, 'reveal');
    useRevealChildren(gridRef, 'stagger');
    useRevealChildren(contentRef, 'stagger');

    /** Sends a command to the embedded YouTube player via the IFrame Player API. */
    const sendPlayerCommand = useCallback((command: YouTubePlayerCommand) => {
        iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: command, args: [] }),
            '*'
        );
    }, []);

    // Observe the video card and toggle `isVideoInView` once it crosses the
    // visibility threshold — this is what drives autoplay/pause on scroll.
    useEffect(() => {
        const target = videoCardRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVideoInView(entry.isIntersecting),
            { threshold: VISIBILITY_THRESHOLD }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    // Play while the card is in view, pause once it scrolls out.
    useEffect(() => {
        sendPlayerCommand(isVideoInView ? 'playVideo' : 'pauseVideo');
    }, [isVideoInView, sendPlayerCommand]);

    const handleToggleMute = useCallback(() => {
        setIsMuted((previouslyMuted) => {
            sendPlayerCommand(previouslyMuted ? 'unMute' : 'mute');
            return !previouslyMuted;
        });
    }, [sendPlayerCommand]);

    return (
        <>
            <style>{STYLES}</style>

            <section className="story-section">
                <div ref={sectionRef} className="story-container">
                    <div ref={gridRef} className="story-grid stagger">
                        <VideoCard
                            videoCardRef={videoCardRef}
                            iframeRef={iframeRef}
                            isMuted={isMuted}
                            onToggleMute={handleToggleMute}
                        />
                        <StoryContent contentRef={contentRef} />
                    </div>
                </div>
            </section>
        </>
    );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

interface VideoCardProps {
    videoCardRef: React.RefObject<HTMLDivElement>;
    iframeRef: React.RefObject<HTMLIFrameElement>;
    isMuted: boolean;
    onToggleMute: () => void;
}

function VideoCard({ videoCardRef, iframeRef, isMuted, onToggleMute }: VideoCardProps) {
    return (
        <div className="story-video-card">
            <div ref={videoCardRef} className="story-video-card-inner">
                <iframe
                    ref={iframeRef}
                    className="story-video-frame"
                    src={VIDEO_SRC}
                    title="TableNest Experience"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />

                {/* Masks the YouTube logo watermark that appears bottom-right on hover/pause */}
                <div className="story-video-logo-mask" aria-hidden="true" />

                <button
                    type="button"
                    className="story-mute-toggle"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    aria-pressed={!isMuted}
                    onClick={onToggleMute}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>
        </div>
    );
}

interface StoryContentProps {
    contentRef: React.RefObject<HTMLDivElement>;
}

function StoryContent({ contentRef }: StoryContentProps) {
    return (
        <div ref={contentRef} className="story-content-col stagger">
            <h2 className="story-headline">
                {COPY.headline} <span className="story-headline-accent">{COPY.headlineAccent}</span>
            </h2>
            <p className="story-body">{COPY.body}</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
/*  Font-family is intentionally left unset throughout so the section  */
/*  inherits whatever typeface the app defines globally.               */

const STYLES = `
    .story-section {
        background: #FFFFFF;
        padding-top: 48px;
        padding-bottom: 80px;
        width: 100%;
        position: relative;
        overflow: hidden;
        border-top: 1px solid #F1F5F9;
    }

    .story-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 40px;
        width: 100%;
    }

    .story-grid {
        display: grid;
        grid-template-columns: 1.2fr 1.05fr;
        gap: 56px;
        align-items: start;
    }

    /* ---- Video card ---- */

    .story-video-card {
        display: flex;
        flex-direction: column;
    }

    .story-video-card-inner {
        position: relative;
        border-radius: 18px;
        overflow: hidden;
        background: #0F172A;
        box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04);
        aspect-ratio: 16 / 9;
        transition: transform 0.3s var(--ease-out-expo, ease-out),
                    box-shadow 0.3s var(--ease-smooth, ease-out);
    }

    .story-video-card-inner:hover {
        transform: translateY(-4px);
        box-shadow: 0 14px 40px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06);
    }

    .story-video-frame {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: #000;
    }

    .story-video-logo-mask {
        position: absolute;
        z-index: 1;
        bottom: 0;
        right: 0;
        width: 70px;
        height: 46px;
        background: transparent;
        pointer-events: none;
    }

    .story-mute-toggle {
        position: absolute;
        z-index: 2;
        bottom: 14px;
        right: 14px;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(15, 23, 42, 0.55);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .story-mute-toggle:hover {
        background: rgba(249, 115, 22, 0.9);
        transform: scale(1.05);
    }

    .story-mute-toggle:focus-visible {
        outline: 2px solid #F97316;
        outline-offset: 2px;
    }

    /* ---- Text content ---- */

    .story-content-col {
        display: flex;
        flex-direction: column;
        gap: 28px;
    }

    .story-headline {
        font-size: clamp(30px, 3.6vw, 44px);
        font-weight: 800;
        line-height: 1.18;
        letter-spacing: -1.2px;
        color: #0F172A;
        margin-bottom: 0;
    }

    .story-headline-accent {
        color: #F97316;
    }

    .story-body {
        font-size: 15px;
        color: #64748B;
        line-height: 1.75;
        margin: 0;
    }

    /* ---- Shared UI primitives (retained for section-wide reuse) ---- */

    .story-badge-pill {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #F97316;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
        letter-spacing: 0.02em;
        z-index: 2;
    }

    .story-btn-primary {
        background: #F97316;
        color: #FFFFFF;
        transition: all 0.25s ease;
    }

    .story-btn-primary:hover {
        background: #EA580C;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
    }

    .story-btn-secondary {
        background: #FFF7ED;
        color: #EA580C;
        border: 1.5px solid #FED7AA;
        transition: all 0.25s ease;
    }

    .story-btn-secondary:hover {
        background: #FFEDD5;
        border-color: #FDBA74;
        transform: translateY(-2px);
    }

    /* ---- Responsive ---- */

    @media (max-width: 960px) {
        .story-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
        }
    }

    @media (max-width: 600px) {
        .story-video-card {
            order: 1 !important;
        }
        .story-content-col {
            order: 2 !important;
        }
    }
`;