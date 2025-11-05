import { Profiler, ReactNode } from 'react';

interface ProfilerProps {
  id: string;
  children: ReactNode;
}

export default function AppProfiler({ id, children }: ProfilerProps) {
  const onRender: React.ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    console.log(
      `[Profiler] ${id} phase=${phase} actual=${actualDuration.toFixed(2)}ms base=${baseDuration.toFixed(2)}ms start=${startTime.toFixed(2)} commit=${commitTime.toFixed(2)}`
    );
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}


