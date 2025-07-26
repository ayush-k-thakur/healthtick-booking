import { memo, useMemo } from "react";

type CardSkeletonProps = {
  length: number;
};

const CardSkeleton: React.FC<CardSkeletonProps> = ({ length }) => {
  const placeholders = useMemo(() => Array.from({ length }), [length]);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      aria-busy="true"
    >
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="border border-gray-100 rounded-lg p-3 animate-pulse bg-white shadow-sm flex flex-col min-h-[72px]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-300" />
              <div className="w-16 h-4 bg-gray-300 rounded" />
            </div>
            <div className="w-5 h-5 rounded-sm bg-gray-300" />
          </div>

          <div className="w-32 h-4 bg-gray-300 rounded mb-1" />
          <div className="w-20 h-4 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
};

export default memo(CardSkeleton);
