import { useState } from 'react';

export default function Player({ currentSong, isPlaying, togglePlay, onNext, onPrevious, nextSong, upNextSongs, songs, currentIndex, onMoveSong, onPlaySong, volume, setVolume, isShuffle, setIsShuffle, isRepeat, setIsRepeat, commentText, setCommentText, comments, addComment, currentTime, duration, onSeek }) {
  const [showQueue, setShowQueue] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const handleSeekChange = (e) => onSeek((e.target.value / 100) * duration);

  const shareText = `Listen to ${currentSong.trackName} by ${currentSong.artistName} on StarMusic`;
  const shareUrl = window.location.href;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-black border border-gray-600',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-[#229ED9]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
      url: `https://www.instagram.com/`
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        setShowSharePopup(false);
      } catch (err) {}
    } else {
      setShowSharePopup(true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <>
      {/* Share Popup Modal */}
      {showSharePopup && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSharePopup(false)}>
          <div className="bg-[#1A1A1A] rounded-3xl p-6 w-full max-w-sm border border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg">Share this song</h3>
              <button onClick={() => setShowSharePopup(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <p className="text-gray-400 text-sm mb-5 truncate">{currentSong.trackName} - {currentSong.artistName}</p>
            
            <div className="grid grid-cols-5 gap-3 mb-5">
              {shareLinks.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSharePopup(false)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-12 h-12 rounded-full ${app.color} flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition`}>
                    {app.icon}
                  </div>
                  <span className="text-[10px] text-gray-300 text-center leading-tight">{app.name}</span>
                </a>
              ))}
            </div>

            <div className="flex gap-2">
              <input readOnly value={shareUrl} className="flex-1 bg-gray-800 rounded-full px-4 py-2.5 text-xs text-gray-300 outline-none truncate" />
              <button onClick={copyLink} className="bg-white text-black font-bold px-5 rounded-full text-sm hover:bg-gray-200 transition whitespace-nowrap">
                {copied ? 'Copied ✓' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 p-3 z-20">
        <div className="max-w-4xl mx-auto">
          {showQueue && (
            <div className="mb-3 bg-gray-900 rounded-2xl p-3 max-h-56 overflow-y-auto border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">Up Next {isShuffle && <span className="text-green-400 text-xs">(Shuffle ON)</span>}</h3>
                <button onClick={() => setShowQueue(false)} className="text-gray-400 text-xs hover:text-white">Close ✕</button>
              </div>
              {upNextSongs && upNextSongs.length > 0 ? upNextSongs.map((song) => {
                const songIndex = songs.findIndex(s => s.trackId === song.trackId);
                return (
                  <div key={song.trackId} className="flex items-center gap-2 py-2 border-b border-gray-800 last:border-0">
                    <img src={song.artworkUrl100} className="w-9 h-9 rounded" alt="" />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlaySong(song)}>
                      <p className="text-sm font-medium truncate">{song.trackName}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artistName}</p>
                    </div>
                    <button onClick={() => onMoveSong(songIndex, songIndex - 1)} disabled={songIndex <= currentIndex + 1} className="text-gray-400 hover:text-white disabled:opacity-30 px-1">▲</button>
                    <button onClick={() => onMoveSong(songIndex, songIndex + 1)} disabled={songIndex >= songs.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 px-1">▼</button>
                  </div>
                );
              }) : <p className="text-gray-500 text-xs">No more songs in queue</p>}
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <input type="range" min="0" max="100" value={progress} onChange={handleSeekChange} className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500" />
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <img src={currentSong.artworkUrl100} className="w-12 h-12 rounded-lg" alt={currentSong.trackName} />
            <div className="flex-1 text-center md:text-left min-w-0">
              <p className="font-bold text-sm text-white truncate">{currentSong.trackName}</p>
              <p className="text-gray-400 text-xs truncate">{currentSong.artistName}</p>
              {nextSong && <p className="text-green-400 text-xs truncate mt-0.5 font-medium">Next: {nextSong.trackName} - {nextSong.artistName}</p>}
              <button onClick={handleNativeShare} className="mt-1 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-green-400 transition">↗ Share</button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={setIsShuffle} className={isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'} title="Shuffle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" /></svg>
              </button>
              <button onClick={onPrevious} className="text-gray-400 hover:text-white transition" title="Previous">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={togglePlay} className="bg-white hover:bg-gray-200 w-11 h-11 rounded-full flex items-center justify-center text-black transition" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z" /></svg>}
              </button>
              <button onClick={onNext} className="text-gray-400 hover:text-white transition" title="Next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>
              </button>
              <button onClick={() => setIsRepeat(!isRepeat)} className={isRepeat ? 'text-green-500' : 'text-gray-400 hover:text-white'} title="Repeat">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              </button>
              <button onClick={() => setShowQueue(!showQueue)} className={showQueue ? 'text-green-500' : 'text-gray-400 hover:text-white'} title="Up Next Queue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <span>🔊</span>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-24 accent-green-500" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 p-2.5 rounded-full bg-gray-800 text-white placeholder-gray-500 text-sm outline-none focus:bg-gray-700" />
            <button onClick={addComment} className="bg-white text-black px-5 rounded-full font-bold text-sm hover:bg-gray-200 transition">Post</button>
          </div>
          <div className="mt-2 text-xs text-gray-400 max-h-16 overflow-y-auto">
            {comments.map((c, i) => <p key={i} className="py-0.5">{c}</p>)}
          </div>
        </div>
      </div>
    </>
  );
}

