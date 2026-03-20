import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const initials = displayName
    ? displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : username.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="w-full max-w-md mx-auto flex flex-col gap-4 px-8 py-8 rounded-2xl bg-slate-800 shadow-xl border border-slate-700">
      <div className="flex items-center gap-6">
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
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-red-400 transition border border-slate-600 hover:border-red-400 rounded-lg px-6 py-2"
        >
          Log out
        </button>
      </div>
    </header>
  );
}