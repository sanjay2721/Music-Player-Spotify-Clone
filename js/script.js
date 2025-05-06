let currentSong=new Audio()
let songs
let currFolder
async function getSongs(folder) {
    currFolder=folder
    const a = await fetch(`/${folder}/`);
    const response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    const links = div.querySelectorAll("#files a")
    songs = []
    for (const element of links) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songul = document.querySelector('.songlist ul')
    songul.innerHTML=""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",()=>{
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
function formatTime(timeInSeconds) {
    const totalSeconds = Math.floor(timeInSeconds); // Floor the input
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const playmusic=(track,pause=false)=>{
    currentSong.src=`/${currFolder}/`+track
    if(!pause){
        currentSong.play()
        play.src="img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}
async function displayAlbums(){
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let cardContainer=document.querySelector(".cardContainer")
    let anchors=div.querySelectorAll("#files a")
    let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++){
        const e=array[index]
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
           let folder=e.href.split("/").slice(-2)[1]
           //Get folder data
           let a=await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
           let response=await a.json();
           cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true"
                                class="e-9812-icon e-9812-baseline" viewBox="0 0 24 24">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //loading playlist
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item =>{
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0],true)
        })
    })
}
async function main() {
    await displayAlbums()
    songs=await getSongs("songs/ncs")
    playmusic(songs[0],true)
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime / currentSong.duration)*100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let leftpercent=(e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left=leftpercent + "%"
        currentSong.currentTime=((currentSong.duration)*leftpercent)/100  
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%"
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFile);
        if (index === -1) {
            console.error("Current song not found in songs array.");
            return;
        }
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[index]);
        }
    });
    
    previous.addEventListener("click", () => {
        currentSong.pause()
        let currentFile = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentFile);
        if (index === -1) {
            console.error("Current song not found in songs array.");
            return;
        }
        if (index > 0) {
            playmusic(songs[index - 1]);
        } else {
            playmusic(songs[index]);
        }
    });
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    //volume muting
    let volume
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            volume=currentSong.volume
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=volume
            document.querySelector(".range").getElementsByTagName("input")[0].value=volume*100
        }
    })
    //card click play first
    document.querySelector(".card").addEventListener("click",()=>{

    })
}
main()
