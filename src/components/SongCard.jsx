export default function SongCard({ song, onPlay, onAdd, onLike, likes, currentSong, isPlaying, onDownload }) {
  const isCurrent = currentSong && currentSong.trackId === song.trackId;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(song.previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.trackName} - ${song.artistName}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      if (onDownload) onDownload(song.trackName);
    } catch (error) {
      if (onDownload) onDownload('Download failed');
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-3 hover:bg-[#232323] transition group cursor-pointer" onClick={() => onPlay(song)}>
      <div className="relative">
        <img src={song.artworkUrl100.replace('100x100', '300x300')} className="w-full aspect-square object-cover rounded-xl" alt={song.trackName} />
        
        {isCurrent && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-1 items-end h-6">
                <span className="w-1 bg-green-500 animate-pulse h-6"></span>
                <span className="w-1 bg-green-500 animate-pulse h-4"></span>
                <span className="w-1 bg-green-500 animate-pulse h-5"></span>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        )}

        {!isCurrent && (
          <button className="absolute bottom-2 right-2 w-11 h-11 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl opacity-0 group-hover:opacity-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
          </button>
        )}
      </div>
      <p className={`font-semibold mt-3 truncate text-sm ${isCurrent ? 'text-green-500' : 'text-white'}`}>{song.trackName}</p>
      <p className="text-gray-400 text-xs truncate">{song.artistName}</p>
      <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onLike(song)} className="flex items-center gap-1 text-gray-400 hover:text-pink-500 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          {likes[song.trackId] || 0}
        </button>
        <div className="flex gap-1">
          <button onClick={() => onAdd(song)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white" title="Add to playlist">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>
          <button onClick={handleDownload} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white" title="Download">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}