// main.js
import Toolbar from './Toolbar.js';
import Typer from './Typer.js';
import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {

    const paper = document.getElementById('paper'); 
    
    // 游戏相关的暗号逻辑
    const secretCode = "playgame";
    let isGameActive = false;
    let inputBuffer = "";

    if (!paper) {
        console.error("Fatal Error: #paper element not found in the DOM.");
        return;
    }

    // --- 1. 初始化新模块 ---
    
    // 初始化打字机引擎
    const typer = new Typer(paper);
    typer.init();

    // 初始化工具栏
    // 传入回调：当打开设置弹窗时，告诉 typer 暂停拦截，防止在设置里打字触发逻辑
    const toolbar = new Toolbar(paper, () => {
        // 这里其实不需要显式暂停 typer，因为设置弹窗是一个 overlay，
        // 焦点不在 paper 上，Typer 的 keydown 事件本身就不会触发。
        // 但为了保险起见，可以加一个空回调或者扩展 Typer 的功能。
        // 目前 Typer 逻辑已通过 focus 判断，这里暂留空白即可。
    });
    toolbar.init();

    // --- 2. 游戏逻辑保持不变 ---

    const game = new Game(() => {
        isGameActive = false;
        console.log("游戏结束，URL控制已释放。");
    });

    // 这里我们需要监听全局 keydown 来检测 secretCode
    // 注意：Typer 接管了 paper 的 keydown，但 document 的 keydown 依然可用
    document.addEventListener('keydown', (event) => {
        // 如果焦点在设置弹窗里，不处理游戏逻辑
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && !settingsModal.classList.contains('hidden') && settingsModal.contains(document.activeElement)) {
            return;
        }

        const key = event.key.toLowerCase();

        // 游戏激活时的按键处理
        if (isGameActive) {
            game.handleKeyPress(key);
        }

        // 暗号检测逻辑 (playgame)
        // 只有当焦点在编辑器上，且输入的是单字符时才检测
        if (key.length === 1 && document.activeElement === paper) {
            inputBuffer += key;
            // 保持 buffer 长度不无限增长
            if (inputBuffer.length > secretCode.length) {
                inputBuffer = inputBuffer.slice(1);
            }
            
            if (inputBuffer === secretCode) {
                console.log("Game Start!");
                inputBuffer = '';
                if (isGameActive) game.end(false);
                isGameActive = true;
                game.start();
            }
        } else if (key === "backspace") {
            inputBuffer = inputBuffer.slice(0, -1);
        }
    });

    console.log("App Loaded: Toolbar, Typer & Game ready.");
});