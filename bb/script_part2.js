// ==========================================
// SCRIPT PART 2: Spiellogik, Events & UI
// ==========================================

// --- RANGELISTE SETUP (Avatare) ---
emojisAvatars.forEach(emoji => {
    const div = document.createElement('div');
    div.className = 'preset-avatar';
    div.innerText = emoji;
    div.addEventListener('click', () => {
        document.querySelectorAll('.preset-avatar').forEach(a => a.classList.remove('selected'));
        div.classList.add('selected');
        
        // Bild verkleinern
        const canvas = document.createElement('canvas');
        canvas.width = 70; canvas.height = 70;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#3b4c73"; 
        ctx.fillRect(0,0,70,70);
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, 35, 40);
        currentRankedPicBase64 = canvas.toDataURL('image/jpeg', 0.5);
        
        document.getElementById('ranked-pic-input').value = "";
        clearPicBtn.style.display = 'block';
    });
    presetContainer.appendChild(div);
});

// --- UI EVENT LISTENERS ---
document.getElementById('btn-expand-lb').addEventListener('click', () => {
    showLeaderboard();
    const gameOverScreen = document.getElementById('custom-game-over-screen');
    const retryBtn = document.getElementById('btn-retry-from-leaderboard');
    if (!gameOverScreen.classList.contains('hidden')) {
        retryBtn.style.display = 'flex';
    } else {
        retryBtn.style.display = 'none';
    }
});

document.getElementById('btn-retry-from-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard-screen').classList.add('hidden');
    startGameRoutine();
});

liveNameInput.addEventListener('input', (e) => {
    currentRankedName = e.target.value.trim();
    if (currentRankedName !== "") {
        localStorage.setItem('lastRankedName', currentRankedName);
    }
});

document.getElementById('toggle-bgm').addEventListener('change', (e) => {
    if (e.target.checked && gameStarted) bgmAudio.play().catch(() => {});
    else bgmAudio.pause();
});

// --- MENÜS & EINSTELLUNGEN ---
settingsBtn.addEventListener('click', () => { settingsModal.classList.remove('hidden'); });
closeSettings.addEventListener('click', () => { settingsModal.classList.add('hidden'); });

btnOpenMaster.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    masterSettingsModal.classList.remove('hidden');
    
    if (isRankedMode) {
        document.getElementById('original-mode-container').style.display = 'none';
        document.getElementById('toggle-original').checked = false; 
    } else {
        document.getElementById('original-mode-container').style.display = 'flex';
    }
});

btnMasterBack.addEventListener('click', () => {
    masterSettingsModal.classList.add('hidden');
    settingsModal.classList.remove('hidden');
    refreshTrayColors();
});

toggleSquareUi.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('square-ui');
    } else {
        document.body.classList.remove('square-ui');
    }
});

// --- SPIELMODI WECHSELN ---
modeStandard.addEventListener('click', () => {
    gameMode = 'standard';
    modeStandard.classList.add('active');
    modeAhmad.classList.remove('active');
    modeEmanuel.classList.remove('active');
    modeAdrian.classList.remove('active');
});

modeAdrian.addEventListener('click', () => {
    gameMode = 'adrian';
    modeAdrian.classList.add('active');
    modeStandard.classList.remove('active');
    modeAhmad.classList.remove('active');
    modeEmanuel.classList.remove('active');
});

modeAhmad.addEventListener('click', () => {
    gameMode = 'ahmad';
    modeAhmad.classList.add('active');
    modeStandard.classList.remove('active');
    modeEmanuel.classList.remove('active');
    modeAdrian.classList.remove('active');
});

modeEmanuel.addEventListener('click', () => {
    gameMode = 'emanuel';
    modeEmanuel.classList.add('active');
    modeStandard.classList.remove('active');
    modeAhmad.classList.remove('active');
    modeAdrian.classList.remove('active');
});

// --- BACKUP (IM-/EXPORT) ---
document.getElementById('btn-export-data').addEventListener('click', async () => {
    try {
        const dataToExport = {
            leaderboard: JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [],
            highscore: localStorage.getItem('blockBlastHighScore') || 0
        };
        
        const jsonString = JSON.stringify(dataToExport, null, 2);

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'iceblast_backup.json',
                    types: [{ description: 'JSON Datei', accept: {'application/json': ['.json']} }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonString);
                await writable.close();
                showBackupStatus("Erfolgreich gespeichert!");
                return;
            } catch (e) {
                if (e.name === 'AbortError') return;
                throw e; 
            }
        }

        const file = new File([jsonString], "iceblast_backup.json", { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file], title: 'Ice Blast Backup', text: 'Hier ist das Backup der Rangliste.'
                });
                showBackupStatus("Export-Menü geöffnet.");
                return;
            } catch (e) {
                if (e.name === 'AbortError') return;
                throw e;
            }
        }

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.href = url;
        downloadAnchorNode.download = "iceblast_backup.json";
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);
        URL.revokeObjectURL(url);
        showBackupStatus("Download gestartet.");
    } catch (err) {
        showBackupStatus("Fehler beim Exportieren.", true);
        console.error(err);
    }
});

