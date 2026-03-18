import { useState } from 'react';
import IconLabelTabs from "../../components/MenuTab/menu.tab";
import SearchIcon from '@mui/icons-material/Search';
import SearchResultCard from '../../components/SearchCard/search.card.tsx';

function SearchPage() {
    const [searchInput, setSearchInput] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const token = localStorage.getItem('spotify_token');
    setLoading(true);

    try {
        const res = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=track&limit=10`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        console.log('data:', data);

        const tracks = (data.tracks?.items ?? []).map((track) => ({
            id: track.id,
            title: track.name,
            subtitle: track.artists.map((a) => a.name).join(', '),
            imageUrl: track.album?.images?.[0]?.url,
            score: Math.round(track.popularity),
        }));

        setResults(tracks);
    } catch (err) {
        console.error('Search failed:', err);
    } finally {
        setLoading(false);
    }
};

return (
    <div className="h-screen bg-[#0C1D1F] text-white flex flex-col">
        <form
            onSubmit={handleSearch}
            className="w-full max-w-md px-6 pt-20 mx-auto flex items-center gap-2 flex-shrink-0"
        >
            <input
                type="text"
                placeholder="Search for songs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="w-12 h-12 bg-[#1bbad3] hover:bg-[#23d3ee] text-white rounded-full flex items-center justify-center"
            >
                <SearchIcon />
            </button>
        </form>

        <div className="mt-6 px-6 space-y-3 overflow-y-auto flex-1">
            {loading && (
                <div className="text-center text-sm text-slate-300">Searching...</div>
            )}

            {!loading && results.map((item) => (
                <SearchResultCard
                    key={item.id}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                    score={item.score}
                    onClick={() => console.log('Selected', item)}
                />
            ))}

            {!loading && results.length === 0 && searchInput && (
                <div className="text-center text-sm text-slate-300">
                    No results found.
                </div>
            )}

            {!loading && results.length === 0 && !searchInput && (
                <div className="text-center text-sm text-slate-300">
                    Search for a song to get started.
                </div>
            )}
        </div>

        
        <div className="flex-shrink-0 flex flex-col pb-20 items-center w-full">
            <IconLabelTabs activeTab={1} />
        </div>
    </div>
);
}

export default SearchPage;