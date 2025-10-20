// Game.js
import Ticker from './Ticker.js';
import Track from './Track.js';
import Renderer from './Renderer.js';
import NoteGenerator from './NoteGenerator.js';

export default class Game {
    constructor(onGameEndCallback) {
        this.onGameEnd = onGameEndCallback;

        // 游戏参数
        this.maxMisses = 5;
        this.keys = { f: { side: 'left', type: '▼' }, d: { side: 'left', type: '☀' }, j: { side: 'right', type: '▼' }, k: { side: 'right', type: '☀' } };
        this.difficultyLevels = { 5: 750, 25: 500, 125: 250 }; // 得分阈值 -> 周期(ms)

        // 状态
        this.score = 0;
        this.combo = 0;
        this.misses = 0;

        // 初始化模块
        this.ticker = new Ticker(() => this.update());
        this.leftTrack = new Track(12, 'left-to-right');
        this.rightTrack = new Track(12, 'right-to-left');
        this.noteGenerator = new NoteGenerator(['▼', '☀']);
        this.renderer = new Renderer(this, this.leftTrack, this.rightTrack);
    }

    start() {
        this.score = 0; this.combo = 0; this.misses = 0;
        this.ticker.setPeriod(1000); // 初始周期
        this.noteGenerator.weights.empty = 16; // 重置难度

        this.leftTrack.reset();
        this.rightTrack.reset();
        
        let countdown = 3;
        const instructions = `[按F/J消除▼][按D/K消除☀]`;
        this.renderer.showCountdown(countdown, instructions);
        
        const countdownInterval = setInterval(() => {
            countdown--;
            this.renderer.showCountdown(countdown, instructions);
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.ticker.start();
            }
        }, 1000);
    }

    end(isFailure = true) {
        this.ticker.stop();
        if (this.onGameEnd) this.onGameEnd();
    }

    update() { // 每次心跳时执行
        // 1. 移动轨道并检测漏键
        const missedLeft = this.leftTrack.move();
        if (missedLeft) this.handleMiss();
        const missedRight = this.rightTrack.move();
        if (missedRight) this.handleMiss();

        // 2. 生成新音符
        this.leftTrack.placeNote(this.noteGenerator.generate());
        this.rightTrack.placeNote(this.noteGenerator.generate());
        
        // 3. 检查并更新难度
        this.updateDifficulty();

        // 4. 渲染
        this.renderer.render();

        // 5. 检查游戏结束
        if (this.misses >= this.maxMisses) {
            this.end();
            this.renderer.render(`[游戏结束]`);
        }
    }

    handleKeyPress(key) {
        if (!this.ticker.isRunning) return; // 倒计时期间按键无效

        const mapping = this.keys[key];
        if (!mapping) return;

        const track = mapping.side === 'left' ? this.leftTrack : this.rightTrack;
        const note = track.getNoteAtJudgment();

        if (note === mapping.type) { // 正确打击
            this.combo++;
            this.score += (1 + this.combo);
            track.setJudgmentEffect('💥');
        } else { // 错误打击或空按
            this.combo = 0;
            this.misses++;
            track.setJudgmentEffect('❌');
        }
    }

    handleMiss() {
        this.combo = 0;
        this.misses++;
    }

    updateDifficulty() {
        for (const scoreThreshold in this.difficultyLevels) {
            if (this.score >= scoreThreshold && this.ticker.period > this.difficultyLevels[scoreThreshold]) {
                this.ticker.setPeriod(this.difficultyLevels[scoreThreshold]);
                this.noteGenerator.increaseDifficulty();
            }
        }
    }
}