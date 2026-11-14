import { useState, useEffect, useRef } from 'react';
import SongCard from './components/SongCard';
import Player from './components/Player';
import Playlist from './components/Playlist';

export default function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likes, setLikes] = useState({});
  const [favourites, setFavourites] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toast, setToast] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [playlists, setPlaylists] = useState([{ id: 1, name: 'My Playlist', songs: [] }]);
  const [activePlaylistId, setActivePlaylistId] = useState(1);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [pendingSong, setPendingSong] = useState(null);
  const [user, setUser] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signInName, setSignInName] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const audioRef = useRef(new Audio());
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    const savedLikes = localStorage.getItem('likes');
    if (savedLikes) setLikes(JSON.parse(savedLikes));
    const savedFavourites = localStorage.getItem('favourites');
    if (savedFavourites) setFavourites(JSON.parse(savedFavourites));
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { localStorage.setItem('recentSearches', JSON.stringify(recentSearches)); }, [recentSearches]);
  useEffect(() => { localStorage.setItem('likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('favourites', JSON.stringify(favourites)); }, [favourites]);
  useEffect(() => { if (user) localStorage.setItem('userProfile', JSON.stringify(user)); else localStorage.removeItem('userProfile'); }, [user]);

  const saveRecentSearch = (term) => {
    const trimmedTerm = term.trim(); if (!trimmedTerm) return;
    const filteredSearches = recentSearches.filter((item) => item.toLowerCase() !== trimmedTerm.toLowerCase());
    setRecentSearches([trimmedTerm, ...filteredSearches].slice(0, 5));
  };
  const deleteRecentSearch = (term) => setRecentSearches(recentSearches.filter((item) => item !== term));
  const clearAllRecentSearches = () => { setRecentSearches([]); showToast('Recent searches cleared'); };
  const handleSignIn = () => {
    if (!signInName.trim() || !signInEmail.trim()) { showToast('Please enter name and email'); return; }
    const newUser = { name: signInName.trim(), email: signInEmail.trim(), joinedAt: new Date().toISOString() };
    setUser(newUser); setShowSignInModal(false); setShowProfileMenu(false); setSignInName(''); setSignInEmail(''); showToast(`Welcome, ${newUser.name}`);
  };
  const handleSignOut = () => { setUser(null); setShowProfileMenu(false); showToast('Signed out successfully'); };
  const clearAllFavourites = () => { setFavourites([]); setLikes({}); setShowProfileMenu(false); showToast('All favourites cleared'); };

  const searchSongs = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&media=music&limit=20`);
      const data = await response.json();
      setSongs(data.results); setIsSearching(true); setActiveTab('home');
      if (searchTerm !== 'hits') saveRecentSearch(searchTerm);
    } catch (error) { console.error('Search failed:', error); }
  };
  const goHome = () => { setQuery(''); setIsSearching(false); setActiveTab('home'); searchSongs('hits'); };
  const handleKeywordClick = (keyword) => { setQuery(keyword); searchSongs(keyword); };
  useEffect(() => { searchSongs('hits'); }, []);

  const playSong = (song) => {
    const audio = audioRef.current;
    if (currentSong && currentSong.trackId === song.trackId) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); } else { audio.play(); setIsPlaying(true); }
      return;
    }
    setCurrentSong(song); audio.src = song.previewUrl; audio.volume = volume; audio.play(); setIsPlaying(true); setCurrentTime(0);
  };

  const playNext = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex((song) => song.trackId === currentSong?.trackId);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const playPrevious = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex((song) => song.trackId === currentSong?.trackId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  const handleShuffleToggle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    if (newShuffle && songs.length > 1) {
      const shuffled = [...songs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setSongs(shuffled);
      showToast('Shuffle ON - Songs mixed');
    } else {
      showToast('Shuffle OFF');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (isRepeat) { audio.currentTime = 0; audio.play(); }
      else playNext();
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, songs, currentSong]);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);

  const togglePlay = () => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (isPlaying) { audio.pause(); setIsPlaying(false); } else { audio.play(); setIsPlaying(true); }
  };

  const currentIndex = songs.findIndex((song) => song.trackId === currentSong?.trackId);
  const nextSong = songs.length > 0 && currentSong ? songs[(currentIndex + 1) % songs.length] : null;
  const upNextSongs = currentIndex >= 0 ? songs.slice(currentIndex + 1, currentIndex + 6) : songs.slice(0, 5);

  const moveSong = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= songs.length) return;
    const newSongs = [...songs];
    const [moved] = newSongs.splice(fromIndex, 1);
    newSongs.splice(toIndex, 0, moved);
    setSongs(newSongs);
    showToast('Queue order updated');
  };

  const seekTo = (time) => { audioRef.current.currentTime = time; setCurrentTime(time); };
  const showToast = (message) => { setToast(message); setTimeout(() => setToast(''), 3000); };
  const openAddToPlaylist = (song) => setPendingSong(song);
  const addToSelectedPlaylist = (playlistId) => {
    if (!pendingSong) return;
    setPlaylists((prevPlaylists) => prevPlaylists.map((playlist) => {
      if (playlist.id === playlistId) {
        const isAlreadyAdded = playlist.songs.some((song) => song.trackId === pendingSong.trackId);
        if (isAlreadyAdded) return playlist;
        return { ...playlist, songs: [...playlist.songs, pendingSong] };
      }
      return playlist;
    }));
    setPendingSong(null); showToast('Added to Playlist');
  };
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = { id: Date.now(), name: newPlaylistName.trim(), songs: pendingSong ? [pendingSong] : [] };
    setPlaylists([...playlists, newPlaylist]); setActivePlaylistId(newPlaylist.id); setNewPlaylistName(''); setShowCreateInput(false); setPendingSong(null); showToast('Playlist Created');
  };
  const removeFromPlaylist = (songId) => setPlaylists((prevPlaylists) => prevPlaylists.map((playlist) => playlist.id === activePlaylistId ? { ...playlist, songs: playlist.songs.filter((song) => song.trackId !== songId) } : playlist));
  const deletePlaylist = (playlistId) => {
    if (playlists.length === 1) { showToast('Cannot delete last playlist'); return; }
    const updatedPlaylists = playlists.filter((playlist) => playlist.id !== playlistId);
    setPlaylists(updatedPlaylists); if (activePlaylistId === playlistId) setActivePlaylistId(updatedPlaylists[0].id); showToast('Playlist Deleted');
  };
  const likeSong = (song) => {
    const isCurrentlyLiked = likes[song.trackId] === 1;
    if (isCurrentlyLiked) {
      setLikes((prevLikes) => ({ ...prevLikes, [song.trackId]: 0 }));
      setFavourites((prevFavourites) => prevFavourites.filter((item) => item.trackId !== song.trackId)); showToast('Removed from Favourites');
    } else {
      setLikes((prevLikes) => ({ ...prevLikes, [song.trackId]: 1 }));
      setFavourites((prevFavourites) => { const isAlreadyFavourite = prevFavourites.some((item) => item.trackId === song.trackId); if (isAlreadyFavourite) return prevFavourites; return [song, ...prevFavourites]; }); showToast('Added to Favourites');
    }
  };
  const addComment = () => { if (!commentText.trim()) return; setComments([commentText, ...comments]); setCommentText(''); };
  const handleDownloadToast = () => showToast('Download Successful');
  const handleSearch = () => searchSongs();
  const activePlaylist = playlists.find((playlist) => playlist.id === activePlaylistId) || playlists[0];
  const totalPlaylistSongs = playlists.reduce((total, playlist) => total + playlist.songs.length, 0);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-32 md:pb-40 overflow-x-hidden">
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black font-bold px-6 py-3 rounded-full shadow-2xl text-sm">{toast}</div>}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowSignInModal(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">Sign In</h3>
            <p className="text-gray-400 text-sm mb-5">Create your profile to personalize your music experience.</p>
            <div className="space-y-3">
              <input value={signInName} onChange={(event) => setSignInName(event.target.value)} placeholder="Your name" className="w-full bg-gray-800 rounded-full px-5 py-3 text-sm outline-none placeholder-gray-500 focus:bg-gray-700 transition" />
              <input value={signInEmail} onChange={(event) => setSignInEmail(event.target.value)} placeholder="Email address" type="email" className="w-full bg-gray-800 rounded-full px-5 py-3 text-sm outline-none placeholder-gray-500 focus:bg-gray-700 transition" />
            </div>
            <button onClick={handleSignIn} className="w-full mt-5 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-full text-sm transition">Sign In</button>
            <button onClick={() => setShowSignInModal(false)} className="w-full mt-2 text-gray-400 text-sm py-2 hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}
      {pendingSong && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPendingSong(null)}>
          <div className="bg-[#1A1A1A] rounded-2xl p-5 w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-bold mb-1">Add to Playlist</h3>
            <p className="text-gray-400 text-sm mb-4 truncate">{pendingSong.trackName} - {pendingSong.artistName}</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => addToSelectedPlaylist(playlist.id)} className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 flex justify-between items-center transition">
                  <span className="font-medium text-sm">{playlist.name}</span><span className="text-gray-400 text-xs">{playlist.songs.length} songs</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input value={newPlaylistName} onChange={(event) => setNewPlaylistName(event.target.value)} placeholder="New playlist name..." className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm outline-none" />
                <button onClick={createPlaylist} className="bg-green-500 text-black font-bold px-4 rounded-full text-sm">Create</button>
              </div>
            </div>
            <button onClick={() => setPendingSong(null)} className="w-full mt-3 text-gray-400 text-sm py-2 hover:text-white">Cancel</button>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-10 bg-[#0F0F0F]/90 backdrop-blur-md p-4 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight"><span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">StarMusic</span><span className="ml-2 text-xl">🎶</span></h1>
          <p className="mx-auto text-center text-sm md:text-base font-medium tracking-[0.18em] text-gray-300 uppercase">Music of Your Choice</p>
          <div className="flex gap-2 flex-wrap justify-end items-center">
            <button onClick={goHome} className={`px-5 py-2 rounded-full text-sm font-bold transition ${activeTab === 'home' && !isSearching ? 'bg-white text-black' : 'bg-green-500 text-black hover:bg-green-400'}`}>Home</button>
            <button onClick={() => setActiveTab('favourites')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'favourites' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Favourites ({favourites.length})</button>
            <button onClick={() => setActiveTab('playlist')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'playlist' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Playlist ({totalPlaylistSongs})</button>
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition overflow-hidden" title={user ? user.name : 'Profile'}>
                {user ? <span className="w-full h-full bg-green-500 text-black font-bold flex items-center justify-center text-sm">{user.name.charAt(0).toUpperCase()}</span> : <span className="text-gray-300">👤</span>}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {user ? (
                    <>
                      <div className="p-4 border-b border-gray-800"><p className="font-bold text-sm truncate">{user.name}</p><p className="text-gray-400 text-xs truncate">{user.email}</p><p className="text-gray-500 text-xs mt-1">Member since {new Date(user.joinedAt).toLocaleDateString()}</p></div>
                      <div className="p-2">
                        <button onClick={() => { setActiveTab('favourites'); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">My Favourites ({favourites.length})</button>
                        <button onClick={() => { setActiveTab('playlist'); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">My Playlists ({playlists.length})</button>
                      </div>
                      <div className="p-2 border-t border-gray-800">
                        <button onClick={clearAllRecentSearches} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">Clear Recent Searches</button>
                        <button onClick={clearAllFavourites} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">Clear All Favourites</button>
                        <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-gray-800 transition">Sign Out</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <button onClick={() => { setShowSignInModal(true); setShowProfileMenu(false); }} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2.5 rounded-full text-sm transition mb-2">Sign In</button>
                      <button onClick={clearAllRecentSearches} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">Clear Recent Searches</button>
                      <button onClick={clearAllFavourites} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-800 transition">Clear All Favourites</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4">
          <div className="flex gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSearch()} placeholder="Search songs, artists..." className="flex-1 bg-gray-800 rounded-full px-5 py-3 text-sm outline-none placeholder-gray-500 focus:bg-gray-700 transition" />
            <button onClick={handleSearch} className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 rounded-full text-sm transition">Search</button>
          </div>
          {recentSearches.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500 font-medium">Recent Searches</span><button onClick={clearAllRecentSearches} className="text-xs text-gray-500 hover:text-red-400 transition">Clear All</button></div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentSearches.map((keyword) => (
                  <div key={keyword} className={`flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${query === keyword ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                    <button onClick={() => handleKeywordClick(keyword)}>{keyword}</button>
                    <button onClick={() => deleteRecentSearch(keyword)} className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 hover:bg-red-500 hover:text-white text-gray-400 transition text-[10px]">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'home' ? (
          <>
            <h2 className="text-lg font-bold mb-4">{isSearching ? `Results for "${query}"` : 'Recent Hits'}</h2>
            {songs.length === 0 ? <p className="text-gray-400 text-sm">No songs found. Try searching for something.</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {songs.map((song) => <SongCard key={song.trackId} song={song} onPlay={playSong} onAdd={openAddToPlaylist} onLike={likeSong} likes={likes} currentSong={currentSong} isPlaying={isPlaying} onDownload={handleDownloadToast} />)}
              </div>
            )}
          </>
        ) : activeTab === 'favourites' ? (
          <>
            <h2 className="text-lg font-bold mb-4">Favourites ({favourites.length})</h2>
            {favourites.length === 0 ? <div className="text-center py-20"><p className="text-gray-400 text-lg font-medium">No favourite songs yet</p><p className="text-gray-500 text-sm mt-2">Like a song from the Home page and it will appear here.</p></div> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {favourites.map((song) => <SongCard key={song.trackId} song={song} onPlay={playSong} onAdd={openAddToPlaylist} onLike={likeSong} likes={likes} currentSong={currentSong} isPlaying={isPlaying} onDownload={handleDownloadToast} />)}
              </div>
            )}
          </>
        ) : (
          <Playlist playlists={playlists} activePlaylistId={activePlaylistId} setActivePlaylistId={setActivePlaylistId} activePlaylist={activePlaylist} onPlay={playSong} onRemove={removeFromPlaylist} onDelete={deletePlaylist} showCreateInput={showCreateInput} setShowCreateInput={setShowCreateInput} newPlaylistName={newPlaylistName} setNewPlaylistName={setNewPlaylistName} onCreate={createPlaylist} />
        )}
      </div>
      <Player currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} onNext={playNext} onPrevious={playPrevious} nextSong={nextSong} upNextSongs={upNextSongs} songs={songs} currentIndex={currentIndex} onMoveSong={moveSong} onPlaySong={playSong} volume={volume} setVolume={setVolume} isShuffle={isShuffle} setIsShuffle={handleShuffleToggle} isRepeat={isRepeat} setIsRepeat={setIsRepeat} commentText={commentText} setCommentText={setCommentText} comments={comments} addComment={addComment} currentTime={currentTime} duration={duration} onSeek={seekTo} />
    </div>
  );
}