document.getElementById('btn-import-data').addEventListener('click', () => { document.getElementById('import-file-input').click(); });

document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedData = JSON.parse(evt.target.result);
            if (importedData.leaderboard !== undefined && importedData.highscore !== undefined) {
                localStorage.setItem('iceBlastLeaderboard', JSON.stringify(importedData.leaderboard));
                localStorage.setItem('blockBlastHighScore', importedData.highscore);
                
                highScore = importedData.highscore;
                highscoreDisplay.innerText = `👑 ${highScore}`;
                updateLiveLeaderboard();
                
                showBackupStatus("Erfolg! Daten wurden wiederhergestellt.");
            } else {
                showBackupStatus("Fehler: Ungültiges Dateiformat.", true);
            }
        } catch (err) {
            showBackupStatus("Fehler beim Verarbeiten der Datei.", true);
        }
    };
    reader.readAsText(file);
    e.target.value = ""; 
});


// --- KERN-SPIELLOGIK ---
function canPlaceOnBoard(board, shapeData, startRow, startCol) {
    for (let r = 0; r < shapeData.matrix.length; r++) {
        for (let c = 0; c < shapeData.matrix[r].length; c++) {
            if (shapeData.matrix[r][c] === 1) {
                let targetRow = startRow + r;
                let targetCol = startCol + c;
                if (targetRow < 0 || targetRow >= rows || targetCol < 0 || targetCol >= cols || board[targetRow][targetCol] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeShapeOnBoard(board, shapeData, startRow, startCol) {
    for (let r = 0; r < shapeData.matrix.length; r++) {
        for (let c = 0; c < shapeData.matrix[r].length; c++) {
            if (shapeData.matrix[r][c] === 1) board[startRow + r][startCol + c] = 'color-simulation';
        }
    }
}

function clearLinesOnBoard(board) {
    let rowsToClear = [], colsToClear = [];
    for (let r = 0; r < rows; r++) {
        let isFull = true;
        for (let c = 0; c < cols; c++) { if (board[r][c] === null) { isFull = false; break; } }
        if (isFull) rowsToClear.push(r);
    }
    for (let c = 0; c < cols; c++) {
        let isFull = true;
        for (let r = 0; r < rows; r++) { if (board[r][c] === null) { isFull = false; break; } }
        if (isFull) colsToClear.push(c);
    }
    rowsToClear.forEach(r => { for (let c = 0; c < cols; c++) board[r][c] = null; });
    colsToClear.forEach(c => { for (let r = 0; r < rows; r++) board[r][c] = null; });
}

function isSolvable(board, remainingShapes) {
    if (remainingShapes.length === 0) return true;
    for (let i = 0; i < remainingShapes.length; i++) {
        const currentShapeKey = remainingShapes[i];
        const shapeData = shapeDefinitions[currentShapeKey];
        const nextRemaining = remainingShapes.slice();
        nextRemaining.splice(i, 1);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (canPlaceOnBoard(board, shapeData, r, c)) {
                    let nextBoard = cloneBoard(board);
                    placeShapeOnBoard(nextBoard, shapeData, r, c);
                    clearLinesOnBoard(nextBoard);
                    if (isSolvable(nextBoard, nextRemaining)) return true;
                }
            }
        }
    }
    return false;
}

function evaluateShape(board, shapeKey) {
    const shapeData = shapeDefinitions[shapeKey];
    let maxLinesCleared = 0;
    let canBePlaced = false;
    let size = 0;
    for (let r = 0; r < shapeData.matrix.length; r++) {
        for (let c = 0; c < shapeData.matrix[r].length; c++) {
            if (shapeData.matrix[r][c] === 1) size++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (canPlaceOnBoard(board, shapeData, r, c)) {
                canBePlaced = true;
                let tempBoard = cloneBoard(board);
                placeShapeOnBoard(tempBoard, shapeData, r, c);
                let lines = 0;
                for (let tr = 0; tr < rows; tr++) {
                    if (tempBoard[tr].every(val => val !== null)) lines++;
                }
                for (let tc = 0; tc < cols; tc++) {
                    let isFull = true;
                    for (let tr = 0; tr < rows; tr++) {
                        if (tempBoard[tr][tc] === null) { isFull = false; break; }
                    }
                    if (isFull) lines++;
                }
                if (lines > maxLinesCleared) maxLinesCleared = lines;
            }
        }
    }
    return { shapeKey, canPlace: canBePlaced, maxLinesCleared, size };
}

function refreshTrayColors() {
    shapeContainers.forEach(container => {
        if (container.style.visibility !== 'hidden') {
            let newColor = blockColors[Math.floor(Math.random() * blockColors.length)];
            
            if (gameMode === 'ahmad') {
                newColor = 'color-image';
            } else if (gameMode === 'emanuel') {
                newColor = 'color-emanuel';
            } else if (gameMode === 'adrian') { 
                newColor = 'color-adrian';
            } else if (document.getElementById('toggle-single-color') && document.getElementById('toggle-single-color').checked) {
                newColor = document.getElementById('single-color-select').value;
            }
            
            const miniBlocks = container.querySelectorAll('.mini-block');
            miniBlocks.forEach(block => {
                if (!block.classList.contains('color-transparent')) {
                    block.className = 'mini-block ' + newColor;
                }
            });
            container.dataset.color = newColor;
        }
    });
}

function generateNewShapes() {
    let allShapeKeys = Object.keys(shapeDefinitions);
    let rareKeys = ['line2_h', 'line2_v'];
    let normalKeys = allShapeKeys.filter(k => !rareKeys.includes(k));
    
    let weightedPool = [...normalKeys, ...normalKeys, ...rareKeys];
    let shapeEvals = allShapeKeys
        .map(k => evaluateShape(boardState, k))
        .filter(e => e.canPlace);
        
    shapeEvals.sort((a, b) => {
        if (b.maxLinesCleared !== a.maxLinesCleared) return b.maxLinesCleared - a.maxLinesCleared;
        return b.size - a.size; 
    });
    
    let clearingShapes = shapeEvals.filter(e => e.maxLinesCleared > 0).map(e => e.shapeKey);
    let helpChance = 0;
    if (currentScore < 100) helpChance = 0.8;
    else if (currentScore < 1000) helpChance = 0.4;

    let shapesToGenerate = [];
    let attempts = 0;
    let validSetFound = false;

    while (!validSetFound && attempts < 100) {
        shapesToGenerate = [];
        for (let i = 0; i < 3; i++) {
            if (Math.random() < helpChance && clearingShapes.length > 0) {
                let topChoices = clearingShapes.slice(0, 3);
                shapesToGenerate.push(topChoices[Math.floor(Math.random() * topChoices.length)]);
            } else {
                shapesToGenerate.push(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
            }
        }
        if (isSolvable(boardState, shapesToGenerate)) validSetFound = true;
        attempts++;
    }

    if (!validSetFound) {
        shapesToGenerate = [];
        let tempBoard = cloneBoard(boardState);
        for(let i = 0; i < 3; i++) {
            let found = false;
            let fallbackKeys = clearingShapes.length > 0 ? [...clearingShapes, ...weightedPool] : weightedPool;
            let shuffledKeys = fallbackKeys.slice().sort(() => Math.random() - 0.5);
            shuffledKeys.unshift('square2x2');
            
            for(let key of shuffledKeys) {
                const shapeData = shapeDefinitions[key];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (canPlaceOnBoard(tempBoard, shapeData, r, c)) {
                             shapesToGenerate.push(key);
                             placeShapeOnBoard(tempBoard, shapeData, r, c);
                             clearLinesOnBoard(tempBoard);
                             found = true; break;
                        }
                    }
                    if(found) break;
                }
                if(found) break;
            }
            if (!found) shapesToGenerate.push('line2_h');
        }
    }

    shapeContainers.forEach((container, index) => {
        const randomKey = shapesToGenerate[index];
        const shapeData = shapeDefinitions[randomKey];
        
        let randomColor = blockColors[Math.floor(Math.random() * blockColors.length)];
        
        if (gameMode === 'ahmad') {
            randomColor = 'color-image';
        } else if (gameMode === 'emanuel') {
            randomColor = 'color-emanuel';
        } else if (gameMode === 'adrian') { 
            randomColor = 'color-adrian';
        } else if (document.getElementById('toggle-single-color') && document.getElementById('toggle-single-color').checked) {
            randomColor = document.getElementById('single-color-select').value;
        }

        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${shapeData.matrix[0].length}, 20px)`;
        container.dataset.shape = randomKey; 
        container.dataset.color = randomColor;
        container.style.visibility = 'visible';
        
        for (let r = 0; r < shapeData.matrix.length; r++) {
            for (let c = 0; c < shapeData.matrix[r].length; c++) {
                const block = document.createElement('div');
                block.className = 'mini-block';
                if (shapeData.matrix[r][c] === 1) block.classList.add(randomColor);
                else block.classList.add('color-transparent');
                container.appendChild(block);
            }
        }
    });
}

function canPlace(shapeData, startRow, startCol) {
    for (let r = 0; r < shapeData.matrix.length; r++) {
        for (let c = 0; c < shapeData.matrix[r].length; c++) {
            if (shapeData.matrix[r][c] === 1) {
                let targetRow = startRow + r;
                let targetCol = startCol + c;
                if (targetRow < 0 || targetRow >= rows || targetCol < 0 || targetCol >= cols || boardState[targetRow][targetCol] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

function checkGameOver() {
    let canPlaceAny = false;
    shapeContainers.forEach(container => {
        if (container.style.visibility !== 'hidden') {
            const shapeKey = container.dataset.shape;
            const shapeData = shapeDefinitions[shapeKey];
            for (let r = 0; r < rows; r++) {
                 for (let c = 0; c < cols; c++) {
                    if (canPlace(shapeData, r, c)) canPlaceAny = true;
                }
            }
        }
    });
    
    if (!canPlaceAny && gameStarted) {
        gameStarted = false;
        boardElement.style.filter = 'brightness(0.4)';

        if (isRankedMode) {
            try {
                let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
                const now = new Date();
                const dateStr = now.toLocaleDateString('de-DE');
                const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                
                scores.push({
                    name: currentRankedName || "Unbekannt",
                    pic: currentRankedPicBase64,
                    date: dateStr,
                    time: timeStr,
                    score: currentScore
                });
                
                scores.sort((a, b) => b.score - a.score);
                scores = scores.slice(0, 50); 
                
                localStorage.setItem('iceBlastLeaderboard', JSON.stringify(scores));
                updateLiveLeaderboard(); 
            } catch (err) {
                console.warn("Speicher voll! Lösche alte Bilder, um Score zu retten...");
                let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
                scores.push({
                    name: currentRankedName || "Unbekannt",
                    pic: "", 
                    date: new Date().toLocaleDateString('de-DE'),
                    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                    score: currentScore
                });
                scores.sort((a, b) => b.score - a.score);
                scores = scores.map(s => { s.pic = ""; return s; }); 
                scores = scores.slice(0, 50);
                localStorage.setItem('iceBlastLeaderboard', JSON.stringify(scores));
                updateLiveLeaderboard();
            }
        }
        
        const sweepOverlay = document.getElementById('sweep-overlay');
        if(sweepOverlay) sweepOverlay.classList.add('active');
        
        setTimeout(() => {
            if(sweepOverlay) sweepOverlay.classList.remove('active');
            document.getElementById('cgo-current').innerText = currentScore;
            document.getElementById('cgo-best').innerText = highScore;
            document.getElementById('custom-game-over-screen').classList.remove('hidden');
        }, 3000);
    }
}

function showComboPopup(comboLvl) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.innerText = `Combo x${comboLvl}! 🔥`;
    document.querySelector('.board-wrapper').appendChild(popup);
    setTimeout(() => { popup.remove(); }, 1200);
}

function checkRoundEnd() {
    const allUsed = Array.from(shapeContainers).every(s => s.style.visibility === 'hidden');
    if (allUsed) {
        if (!clearedLineInRound) {
            currentCombo = 0;
            updateComboUI();
        }
        clearedLineInRound = false;
        generateNewShapes();
    }
    checkGameOver();
}

function checkAndClearLines() {
    let rowsToClear = [], colsToClear = [];
    for (let r = 0; r < rows; r++) {
        let isFull = true;
        for (let c = 0; c < cols; c++) { if (boardState[r][c] === null) { isFull = false; break; } }
        if (isFull) rowsToClear.push(r);
    }
    for (let c = 0; c < cols; c++) {
        let isFull = true;
        for (let r = 0; r < rows; r++) { if (boardState[r][c] === null) { isFull = false; break; } }
        if (isFull) colsToClear.push(c);
    }

    let totalLinesCleared = rowsToClear.length + colsToClear.length;
    if (totalLinesCleared > 0) {
        clearedLineInRound = true;
        isAnimating = true;
        
        let startCombo = currentCombo;
        currentCombo += totalLinesCleared;
        updateComboUI();

        let basePoints = totalLinesCleared * 10;
        let multiClearBonus = 0;
        
        if (totalLinesCleared === 2) multiClearBonus = 30;
        else if (totalLinesCleared === 3) multiClearBonus = 60;
        else if (totalLinesCleared >= 4) multiClearBonus = 120;
        
        let multiplier = Math.max(1, currentCombo);
        let pointsToAdd = (basePoints + multiClearBonus) * multiplier;
        
        updateScore(pointsToAdd);
        SoundEngine.playBreak(currentCombo);
        
        for (let i = 0; i < totalLinesCleared; i++) {
            setTimeout(() => showComboPopup(startCombo + i + 1), i * 300);
        }

        let cellsToShatter = [];
        rowsToClear.forEach(r => {
            for (let c = 0; c < cols; c++) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) cellsToShatter.push(cell);
            }
        });
        
        colsToClear.forEach(c => {
            for (let r = 0; r < rows; r++) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell && !cellsToShatter.includes(cell)) cellsToShatter.push(cell);
            }
        });
        
        cellsToShatter.forEach(cell => cell.classList.add('shatter'));

        setTimeout(() => {
            rowsToClear.forEach(r => { for (let c = 0; c < cols; c++) boardState[r][c] = null; });
            colsToClear.forEach(c => { for (let r = 0; r < rows; r++) boardState[r][c] = null; });
            renderBoard();
            isAnimating = false;
            checkRoundEnd(); 
        }, 400);
        
        return totalLinesCleared; 
    }
    return 0;
}

function clearPreview() {
    document.querySelectorAll('.cell.preview').forEach(cell => {
        cell.classList.remove('preview');
        const classes = Array.from(cell.classList);
        classes.forEach(cls => {
            if (cls.startsWith('color-') && !cell.classList.contains('filled')) cell.classList.remove(cls);
        });
    });
    document.querySelectorAll('.cell.will-clear').forEach(cell => { cell.classList.remove('will-clear'); });
}

// --- DRAG & DROP LOGIK ---
let isDragging = false, activeShape = null, draggedShapeKey = null;
let startMouseX = 0, startMouseY = 0, startElementX = 0, startElementY = 0;
let currentTargetRow = -1, currentTargetCol = -1;

shapeSlots.forEach((slot, index) => {
    slot.addEventListener('pointerdown', (e) => {
        if (!gameStarted || isAnimating) return; 
        const shape = shapeContainers[index];
        if (shape.style.visibility === 'hidden') return;
        
        currentTargetRow = -1;
        currentTargetCol = -1;
        
        isDragging = true; activeShape = shape; draggedShapeKey = shape.dataset.shape;
        const shapeData = shapeDefinitions[draggedShapeKey];
        
        shape.style.gridTemplateColumns = `repeat(${shapeData.matrix[0].length}, 70px)`;
        Array.from(shape.children).forEach(child => {
            child.style.width = '70px';
            child.style.height = '70px';
            child.style.borderRadius = '4px';
        });
        
        const newWidth = shapeData.matrix[0].length * 70 + (shapeData.matrix[0].length - 1) * 2;
        const newHeight = shapeData.matrix.length * 70 + (shapeData.matrix.length - 1) * 2;
        
        startMouseX = e.clientX; 
        startMouseY = e.clientY;
        startElementX = e.clientX - (newWidth / 2);
        startElementY = e.clientY - newHeight - 30;

        shape.classList.add('dragging');
        shape.style.position = 'fixed';
        shape.style.left = startElementX + 'px'; 
        shape.style.top = startElementY + 'px';
        shape.style.margin = '0';
        shape.style.transform = 'none';

        slot.style.cursor = 'grabbing';
        e.preventDefault();
    });
});

document.addEventListener('pointermove', (e) => {
    if (!isDragging || !activeShape) return;
    const dx = e.clientX - startMouseX; const dy = e.clientY - startMouseY;
    activeShape.style.left = (startElementX + dx) + 'px'; activeShape.style.top = (startElementY + dy) + 'px';

    const activeRect = activeShape.getBoundingClientRect();
    const boardRect = boardElement.getBoundingClientRect();
    
    clearPreview(); currentTargetRow = -1; currentTargetCol = -1;

    const xInsideBoard = activeRect.left - boardRect.left;
    const yInsideBoard = activeRect.top - boardRect.top;
    
    const cellSize = 72;
    const col = Math.floor((xInsideBoard + 36) / cellSize);
    const row = Math.floor((yInsideBoard + 36) / cellSize);

    const shapeData = shapeDefinitions[draggedShapeKey];
    const activeColor = activeShape.dataset.color; 
    
    if (canPlace(shapeData, row, col)) {
        currentTargetRow = row;
        currentTargetCol = col;
        for (let r = 0; r < shapeData.matrix.length; r++) {
            for (let c = 0; c < shapeData.matrix[r].length; c++) {
                if (shapeData.matrix[r][c] === 1) {
                    const targetCell = document.querySelector(`.cell[data-row="${row + r}"][data-col="${col + c}"]`);
                    if (targetCell) { targetCell.classList.add('preview'); targetCell.classList.add(activeColor); }
                }
            }
        }

        let tempRowCounts = Array(rows).fill(0);
        let tempColCounts = Array(cols).fill(0);
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (boardState[r][c] !== null) { tempRowCounts[r]++; tempColCounts[c]++; }
            }
        }
        
        for (let r = 0; r < shapeData.matrix.length; r++) {
            for (let c = 0; c < shapeData.matrix[r].length; c++) {
                if (shapeData.matrix[r][c] === 1) { tempRowCounts[row + r]++; tempColCounts[col + c]++; }
            }
        }
        
        for (let r = 0; r < rows; r++) {
            if (tempRowCounts[r] === cols) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('will-clear');
                }
            }
        }
        
        for (let c = 0; c < cols; c++) {
            if (tempColCounts[c] === rows) {
                for (let r = 0; r < rows; r++) {
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) cell.classList.add('will-clear');
                }
            }
        }
    }
});

document.addEventListener('pointerup', (e) => {
    if (!isDragging || !activeShape) return;
    shapeSlots.forEach(slot => slot.style.cursor = 'grab');

    if (draggedShapeKey) {
        const resetShapeData = shapeDefinitions[draggedShapeKey];
        activeShape.style.gridTemplateColumns = `repeat(${resetShapeData.matrix[0].length}, 20px)`;
        Array.from(activeShape.children).forEach(child => {
            child.style.width = '20px';
            child.style.height = '20px';
            child.style.borderRadius = '3px';
         });
    }

    activeShape.classList.remove('dragging');
    activeShape.style.position = 'relative'; 
    activeShape.style.left = '0';
    activeShape.style.top = '0';
    activeShape.style.transform = 'none';

    if (currentTargetRow !== -1 && currentTargetCol !== -1) {
        const shapeData = shapeDefinitions[draggedShapeKey];
        const activeColor = activeShape.dataset.color;
        
        let blocksPlaced = 0;
        let newlyPlacedCells = [];
        
        for (let r = 0; r < shapeData.matrix.length; r++) {
            for (let c = 0; c < shapeData.matrix[r].length; c++) {
                if (shapeData.matrix[r][c] === 1) {
                    boardState[currentTargetRow + r][currentTargetCol + c] = activeColor;
                    blocksPlaced++;
                    newlyPlacedCells.push({r: currentTargetRow + r, c: currentTargetCol + c});
                }
            }
        }
        
        updateScore(blocksPlaced * 1);
        renderBoard();
        activeShape.style.visibility = 'hidden';
        SoundEngine.playPlace();
        
        newlyPlacedCells.forEach(pos => {
            const cell = document.querySelector(`.cell[data-row="${pos.r}"][data-col="${pos.c}"]`);
            if (cell) {
                cell.classList.add('placed-effect');
                setTimeout(() => cell.classList.remove('placed-effect'), 300);
            }
        });
        
        let linesClearedNow = checkAndClearLines();
        if (linesClearedNow === 0) {
            checkRoundEnd();
        }
    }

    isDragging = false;
    activeShape = null;
    draggedShapeKey = null;
    currentTargetRow = -1;
    currentTargetCol = -1;
    clearPreview();
});

// --- SPIELSTART & PREFILL ---
function prefillOriginal() {
    const numBlocks = Math.floor(Math.random() * 8) + 16;
    let blocksPlaced = 0;
    
    while(blocksPlaced < numBlocks) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (boardState[r][c] === null) {
            let randomColor = blockColors[Math.floor(Math.random() * blockColors.length)];
            if (gameMode === 'ahmad') randomColor = 'color-image';
            else if (gameMode === 'emanuel') randomColor = 'color-emanuel';
            else if (gameMode === 'adrian') randomColor = 'color-adrian';
            else if (document.getElementById('toggle-single-color') && document.getElementById('toggle-single-color').checked) {
                randomColor = document.getElementById('single-color-select').value;
            }

            boardState[r][c] = randomColor;
            blocksPlaced++;
        }
    }
    
    let clearedSomething = true;
    while(clearedSomething) {
        let rowsToClear = [], colsToClear = [];
        for (let r = 0; r < rows; r++) {
            let isFull = true;
            for (let c = 0; c < cols; c++) { if (boardState[r][c] === null) { isFull = false; break; } }
            if (isFull) rowsToClear.push(r);
        }
        for (let c = 0; c < cols; c++) {
            let isFull = true;
            for (let r = 0; r < rows; r++) { if (boardState[r][c] === null) { isFull = false; break; } }
            if (isFull) colsToClear.push(c);
        }
        
        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            rowsToClear.forEach(r => { for (let c = 0; c < cols; c++) boardState[r][c] = null; });
            colsToClear.forEach(c => { for (let r = 0; r < rows; r++) boardState[r][c] = null; });
        } else {
            clearedSomething = false;
        }
    }
}

function startGameRoutine() {
    SoundEngine.init();
   
    if (document.getElementById('toggle-bgm').checked) bgmAudio.play().catch(() => {});
    
    if (scoreAnimationId) cancelAnimationFrame(scoreAnimationId);
    displayedScore = 0; currentScore = 0;
    
    boardElement.style.filter = 'brightness(1)';
    const sweepOverlay = document.getElementById('sweep-overlay');
    if(sweepOverlay) {
        sweepOverlay.style.transition = 'none'; 
        sweepOverlay.classList.remove('active');
        void sweepOverlay.offsetWidth; 
        sweepOverlay.style.transition = 'height 3s ease-in-out'; 
    }
    
    currentCombo = 0;
    clearedLineInRound = false;
    updateComboUI();
    
    scoreDisplay.innerText = displayedScore;
    boardState = Array(rows).fill().map(() => Array(cols).fill(null));
    
    if (document.getElementById('toggle-original') && document.getElementById('toggle-original').checked) {
        prefillOriginal();
    }
    
    renderBoard();
    generateNewShapes();
    gameStarted = true;
    iceStartScreen.classList.add('hidden');
    document.getElementById('custom-game-over-screen').classList.add('hidden');
    checkGameOver();

    if (isRankedMode) {
        liveLeaderboard.classList.remove('hidden');
        liveNameInput.value = currentRankedName;
        updateLiveLeaderboard(); 
    } else {
        liveLeaderboard.classList.add('hidden');
    }
}

// Start-Buttons verknüpfen
document.getElementById('btn-settings-home').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    gameStarted = false;
    bgmAudio.pause();
    iceStartScreen.classList.remove('hidden');
    liveLeaderboard.classList.add('hidden');
    isRankedMode = false;
});

document.getElementById('btn-settings-replay').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    startGameRoutine();
});

btnStartClassic.addEventListener('click', startGameRoutine);

function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 70;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.6));
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

btnStartRangliste.addEventListener('click', () => {
    rankedSetupScreen.classList.remove('hidden');
    document.getElementById('ranked-name-input').value = localStorage.getItem('lastRankedName') || "";
});

clearPicBtn.addEventListener('click', () => {
    currentRankedPicBase64 = "";
    document.getElementById('ranked-pic-input').value = "";
    document.querySelectorAll('.preset-avatar').forEach(a => a.classList.remove('selected'));
    clearPicBtn.style.display = 'none';
});

document.getElementById('ranked-pic-input').addEventListener('change', function(e) {
    document.querySelectorAll('.preset-avatar').forEach(a => a.classList.remove('selected'));
    const file = e.target.files[0];
    if (file) {
        resizeImage(file, function(resizedBase64) {
            currentRankedPicBase64 = resizedBase64;
            clearPicBtn.style.display = 'block'; 
        });
    }
});

document.getElementById('btn-start-ranked-game').addEventListener('click', () => {
    const nameInput = document.getElementById('ranked-name-input').value.trim();
    if (nameInput === "") {
        alert("Bitte gib einen Namen ein!");
        return;
    }
    
    currentRankedName = nameInput;
    localStorage.setItem('lastRankedName', currentRankedName);
    isRankedMode = true;
    
    rankedSetupScreen.classList.add('hidden');
    startGameRoutine();
});

document.getElementById('close-ranked-setup').addEventListener('click', () => {
    rankedSetupScreen.classList.add('hidden');
});

// --- LEADERBOARD & ADMIN ---
function updateLiveLeaderboard() {
    liveLbList.innerHTML = "";
    let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
    
    if (scores.length === 0) {
        liveLbList.innerHTML = "<div style='text-align:center; color:#a9b7d6; font-size: 14px;'>Noch keine Einträge.</div>";
    } else {
        scores.forEach((entry, index) => {
            let rankDisplay = `#${index + 1}`;
            let bgClass = "";
            let rankTextClass = "";
            
            if (index === 0) { rankDisplay = "🥇"; bgClass = "bg-rank-1"; rankTextClass = "rank-1-text"; }
            else if (index === 1) { rankDisplay = "🥈"; bgClass = "bg-rank-2"; rankTextClass = "rank-2-text"; }
            else if (index === 2) { rankDisplay = "🥉"; bgClass = "bg-rank-3"; rankTextClass = "rank-3-text"; }

            liveLbList.innerHTML += `
                <div class="live-lb-entry ${bgClass}">
                    <div class="live-lb-rank ${rankTextClass}">${rankDisplay}</div>
                    <div class="live-lb-name">${entry.name}</div>
                    <div class="live-lb-score">${entry.score}</div>
                </div>
            `;
        });
    }
}

