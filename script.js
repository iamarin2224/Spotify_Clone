document.addEventListener("DOMContentLoaded", () => {
    // Persistent Global Variables
    let currentId = JSON.parse(localStorage.getItem("currentId")) || "100";
    let librarySongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let audioTime = JSON.parse(localStorage.getItem("audioTime")) || 0;
    let playing = JSON.parse(localStorage.getItem("playing")) || false;
    let isShuffle = JSON.parse(localStorage.getItem("isShuffle")) || false;
    let repeatMode = localStorage.getItem("repeatMode") || "off"; // 'off' | 'all' | 'one'
    let currentVolume = localStorage.getItem("currentVolume") !== null ? parseFloat(localStorage.getItem("currentVolume")) : 1;
    let isMuted = JSON.parse(localStorage.getItem("isMuted")) || false;

    // DOM Elements - Navigation & Sidebar
    const librarySongsContainer = document.getElementById("librarySongList");
    const mainContent = document.querySelector(".main-content");
    const romanticSongsContainer = document.getElementById("romantic-card-container");
    const soulfulSongsContainer = document.getElementById("soulful-card-container");
    const upbeatSongsContainer = document.getElementById("upbeat-card-container");
    const browseAllSongsContainer = document.getElementById("browse-all-card-container");
    const hindiSongsContainer = document.getElementById("hindi-card-container");
    const englishSongsContainer = document.getElementById("english-card-container");
    const hamburger = document.getElementById("hamburger");
    const crossBtn = document.getElementById("cross-btn");
    const leftSection = document.querySelector(".left");

    // DOM Elements - Playbar Controls
    const playBtn = document.querySelector(".playBtn");
    const pauseBtn = document.querySelector(".pauseBtn");
    const prevBtn = document.querySelector(".prevBtn");
    const nextBtn = document.querySelector(".nextBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const repeatBtn = document.getElementById("repeatBtn");
    const repeatBadge = document.getElementById("repeatBadge");
    const progress = document.querySelector(".progress");
    const progressContainer = document.querySelector(".progressContainer");
    const progressTooltip = document.getElementById("progressTooltip");
    const currentTiming = document.getElementById("currentTiming");
    const totalDuration = document.getElementById("totalDuration");
    const addToLibrary = document.getElementById("addToLibrary");
    const volumeBtn = document.getElementById("volumeBtn");
    const volumeIcon = document.getElementById("volumeIcon");
    const volumeSlider = document.getElementById("volumeSlider");

    // Responsive Sidebar Toggles
    if (hamburger && leftSection) {
        hamburger.addEventListener("click", () => {
            leftSection.style.transform = "translateX(0%)";
        });
    }

    if (crossBtn && leftSection) {
        crossBtn.addEventListener("click", () => {
            leftSection.style.transform = "translateX(-100%)";
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1060 && leftSection) {
            leftSection.style.transform = "translateX(0%)";
        }
    });

    // Hover Animations for Cards
    if (mainContent) {
        mainContent.addEventListener("mouseover", (e) => {
            const card = e.target.closest(".card");
            if (card) {
                const play = card.querySelector("#play");
                if (play) play.classList.add("play-active");
            }
        });

        mainContent.addEventListener("mouseout", (e) => {
            const card = e.target.closest(".card");
            if (card) {
                const play = card.querySelector("#play");
                if (play) play.classList.remove("play-active");
            }
        });
    }

    // Library Remove Button Hover Handling
    if (librarySongsContainer) {
        librarySongsContainer.addEventListener("mouseover", (event) => {
            const song = event.target.closest(".libSongInfo");
            if (song) {
                const removeBtn = song.querySelector(".libRemove");
                if (removeBtn) removeBtn.classList.remove("hidden");
            }
        });

        librarySongsContainer.addEventListener("mouseout", (event) => {
            const song = event.target.closest(".libSongInfo");
            if (song) {
                const removeBtn = song.querySelector(".libRemove");
                if (removeBtn) removeBtn.classList.add("hidden");
            }
        });
    }

    // Local Storage Helpers
    function saveLibrarySongs() {
        localStorage.setItem("librarySongs", JSON.stringify(librarySongs));
    }

    function saveCurrentId() {
        localStorage.setItem("currentId", JSON.stringify(currentId));
    }

    function saveAudioTime() {
        localStorage.setItem("audioTime", JSON.stringify(audioTime));
    }

    function savePlaying() {
        localStorage.setItem("playing", JSON.stringify(playing));
    }

    function saveShuffle() {
        localStorage.setItem("isShuffle", JSON.stringify(isShuffle));
    }

    function saveRepeatMode() {
        localStorage.setItem("repeatMode", repeatMode);
    }

    function saveVolume() {
        localStorage.setItem("currentVolume", currentVolume.toString());
        localStorage.setItem("isMuted", JSON.stringify(isMuted));
    }

    // Utilities
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const formattedSecs = secs < 10 ? `0${secs}` : secs;
        return `${mins}:${formattedSecs}`;
    }

    // Library Management
    function addLibrarySongs(song) {
        if (!song) return;
        const alreadyExists = librarySongs.some(item => item.id === song.id);
        if (!alreadyExists) {
            librarySongs.push(song);
            saveLibrarySongs();
            displayLibrary();
        }
    }

    function displayLibrary() {
        if (!librarySongsContainer) return;
        librarySongsContainer.innerHTML = "";

        librarySongs.forEach(song => {
            const songDiv = document.createElement("div");
            songDiv.className = "libSongInfo flex items-center gap-[10px] cursor-pointer relative hover:bg-gray-800 p-[10px] mr-[10px] rounded-lg";

            songDiv.innerHTML = `
                <div class="thumbnail">
                    <img src="${song.picture}" alt="song icon" class="h-[50px] w-[50px] rounded-lg object-cover">
                </div>
                <div class="title-artist">
                    <p class="songId hidden" data-id="${song.id}"></p>
                    <p class="title font-bold text-md line-clamp-1 w-[16ch] overflow-hidden">${song.title}</p>
                    <p class="artists text-[10px] text-gray-400">${song.artist}</p>
                </div>
                <div class="libRemove absolute right-[10%] hidden">
                    <button class="w-[30px] h-[30px] rounded-[50%] cursor-pointer p-[8px] hover:bg-gray-700 flex justify-center items-center" title="Remove from Library">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                </div>
            `;
            librarySongsContainer.appendChild(songDiv);
        });
    }

    if (librarySongsContainer) {
        librarySongsContainer.addEventListener("click", (e) => {
            const removeBtn = e.target.closest(".libRemove");
            if (removeBtn) {
                e.stopPropagation();
                const songDiv = e.target.closest(".libSongInfo");
                if (songDiv) {
                    const songId = songDiv.querySelector(".songId").dataset.id;
                    removeLibrarySong(songId);
                }
            }
        });
    }

    function removeLibrarySong(songId) {
        librarySongs = librarySongs.filter((song) => song.id !== songId);
        saveLibrarySongs();
        displayLibrary();
    }

    // Fetch Song Data
    async function loadSongs() {
        try {
            let response = await fetch('songs.json');
            let songs = await response.json();
            return songs || [];
        } catch (error) {
            console.error("Error in fetching songs: ", error);
            return [];
        }
    }

    // Main App Orchestration
    async function main() {
        const songList = await loadSongs();
        if (!songList || songList.length === 0) return;

        let activePlaylist = songList;
        let romantic = [];
        let soulful = [];
        let upbeat = [];
        let hindi = [];
        let english = [];

        // Categorize Playlists
        songList.forEach((song) => {
            if (song.genre === "Romantic") romantic.push(song);
            else if (song.genre === "Soulful") soulful.push(song);
            else if (song.genre === "Upbeat") upbeat.push(song);

            if (song.language === "Hindi") hindi.push(song);
            else if (song.language === "English") english.push(song);
        });

        // Render Cards
        function displaySection(songContainer, givenSongList) {
            if (!songContainer) return;
            songContainer.innerHTML = "";
            givenSongList.forEach((song) => {
                const songCardDiv = document.createElement("div");
                songCardDiv.className = "card w-[200px] p-[15px] ml-[20px] hover:bg-gray-800 rounded-lg relative cursor-pointer";
                songCardDiv.innerHTML = `
                    <img src="${song.picture}" alt="${song.title}" class="rounded-lg w-full h-[170px] object-cover">
                    <div class="play shadow-lg" id="play">
                        <i class="fa-solid fa-play"></i>
                    </div>
                    <h2 class="font-bold text-lg pt-[15px] line-clamp-1">${song.title}</h2>
                    <p class="text-sm font-[200] tracking-wider pt-[3px] line-clamp-2 text-gray-400">${song.artist}</p>
                    <p class="songId hidden" data-id="${song.id}"></p>
                `;
                songContainer.appendChild(songCardDiv);
            });
        }

        displaySection(browseAllSongsContainer, songList);
        displaySection(romanticSongsContainer, romantic);
        displaySection(soulfulSongsContainer, soulful);
        displaySection(upbeatSongsContainer, upbeat);
        displaySection(hindiSongsContainer, hindi);
        displaySection(englishSongsContainer, english);

        // Find initial song
        let currentSong = songList.find((song) => song.id === currentId) || songList[0];
        currentId = currentSong.id;
        saveCurrentId();

        // Initialize Audio Object
        const audio = new Audio(currentSong.src);
        audio.currentTime = audioTime;

        // Apply saved volume & mute state
        applyVolumeState();

        // UI Metadata Helpers
        function setImg(song) {
            const img = document.getElementById("thumbnail-img");
            if (img && song) img.src = song.picture;
        }

        function setInfo(song) {
            const title = document.getElementById("title");
            const artists = document.getElementById("artists");
            if (title && song) title.textContent = song.title;
            if (artists && song) artists.textContent = song.artist;
        }

        // Setup MediaSession API
        function updateMediaSession(song) {
            if ('mediaSession' in navigator && song) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title,
                    artist: song.artist,
                    artwork: [
                        { src: song.picture, sizes: '96x96', type: 'image/jpeg' },
                        { src: song.picture, sizes: '128x128', type: 'image/jpeg' },
                        { src: song.picture, sizes: '192x192', type: 'image/jpeg' },
                        { src: song.picture, sizes: '256x256', type: 'image/jpeg' },
                        { src: song.picture, sizes: '384x384', type: 'image/jpeg' },
                        { src: song.picture, sizes: '512x512', type: 'image/jpeg' }
                    ]
                });
            }
        }

        function setupMediaSessionHandlers() {
            if (!('mediaSession' in navigator)) return;

            try {
                navigator.mediaSession.setActionHandler('play', () => playAudio());
                navigator.mediaSession.setActionHandler('pause', () => pauseAudio());
                navigator.mediaSession.setActionHandler('previoustrack', () => playPrevSong());
                navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong(true, false));
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.seekTime !== undefined) {
                        audio.currentTime = details.seekTime;
                    }
                });
                navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                    audio.currentTime = Math.max(audio.currentTime - (details.seekOffset || 5), 0);
                });
                navigator.mediaSession.setActionHandler('seekforward', (details) => {
                    audio.currentTime = Math.min(audio.currentTime + (details.seekOffset || 5), audio.duration || 0);
                });
            } catch (error) {
                console.warn("MediaSession action handler error:", error);
            }
        }

        setupMediaSessionHandlers();

        // Playback Control Functions
        function loadSong(song, shouldPlay = false) {
            if (!song) return;
            currentId = song.id;
            saveCurrentId();
            audio.src = song.src;
            audio.currentTime = 0;
            audioTime = 0;
            saveAudioTime();

            setImg(song);
            setInfo(song);
            updateMediaSession(song);
            if (progress) progress.style.width = "0%";
            if (currentTiming) currentTiming.textContent = "0:00";
            if (totalDuration) totalDuration.textContent = "0:00";

            if (shouldPlay) {
                playAudio();
            } else {
                pauseAudio();
            }
        }

        function playAudio() {
            audio.play()
                .then(() => {
                    playing = true;
                    savePlaying();
                    if (pauseBtn) pauseBtn.classList.remove("hidden");
                    if (playBtn) playBtn.classList.add("hidden");
                    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
                })
                .catch(() => {
                    pauseAudio();
                });
        }

        function pauseAudio() {
            audio.pause();
            playing = false;
            savePlaying();
            if (pauseBtn) pauseBtn.classList.add("hidden");
            if (playBtn) playBtn.classList.remove("hidden");
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        }

        function playNextSong(autoPlay = true, fromEnded = false) {
            if (!activePlaylist || activePlaylist.length === 0) return;

            // If repeat one is on and track naturally ended, replay track
            if (fromEnded && repeatMode === "one") {
                audio.currentTime = 0;
                playAudio();
                return;
            }

            let currentIndex = activePlaylist.findIndex((song) => song.id === currentId);
            let nextIndex;

            if (isShuffle && activePlaylist.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * activePlaylist.length);
                } while (nextIndex === currentIndex);
            } else {
                nextIndex = currentIndex + 1;
                if (nextIndex >= activePlaylist.length) {
                    if (fromEnded && repeatMode === "off") {
                        // End of playlist reached with repeat off
                        loadSong(activePlaylist[0], false);
                        return;
                    }
                    nextIndex = 0;
                }
            }

            const nextSong = activePlaylist[nextIndex];
            loadSong(nextSong, autoPlay);
        }

        function playPrevSong() {
            if (!activePlaylist || activePlaylist.length === 0) return;

            // If more than 3 seconds into the song, restart track (standard music player behavior)
            if (audio.currentTime > 3) {
                audio.currentTime = 0;
                return;
            }

            let currentIndex = activePlaylist.findIndex((song) => song.id === currentId);
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = activePlaylist.length - 1;
            }

            const prevSong = activePlaylist[prevIndex];
            loadSong(prevSong, true);
        }

        // Shuffle & Repeat State Handlers
        function updateShuffleUI() {
            if (!shuffleBtn) return;
            if (isShuffle) {
                shuffleBtn.classList.add("active-control");
            } else {
                shuffleBtn.classList.remove("active-control");
            }
        }

        function toggleShuffle() {
            isShuffle = !isShuffle;
            saveShuffle();
            updateShuffleUI();
        }

        function updateRepeatUI() {
            if (!repeatBtn || !repeatBadge) return;
            if (repeatMode === "off") {
                repeatBtn.classList.remove("active-control");
                repeatBadge.classList.add("hidden");
                repeatBtn.title = "Repeat: Off (R)";
            } else if (repeatMode === "all") {
                repeatBtn.classList.add("active-control");
                repeatBadge.classList.add("hidden");
                repeatBtn.title = "Repeat: All (R)";
            } else if (repeatMode === "one") {
                repeatBtn.classList.add("active-control");
                repeatBadge.classList.remove("hidden");
                repeatBtn.title = "Repeat: One (R)";
            }
        }

        function toggleRepeat() {
            if (repeatMode === "off") {
                repeatMode = "all";
            } else if (repeatMode === "all") {
                repeatMode = "one";
            } else {
                repeatMode = "off";
            }
            saveRepeatMode();
            updateRepeatUI();
        }

        // Volume & Mute Handlers
        function updateVolumeIcon(effectiveVolume) {
            if (!volumeIcon) return;
            volumeIcon.className = "fa-solid";
            if (isMuted || effectiveVolume === 0) {
                volumeIcon.classList.add("fa-volume-xmark");
            } else if (effectiveVolume < 0.5) {
                volumeIcon.classList.add("fa-volume-low");
            } else {
                volumeIcon.classList.add("fa-volume-high");
            }
        }

        function applyVolumeState() {
            const effectiveVolume = isMuted ? 0 : currentVolume;
            audio.volume = effectiveVolume;
            if (volumeSlider) {
                volumeSlider.value = isMuted ? 0 : currentVolume;
            }
            updateVolumeIcon(effectiveVolume);
        }

        function setVolume(val) {
            currentVolume = Math.min(1, Math.max(0, val));
            if (isMuted && currentVolume > 0) {
                isMuted = false;
            }
            saveVolume();
            applyVolumeState();
        }

        function toggleMute() {
            isMuted = !isMuted;
            saveVolume();
            applyVolumeState();
        }

        // Initial View Initialization
        setImg(currentSong);
        setInfo(currentSong);
        updateMediaSession(currentSong);
        updateShuffleUI();
        updateRepeatUI();

        if (playing) {
            playAudio();
        }

        // Play/Pause Button Listeners
        if (playBtn) playBtn.addEventListener("click", playAudio);
        if (pauseBtn) pauseBtn.addEventListener("click", pauseAudio);
        if (nextBtn) nextBtn.addEventListener("click", () => playNextSong(true, false));
        if (prevBtn) prevBtn.addEventListener("click", playPrevSong);
        if (shuffleBtn) shuffleBtn.addEventListener("click", toggleShuffle);
        if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);

        // Volume Slider and Button Events
        if (volumeBtn) volumeBtn.addEventListener("click", toggleMute);
        if (volumeSlider) {
            volumeSlider.addEventListener("input", (e) => {
                setVolume(parseFloat(e.target.value));
            });
        }

        // Audio Timing & Progress Updates
        audio.addEventListener("loadedmetadata", () => {
            if (totalDuration) totalDuration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
            if (!isDragging) {
                if (currentTiming) currentTiming.textContent = formatTime(audio.currentTime);
                if (Math.abs(audio.currentTime - audioTime) >= 1) {
                    audioTime = audio.currentTime;
                    saveAudioTime();
                }
                if (audio.duration) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    if (progress) progress.style.width = percent + "%";
                }
            }
        });

        audio.addEventListener("ended", () => {
            playNextSong(true, true);
        });

        // Smooth Progress Bar Dragging & Scrubbing
        let isDragging = false;

        function seekFromEvent(e) {
            if (!progressContainer || !audio.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = offsetX / rect.width;
            audio.currentTime = percentage * audio.duration;
            if (progress) progress.style.width = (percentage * 100) + "%";
            if (currentTiming) currentTiming.textContent = formatTime(audio.currentTime);
        }

        if (progressContainer) {
            progressContainer.addEventListener("mousedown", (e) => {
                isDragging = true;
                progressContainer.classList.add("is-scrubbing");
                seekFromEvent(e);
            });

            progressContainer.addEventListener("mousemove", (e) => {
                if (!audio.duration || !progressTooltip) return;
                const rect = progressContainer.getBoundingClientRect();
                const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percentage = offsetX / rect.width;
                const previewTime = percentage * audio.duration;

                progressTooltip.style.left = `${offsetX}px`;
                progressTooltip.textContent = formatTime(previewTime);
                progressTooltip.classList.remove("hidden");
            });

            progressContainer.addEventListener("mouseleave", () => {
                if (progressTooltip) progressTooltip.classList.add("hidden");
            });

            // Touch events for mobile
            progressContainer.addEventListener("touchstart", (e) => {
                isDragging = true;
                progressContainer.classList.add("is-scrubbing");
                seekFromEvent(e);
            }, { passive: true });

            progressContainer.addEventListener("touchmove", (e) => {
                if (isDragging) seekFromEvent(e);
            }, { passive: true });
        }

        window.addEventListener("mousemove", (e) => {
            if (isDragging) {
                seekFromEvent(e);
            }
        });

        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                if (progressContainer) progressContainer.classList.remove("is-scrubbing");
            }
        });

        window.addEventListener("touchend", () => {
            if (isDragging) {
                isDragging = false;
                if (progressContainer) progressContainer.classList.remove("is-scrubbing");
            }
        });

        // Global Keyboard Shortcuts
        window.addEventListener("keydown", (e) => {
            const activeTag = document.activeElement ? document.activeElement.tagName : "";
            if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    if (playing) pauseAudio();
                    else playAudio();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    audio.currentTime = Math.min((audio.duration || 0), audio.currentTime + 5);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    audio.currentTime = Math.max(0, audio.currentTime - 5);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(currentVolume + 0.05);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(currentVolume - 0.05);
                    break;
                case "KeyM":
                    toggleMute();
                    break;
                case "KeyN":
                    playNextSong(true, false);
                    break;
                case "KeyP":
                    playPrevSong();
                    break;
                case "KeyS":
                    toggleShuffle();
                    break;
                case "KeyR":
                    toggleRepeat();
                    break;
            }
        });

        // Add to Library Button
        if (addToLibrary) {
            addToLibrary.addEventListener("click", () => {
                const song = songList.find((s) => s.id === currentId);
                if (song) addLibrarySongs(song);
            });
        }

        // Library Playback Interaction
        if (librarySongsContainer) {
            librarySongsContainer.addEventListener("click", (e) => {
                if (e.target.closest(".libRemove")) return;
                const songDiv = e.target.closest(".libSongInfo");
                if (!songDiv) return;

                const songId = songDiv.querySelector(".songId").dataset.id;
                const song = songList.find((s) => s.id === songId);
                if (song) {
                    activePlaylist = librarySongs;
                    loadSong(song, true);
                }
            });
        }

        // Section Playback Interaction
        function setupSectionPlayback(container, playlist) {
            if (!container) return;
            container.addEventListener("click", (e) => {
                const card = e.target.closest(".card");
                if (!card) return;

                const songId = card.querySelector(".songId").dataset.id;
                const song = songList.find((s) => s.id === songId);
                if (song) {
                    activePlaylist = playlist;
                    loadSong(song, true);
                }
            });
        }

        setupSectionPlayback(browseAllSongsContainer, songList);
        setupSectionPlayback(romanticSongsContainer, romantic);
        setupSectionPlayback(soulfulSongsContainer, soulful);
        setupSectionPlayback(upbeatSongsContainer, upbeat);
        setupSectionPlayback(hindiSongsContainer, hindi);
        setupSectionPlayback(englishSongsContainer, english);
    }

    main();
    displayLibrary();
});
