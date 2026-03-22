<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ice Blast - Adventure Master</title>
    <style>
        * {
            box-sizing: border-box;
            user-select: none;
        }

        body {
            background: linear-gradient(to bottom, #1d61c2, #2185de, #2497eb);
            background-attachment: fixed;
            margin: 0;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            height: 100vh;
            overflow: hidden;
            touch-action: none;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 580px;
            margin-bottom: 10px;
        }

        .highscore {
            color: #f1c40f;
            font-size: 32px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .settings-icon {
            font-size: 40px;
            color: #a9b7d6;
            cursor: pointer;
            transition: transform 0.1s;
        }
        
        .settings-icon:active {
            transform: scale(0.9);
        }

        .current-score-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            position: relative;
            min-height: 90px;
        }

        .combo-display {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            color: rgba(255, 71, 87, 0.25);
            font-size: 100px;
            z-index: 1;
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
        }

        .combo-display.hidden {
            opacity: 0;
            transform: scale(0.5);
        }

        .combo-display.pulse {
            animation: comboPopUI 0.4s ease-out;
        }

        @keyframes comboPopUI {
            0% { transform: scale(1);
            }
            50% { transform: scale(1.15);
            filter: drop-shadow(0 0 15px rgba(255, 71, 87, 0.4)); }
            100% { transform: scale(1);
            }
        }

        .heart-icon {
            animation: heartbeat 0.8s infinite alternate;
        }

        @keyframes heartbeat {
            0% { transform: scale(1);
            }
            100% { transform: scale(1.1);
            }
        }

        .current-score {
            font-size: 68px;
            font-weight: bold;
            z-index: 2;
            position: relative;
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .board-wrapper {
            position: relative;
            width: 580px; 
            height: 580px;
            margin-bottom: 20px;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(8, 70px); 
            grid-template-rows: repeat(8, 70px);
            gap: 2px;
            background-color: #212943;
            padding: 3px;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            width: 100%;
            height: 100%;
            transition: filter 0.5s ease;
        }

        .sweep-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; height: 0;
            background: linear-gradient(to bottom, rgba(238, 82, 83, 0.8), rgba(95, 39, 205, 0.8));
            z-index: 50;
            transition: height 3s ease-in-out;
            border-radius: 6px;
            pointer-events: none;
        }
        
        .sweep-overlay.active {
            height: 100%;
        }

        .cell {
            width: 70px;
            height: 70px;
            background-color: #2a3453;
            border-radius: 4px;
            transition: background-color 0.1s, opacity 0.1s;
        }

        .cell.preview {
            opacity: 0.7;
            box-shadow: inset 0 0 8px rgba(255,255,255,0.8);
            transform: scale(0.95);
        }

        .cell.filled {
            box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.4), 
                        inset -2px -2px 5px rgba(0, 0, 0, 0.3);
            transform: scale(1);
        }

        .cell.placed-effect { animation: dropAndShine 0.3s ease-out forwards;
        }

        @keyframes dropAndShine {
            0% { transform: scale(1.1) translateY(-3px);
            filter: brightness(1.8); }
            50% { transform: scale(0.95) translateY(2px);
            filter: brightness(1.3); }
            100% { transform: scale(1) translateY(0);
            filter: brightness(1); }
        }

        .cell.will-clear { position: relative;
        }
        .cell.will-clear::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.4);
            box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.8), 0 0 10px rgba(255, 215, 0, 0.6);
            border-radius: 4px;
            z-index: 5;
            animation: pulseGlitter 0.5s infinite alternate;
            pointer-events: none;
        }
        @keyframes pulseGlitter {
            0% { opacity: 0.4;
            transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1.05);
            }
        }

        .cell.shatter {
            animation: shatterEffect 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            pointer-events: none;
            z-index: 10;
        }
        @keyframes shatterEffect {
            0% { transform: scale(1);
            opacity: 1; filter: brightness(1.5); }
            40% { transform: scale(1.15) rotate(15deg);
            opacity: 1; filter: brightness(2); }
            100% { transform: scale(0) rotate(-45deg);
            opacity: 0; filter: brightness(0.5); }
        }

        .combo-popup {
            position: absolute;
            top: 40%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 32px; font-weight: bold; color: #f1c40f;
            text-shadow: 0 0 10px #e67e22, 0 0 20px #e74c3c;
            z-index: 200; pointer-events: none; white-space: nowrap;
            animation: comboPop 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes comboPop {
            0% { transform: translate(-50%, -30%) scale(0.5);
            opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2);
            opacity: 1; }
            80% { transform: translate(-50%, -60%) scale(1);
            opacity: 1; }
            100% { transform: translate(-50%, -70%) scale(0.8);
            opacity: 0; }
        }

        .ice-start-screen {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, #1d61c2, #2185de, #2497eb);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            transition: opacity 0.4s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .ice-start-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .logo-container {
            text-align: center;
            margin-bottom: 120px;
            margin-top: -100px; 
            transform: scale(1.2);
        }

        .logo-ice {
            font-size: 90px;
            font-weight: 900;
            color: #e0f2fe;
            text-shadow: 0 8px 0 #93c5fd, 0 15px 20px rgba(0,0,0,0.3);
            margin: 0;
            line-height: 1;
            position: relative;
            letter-spacing: -2px;
        }

        .logo-crown {
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 55px;
            filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));
        }

        .logo-blast {
            font-size: 65px;
            font-weight: 900;
            display: flex;
            justify-content: center;
            gap: 2px;
            text-shadow: 0 5px 0 rgba(0,0,0,0.2), 0 10px 15px rgba(0,0,0,0.3);
            margin: -5px 0 0 0;
            letter-spacing: -1px;
        }

        .letter-B { color: #f59e0b; }
        .letter-L { color: #ef4444; }
        .letter-A { color: #facc15; }
        .letter-S { color: #fcd34d; }
        .letter-T { color: #a855f7; }

        .logo-sub {
            font-size: 16px;
            color: #bae6fd;
            letter-spacing: 3px;
            margin-top: 15px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .start-buttons-wrapper {
            display: flex;
            flex-direction: column;
            gap: 35px;
            width: 80%;
            max-width: 320px;
        }

        .btn-menu {
            position: relative;
            border: none;
            border-radius: 12px;
            padding: 22px;
            font-size: 28px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 8px 15px rgba(0,0,0,0.3);
            transition: transform 0.1s;
        }

        .btn-menu:active {
            transform: translateY(6px);
        }

        .btn-rangliste {
            background-color: #facc15;
            color: white;
            border-bottom: 6px solid #d97706;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .btn-rangliste:active {
            border-bottom-width: 0px;
            margin-bottom: 6px;
        }

        .btn-classic {
            background-color: #6ee7b7;
            color: white;
            border-bottom: 6px solid #059669;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .btn-classic:active {
            border-bottom-width: 0px;
            margin-bottom: 6px;
        }

        .badge-dot {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            background-color: #ef4444;
            border-radius: 50%;
            border: 3px solid #1d61c2;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .custom-game-over-screen {
            position: fixed;
            top: 0;
            left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, #1d61c2, #2185de, #2497eb);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            transition: opacity 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .custom-game-over-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .top-right-icon {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: #f1c40f;
            border-radius: 50%;
            width: 40px; height: 40px;
            display: flex; justify-content: center; align-items: center;
            font-size: 20px;
            box-shadow: 0 3px 0 #d4ac0d;
            cursor: pointer;
            transition: transform 0.1s;
        }
        
        .top-right-icon:active {
            transform: translateY(2px);
            box-shadow: 0 1px 0 #d4ac0d;
        }

        .cgo-title {
            font-size: 48px;
            font-weight: 800;
            color: #72bffd; 
            text-shadow: 0 2px 5px rgba(0,0,0,0.2);
            margin-bottom: 40px;
            letter-spacing: 1px;
        }

        .cgo-label {
            font-size: 18px;
            font-weight: 600;
            color: #72bffd;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }

        .cgo-score {
            font-size: 64px;
            font-weight: bold;
            color: white;
            margin-bottom: 30px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .cgo-best {
            font-size: 48px;
            font-weight: bold;
            color: #ffa500; 
            margin-bottom: 50px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .cgo-play-btn {
            background-color: #31c817;
            border: none;
            border-bottom: 6px solid #23930e; 
            border-radius: 12px;
            width: 200px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.1s, border-bottom-width 0.1s;
        }

        .cgo-play-btn:active {
            transform: translateY(4px);
            border-bottom-width: 2px; 
        }

        .tray {
            display: flex;
            justify-content: space-evenly; align-items: center;
            width: 580px; 
            margin-top: 20px;
            height: 100px;
        }

        .shape-slot {
            width: 100px;
            height: 100px;
            display: flex; justify-content: center; align-items: center;
            cursor: grab; touch-action: none;
        }

        .shape-container {
            display: grid;
            gap: 2px;
            transition: transform 0.1s ease;
            visibility: hidden; pointer-events: none;
        }

        .shape-container.dragging { z-index: 1000;
        }

        .mini-block {
            width: 20px;
            height: 20px; border-radius: 3px;
            box-shadow: inset 1px 1px 3px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.3);
        }

        .color-hellblau { background-color: #00D2D3; }
        .color-dunkelblau { background-color: #2E86DE; }
        .color-gruen { background-color: #10AC84; }
        .color-gelb { background-color: #FECA57; }
        .color-orange { background-color: #FF9F43; }
        .color-rot { background-color: #EE5253; }
        .color-pink { background-color: #FF9FF3; }
        .color-lila { background-color: #5F27CD; }
        .color-transparent { background-color: transparent; box-shadow: none; }
        
        .color-image {
            background-image: var(--ahmad-img, none);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #2E86DE; 
            box-shadow: inset 1px 1px 3px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.3);
        }

        .color-emanuel {
            background-image: var(--emanuel-img, none);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #10AC84; 
            box-shadow: inset 1px 1px 3px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.3);
        }

        .color-adrian {
            background-image: var(--adrian-img, none);
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #FF9F43; 
            box-shadow: inset 1px 1px 3px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.3);
        }

        .settings-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(33, 41, 67, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 5000; opacity: 1; transition: opacity 0.2s ease;
        }

        .settings-overlay.hidden { 
            opacity: 0;
            pointer-events: none; 
        }

        .settings-content {
            background-color: #212943;
            width: 85%;
            max-width: 360px;
            border-radius: 20px; 
            padding: 25px 25px 15px 25px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            border: 6px solid #3b4c73;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
        }

        .settings-header {
            display: flex;
            justify-content: center; align-items: center;
            margin-bottom: 25px; font-size: 26px; font-weight: 800;
            position: relative;
            letter-spacing: 1px;
        }

        .close-settings { 
            cursor: pointer;
            color: white; 
            transition: transform 0.1s, background-color 0.1s;
            position: absolute; right: 0; top: 50%; 
            transform: translateY(-50%);
            font-size: 20px;
            font-weight: bold;
            background-color: rgba(255, 255, 255, 0.15); 
            width: 32px;
            height: 32px;
            display: flex; justify-content: center; align-items: center;
            border-radius: 8px;
        }
        .close-settings:active { transform: translateY(-50%) scale(0.9); }

        .setting-item {
            display: flex;
            justify-content: space-between; align-items: center;
            padding: 16px 0; border-bottom: 2px solid rgba(255, 255, 255, 0.05);
            font-size: 18px; color: white;
            font-weight: 700;
        }

        .setting-item:last-child { border-bottom: none; }

        .setting-left {
            display: flex;
            align-items: center; gap: 15px;
        }
        
        .setting-left .icon { 
            display: flex;
            justify-content: center; align-items: center;
            width: 32px; height: 32px;
        }

        .action-btn {
            background-color: #68cd56;
            color: white; border: none; padding: 10px 0;
            width: 90px; border-radius: 10px; font-weight: bold; font-size: 16px; 
            cursor: pointer;
            box-shadow: 0 4px 0 #4ab038;
            transition: transform 0.1s, box-shadow 0.1s;
        }
        
        .action-btn:active { 
            transform: translateY(4px);
            box-shadow: 0 0 0 #4ab038; 
        }

        .switch { position: relative; display: inline-block; width: 60px; height: 34px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        
        .slider {
            position: absolute;
            cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #3b4c73;
            transition: .3s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px;
            background-color: white; transition: .3s; border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        
        input:checked + .slider { background-color: #68cd56; } 
        input:checked + .slider:before { transform: translateX(26px); }

        .flying-meme {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            width: 250px;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
            animation: flyAcrossScreen 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes flyAcrossScreen {
            0% { left: -300px; top: 60%; transform: translateY(-50%) rotate(-15deg); }
            50% { top: 30%; transform: translateY(-50%) rotate(10deg) scale(1.2); }
            100% { left: 100vw; top: 60%; transform: translateY(-50%) rotate(-15deg); }
        }

        body.square-ui * { border-radius: 0 !important; }

        .master-fullscreen {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            z-index: 6000;
            display: flex;
            flex-direction: column;
            padding: 40px 20px;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .master-fullscreen.hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
        }

        .master-fs-header {
            font-size: 38px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #facc15;
            text-shadow: 0 4px 15px rgba(0,0,0,0.6);
        }

        .master-fs-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
            overflow-y: auto;
            padding-bottom: 80px;
        }

        .master-fs-item {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 20px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
        }

        .master-fs-item span {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .mode-selector-container {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
        }

        .mode-options {
            display: flex;
            gap: 15px;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap; 
        }

        .mode-option {
            background: rgba(0, 0, 0, 0.2);
            border: 3px solid transparent;
            border-radius: 12px;
            padding: 15px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
            min-width: 80px; 
            text-align: center;
        }

        .mode-option span { font-size: 14px; margin-top: 10px; }

        .mode-option.active {
            border-color: #68cd56;
            background: rgba(104, 205, 86, 0.15);
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(104, 205, 86, 0.3);
        }

        .mode-preview {
            width: 45px;
            height: 45px;
            border-radius: 4px;
            box-shadow: inset 1px 1px 3px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.3);
        }

        .standard-preview { background-color: #2E86DE; }

        .master-fs-footer { position: fixed; bottom: 40px; left: 40px; z-index: 10;}

        .btn-fs-back {
            background-color: #EE5253;
            color: white; border: none; padding: 16px 32px;
            border-radius: 12px; font-weight: bold; font-size: 20px; 
            cursor: pointer;
            box-shadow: 0 6px 0 #b33939, 0 10px 20px rgba(0,0,0,0.4);
            transition: transform 0.1s, box-shadow 0.1s;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-fs-back:active {
            transform: translateY(6px);
            box-shadow: 0 0 0 #b33939, 0 4px 10px rgba(0,0,0,0.4);
        }
        
        /* Ranglisten Styles */
        .leaderboard-entry {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            border-left: 5px solid #facc15;
        }

        .lb-rank {
            font-size: 24px;
            font-weight: 900;
            color: #facc15;
            min-width: 30px;
        }

        .lb-pic {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #3b4c73;
            object-fit: cover;
            border: 2px solid white;
        }

        .lb-info {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .lb-name {
            font-size: 18px;
            font-weight: bold;
            color: white;
        }

        .lb-date {
            font-size: 12px;
            color: #a9b7d6;
        }

        .lb-score {
            font-size: 28px;
            font-weight: 900;
            color: #6ee7b7;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .bg-rank-1 { background: linear-gradient(90deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%) !important; border-left: 5px solid #ffd700 !important; }
        .bg-rank-2 { background: linear-gradient(90deg, rgba(192, 192, 192, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%) !important; border-left: 5px solid #c0c0c0 !important; }
        .bg-rank-3 { background: linear-gradient(90deg, rgba(205, 127, 50, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%) !important; border-left: 5px solid #cd7f32 !important; }
        .rank-1-text { color: #ffd700 !important; text-shadow: 0 0 8px rgba(255,215,0,0.6); font-size: 1.2em; }
        .rank-2-text { color: #c0c0c0 !important; text-shadow: 0 0 8px rgba(192,192,192,0.6); font-size: 1.1em; }
        .rank-3-text { color: #cd7f32 !important; text-shadow: 0 0 8px rgba(205,127,50,0.6); font-size: 1.1em; }

        #live-leaderboard {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 260px;
            background: rgba(33, 41, 67, 0.95);
            border-right: 4px solid #3b4c73;
            padding: 20px 15px;
            overflow-y: auto;
            z-index: 3500;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease;
            box-shadow: 5px 0 15px rgba(0,0,0,0.5);
        }

        #live-leaderboard.hidden {
            transform: translateX(-100%);
        }

        .live-lb-entry {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .live-lb-rank { color: #facc15; font-weight: bold; width: 35px; text-align: center; }
        .live-lb-name { flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: white; }
        .live-lb-score { color: #6ee7b7; font-weight: bold; }

        .live-name-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid #facc15;
            color: white;
            font-size: 16px;
            font-weight: bold;
            padding: 8px;
            border-radius: 8px;
            text-align: center;
            outline: none;
            margin-bottom: 20px;
            transition: background 0.2s, box-shadow 0.2s;
        }

        .live-name-input:focus {
            background: rgba(255, 255, 255, 0.25);
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
        }

        .live-lb-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b4c73;
            padding-bottom: 10px;
        }

        .live-lb-title {
            font-size: 20px;
            font-weight: bold;
            color: #facc15;
            margin: 0; 
            padding: 0;
            border: none;
        }

        .expand-lb-icon {
            background-color: rgba(255,255,255,0.1);
            border-radius: 6px;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 20px;
            color: white;
            transition: background 0.2s, transform 0.1s;
        }

        .expand-lb-icon:hover { background-color: rgba(255,255,255,0.25); }
        .expand-lb-icon:active { transform: scale(0.9); }

        /* Vorgefertigte Profilbilder */
        .preset-avatar {
            width: 45px; height: 45px;
            border-radius: 50%;
            background-color: #3b4c73;
            border: 2px solid transparent;
            cursor: pointer;
            display: flex; justify-content: center; align-items: center;
            font-size: 24px;
            transition: transform 0.1s, border-color 0.1s;
        }
        .preset-avatar.selected {
            border-color: #68cd56;
            transform: scale(1.1);
            background-color: #212943;
            box-shadow: 0 0 10px rgba(104, 205, 86, 0.5);
        }
    </style>
</head>
<body>

    <div id="live-leaderboard" class="hidden">
        <input type="text" id="live-name-input" class="live-name-input" placeholder="Dein Name" title="Name ändern">
        <div class="live-lb-header">
            <div class="live-lb-title">🏆 Rangliste</div>
            <div class="expand-lb-icon" id="btn-expand-lb" title="Rangliste vergrößern">⤢</div>
        </div>
        <div id="live-lb-list"></div>
    </div>

    <div id="ice-start-screen" class="ice-start-screen">
        <div class="logo-container">
            <div class="logo-ice">
                <span class="logo-crown">👑</span>
                ICE
            </div>
            <div class="logo-blast">
                <span class="letter-B">B</span>
                <span class="letter-L">L</span>
                <span class="letter-A">A</span>
                <span class="letter-S">S</span>
                <span class="letter-T">T</span>
            </div>
            <div class="logo-sub">ADVENTURE MASTER</div>
        </div>

        <div class="start-buttons-wrapper">
            <button class="btn-menu btn-rangliste" id="btn-start-rangliste">
                🏆 Rangliste
                <span class="badge-dot"></span>
            </button>
            <button class="btn-menu btn-classic" id="btn-start-classic">
                ♾️ Classic
            </button>
        </div>
    </div>

    <div class="header">
        <div class="highscore" id="highscore-display">👑 0</div>
        <div class="settings-icon" id="settings-btn">⚙️</div>
    </div>

    <div class="current-score-wrapper">
        <div class="combo-display hidden" id="combo-display">
            <span class="heart-icon">❤️</span>
        </div>
        <div class="current-score" id="current-score-display">0</div>
    </div>

    <div class="board-wrapper">
        <div id="sweep-overlay" class="sweep-overlay"></div>
        <div class="board" id="board"></div>
    </div>

    <div class="tray" id="tray">
        <div class="shape-slot"><div class="shape-container"></div></div>
        <div class="shape-slot"><div class="shape-container"></div></div>
        <div class="shape-slot"><div class="shape-container"></div></div>
    </div>

    <div id="settings-modal" class="settings-overlay hidden">
        <div class="settings-content">
            <div class="settings-header">
                <span>Settings</span>
                <span class="close-settings" id="close-settings">✕</span>
            </div>
           
            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </span> 
                    <span>Sound</span>
                </div>
                <label class="switch"><input type="checkbox" id="toggle-sound"><span class="slider"></span></label>
            </div>

            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </span> 
                    <span>BGM</span>
                </div>
                <label class="switch"><input type="checkbox" id="toggle-bgm"><span class="slider"></span></label>
             </div>

            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z"/></svg>
                    </span> 
                    <span>Vibration</span>
                </div>
                <label class="switch"><input type="checkbox" id="toggle-vibration"><span class="slider"></span></label>
            </div>
            
            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="30" height="30"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    </span> 
                    <span>Home</span>
                </div>
                <button class="action-btn" id="btn-settings-home">Back</button>
            </div>

            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                    </span> 
                    <span>Replay</span>
                </div>
                <button class="action-btn" id="btn-settings-replay">Play</button>
             </div>

            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M3 11h4v10H3zm5 4h13v6H8zm0-14h13v13H8z"/></svg>
                    </span> 
                    <span>More Games</span>
                </div>
                <button class="action-btn" onclick="window.location.href='more_games.html'">Start</button>
             </div>

            <div class="setting-item">
                <div class="setting-left">
                    <span class="icon">
                        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                    </span> 
                    <span>More Settings</span>
                </div>
                <button class="action-btn" id="btn-open-master">Set</button>
            </div>
        </div>
    </div>

    <div id="master-settings-modal" class="master-fullscreen hidden">
        <div class="master-fs-header" id="master-title" style="cursor: pointer;">Mastersettings</div>
        <div class="master-fs-content">
            
            <div class="master-fs-item" style="flex-direction: column; align-items: stretch; gap: 10px;">
                <div style="text-align: center;"><span>Daten Backup (Rangliste & Score)</span></div>
                <div style="display: flex; gap: 10px;">
                    <button class="action-btn" id="btn-export-data" style="flex: 1; background-color: #3b82f6; box-shadow: 0 4px 0 #2563eb;">Exportieren</button>
                    <button class="action-btn" id="btn-import-data" style="flex: 1; background-color: #fca5a5; box-shadow: 0 4px 0 #f87171; color: #7f1d1d;">Importieren</button>
                    <input type="file" id="import-file-input" accept=".json" style="display: none;">
                </div>
            </div>

            <div class="master-fs-item mode-selector-container">
                <div style="width: 100%; text-align: center;"><span>Spielmodus</span></div>
                <div class="mode-options">
                    <div class="mode-option active" id="mode-standard">
                        <div class="mode-preview standard-preview"></div>
                        <span>Standard</span>
                    </div>

                    <div class="mode-option" id="mode-adrian">
                        <div class="mode-preview color-adrian"></div>
                        <span>Adrian Modus</span>
                    </div>

                    <div class="mode-option" id="mode-ahmad">
                        <div class="mode-preview color-image"></div>
                        <span>Ahmad Modus</span>
                    </div>
                   
                    <div class="mode-option" id="mode-emanuel">
                        <div class="mode-preview color-emanuel"></div>
                        <span>Emanuel Modus</span>
                    </div>
                 </div>
            </div>

            <div class="master-fs-item">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span>Einfarbig (Standard)</span>
                    <select id="single-color-select" style="background: #3b4c73; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: bold; outline: none; width: fit-content;">
                        <option value="color-hellblau">Hellblau</option>
                        <option value="color-dunkelblau">Dunkelblau</option>
                        <option value="color-gruen">Grün</option>
                        <option value="color-gelb">Gelb</option>
                        <option value="color-orange">Orange</option>
                        <option value="color-rot">Rot</option>
                        <option value="color-pink">Pink</option>
                        <option value="color-lila">Lila</option>
                    </select>
                </div>
                <label class="switch"><input type="checkbox" id="toggle-single-color"><span class="slider"></span></label>
            </div>

            <div class="master-fs-item">
                <span>Meme bei 67</span>
                <label class="switch"><input type="checkbox" id="toggle-meme" checked><span class="slider"></span></label>
            </div>

            <div class="master-fs-item">
                <span>Quadratisches UI</span>
                <label class="switch"><input type="checkbox" id="toggle-square-ui"><span class="slider"></span></label>
            </div>

            <div class="master-fs-item" id="original-mode-container">
                <div style="display:flex; flex-direction:column; max-width: 70%;">
                    <span>Original</span>
                    <span style="font-size: 13px; color: #a9b7d6; font-weight: normal; margin-top: 4px; line-height: 1.3;">
                        Füllt das Feld anfangs mit zufälligen Blöcken. Bis Score 100 erhältst du leichtere Formen zum Auflösen.
                    </span>
                </div>
                <label class="switch"><input type="checkbox" id="toggle-original"><span class="slider"></span></label>
            </div>
        </div>

        <div class="master-fs-footer">
            <button class="btn-fs-back" id="btn-master-back">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Zurück
            </button>
        </div>
    </div>

    <div id="custom-game-over-screen" class="custom-game-over-screen hidden">
        <div class="top-right-icon">🔄</div> 
        <div class="cgo-title">Game Over</div>
        <div class="cgo-label">Score</div>
        <div class="cgo-score" id="cgo-current">0</div>
        <div class="cgo-label">Best Score</div>
        <div class="cgo-best" id="cgo-best">0</div>
        <button class="cgo-play-btn" id="cgo-play-btn">
            <svg viewBox="0 0 24 24" fill="white" width="36px" height="36px"><path d="M8 5v14l11-7z"/></svg>
        </button>
    </div>

    <div id="ranked-setup-screen" class="settings-overlay hidden" style="z-index: 6000;">
        <div class="settings-content" style="display: flex; flex-direction: column; gap: 15px; align-items: center; position: relative;">
            <div class="settings-header" style="width: 100%; position: relative; min-height: 32px; justify-content: center; display: flex;">
                <span style="font-size: 22px; text-align: center; margin: 0;">Rangliste spielen</span>
                <span class="close-settings" id="close-ranked-setup" style="position: absolute; right: -5px; top: -5px; transform: none;">✕</span>
            </div>
            
            <input type="text" id="ranked-name-input" placeholder="Dein Spielername" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: #3b4c73; color: white; font-size: 16px; font-weight: bold; outline: none;">
            
            <div style="width: 100%; margin-top: 5px;">
                <span style="color: #a9b7d6; font-size: 14px;">Vorgefertigte Bilder:</span>
                <div id="preset-avatars" style="display: flex; gap: 8px; justify-content: center; margin-top: 8px; flex-wrap: wrap;">
                    </div>
            </div>
            
            <div style="width: 100%; text-align: center; color: #a9b7d6; font-size: 12px; margin: 5px 0;">- ODER EIGENES BILD -</div>

            <div style="display: flex; justify-content: space-between; width: 100%;">
                <span style="color: #a9b7d6; font-size: 14px;">Optionales Profilbild</span>
                <span id="clear-pic-btn" style="color: #ef4444; font-size: 14px; cursor: pointer; display: none;">✖ Entfernen</span>
            </div>
            <input type="file" id="ranked-pic-input" accept="image/*" style="width: 100%; color: white;">
            
            <button class="cgo-play-btn" id="btn-start-ranked-game" style="margin-top: 10px; width: 100%;">Los geht's!</button>
        </div>
    </div>

    <div id="leaderboard-screen" class="master-fullscreen hidden" style="z-index: 7000;">
        <div class="master-fs-header">Top Spieler</div>
        <div class="master-fs-content" id="leaderboard-list" style="overflow-y: auto; max-height: 60vh; padding-right: 10px;">
        </div>
        <div class="master-fs-footer" style="position: relative; margin-top: 20px; text-align: center; bottom: 0; left: 0; display: flex; justify-content: center; gap: 15px;">
            <button class="btn-fs-back" id="btn-close-leaderboard" style="margin: 0;">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Zurück
            </button>
            <button class="btn-fs-back" id="btn-retry-from-leaderboard" style="margin: 0; background-color: #31c817; box-shadow: 0 6px 0 #23930e, 0 10px 20px rgba(0,0,0,0.4); display: none;">
                🔄 Retry
            </button>
        </div>
    </div>
    
    <div id="hidden-room" class="master-fullscreen hidden" style="z-index: 9999; background: radial-gradient(circle, #4a00e0, #8e2de2);">
        <div class="master-fs-header" style="color: #fff; text-shadow: 0 4px 15px rgba(255,255,255,0.5);">Admin Panel</div>
        
        <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; gap: 10px;">
            <input type="number" id="admin-global-highscore" placeholder="Global Highscore" style="width: 150px; padding: 10px; border-radius: 8px; border: none; background: #3b4c73; color: white; outline: none;">
            <button class="action-btn" id="btn-admin-save-highscore" style="width: auto; padding: 0 15px; height: 38px;">Setzen</button>
        </div>

        <div style="text-align: center; margin-bottom: 15px;">
            <button class="action-btn" id="btn-admin-add" style="width: 250px; height: 50px; font-size: 18px; background-color: #3b4c73; box-shadow: 0 4px 0 #212943;">+ Neuen Eintrag hinzufügen</button>
        </div>
        <div class="master-fs-content" id="admin-list" style="overflow-y: auto; max-height: 60vh; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 12px;">
            </div>
        <div class="master-fs-footer" style="position: relative; margin-top: 20px; text-align: center; bottom: 0; left: 0;">
            <button class="btn-fs-back" id="btn-leave-room" style="margin: 0 auto; background-color: #333; box-shadow: 0 6px 0 #111;">Schließen</button>
        </div>
    </div>

    <div id="admin-edit-modal" class="settings-overlay hidden" style="z-index: 10000;">
        <div class="settings-content" style="display: flex; flex-direction: column; gap: 15px; align-items: center; position: relative;">
            <div class="settings-header" style="width: 100%; position: relative; min-height: 32px; justify-content: center; display: flex;">
                <span id="admin-modal-title" style="font-size: 22px; text-align: center; margin: 0;">Eintrag bearbeiten</span>
                <span class="close-settings" id="close-admin-edit" style="position: absolute; right: -5px; top: -5px; transform: none;">✕</span>
            </div>
            
            <input type="hidden" id="admin-edit-index">
            <input type="text" id="admin-name" placeholder="Spielername" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #3b4c73; color: white; outline: none;">
            <input type="number" id="admin-score" placeholder="Score" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #3b4c73; color: white; outline: none;">
            <input type="text" id="admin-date" placeholder="Datum (z.B. 12.10.2023)" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #3b4c73; color: white; outline: none;">
            <input type="text" id="admin-time" placeholder="Uhrzeit (z.B. 14:30)" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #3b4c73; color: white; outline: none;">
            
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 5px;">
                <span style="color: #a9b7d6; font-size: 14px;">Profilbild</span>
                <span id="admin-clear-pic" style="color: #ef4444; font-size: 14px; cursor: pointer;">✖ Entfernen</span>
            </div>
            <input type="file" id="admin-pic-input" accept="image/*" style="width: 100%; color: white;">
            
            <button class="cgo-play-btn" id="btn-admin-save" style="margin-top: 10px; width: 100%; height: 50px;">Speichern</button>
        </div>
    </div>

    <script src="ahmad.js"></script>
    <script src="zemanuel.js"></script>
    <script src="zadrian.js"></script> 
    <script src="zassets.js"></script>

    <script>
        let isRankedMode = false;
        let currentRankedName = "";
        let currentRankedPicBase64 = "";
        
        const rankedSetupScreen = document.getElementById('ranked-setup-screen');
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        
        // Referenzen für das Live-Leaderboard
        const liveLeaderboard = document.getElementById('live-leaderboard');
        const liveLbList = document.getElementById('live-lb-list');
        const liveNameInput = document.getElementById('live-name-input');
        const clearPicBtn = document.getElementById('clear-pic-btn');

        // Init Vorgefertigte Bilder
        const emojisAvatars = ['🦊', '🐱', '🐶', '🐼', '🐸', '🦄'];
        const presetContainer = document.getElementById('preset-avatars');
        
        emojisAvatars.forEach(emoji => {
            const div = document.createElement('div');
            div.className = 'preset-avatar';
            div.innerText = emoji;
            div.addEventListener('click', () => {
                document.querySelectorAll('.preset-avatar').forEach(a => a.classList.remove('selected'));
                div.classList.add('selected');
                
                // Konvertiere Emoji zu Base64-Bild, damit es im gleichen System bleibt
                const canvas = document.createElement('canvas');
                canvas.width = 100; canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = "#3b4c73"; 
                ctx.fillRect(0,0,100,100);
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(emoji, 50, 55);
                currentRankedPicBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // Clear file input fall genutzt
                document.getElementById('ranked-pic-input').value = "";
                clearPicBtn.style.display = 'block';
            });
            presetContainer.appendChild(div);
        });

        // Event Listener für den Vergrößern-Button
        document.getElementById('btn-expand-lb').addEventListener('click', () => {
            showLeaderboard();
            // Blende den Retry-Button ein, falls das Game Over Fenster gerade aktiv ist
            const gameOverScreen = document.getElementById('custom-game-over-screen');
            const retryBtn = document.getElementById('btn-retry-from-leaderboard');
            if (!gameOverScreen.classList.contains('hidden')) {
                retryBtn.style.display = 'flex';
            } else {
                retryBtn.style.display = 'none';
            }
        });

        // Retry-Button im Leaderboard
        document.getElementById('btn-retry-from-leaderboard').addEventListener('click', () => {
            document.getElementById('leaderboard-screen').classList.add('hidden');
            startGameRoutine();
        });

        // Event Listener für die Namenseingabe während des Spiels
        liveNameInput.addEventListener('input', (e) => {
            currentRankedName = e.target.value.trim();
            if (currentRankedName !== "") {
                localStorage.setItem('lastRankedName', currentRankedName);
            }
        });

        // Funktion zur Aktualisierung der seitlichen Rangliste
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

        if (typeof memeBase64 !== 'undefined') {
            document.documentElement.style.setProperty('--ahmad-img', `url('${memeBase64}')`);
        }
        
        if (typeof emanuelBase64 !== 'undefined') {
            document.documentElement.style.setProperty('--emanuel-img', `url('${emanuelBase64}')`);
        }
        
        if (typeof adrianBase64 !== 'undefined') {
            document.documentElement.style.setProperty('--adrian-img', `url('${adrianBase64}')`);
        }

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

        const blockColors = [
            'color-hellblau', 
            'color-dunkelblau', 
            'color-gruen', 
            'color-gelb', 
            'color-orange', 
            'color-rot', 
            'color-pink', 
            'color-lila'
        ];
        
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
        let hasFlown67 = false;
        
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

        // EXPORT / IMPORT LOGIK
        document.getElementById('btn-export-data').addEventListener('click', () => {
            const dataToExport = {
                leaderboard: JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [],
                highscore: localStorage.getItem('blockBlastHighScore') || 0
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "iceblast_backup.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });

        document.getElementById('btn-import-data').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

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
                        
                        alert("Erfolg! Daten (Rangliste & Score) wurden wiederhergestellt.");
                    } else {
                        alert("Fehler: Dateiformat ist ungültig oder unvollständig.");
                    }
                } catch (err) {
                    alert("Fehler beim Verarbeiten der Datei.");
                }
            };
            reader.readAsText(file);
            e.target.value = ""; // Reset file input
        });

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

        const SoundEngine = {
            ctx: null,
            init: function() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') { this.ctx.resume();
                }
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
        bgmAudio.loop = true; bgmAudio.volume = 0.3;

        document.getElementById('toggle-bgm').addEventListener('change', (e) => {
            if (e.target.checked && gameStarted) bgmAudio.play().catch(() => {});
            else bgmAudio.pause();
        });

        highscoreDisplay.innerText = `👑 ${highScore}`;

        function triggerMemeFlight() {
            if(typeof memeBase64 !== 'undefined'){
                const img = document.createElement('img');
                img.src = memeBase64; 
                img.className = 'flying-meme';
                document.body.appendChild(img);
                
                setTimeout(() => { img.remove(); }, 3000);
            }
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

            if (!hasFlown67 && currentScore >= 67) {
                hasFlown67 = true;
                if (document.getElementById('toggle-meme').checked) triggerMemeFlight();
            }
            
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

        function cloneBoard(board) { return board.map(row => [...row]); }

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
                
                const sweepOverlay = document.getElementById('sweep-overlay');
                if(sweepOverlay) sweepOverlay.classList.add('active');
                
                setTimeout(() => {
                    if(sweepOverlay) sweepOverlay.classList.remove('active');
                    
                    if (isRankedMode) {
                        let scores = JSON.parse(localStorage.getItem('iceBlastLeaderboard')) || [];
                        const now = new Date();
                        const dateStr = now.toLocaleDateString('de-DE');
                        const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                        
                        scores.push({
                            name: currentRankedName,
                            pic: currentRankedPicBase64,
                            date: dateStr,
                            time: timeStr,
                            score: currentScore
                        });
                        
                        scores.sort((a, b) => b.score - a.score);
                        scores = scores.slice(0, 50); 
                        
                        localStorage.setItem('iceBlastLeaderboard', JSON.stringify(scores));
                        updateLiveLeaderboard(); 
                    } 

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

        function prefillOriginal() {
            const numBlocks = Math.floor(Math.random() * 8) + 16;
            let blocksPlaced = 0;
            
            while(blocksPlaced < numBlocks) {
                let r = Math.floor(Math.random() * rows);
                let c = Math.floor(Math.random() * cols);
                if (boardState[r][c] === null) {
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
            hasFlown67 = false;
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
                    const MAX_SIZE = 150; 
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
                    callback(canvas.toDataURL('image/jpeg', 0.8)); 
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

        document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
            leaderboardScreen.classList.add('hidden');
            
            if (gameStarted) {
                return;
            }
            
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
                resizeImage(file, function(resizedBase64) {
                    adminCurrentPic = resizedBase64;
                });
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
                masterClickTimer = setTimeout(() => {
                    masterClickCount = 0;
                }, 1000);
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

        renderBoard();
    </script>
</body>
</html>