document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
    leaderboardScreen.classList.add('hidden');
    
    if (gameStarted) return;
    
    if (!isRankedMode) {
        iceStartScreen.classList.remove('hidden');
        liveLeaderboard.classList.add('hidden');
    }
});

function showLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ""; 
    
    let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = "<div style='text-align:center; color:#a9b7d6;'>Noch keine Einträge. Spiel eine Runde!</div>";
    } else {
        scores.forEach((entry, index) => {
            let picHtml = '';
            if (entry.pic) {
                picHtml = `<img src="${entry.pic}" class="lb-pic" alt="Profil">`;
            } else {
                picHtml = `<div class="lb-pic" style="background-color: transparent; border: none;"></div>`;
            }
            
            let rankDisplay = `#${index + 1}`;
            let bgClass = "";
            let rankTextClass = "";
            
            if (index === 0) { rankDisplay = "🥇"; bgClass = "bg-rank-1"; rankTextClass = "rank-1-text"; }
            else if (index === 1) { rankDisplay = "🥈"; bgClass = "bg-rank-2"; rankTextClass = "rank-2-text"; }
            else if (index === 2) { rankDisplay = "🥉"; bgClass = "bg-rank-3"; rankTextClass = "rank-3-text"; }

            const html = `
                <div class="leaderboard-entry ${bgClass}">
                    <div class="lb-rank ${rankTextClass}">${rankDisplay}</div>
                    ${picHtml}
                    <div class="lb-info">
                        <div class="lb-name">${entry.name}</div>
                        <div class="lb-date">${entry.date} - ${entry.time}</div>
                    </div>
                    <div class="lb-score">${entry.score}</div>
                </div>
            `;
            leaderboardList.innerHTML += html;
        });
    }
    leaderboardScreen.classList.remove('hidden');
}

