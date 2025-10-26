import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AmbientArtProps {
  theme?: 'dashboard' | 'cycle' | 'goals' | 'insights' | 'settings';
}

const themeConfig = {
  dashboard: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-pink-200/20 via-blue-200/20 to-purple-200/20', position: 'top-20 right-10', delay: 0 },
      { id: 2, size: 'w-80 h-80', color: 'from-blue-100/15 via-indigo-100/15 to-purple-100/15', position: 'bottom-40 left-20', delay: 0.5 },
      { id: 3, size: 'w-72 h-72', color: 'from-rose-200/10 to-pink-200/10', position: 'top-1/2 right-1/3', delay: 1 },
    ],
  },
  cycle: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-lavender-200/25 via-coral-200/25 to-rose-200/25', position: 'top-10 left-10', delay: 0 },
      { id: 2, size: 'w-80 h-80', color: 'from-violet-100/20 via-purple-100/20 to-fuchsia-100/20', position: 'bottom-20 right-20', delay: 0.7 },
      { id: 3, size: 'w-56 h-56', color: 'from-pink-200/15 to-rose-200/15', position: 'top-1/3 left-1/4', delay: 1.2 },
    ],
  },
  goals: {
    shapes: [
      { id: 1, size: 'w-72 h-72', color: 'from-emerald-200/20 via-teal-200/20 to-cyan-200/20', position: 'top-20 right-20', delay: 0 },
      { id: 2, size: 'w-64 h-64', color: 'from-green-100/15 via-emerald-100/15 to-teal-100/15', position: 'bottom-30 left-10', delay: 0.6 },
      { id: 3, size: 'w-80 h-80', color: 'from-sky-200/10 to-blue-200/10', position: 'top-2/3 right-1/4', delay: 1.1 },
    ],
  },
  insights: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-violet-200/20 via-indigo-200/20 to-blue-200/20', position: 'top-30 left-20', delay: 0 },
      { id: 2, size: 'w-72 h-72', color: 'from-purple-100/15 via-violet-100/15 to-indigo-100/15', position: 'bottom-40 right-15', delay: 0.5 },
      { id: 3, size: 'w-56 h-56', color: 'from-indigo-200/12 to-blue-200/12', position: 'top-1/2 left-1/3', delay: 1 },
    ],
  },
  settings: {
    shapes: [
      { id: 1, size: 'w-64 h-64', color: 'from-slate-200/25 via-gray-200/25 to-zinc-200/25', position: 'top-20 left-10', delay: 0 },
      { id: 2, size: 'w-72 h-72', color: 'from-neutral-100/20 via-stone-100/20 to-gray-100/20', position: 'bottom-30 right-20', delay: 0.7 },
    ],
  },
};

export default function AmbientArt({ theme = 'dashboard' }: AmbientArtProps) {
  const shapes = useMemo(() => themeConfig[theme].shapes, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIj4KICAgICAgPGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHJlc3VsdD0ibm9pc2UiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggaW49Im5vaXNlIiB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPgo8L3N2Zz4=')",
          }}
        />
      </div>

      {/* Floating gradient blobs */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.position} ${shape.size}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 0.8, 1],
            scale: [0.8, 1.1, 1, 0.9],
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 20 + shape.delay * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay * 2,
          }}
        >
          <div
            className={`h-full w-full rounded-full bg-gradient-to-br ${shape.color} blur-[60px]`}
            style={{
              filter: 'blur(60px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

