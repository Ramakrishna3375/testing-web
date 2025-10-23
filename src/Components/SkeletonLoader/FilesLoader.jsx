
function joinClassNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Skeleton({ className = '', rounded = 'rounded-md', animate = true, ...rest }) {
  return (
    <div
      className={joinClassNames(
        'bg-gray-200 dark:bg-gray-300',
        rounded,
        animate ? 'animate-pulse' : '',
        className
      )}
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3, className = '', lineClassName = '' }) {
  const items = Array.from({ length: Math.max(1, lines) });
  return (
    <div className={joinClassNames('space-y-3', className)}>
      {items.map((_, idx) => (
        <Skeleton
          key={idx}
          className={joinClassNames('h-3 w-full', idx === items.length - 1 ? 'w-5/6' : 'w-full', lineClassName)}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 40, className = '', ...rest }) {
  const style = { width: size, height: size };
  return <Skeleton className={joinClassNames('rounded-full', className)} rounded="rounded-full" style={style} {...rest} />;
}

export function SkeletonRect({ width = '100%', height = 16, className = '', rounded = 'rounded-md', ...rest }) {
  const style = { width, height };
  return <Skeleton className={className} rounded={rounded} style={style} {...rest} />;
}

export function SkeletonCard({
  showAvatar = true,
  lines = 3,
  className = '',
  image = false,
}) {
  return (
    <div className={joinClassNames('w-full', className)}>
      {image && <Skeleton className="w-full h-40 mb-4 rounded-lg" />}
      <div className="flex items-start gap-4">
        {showAvatar && <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />}
        <div className="flex-1">
          <Skeleton className="h-4 w-2/3 mb-3 rounded" />
          <SkeletonText lines={lines} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5, itemClassName = '' }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: Math.max(1, count) }).map((_, i) => (
        <div key={i} className={joinClassNames('flex items-center gap-4', itemClassName)}>
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;