let adminCurrentPic = "";

function renderAdminList() {
    const listContainer = document.getElementById('admin-list');
    listContainer.innerHTML = '';
    let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
    
    scores.forEach((entry, index) => {
        let picHtml = entry.pic ? `<img src="${entry.pic}" class="lb-pic" style="width:40px;height:40px;border:1px solid #fff;">` : `<div class="lb-pic" style="width:40px;height:40px;background:transparent;border:none;"></div>`;
        const entryHtml = `
            <div class="leaderboard-entry" style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.15); border-left: none; padding: 10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${picHtml}
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:bold; color:white; font-size: 16px;">${entry.name}</span>
                        <span style="color:#6ee7b7; font-weight:bold; font-size: 18px;">${entry.score}</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="adminEditEntry(${index})" style="background:#facc15; border:none; border-radius:6px; padding:8px 12px; font-weight:bold; cursor:pointer; font-size: 16px;">✎</button>
                    <button onclick="adminDeleteEntry(${index})" style="background:#ef4444; color:white; border:none; border-radius:6px; padding:8px 12px; font-weight:bold; cursor:pointer; font-size: 16px;">🗑</button>
                </div>
            </div>
        `;
        listContainer.innerHTML += entryHtml;
    });

    if(scores.length === 0) {
        listContainer.innerHTML = "<div style='text-align:center; padding: 20px; color:#fff;'>Keine Einträge vorhanden.</div>";
    }
}

