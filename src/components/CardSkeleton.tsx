type CardSkeletonProps = {
  length: number;
};

export default function CardSkeleton({ length }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-100 rounded-lg p-3 animate-pulse bg-white shadow-sm flex flex-col"
          style={{ minHeight: "72px" }}
        >
          {/* Time & icon skeleton with delete button circle on right */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-300" />
              <div className="w-16 h-4 bg-gray-300 rounded" />
            </div>
            <div className="w-5 h-5 rounded-sm bg-gray-300" />
          </div>

          {/* Name skeleton */}
          <div className="w-32 h-4 bg-gray-300 rounded mb-1" />

          {/* Phone number skeleton */}
          <div className="w-20 h-4 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}
