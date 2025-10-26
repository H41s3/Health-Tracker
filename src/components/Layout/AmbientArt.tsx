import { useMemo } from 'react';

interface AmbientArtProps {
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
}

const themeConfig = {
  dashboard: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-pink-200/15 via-blue-200/15 to-purple-200/15', position: 'top-20 right-10' },
      { id: 2, size: 'w-80 h-80', color: 'from-blue-100/10 via-indigo-100/10 to-purple-100/10', position: 'bottom-40 left-20' },
    ],
  },
  cycle: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-lavender-200/15 via-coral-200/15 to-rose-200/15', position: 'top-10 left-10' },
      { id: 2, size: 'w-80 h-80', color: 'from-violet-100/12 via-purple-100/12 to-fuchsia-100/12', position: 'bottom-20 right-20' },
    ],
  },
  goals: {
    shapes: [
      { id: 1, size: 'w-72 h-72', color: 'from-emerald-200/15 via-teal-200/15 to-cyan-200/15', position: 'top-20 right-20' },
      { id: 2, size: 'w-64 h-64', color: 'from-green-100/10 via-emerald-100/10 to-teal-100/10', position: 'bottom-30 left-10' },
    ],
  },
  insights: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-violet-200/15 via-indigo-200/15 to-blue-200/15', position: 'top-30 left-20' },
      { id: 2, size: 'w-72 h-72', color: 'from-purple-100/12 via-violet-100/12 to-indigo-100/12', position: 'bottom-40 right-15' },
    ],
  },
  settings: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-slate-200/15 via-gray-200/15 to-zinc-200/15', position: 'top-20 left-10' },
    ],
  },
};

export default function AmbientArt({ theme = 'dashboard' }: AmbientArtProps) {
  const shapes = useMemo(() => themeConfig[theme].shapes, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIj4KICAgICAgPGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHJlc3VsdD0ibm9pc2UiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggaW49Im5vaXNlIiB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPgo8L3N2Zz4=')",
          }}
        />
      </div>

      {/* Floating gradient blobs - simplified animations */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute ${shape.position} ${shape.size} will-change-transform pointer-events-none`}
          style={{
            transform: 'translateZ(0)',
          }}
        >
          <div
            className={`h-full w-full rounded-full bg-gradient-to-br ${shape.color}`}
            style={{
              filter: 'blur(60px)',
              willChange: 'transform',
            }}
          />
        </div>
      ))}
    </div>
  );
}

