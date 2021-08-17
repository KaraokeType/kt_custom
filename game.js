(async function () {
  // define the time limit
  let TIME_LIMIT = 0; // Defined later at getParameter();

  // define quotes to be used

  let lyrics = [];

  let koi_song = null;

  // selecting required elements
  const timer_text = document.querySelector(".curr_time");
  const accuracy_text = document.querySelector(".curr_accuracy");
  const error_text = document.querySelector(".curr_errors");
  const cpm_text = document.querySelector(".curr_cpm");
  const wpm_text = document.querySelector(".curr_wpm");
  const quote_text = document.querySelector(".quote");
  const forecast_text = document.querySelector(".quote_f");
  const input_area = document.querySelector(".input_area");
  const restart_btn = document.querySelector(".restart_btn");
  const btm_btn = document.querySelector(".btm_btn");
  const cpm_group = document.querySelector(".cpm");
  const wpm_group = document.querySelector(".wpm");
  const error_group = document.querySelector(".errors");
  const accuracy_group = document.querySelector(".accuracy");
  const fav_btn = document.querySelector('.fav_btn');
  const volume_button = document.querySelector('.volume_button');

  let timeLeft = TIME_LIMIT;
  let timeElapsed = 0;
  let total_errors = 0;
  let total_errors_syncless = 0;
  let errors = 0;
  let sync_errors = -1;
  let accuracy = 0;
  let characterTyped = 0;
  let current_quote = "";
  let quoteNo = -1;
  let timer = null;
  let timer2 = null;
  let started = false;
  let assist = false; // Hacks mode
  let scoreGiven = 0;
  let offset = 1; // Second offset
  let audioname = "";
  let favtoggled = false;
  let url = null; // Line 360


  let updateQuote = function() {
    checkSync();
    updateBar();

    // roll over to the first quote
    if (quoteNo < lyrics.length - 1) {
    quoteNo++;
    } else {
    quoteNo = -1;
    }
    quote_text.textContent = null;
    current_quote = lyrics[quoteNo].w;
    try {
    next_quote = lyrics[quoteNo + 1].w;
    } catch(err) {
    if (err.message == "Uncaught TypeError: Cannot read property 'w' of undefined") {
      next_quote = ""
    }
    }

    // separate each character and make an element
    // out of each of them to individually style them
    current_quote.split("").forEach(function (char) {
    const charSpan = document.createElement("span");
    charSpan.innerText = char;
    quote_text.appendChild(charSpan);
    });
    // Roll over to the next forecast quote
    forecast_text.textContent = next_quote;
  }

  let updateQuoteS = function() {
    // updateQuote() needs to happen at the start of the game, but won't happen because it will cry about 'checkSync()', so I did this
    // roll over to the first quote
    if (typeof lyrics[0] == "undefined") {
    window.location.property = "../";
    }
    if (quoteNo < lyrics.length - 1) {
    quoteNo++;
    } else {
    quoteNo = -1;
    }
    quote_text.textContent = null;
    current_quote = lyrics[quoteNo].w;
    next_quote = lyrics[quoteNo + 1].w;

    // separate each character and make an element
    // out of each of them to individually style them
    current_quote.split("").forEach(function (char) {
    const charSpan = document.createElement("span");
    charSpan.innerText = char;
    quote_text.appendChild(charSpan);
    });
    // Roll over to the next forecast quote
    forecast_text.textContent = next_quote;
    checkSync();
  }

  let processCurrentText = function() {
    // get current input text and split it
    curr_input = input_area.value;
    curr_input_array = curr_input.split("");

    // increment total characters typed
    characterTyped++;

    errors = 0;

    quoteSpanArray = quote_text.querySelectorAll("span");
    quoteSpanArray.forEach(function (char, index) {
    let typedChar = curr_input_array[index];

    // characters not currently typed
    if (typedChar == null) {
      char.classList.remove("correct_char");
      char.classList.remove("incorrect_char");

      // correct characters
    } else if (typedChar === char.innerText) {
      char.classList.add("correct_char");
      char.classList.remove("incorrect_char");

      // incorrect characters
    } else {
      char.classList.add("incorrect_char");
      char.classList.remove("correct_char");

      // increment number of errors
      errors++;
    }
    });

    // display the number of points
    error_text.textContent = scoreGiven;

    // update accuracy text
    let correctCharacters = characterTyped - (total_errors_syncless + errors);
    let accuracyVal = (correctCharacters / characterTyped) * 100;
    accuracy_text.textContent = Math.floor(accuracyVal) + "%";

    // if current text is completely typed
    // irrespective of errors
    if (curr_input.length == current_quote.length) {
    updateQuote();

    // update total errors
    total_errors += errors;
    total_errors_syncless += errors;
    total_errors += sync_errors;

    // clear the input area
    input_area.value = "";
    }
  }

  let updateTimer = function() { // CHANGE THESE ACCORDINGLY TO THE TIME | IF YOU DIVIDE THE TIMER BY 4, DIVIDE THESE BY 4 TOO!
    if (timeLeft > 0) {
    // decrease the current time left
    timeLeft = timeLeft - 1;

    // increase the time elapsed
    timeElapsed = timeElapsed + 1

    // Updates scoregiven to then let the text be updated by updateScore()
    scoreGiven += 5;

    } else {
    // finish the game
    finishGame();
    }
  }

  let updateScore = function () {
    if (timeLeft > 0) {
      // decrease the current time left
      timeLeft--;
  
      // increase the time elapsed
      timeElapsed++;
  
      // Update timer text
      timer_text.textContent = Math.floor(timeLeft) + "s";
      // Give some points for surviving and update it
      error_text.textContent = Math.floor(scoreGiven);
  
      } else {
      // finish the game
      finishGame();
      }
  }

  function finishGame() {
    started = false;
    // stop the timer
    clearInterval(timer);

    // disable the input area
    input_area.disabled = true;

    // show finishing text
    quote_text.textContent = "KaraokeType - Custom Song";

    // display restart button
    restart_btn.style.display = "block";
    btm_btn.style.display = "block";

    // calculate cpm and wpm
    cpm = Math.round((characterTyped / timeElapsed) * 60);
    wpm = Math.round((characterTyped / 5 / timeElapsed) * 60);

    // update cpm and wpm text
   // cpm_text.textContent = cpm;
   // wpm_text.textContent = wpm;

    // display the cpm and wpm
    // cpm_group.style.display = "block";
    // wpm_group.style.display = "block";
    koi_song.currentTime = 0;
    koi_song.pause();

    // Reset forecast text
    forecast_text.textContent = '';
  }

  let startGame = function() {
    if (!started) {
    started = true;
    resetValues();
    // playsong(audioname);
    updateQuoteS();

    // clear old and start song new timer
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000); // CHANGE THIS IF YOU WANT TO ADD DECIMALS TO YOUR SONG
    timer2 = setInterval(updateScore, 1000);
    koi_song = playsong(url);
    koi_song.play();
    } else {
    console.info("Game already started, not re-starting...");
    }
  }

  function resetValues() {
    timeLeft = TIME_LIMIT; // CHANGE LATER TO MP3 LENGTH
    timeElapsed = 0;
    errors = 0;
    total_errors = 0;
    sync_errors = -1;
    total_errors_syncless = 0;
    accuracy = 0;
    characterTyped = 0;
    quoteNo = -1;
    scoreGiven = 0;
    input_area.disabled = false;

    input_area.value = "";
    quote_text.textContent = "Click on the area below to start the game.";
    accuracy_text.textContent = 100 + "%";
    timer_text.textContent = timeLeft + "s";
    error_text.textContent = 0;
    restart_btn.style.display = "none";
    btm_btn.style.display = "none";
    // cpm_group.style.display = "none";
    // wpm_group.style.display = "none";
  }

  let backToMenu = function() {
    window.location.href = "../";
  }

  let between = function(x, min, max) {
    return x >= min && x <= max;
  }

  let tmpresult = 0;

  let checkSync = function() {
    // Checks if lyrics are synced, then adds points
    if (scoreGiven < 0) {
    scoreGiven = 0;
    }
    if (!between(timeElapsed - lyrics[quoteNo].s, -offset, offset)) {
    sync_errors++;
    // console.log("Sync Error");
    err();
    }
    else {
    if (quoteNo > 0) { /*
      scoreGiven += Math.abs( // Formula for errors
      lyrics[quoteNo - 1].s -
        lyrics[quoteNo].s +
        timeElapsed +
        parseInt(accuracy_text.textContent)
      ) -
      total_errors - 50; */
      scoreGiven += Math.floor(Math.abs(
      parseInt(accuracy_text.textContent) * 10 +
      lyrics[quoteNo - 1].s -
      lyrics[quoteNo].s -
      timeElapsed
      ) / 100 - errors);
    }
    }
  }

  var textArea = document.getElementsByClassName("input_area")[0]; // Get rid of the enter key
  textArea.onkeydown = function (e) {
    if (e.keyCode == 13) {
    e.preventDefault();
    } else if (e.keyCode == 32) {
    if(textArea.value == "") {
      e.preventDefault();
    }
    }
  };

  if (assist) {
    // Enable hacks
    window.setInterval(function () {
    console.log("%c" + lyrics[quoteNo].s + " - Lyrics", "color: #40ff00");
    console.log("%c" + timeElapsed + " - Time Elapsed", "color: #00ffee");
    }, 1000);
  }

  let loadLyrics = function() {
    const reader = new FileReader();
    if (window.FileList && window.File && window.FileReader) {
      document.getElementById('jsonu').addEventListener('change', event => {
        const file = event.target.files[0];
        console.log(event.target.files)
        reader.addEventListener('load', event => {
        const pl = JSON.parse(atob(event.target.result.substring(29)));
        lyrics = pl;
        step1to2();
        });
        reader.readAsDataURL(file);
      }); 
    }
  }

  let loadSong = function() {
    if (window.FileList && window.File && window.FileReader) {
      document.getElementById('jsonmp3').addEventListener('change', event => {
        const file = event.target.files[0];
        url = URL.createObjectURL(file)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.responseType = 'arraybuffer'
        request.onload = function() {
          audioContext.decodeAudioData(request.response, function(buffer) { TIME_LIMIT = Math.floor(buffer.duration) });
        }
        request.send();
        step2to3();
        });
    }
  }

  let getParameter = function() {
    loadLyrics();
    loadSong();
    document.title = "KaraokeType - Custom Song";
    loadallEvents();
  }

  window.addEventListener('load', getParameter, false);


  let	canvas,
    ctx,
    source,
    context,
    analyser,
    fbc_array,
    bar_count,
    bar_pos,
    bar_width,
    bar_height,
    eqsong;

  let playsong = function(url) {
    eqsong = new Audio(url);
    eqsong.src = url;
    eqsong.controls = false;
    eqsong.loop = false;
    eqsong.autoplay = false;
    eqsong.volume = parseInt(localStorage.getItem('song_volume')) / 100 || 1
    volume_button.oninput = (function () { eqsong.volume = volume_button.value / 100 })

    context = new AudioContext();
    analyser = context.createAnalyser();
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
      
    canvas.width = window.innerWidth * 0.99;
    canvas.height = window.innerHeight * 0.15;
      
    source = context.createMediaElementSource(eqsong);
    source.connect(analyser);
    analyser.connect(context.destination);
      
    window.RequestAnimationFrame =
      window.requestAnimationFrame(FrameLooper) ||
      window.msRequestAnimationFrame(FrameLooper) ||
      window.mozRequestAnimationFrame(FrameLooper) ||
      window.webkitRequestAnimationFrame(FrameLooper);

    FrameLooper();
    return eqsong;
  }

  let FrameLooper = function() {
    window.RequestAnimationFrame =
      window.requestAnimationFrame(FrameLooper) ||
      window.msRequestAnimationFrame(FrameLooper) ||
      window.mozRequestAnimationFrame(FrameLooper) ||
      window.webkitRequestAnimationFrame(FrameLooper);

    fbc_array = new Uint8Array(analyser.frequencyBinCount);
    bar_count = window.innerWidth / 2;

    analyser.getByteFrequencyData(fbc_array);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ffc1";

    for (let i = 0; i < bar_count; i++) {
      bar_pos = i * 4;
      bar_width = 2;
      bar_height = -(fbc_array[i] / 2);
      ctx.fillRect(bar_pos, canvas.height, bar_width, bar_height);
    }
  }

  let err = function() { // Show sync overlay
    if (sync_errors > -1 && quoteNo > 0) {
    let err = document.getElementById('err_overlay');
    err.style.display = "block";
    err.classList.add("fade-in");
    setTimeout(function () {erroff()}, 305); // This calls erroff()
    }
  }

  let erroff = function() { // And hide it some 100ms later
    let err = document.getElementById('err_overlay');
    err.classList.remove("fade-in");
    err.classList.add("fade-out");
    setTimeout(function () {err.style.display = "none";}, 305);
  }

  let shortcutCheck = function(e) {

    if (e.ctrlKey && e.altKey && e.keyCode == 74) {
      backToMenu();
    } else if (e.ctrlKey && e.altKey && e.keyCode == 75 && !started) {
      resetValues();    
    }
  }

  document.addEventListener('keyup', shortcutCheck, false);

  let percentage = function(partial, full) {
    return (100 * partial) / full;
  }

  let updateBar = function() {
    let prc = percentage((quoteNo + 1), lyrics.length);
    let circle = document.getElementById("circle");
    circle.style.left = prc + "%";
  }

  let loadallEvents = function() {
    input_area.onfocus = (function () { startGame(); })
    input_area.oninput = (function () { processCurrentText() })
    input_area.onpaste = (function (e)  {
    e.preventDefault()
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Rickroll people when they cheat
    })
    btm_btn.onclick = (function () { backToMenu() })
    restart_btn.onclick = (function () { resetValues() })
    jsonu.onclick = (function () { loadLyrics() })
    volume_button.oninput = (function () { localStorage.setItem('song_volume', volume_button.value) })
  }
  let step1to2 = function() {
    document.querySelector('.step1').style.display = "none";
    document.querySelector('.step2').style.display = "block";
  }
  let step2to3 = function() {
    document.querySelector('.step2').style.display = "none";
    document.querySelector('.step3').style.display = "block";
  }
})();
