type ProfileCardProps = {
  imageUrl?: string;
  username: string;
  displayName?: string;
};

export default function ProfileCard({
  imageUrl,
  username,
  displayName,
}: ProfileCardProps) {
  const initials = displayName
    ? displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : username.slice(0, 2).toUpperCase();

  return (
    <header className="w-full max-w-md mx-auto flex items-center gap-6 px-8 py-8 rounded-2xl bg-slate-800 shadow-xl border border-slate-700 min-h-[160px]">
      <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-lg font-bold text-slate-200">
        {imageUrl ? (
          <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="flex-1 text-left">
        <div className="text-xs text-slate-400 uppercase tracking-wide">Logged in as</div>
        <div className="text-2xl font-bold text-white">{displayName ?? username}</div>
        <div className="text-sm text-slate-300">@{username}</div>
      </div>
    </header>
  );
}
