const birdImg = new Image();
birdImg.src = 'flappybris.png';

// ASET AUDIO & TOGGLE
const bgm = document.getElementById('bgm');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

// 1. SPLASH SCREEN & AUTOPLAY MUSIC
document.getElementById('btn-start').addEventListener('click', () => {
    // Sembunyikan splash screen, tampilkan aplikasi utama
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Tampilkan tombol musik
    musicToggle.style.display = 'block';
    
    // Mainkan lagu (Volume 40% agar tidak terlalu mengagetkan)
    bgm.volume = 0.4;
    let playPromise = bgm.play();
    
    // Cegah error jika browser tetap memblokir
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isMusicPlaying = true;
            musicToggle.innerText = '🔊';
        }).catch(error => {
            console.log("Browser masih memblokir autoplay", error);
            isMusicPlaying = false;
            musicToggle.innerText = '🔇';
        });
    }

    updateGame(); 
});

// LOGIKA TOMBOL MATIKAN/NYALAKAN MUSIK
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgm.pause();
        musicToggle.innerText = '🔇';
    } else {
        bgm.play();
        musicToggle.innerText = '🔊';
    }
    isMusicPlaying = !isMusicPlaying;
});

// 2. THE MAESTER'S CLOCK
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID', { hour12: false });
}, 1000);

// 3. THE ROYAL NAME DAY (COUNTDOWN ULANG TAHUN)
function updateNameDay() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Ulang tahun: 11 September (Bulan 8 karena indeks dimulai dari 0)
    let nextBday = new Date(currentYear, 8, 11); 
    
    // Jika lewat, hitung untuk tahun depan
    if (now.getTime() > nextBday.getTime()) {
        nextBday.setFullYear(currentYear + 1);
    }
    
    // Umur yang akan dicapai (Tahun lahir: 2001)
    const birthYear = 2001;
    const turningAge = nextBday.getFullYear() - birthYear;
    document.getElementById('upcoming-age').innerText = turningAge;
    
    const diff = nextBday - now;
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    document.getElementById('bday-countdown').innerHTML = `${d}D ${h}H ${m}M ${s}S`;
}
setInterval(updateNameDay, 1000);
updateNameDay(); 

// 4. REALM'S CALENDAR WIDGET
let calDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('month-display');
    grid.innerHTML = ''; 

    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    monthDisplay.innerText = `${monthNames[month]} ${year}`;

    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    days.forEach(day => {
        grid.innerHTML += `<div class="cal-day-name">${day}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="cal-date empty"></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        let isToday = (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) ? 'today' : '';
        grid.innerHTML += `<div class="cal-date ${isToday}">${i}</div>`;
    }
}

document.getElementById('prev-month').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
});
renderCalendar(); 

// 5. THE DIVINE WHISPER (AYAT ALKITAB)
async function fetchVerse() {
    const verseEl = document.getElementById('daily-verse');
    try {
        const res = await fetch('alkitab.json?v=' + Date.now());
        const verses = await res.json();
        verseEl.innerText = `"${verses[Math.floor(Math.random() * verses.length)]}"`;
    } catch (e) {
        verseEl.innerText = `"Tuhan adalah terangku dan keselamatanku, kepada siapakah aku harus takut?" - Mazmur 27:1`;
    }
}
fetchVerse();

// 6. KINGDOM WEATHER
async function fetchWeather() {
    try {
        const slo = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.5561&longitude=110.8317&current_weather=true');
        document.getElementById('temp-slo').innerText = Math.round((await slo.json()).current_weather.temperature) + '°';

        const jkt = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2000&longitude=106.8166&current_weather=true');
        document.getElementById('temp-jkt').innerText = Math.round((await jkt.json()).current_weather.temperature) + '°';
    } catch (e) {
        console.log("Weather failed.");
    }
}
fetchWeather();

// 7. QUEST BOARD LOGIC
document.querySelectorAll('.pixel-list li').forEach(item => {
    item.addEventListener('click', function() {
        if (!this.classList.contains('done')) {
            this.querySelector('.checkbox').innerText = '☑';
            this.classList.add('done');
        } else {
            this.querySelector('.checkbox').innerText = '☐';
            this.classList.remove('done');
        }
    });
});

// 8. ESCAPE THE WINTER (FLAPPY MINIGAME)
const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
let birdY = 60, birdV = 0, pipes = [], frame = 0, score = 0, isGameOver = false;

const gravity = 0.2; 
const jumpForce = -4.5;

function drawBird() {
    ctx.drawImage(birdImg, 30, birdY, 24, 24);
}

function updateGame() {
    if (isGameOver) return;
    
    ctx.fillStyle = '#4a5a7a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    birdV += gravity; 
    birdY += birdV; 
    
    if (birdY > canvas.height - 24 || birdY < 0) endGame();
    
    if (frame % 110 === 0) { 
        let gap = 85; 
        let top = Math.random() * (canvas.height - gap - 40) + 20;
        pipes.push({ x: canvas.width, top: top, bottom: canvas.height - top - gap });
    }
    
    pipes.forEach(p => {
        p.x -= 1.5; 
        
        ctx.fillStyle = '#78909c'; 
        ctx.fillRect(p.x, 0, 30, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, 30, p.bottom);
        
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, 30, p.top);
        ctx.strokeRect(p.x, canvas.height - p.bottom, 30, p.bottom);

        if (p.x < 54 && p.x > 0 && (birdY < p.top || birdY > canvas.height - p.bottom)) endGame();
        if (p.x === 30) score++;
    });
    
    pipes = pipes.filter(p => p.x > -40);
    drawBird();
    
    ctx.fillStyle = '#fff'; 
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.font = '10px "Press Start 2P"';
    ctx.strokeText("GOLD:" + score, 5, 15);
    ctx.fillText("GOLD:" + score, 5, 15);
    
    frame++; 
    requestAnimationFrame(updateGame);
}

function jump() { if (!isGameOver) birdV = jumpForce; }

function endGame() { 
    isGameOver = true; 
    document.getElementById('game-over').style.display = 'flex'; 
    document.getElementById('score-display').innerText = score; 
}

function resetGame() { 
    birdY = 60; birdV = 0; pipes = []; score = 0; frame = 0; isGameOver = false; 
    document.getElementById('game-over').style.display = 'none'; 
    updateGame(); 
}

canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });