import { useState } from 'react';
import IconLabelTabs from "../../components/MenuTab/menu.tab";
import SearchIcon from '@mui/icons-material/Search';
import SearchResultCard from '../../components/SearchCard/search.card.tsx';

function SearchPage() {
    const [searchInput, setSearchInput] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        const token = localStorage.getItem('spotify_token');
        const currentContext = localStorage.getItem('energy_context') || 'normal';
        setContext(currentContext);
        setLoading(true);

        try {
            // 1. get artist ID
            const artistRes = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=artist&limit=5`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const artistData = await artistRes.json();
            const artists = artistData.artists?.items ?? [];
            const artist = artists.find(a =>
                a.name.toLowerCase() === searchInput.toLowerCase()
            ) ?? artists[0];

            if (!artist) {
                setResults([]);
                setLoading(false);
                return;
            }

            console.log('found artist:', artist.name, 'id:', artist.id);

            // 2. fetch 3 pages in parallel
            const [r1, r2, r3] = await Promise.all([
                fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${artist.name}`)}&type=track&limit=10&offset=0`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${artist.name}`)}&type=track&limit=10&offset=10`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${artist.name}`)}&type=track&limit=10&offset=20`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
            ]);

            const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

            // 3. merge and deduplicate
            const seen = new Set();
            const allItems = [
                ...(d1.tracks?.items ?? []),
                ...(d2.tracks?.items ?? []),
                ...(d3.tracks?.items ?? []),
            ].filter(track => {
                if (seen.has(track.id)) return false;
                seen.add(track.id);
                return true;
            });

            // 4. prioritize correct artist songs
            const correctArtistSongs = allItems.filter(t =>
                t.artists.some(a => a.id === artist.id)
            );
            const otherSongs = allItems.filter(t =>
                !t.artists.some(a => a.id === artist.id)
            );
            const items = [...correctArtistSongs, ...otherSongs].slice(0, 20);

            if (items.length === 0) {
                setResults([]);
                setLoading(false);
                return;
            }

            // 5. get energy ratings
            const ids = items.map(t => t.id).join(',');
            const ratingsRes = await fetch(`http://127.0.0.1:8888/rate-songs?ids=${ids}`);
            const ratingsData = await ratingsRes.json();
            const ratings = ratingsData.ratings ?? [];

            items.forEach((track, i) => {
                console.log(`${track.name}: energy=${ratings[i]?.energy}`);
            });

            // 6. rank by closeness to target energy
            const targets = { active: 0.9, stressed: 0.2, tired: 0.3, normal: 0.5 };
            const target = targets[currentContext] ?? 0.5;

            const tracks = items.map((track, i) => {
                const energy = ratings[i]?.energy ?? 0.5;
                const distance = Math.abs(energy - target);
                const energyScore = 1 - distance;

                const isCorrectArtist = track.artists.some(a => a.id === artist.id);
                const finalScore = isCorrectArtist ? energyScore : energyScore * 0.1;

                return {
                    id: track.id,
                    title: track.name,
                    subtitle: track.artists.map((a) => a.name).join(', '),
                    imageUrl: track.album?.images?.[0]?.url,
                    score: Math.round(finalScore * 100),
                    energy,
                    spotifyUrl: `https://open.spotify.com/track/${track.id}`,
                };
            });

            // 7. sort and take top 10
            tracks.sort((a, b) => b.score - a.score);
            setResults(tracks.slice(0, 10));

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
                    placeholder="Search for an artist..."
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

            {context && (
                <div className="px-6 py-2 text-xs text-slate-400 text-center">
                    Ranked for <span className="text-cyan-400 capitalize">{context}</span> mode
                    · {context === 'active' ? '🔥 high energy songs first'
                     : context === 'stressed' ? '😌 calm songs first'
                     : context === 'tired' ? '💤 relaxing songs first'
                     : '⚖️ balanced ranking'}
                </div>
            )}

            <div className="mt-6 px-6 space-y-3 overflow-y-auto flex-1">
                {loading && (
                    <div className="text-center text-sm text-slate-300">
                        <p>Rating songs with AI...</p>
                        <p className="text-xs text-slate-500 mt-1">First search may take a moment — results are cached after</p>
                    </div>
                )}

                {!loading && results.map((item) => (
                    <SearchResultCard
                        key={item.id}
                        imageUrl={item.imageUrl}
                        title={item.title}
                        subtitle={item.subtitle}
                        score={item.score}
                        href={item.spotifyUrl}
                    />
                ))}

                {!loading && results.length === 0 && searchInput && (
                    <div className="text-center text-sm text-slate-300">
                        No results found.
                    </div>
                )}

                {!loading && results.length === 0 && !searchInput && (
                    <div className="text-center text-sm text-slate-300">
                        Search for an artist to get started.
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