window.adminDeleteEntry = function(index) {
    if(confirm("Diesen Eintrag wirklich löschen?")) {
        let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
        scores.splice(index, 1);
        localStorage.setItem('iceBlastLeaderboard', JSON.stringify(scores));
        renderAdminList();
        updateLiveLeaderboard();
    }
};

window.adminEditEntry = function(index) {
    let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
    let entry = scores[index];
    document.getElementById('admin-modal-title').innerText = "Eintrag bearbeiten";
    document.getElementById('admin-edit-index').value = index;
    document.getElementById('admin-name').value = entry.name;
    document.getElementById('admin-score').value = entry.score;
    document.getElementById('admin-date').value = entry.date;
    document.getElementById('admin-time').value = entry.time;
    
    adminCurrentPic = entry.pic || "";
    document.getElementById('admin-pic-input').value = "";
    document.getElementById('admin-edit-modal').classList.remove('hidden');
};

document.getElementById('btn-admin-add').addEventListener('click', () => {
    document.getElementById('admin-modal-title').innerText = "Neuer Eintrag";
    document.getElementById('admin-edit-index').value = "-1";
    document.getElementById('admin-name').value = "";
    document.getElementById('admin-score').value = "";
    
    const now = new Date();
    document.getElementById('admin-date').value = now.toLocaleDateString('de-DE');
    document.getElementById('admin-time').value = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    adminCurrentPic = "";
    document.getElementById('admin-pic-input').value = "";
    document.getElementById('admin-edit-modal').classList.remove('hidden');
});

