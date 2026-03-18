type SearchResultCardProps = {
  imageUrl?: string;
  title: string;
  score: number | string;
  subtitle?: string;
  href?: string;
};

export default function SearchResultCard({
  imageUrl,
  title,
  score,
  subtitle,
  href,
}: SearchResultCardProps) {
  const Component = href ? 'a' : 'button';
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { type: 'button' };

  return (
    <Component
      {...props}
      className="w-96 mx-auto flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-300">
              No Image
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle ? (
            <div className="text-xs text-slate-300 mt-0.5">{subtitle}</div>
          ) : null}
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-white">{score}</div>
      </div>
    </Component>
  );
}
