
document.addEventListener("DOMContentLoaded", () => {
    
    // global variables
    let currentId = JSON.parse(localStorage.getItem("currentId")) || "100";
    let librarySongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let audioTime = JSON.parse(localStorage.getItem("audioTime")) || 0;
    let playing = JSON.parse(localStorage.getItem("playing")) || false;
    
    const librarySongsContainer = document.getElementById("librarySongList");
    const mainContent = document.querySelector(".main-content")
    const romanticSongsContainer = document.getElementById("romantic-card-container");
    const soulfulSongsContainer = document.getElementById("soulful-card-container");
    const upbeatSongsContainer = document.getElementById("upbeat-card-container");
    const browseAllSongsContainer = document.getElementById("browse-all-card-container");
    const hindiSongsContainer = document.getElementById("hindi-card-container");
    const englishSongsContainer = document.getElementById("english-card-container");
    const hamburger = document.getElementById("hamburger");
    const crossBtn = document.getElementById("cross-btn");
    const leftSection = document.querySelector(".left");

    hamburger.addEventListener("click", () => {
        leftSection.style.transform = "translateX(0%)";
    })

    crossBtn.addEventListener("click", () => {
        leftSection.style.transform = "translateX(-100%)";
    })

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1060) {
            leftSection.style.transform = "translateX(0%)";
        }
    });

    // Play button on cards animation
    mainContent.addEventListener("mouseover", (e) => {
        const card = e.target.closest(".card");
        if(card){
            const play = card.querySelector("#play");
            play.classList.add("play-active");
        }
    })

    mainContent.addEventListener("mouseout", (e) => {
        const card = e.target.closest(".card");
        if(card){
            const play = card.querySelector("#play");
            play.classList.remove("play-active");
        }
    })
    
    // library Remove Buttons animation
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
    
    //Local Storage
    function saveLibrarySongs(){
        localStorage.setItem("librarySongs", JSON.stringify(librarySongs));
    }

    function saveCurrentId(){
        localStorage.setItem("currentId", JSON.stringify(currentId))
    }

    function saveAudioTime(){
        localStorage.setItem("audioTime", JSON.stringify(audioTime));
    }

    function savePlaying(){
        localStorage.setItem("playing", JSON.stringify(playing));
    }
    
    //miscellanous
    function formatTime(seconds){
        const mins = Math.floor(seconds/60);
        const secs = Math.floor(seconds%60);
        const formattedSecs = secs < 10 ? `0${secs}` : secs;
        return `${mins}:${formattedSecs}`
    }
    
    // adding & displaying songs to library
    function addLibrarySongs(song){
        const alreadyExists = librarySongs.some(item => item.id === song.id); 
        if (!alreadyExists) {
            librarySongs.push(song);
            saveLibrarySongs();
            displayLibrary(); 
        }
    }
    
    function displayLibrary(){
        librarySongsContainer.innerHTML = "";
        
        librarySongs.forEach(song => {
            
            const songDiv = document.createElement("div");
            songDiv.className = "libSongInfo flex items-center gap-[10px] cursor-pointer relative hover:bg-gray-800 p-[10px] mr-[10px] rounded-lg";
            
            songDiv.innerHTML = `
            <div class="thumbnail">
            <img src=${song.picture} alt="song icon" class="h-[50px] w-[50px] rounded-lg">
            </div>
            <div class="title-artist">
            <p class="songId hidden" data-id="${song.id}"></p>
            <p class="title font-bold text-md line-clamp-1 w-[16ch] overflow-hidden">${song.title}</p>
            <p class="artists text-[10px]">${song.artist}</p>
            </div>
            <div class="libRemove absolute right-[10%] hidden">
            <button class="w-[30px] h-[30px] rounded-[50%] cursor-pointer p-[8px] hover:bg-gray-700 flex justify-center items-center "><i class="fa-solid fa-minus"></i></button>
            </div>
            `
            librarySongsContainer.appendChild(songDiv)
            
        })
    }
    
    // removing songs from library
    librarySongsContainer.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".libRemove");

        if (removeBtn){
            e.stopPropagation();
            const songDiv = e.target.closest(".libSongInfo");
            console.log(songDiv);
            if (songDiv){
                const songId = songDiv.querySelector(".songId").dataset.id;
                removeLibrarySong(songId);
            }
        }
    })

    function removeLibrarySong(songId){
        librarySongs = librarySongs.filter((song) => song.id !== songId);
        saveLibrarySongs();
        displayLibrary();
    }

    //Main Playing functionality  
    function setImg(songList){
        const img = document.getElementById("thumbnail-img");
        const song = songList.find((song) => song.id === currentId);
        img.src = song.picture
    }
    
    function setInfo(songList){
        const title = document.getElementById("title");
        const artists = document.getElementById("artists");
        const song = songList.find((song) => song.id === currentId);
        title.textContent = song.title;
        artists.textContent = song.artist;
    }

    async function loadSongs() {
        try{
            let response =  await fetch('songs.json');
            let songs = await response.json();
            return songs || [];
        }
        catch(error){
            console.log("Error in fetching songs: ", error);
        }
    }

    async function main() {
        
        let songList =  await loadSongs();
        let romantic = [];
        let soulful = [];
        let upbeat = [];
        let hindi = [];
        let english = [];

        // make each playlist
        songList.forEach((song) => {

            if (song.genre === "Romantic") romantic.push(song);
            else if (song.genre === "Soulful") soulful.push(song);
            else if (song.genre === "Upbeat") upbeat.push(song);

            if (song.language === "Hindi") hindi.push(song);
            else if (song.language === "English") english.push(song);
        })

        // display all sections
        function displaySection(songContainer, givenSongList){
            if(songContainer){
                songContainer.innerHTML = ``;    
                givenSongList.forEach((song) => {
                    const songCardDiv = document.createElement("div");
                    songCardDiv.className = "card w-[200px] p-[15px] ml-[20px] hover:bg-gray-800 rounded-lg relative cursor-pointer";
                    songCardDiv.innerHTML = `
                    <img src=${song.picture} alt=${song.title} class="rounded-lg">
                    <div class="play shadow-lg" id="play">
                    <i class="fa-solid fa-play"></i>
                    </div>
                    <h2 class="font-bold text-lg pt-[15px]">${song.title}</h2>
                    <p class="text-sm font-[200] tracking-wider pt-[3px] line-clamp-2">${song.artist}</p>
                    <p class="songId hidden" data-id="${song.id}"></p>
                    `
                    songContainer.appendChild(songCardDiv);
                })
            }
        }
        displaySection(browseAllSongsContainer, songList);
        displaySection(romanticSongsContainer, romantic);
        displaySection(soulfulSongsContainer, soulful);
        displaySection(upbeatSongsContainer,upbeat);
        displaySection(hindiSongsContainer, hindi);
        displaySection(englishSongsContainer, english);

        // required elements
        const playBtn = document.querySelector(".playBtn");
        const pauseBtn = document.querySelector(".pauseBtn");
        const progress = document.querySelector(".progress");
        const progressContainer = document.querySelector(".progressContainer");
        const nextBtn = document.querySelector(".nextBtn");
        const prevBtn = document.querySelector(".prevBtn");
        const muteBtn = document.getElementById("mute");
        const unMuteBtn = document.getElementById("unmute");
        const addToLibrary = document.getElementById("addToLibrary");
        const currentTiming = document.getElementById("currentTiming");
        const totalDuration = document.getElementById("totalDuration");

        // main playing functionality
        const audio = new Audio(songList.find((song) => song.id === currentId).src);
        audio.currentTime = audioTime;


        if (playing) {
            playAudio();
        }

        setImg(songList);
        setInfo(songList);

        function playAudio() {
            audio.play()
                .then(() => {
                    playing = true;
                    savePlaying();
                    pauseBtn.classList.remove("hidden");
                    playBtn.classList.add("hidden");
                })
                .catch(() => {
                    pauseAudio();
                })
        }

        function pauseAudio(){
            audio.pause();
            playing = false;
            savePlaying();
            pauseBtn.classList.add("hidden");
            playBtn.classList.remove("hidden");
        }

        // Toggle play
        playBtn.addEventListener("click", () => {
            playAudio();
        });

        pauseBtn.addEventListener("click", () => {
            pauseAudio();
        });

        //progress bar display
        audio.addEventListener("loadedmetadata", () => {
            totalDuration.textContent = formatTime(audio.duration);
        })
        
        audio.addEventListener("timeupdate", () => {
            currentTiming.textContent = formatTime(audio.currentTime);
            if (Math.abs(audio.currentTime - audioTime) >= 1){
                audioTime = audio.currentTime;
                saveAudioTime();
            }
            const percent = (audio.currentTime/audio.duration) * 100;
            progress.style.width = percent + "%";

            if (audio.currentTime >= audio.duration){
                let index = songList.findIndex((song) => song.id === currentId);
                if (index === songList.length-1){
                    index = 0;
                    currentId = songList[index].id;
                }
                else{
                    index++;
                    currentId = songList[index].id;
                }
                saveCurrentId();
                audio.src = songList[index].src;
                if (playing) audio.play();
                setImg(songList);
                setInfo(songList);
                progress.style.width = "0%";
            }
        });

        // timeset from progress bar
        progressContainer.addEventListener("click", (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX/width) * duration;
        })

        // prev & next buttons
        nextBtn.addEventListener("click", () => {
            let index = songList.findIndex((song) => song.id === currentId);
            if (index === songList.length-1){
                index = 0;
                currentId = songList[index].id;
            }
            else{
                index++;
                currentId = songList[index].id;
            }
            saveCurrentId();
            audio.src = songList[index].src;
            if (playing) audio.play();
            setImg(songList);
            setInfo(songList);
            progress.style.width = "0%";
            totalDuration.textContent = `0:00`
        })

        prevBtn.addEventListener("click", () => {
            let index = songList.findIndex((song) => song.id === currentId);
            if (index === 0){
                index = songList.length-1;
                currentId = songList[index].id;
            }
            else{
                index--;
                currentId = songList[index].id;
            }
            saveCurrentId();
            audio.src = songList[index].src;
            if (playing) audio.play();
            setImg(songList);
            setInfo(songList);
            progress.style.width = "0%";
            totalDuration.textContent = `0:00`
        })

        // mute-unmute
        muteBtn.addEventListener("click", () => {
            audio.muted = true;
            muteBtn.classList.add("hidden");
            unMuteBtn.classList.remove("hidden");
        })

        unMuteBtn.addEventListener("click", () => {
            audio.muted = false;
            muteBtn.classList.remove("hidden");
            unMuteBtn.classList.add("hidden");
        })

        // adding to library 
        addToLibrary.addEventListener("click", () => {
            addLibrarySongs(songList.find((song) => song.id === currentId));
        })

        // playing from library
        librarySongsContainer.addEventListener("click", (e) => {
            if (e.target.closest(".libRemove")){
                return;
            }
            const songDiv = e.target.closest(".libSongInfo");
            if(!songDiv) return;
            if(songDiv){
                const songId = songDiv.querySelector(".songId").dataset.id;
                const song = songList.find((song) => song.id === songId);
                songList = librarySongs;
                audio.src = song.src;
                currentId = song.id;
                saveCurrentId();
                playAudio();
                setImg(songList);
                setInfo(songList);
                progress.style.width = "0%";
            }
        })

        //playing from playlists
        function playFromSection(songContainer, givenSongList){
            songContainer.addEventListener("click", (e) => {
                const songDiv = e.target.closest(".card");
                if (songDiv){
                    const songId = songDiv.querySelector(".songId").dataset.id;
                    const song = songList.find((song) => song.id === songId);
                    currentId = songId;
                    songList = givenSongList;
                    audio.src = song.src;
                    saveCurrentId();
                    playAudio();
                    setImg(songList);
                    setInfo(songList);
                    progress.style.width = "0%";
                }
            })
        } 

        playFromSection(browseAllSongsContainer, songList);
        playFromSection(romanticSongsContainer, romantic);
        playFromSection(soulfulSongsContainer, soulful);
        playFromSection(upbeatSongsContainer, upbeat);
        playFromSection(hindiSongsContainer, hindi);
        playFromSection(englishSongsContainer, english);

    }   

    main();
    displayLibrary();
    
})