document.getElementById('close-admin-edit').addEventListener('click', () => {
    document.getElementById('admin-edit-modal').classList.add('hidden');
});

document.getElementById('admin-pic-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        resizeImage(file, function(resizedBase64) { adminCurrentPic = resizedBase64; });
    }
});

document.getElementById('admin-clear-pic').addEventListener('click', () => {
    adminCurrentPic = "";
    document.getElementById('admin-pic-input').value = "";
});

document.getElementById('btn-admin-save').addEventListener('click', () => {
    let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
    const index = parseInt(document.getElementById('admin-edit-index').value);
    
    const newEntry = {
        name: document.getElementById('admin-name').value || "Unbekannt",
        score: parseInt(document.getElementById('admin-score').value) || 0,
        date: document.getElementById('admin-date').value || "",
        time: document.getElementById('admin-time').value || "",
        pic: adminCurrentPic
    };

    if (index >= 0) {
        scores[index] = newEntry;
    } else {
        scores.push(newEntry);
    }
    
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('iceBlastLeaderboard', JSON.stringify(scores));
    
    document.getElementById('admin-edit-modal').classList.add('hidden');
    renderAdminList();
    updateLiveLeaderboard(); 
});

let masterClickCount = 0;
let masterClickTimer = null;

document.getElementById('master-title').addEventListener('click', () => {
    masterClickCount++;
    clearTimeout(masterClickTimer);

    if (masterClickCount >= 5) {
        document.getElementById('hidden-room').classList.remove('hidden');
        document.getElementById('admin-global-highscore').value = highScore; 
        renderAdminList();
        masterClickCount = 0; 
    } else {
        masterClickTimer = setTimeout(() => { masterClickCount = 0; }, 1000);
    }
});

