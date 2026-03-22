// ==========================================
// SCRIPT PART 1: Variablen, Setup & Audio
// ==========================================

// --- GLOBALE VARIABLEN & SPIELSTATUS ---
let isRankedMode = false;
let currentRankedName = "";
let currentRankedPicBase64 = "";

let gameMode = 'standard';
let scoreAnimationId = null;
let displayedScore = 0;
let currentScore = 0;
let highScore = localStorage.getItem('blockBlastHighScore') || 0;
let currentCombo = 0;
let clearedLineInRound = false;

const rows = 8, cols = 8;
let boardState = Array(rows).fill().map(() => Array(cols).fill(null));
let gameStarted = false;
let isAnimating = false;


// --- DOM ELEMENTE (VERKNÜPFUNGEN ZUM HTML) ---
const rankedSetupScreen = document.getElementById('ranked-setup-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const liveLeaderboard = document.getElementById('live-leaderboard');
const liveLbList = document.getElementById('live-lb-list');
const liveNameInput = document.getElementById('live-name-input');
const clearPicBtn = document.getElementById('clear-pic-btn');
const presetContainer = document.getElementById('preset-avatars');

const scoreDisplay = document.getElementById('current-score-display');
const highscoreDisplay = document.getElementById('highscore-display');
const boardElement = document.getElementById('board');
const shapeSlots = document.querySelectorAll('.shape-slot');
const shapeContainers = document.querySelectorAll('.shape-container');
const iceStartScreen = document.getElementById('ice-start-screen');
const btnStartClassic = document.getElementById('btn-start-classic');
const btnStartRangliste = document.getElementById('btn-start-rangliste');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const comboDisplay = document.getElementById('combo-display');
const masterSettingsModal = document.getElementById('master-settings-modal');
const btnOpenMaster = document.getElementById('btn-open-master');
const btnMasterBack = document.getElementById('btn-master-back');
const toggleSquareUi = document.getElementById('toggle-square-ui');

const modeStandard = document.getElementById('mode-standard');
const modeAhmad = document.getElementById('mode-ahmad');
const modeEmanuel = document.getElementById('mode-emanuel');
const modeAdrian = document.getElementById('mode-adrian');
const backupStatusMsg = document.getElementById('backup-status-msg');

// --- EINSTELLUNGEN & DATEN ---
const emojisAvatars = ['🦊', '🐱', '🐶', '🐼', '🐸', '🦄'];

const blockColors = [
    'color-hellblau', 'color-dunkelblau', 'color-gruen', 'color-gelb', 
    'color-orange', 'color-rot', 'color-pink', 'color-lila'
];

const shapeDefinitions = {
    'line2_h': { matrix: [[1,1]] },
    'line2_v': { matrix: [[1],[1]] },
    'line3_h': { matrix: [[1,1,1]] },
    'line3_v': { matrix: [[1],[1],[1]] },
    'line4_h': { matrix: [[1,1,1,1]] },
    'line4_v': { matrix: [[1],[1],[1],[1]] },
    'line5_h': { matrix: [[1,1,1,1,1]] },
    'line5_v': { matrix: [[1],[1],[1],[1],[1]] },
    'square2x2': { matrix: [[1,1], [1,1]] },
    'square3x3': { matrix: [[1,1,1],[1,1,1],[1,1,1]] },
    'rect2x3_h': { matrix: [[1,1,1], [1,1,1]] },
    'rect2x3_v': { matrix: [[1,1], [1,1], [1,1]] },
    'l_med_1': { matrix: [[1,0],[1,0],[1,1]] },
    'l_med_2': { matrix: [[0,1],[0,1],[1,1]] },
    'l_med_3': { matrix: [[1,1,1],[1,0,0]] },
    'l_med_4': { matrix: [[1,1,1],[0,0,1]] },
    'l_med_5': { matrix: [[1,1],[1,0],[1,0]] },
    'l_med_6': { matrix: [[1,1],[0,1],[0,1]] },
    'l_med_7': { matrix: [[1,0,0],[1,1,1]] },
    'l_med_8': { matrix: [[0,0,1],[1,1,1]] },
    'l_large_1': { matrix: [[1,0,0],[1,0,0],[1,1,1]] },
    'l_large_2': { matrix: [[0,0,1],[0,0,1],[1,1,1]] },
    'l_large_3': { matrix: [[1,1,1],[1,0,0],[1,0,0]] },
    'l_large_4': { matrix: [[1,1,1],[0,0,1],[0,0,1]] },
    't_shape_1': { matrix: [[1,1,1],[0,1,0]] },
    't_shape_2': { matrix: [[0,1,0],[1,1,1]] },
    't_shape_3': { matrix: [[1,0],[1,1],[1,0]] },
    't_shape_4': { matrix: [[0,1],[1,1],[0,1]] },
    'z_shape_1': { matrix: [[1,1,0],[0,1,1]] },
    'z_shape_2': { matrix: [[0,1,1],[1,1,0]] },
    'z_shape_3': { matrix: [[1,0],[1,1],[0,1]] },
    'z_shape_4': { matrix: [[0,1],[1,1],[1,0]] }
};

// --- BASE64 BILDER SETUP (Spezial-Modi) ---
if (typeof memeBase64 !== 'undefined') {
    document.documentElement.style.setProperty('--ahmad-img', `url('${memeBase64}')`);
}
if (typeof emanuelBase64 !== 'undefined') {
    document.documentElement.style.setProperty('--emanuel-img', `url('${emanuelBase64}')`);
}
if (typeof adrianBase64 !== 'undefined') {
    document.documentElement.style.setProperty('--adrian-img', `url('${adrianBase64}')`);
}

// --- AUDIO & SOUND ENGINE ---
const SoundEngine = {
    ctx: null,
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') { this.ctx.resume(); }
    },
    playTone: function(freq, type, duration, vol=0.1) {
        if (!document.getElementById('toggle-sound').checked) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    playPlace: function() {
        this.playTone(300, 'sine', 0.1, 0.3);
        if (document.getElementById('toggle-vibration').checked && navigator.vibrate) {
            navigator.vibrate(15);
        }
    },
    playBreak: function(comboMultiplier = 0) {
        if (!document.getElementById('toggle-sound').checked) return;
        this.init();
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        const pitchShift = Math.min(comboMultiplier * 40, 400);
        osc1.frequency.setValueAtTime(150 + pitchShift, this.ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20 + pitchShift, this.ctx.currentTime + 0.3);
        osc2.frequency.setValueAtTime(200 + pitchShift, this.ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(30 + pitchShift, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.3); osc2.stop(this.ctx.currentTime + 0.3);
        
        if (document.getElementById('toggle-vibration').checked && navigator.vibrate) {
            navigator.vibrate([40, 50, 40]);
        }
    }
};

const bgmAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'); 
bgmAudio.loop = true; 
bgmAudio.volume = 0.3;

// --- GRUNDLEGENDE UI-FUNKTIONEN (Score, Combo, Board zeichnen) ---
function showBackupStatus(msg, isError = false) {
    backupStatusMsg.innerText = msg;
    backupStatusMsg.style.color = isError ? '#ef4444' : '#6ee7b7';
    backupStatusMsg.style.opacity = '1';
    setTimeout(() => {
        backupStatusMsg.style.opacity = '0';
    }, 4000);
}



function updateComboUI() {
    if (currentCombo > 0) {
        comboDisplay.classList.remove('hidden');
        comboDisplay.classList.remove('pulse');
        void comboDisplay.offsetWidth; 
        comboDisplay.classList.add('pulse');
    } else {
        comboDisplay.classList.add('hidden');
    }
}

function updateScore(points) {
    const startScore = displayedScore;
    currentScore += points;
    const targetScore = currentScore;


    if (scoreAnimationId) cancelAnimationFrame(scoreAnimationId);
    let startTimestamp = null;
    const duration = 2000;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress * (2 - progress);
        displayedScore = Math.floor(easeProgress * (targetScore - startScore) + startScore);
        scoreDisplay.innerText = displayedScore;
        
        if (displayedScore > highScore) {
            highScore = displayedScore;
            localStorage.setItem('blockBlastHighScore', highScore);
            highscoreDisplay.innerText = `👑 ${highScore}`;
        }

        if (progress < 1) {
            scoreAnimationId = window.requestAnimationFrame(step);
        } else {
            displayedScore = targetScore;
            scoreDisplay.innerText = displayedScore;
        }
    };
    scoreAnimationId = window.requestAnimationFrame(step);
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (boardState[r][c] !== null) {
                cell.classList.add(boardState[r][c]);
                cell.classList.add('filled');
            }
            boardElement.appendChild(cell);
        }
    }
}

function cloneBoard(board) { 
    return board.map(row => [...row]); 
}

// Einmaliges Initialisieren des Highscores auf der Oberfläche beim Starten
highscoreDisplay.innerText = `👑 ${highScore}`;
