export default function Playlist({ playlists, activePlaylistId, setActivePlaylistId, activePlaylist, onPlay, onRemove, onDelete, showCreateInput, setShowCreateInput, newPlaylistName, setNewPlaylistName, onCreate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Playlists</h2>
        <button onClick={() => setShowCreateInput(!showCreateInput)} className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-full text-sm transition">
          + New Playlist
        </button>
      </div>

      {showCreateInput && (
        <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4 flex gap-2">
          <input value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onCreate()} placeholder="Playlist name..." className="flex-1 bg-gray-800 rounded-full px-4 py-2.5 text-sm outline-none" autoFocus />
          <button onClick={onCreate} className="bg-white text-black font-bold px-5 rounded-full text-sm">Create</button>
          <button onClick={() => setShowCreateInput(false)} className="bg-gray-800 text-white px-4 rounded-full text-sm">Cancel</button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {playlists.map(p => (
          <div key={p.id} className="flex items-center gap-1 shrink-0">
            <button onClick={() => setActivePlaylistId(p.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activePlaylistId === p.id ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {p.name} ({p.songs.length})
            </button>
            {playlists.length > 1 && (
              <button onClick={() => onDelete(p.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white text-xs transition" title="Delete playlist">✕</button>
            )}
          </div>
        ))}
      </div>

      {!activePlaylist || activePlaylist.songs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg font-medium">No songs in "{activePlaylist?.name}"</p>
          <p className="text-gray-500 text-sm mt-2">Go to Home, click + on any song and choose this playlist</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activePlaylist.songs.map((song) => (
            <div key={song.trackId} className="flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#232323] rounded-xl p-3 transition cursor-pointer" onClick={() => onPlay(song)}>
              <img src={song.artworkUrl100} className="w-12 h-12 rounded-lg" alt={song.trackName} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{song.trackName}</p>
                <p className="text-gray-400 text-xs truncate">{song.artistName}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(song.trackId);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 text-gray-300 hover:text-white transition"
                title="Remove from playlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}