document.getElementById('btn-leave-room').addEventListener('click', () => {
    document.getElementById('hidden-room').classList.add('hidden');
});

document.getElementById('btn-admin-save-highscore').addEventListener('click', () => {
    const newScore = parseInt(document.getElementById('admin-global-highscore').value);
    if (!isNaN(newScore)) {
        highScore = newScore;
        localStorage.setItem('blockBlastHighScore', highScore);
        highscoreDisplay.innerText = `👑 ${highScore}`;
        alert('Globaler Highscore erfolgreich aktualisiert!');
    }
});

document.getElementById('cgo-play-btn').addEventListener('click', startGameRoutine);
document.querySelector('.top-right-icon').addEventListener('click', startGameRoutine);

// Initiales Aufrufen beim Laden der Seite
renderBoard();

// --- NEU: Button-Funktion für die permanente Ranking-Taste (Weiterleitung zur Hauptseite) ---
document.getElementById('btn-back-to-ranking').addEventListener('click', () => {
    window.location.href = '../index.html';
});

// --- NEU: Direkt im Ranglisten-Setup (Namenseingabe) starten ---
// 1. Versteckt den normalen Startbildschirm
document.getElementById('ice-start-screen').classList.add('hidden');
// 2. Versteckt die Top-Spieler-Liste zur Sicherheit
document.getElementById('leaderboard-screen').classList.add('hidden'); 
// 3. Zeigt den Setup-Screen für Namen und Profilbild
document.getElementById('ranked-setup-screen').classList.remove('hidden');
// 4. Lädt den zuletzt genutzten Namen direkt in das Eingabefeld
document.getElementById('ranked-name-input').value = localStorage.getItem('lastRankedName') || "";
