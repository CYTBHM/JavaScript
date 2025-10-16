// main.js

import WordLogic from './WordLogic.js';
import GameLogic from './GameLogic.js';

const paper = document.getElementById('paper');
const secretCode = "playgame";
let isGameActive = false;
let inputBuffer = "";

const word = new WordLogic(paper);
const game = new GameLogic(() => {
    isGameActive = false;
    console.log("游戏结束，URL控制已释放。");
});

// 这一行是修复按钮功能的关键！
word.init();

document.addEventListener('keydown', (event) => {
    if (document.activeElement === word.presetTextarea) {
        return;
    }

    const key = event.key.toLowerCase();

    if (isGameActive) {
        game.handleKeyPress(key);
    }

    if (document.activeElement === paper) {
        word.handleKeyDown(event);
    }
   
    if (key.length === 1) {
        inputBuffer += key;
        if (inputBuffer.length > secretCode.length) {
            inputBuffer = inputBuffer.slice(1);
        }
        if (inputBuffer === secretCode) {
            inputBuffer = '';
            if (isGameActive) {
                game.end(false);
            }
            isGameActive = true;
            game.start();
        }
    } else if (key === "Backspace") {
        inputBuffer = inputBuffer.slice(0, -1);
    }
});