// main.js

import WordLogic from './WordLogic.js';
import Game from './Game.js';

// --- 将所有代码包裹在 DOMContentLoaded 事件中 ---
document.addEventListener('DOMContentLoaded', () => {

    // ---- 初始化 ----
    // CHANGED: 这里的 ID 必须与你最终的 index.html 匹配！
    const paper = document.getElementById('paper'); 
    
    const secretCode = "playgame";
    let isGameActive = false;
    let inputBuffer = "";

    // 检查 paper 元素是否存在，以防万一
    if (!paper) {
        console.error("Fatal Error: #paper element not found in the DOM.");
        return; // 如果找不到，直接停止所有JS执行
    }

    const word = new WordLogic(paper);
    const game = new Game(() => {
        isGameActive = false;
        console.log("游戏结束，URL控制已释放。");
    });

    // 现在可以安全地调用 init
    word.init();

    // ---- 主事件监听 ----
    document.addEventListener('keydown', (event) => {
        // 确保 word 和 word.settingsModal 都已初始化
        if (word && word.settingsModal && word.settingsModal.contains(document.activeElement)) {
            return;
        }

        const key = event.key.toLowerCase();

        if (isGameActive) {
            game.handleKeyPress(key);
        }

        // Word 的键盘输入现在由它自己的类内部处理，
        // 但我们需要在这里处理秘密指令的输入
        if (key.length === 1 && document.activeElement === paper) {
            inputBuffer += key;
            if (inputBuffer.length > secretCode.length) {
                inputBuffer = inputBuffer.slice(1);
            }
            if (inputBuffer === secretCode) {
                inputBuffer = '';
                if (isGameActive) game.end(false);
                isGameActive = true;
                game.start();
            }
        } else if (key === "Backspace") {
            inputBuffer = inputBuffer.slice(0, -1);
        }
    });

}); // DOMContentLoaded 结束