let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    //fetching data from local server

    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();          //converting it to text
    let div = document.createElement("div");
    div.innerHTML = response;              //appending text inside div element
    let as = div.getElementsByTagName("a");     // seraching inside div for every anchor tag element

    songs = [];
    for (let index = 0; index < as.length; index++) {     //iterating through array of anchor tag
        const element = as[index];
        if (element.href.endsWith(".mp3")) {            //checking if href inside every anchor tag end with .mp3 to varify originality of song
            //storing songs name in array
            songs.push(element.href.split(`/${folder}/`)[1].split(".mp3")[0].replaceAll("%20", " "));
        }
    }

    //getelmbytagname return array containing all ul element in perticular class
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ``;
    console.log(songul);
    // selecting ul inside songlist class
    for (const song of songs) {          // iterating through song list return by getsong funct
        //adding every song as list inside ul as innerHtml
        songul.innerHTML += `<li><img src="svgs/music.svg" alt="">      
                            <div class="info">
                                <div style="overflow: hidden; height:18.7px;">${song}</div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="playlib invert" src="svgs/pause.svg" alt="">
                            </div>
                             </li>`;
    }

    //listenig to click event on list of songs
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML);

            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
            e.querySelector(".playlib").src = "svgs/play.svg"

        })

    })
   



}
  //function playMusic(name, pause = false) {
const playMusic = (name, pause = false) => {
    // let audio=new Audio("/songs/" + track+".mp3")

    currentSong.src = `/${currFolder}/` + name + ".mp3";
    if (!pause) {
        currentSong.play();
        play.src = "svgs/play.svg"

    }


    document.querySelector(".currSongName").innerHTML = name;

    //  listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);

        document.querySelector(".currDuration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left = `${currentSong.currentTime / currentSong.duration * 100}%`;

    })

    // add an event listner to seekbar , moving circle acc. and charging currenttime of song accordingly...

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekpos = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = `${seekpos}%`;
        currentSong.currentTime = currentSong.duration * seekpos / 100
    });


}



function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return `00:00`
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Add leading zeros if necessary
    var formattedMinutes = (minutes < 10) ? "0" + minutes : minutes;
    var formattedSeconds = (remainingSeconds < 10) ? "0" + remainingSeconds : remainingSeconds;

    return formattedMinutes + ":" + formattedSeconds;
}


async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();          //converting it to text
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a");
    
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        if (element.href.includes("/songs")) {
            let folder = element.href.split("/").slice(-2)[0]

            //get the meta data of folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();


            document.querySelector(".cardContainer").innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40"
                    height="40">
                    <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                    <path d="M9 18V6l10.016 6-10.016 6z" fill="black" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg"
                alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`;

        }
    }

    //load the playlist whenever card is clicked
    Array.from(document.querySelectorAll(".card")).forEach(e => {
        e.addEventListener("click", async item => {

          await getSongs(`songs/${item.currentTarget.dataset.folder}`);
          playMusic(songs[0])
        })
    })

    
    

}



async function main() {

    // get list of the song
    await getSongs("songs/Arijit");

    // playMusic(songs[0], true)

    // display all the albums on the page

    displayAlbums()




    //attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svgs/play.svg"
        }
        else {
            currentSong.pause();
            play.src = "svgs/pause.svg"
        }
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = `0%`;

    });

    // add an event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = `-140%`;
    });

    // add an event listener to prev and next song `/${currFolder}/`

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
        console.log(index)
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
        else {
            playMusic(songs[songs.length - 1]);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
        console.log(index)
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0]);
        }
    })

    //add an event to voulume
    myRange.addEventListener("change", (e) => {
        let volLevel = e.target.value;
        currentSong.volume = parseFloat(volLevel) / 100;
        if(currentSong.volume==0){
            document.querySelector(".speaker").src = `svgs/muted.svg`;
        }
        if(currentSong.volume>0){
            currentSong.muted=false;
            document.querySelector(".speaker").src = `svgs/volume.svg`;
        }

    })
    let currvol;
    document.querySelector(".speaker").addEventListener("click", () => {
        if (!currentSong.muted) {
            currvol=currentSong.volume;
            currentSong.muted = true;
            document.querySelector(".speaker").src = `svgs/muted.svg`;
            myRange.value=0;
            

        }
        else {
            currentSong.muted = false;
            myRange.value= currvol*100;
            document.querySelector(".speaker").src = `svgs/volume.svg`;

        }
    });

    



}



main()
