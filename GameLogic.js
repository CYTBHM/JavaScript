// GameLogic.js

export default class GameLogic {
    static TRACK_WIDTH = 12;
    static NOTE_CHAR = '▼';
    static HIT_CHAR = '💥';
    static MISS_CHAR = '❌';
    static EMPTY_CHAR = '─';

    constructor(onGameEndCallback) {
        this.onGameEnd = onGameEndCallback;
        
        this.JUDGMENT_VISUAL_DEFAULT = { left: '─', right: '─' };
        this.LEFT_KEY = 'f';
        this.RIGHT_KEY = 'j';
        this.MAX_MISSES = 5;
        this.INITIAL_SPEED = 300;
        this.MIN_SPEED = 80;
        this.SPEED_INTERVAL = 200;
        this.EFFECT_DISPLAY_TIME = 150; // 统一的效果显示时间

        // 状态
        this.score = 0; this.combo = 0; this.misses = 0; this.gameTime = 0;
        this.gameSpeed = 0; this.gameInterval = null;
        this.leftTrack = []; this.rightTrack = [];

        // NEW: 专门管理视觉效果的状态
        this.leftJudgmentEffect = null;
        this.rightJudgmentEffect = null;
    }

    start() {
        // ... (start 方法的上半部分不变) ...
        this.score = 0; this.combo = 0; this.misses = 0; this.gameTime = 0;
        this.gameSpeed = this.INITIAL_SPEED;
        this.leftTrack = Array(GameLogic.TRACK_WIDTH).fill(GameLogic.EMPTY_CHAR);
        this.rightTrack = Array(GameLogic.TRACK_WIDTH).fill(GameLogic.EMPTY_CHAR);
        this.leftJudgmentEffect = null;
        this.rightJudgmentEffect = null;
        
        this.render("[游戏开始]");
        this.gameInterval = setInterval(() => this.loop(), this.gameSpeed);
    }

    end(isFailure = true) {
        clearInterval(this.gameInterval);
        if (isFailure) location.hash = `[游戏结束][最终得分:${this.score}]`;
        else location.hash = `[游戏已重置]`;
        if (this.onGameEnd) this.onGameEnd();
    }
    
    loop() {
        this.gameTime++;
        
        // 漏键检测现在只处理逻辑，不处理视觉
        if (this.leftTrack[GameLogic.TRACK_WIDTH - 1] === GameLogic.NOTE_CHAR) this.handleMiss(this.leftTrack, GameLogic.TRACK_WIDTH - 1, 'left');
        if (this.rightTrack[0] === GameLogic.NOTE_CHAR) this.handleMiss(this.rightTrack, 0, 'right');

        // 移动逻辑不变
        this.leftTrack.pop(); this.leftTrack.unshift(GameLogic.EMPTY_CHAR);
        this.rightTrack.shift(); this.rightTrack.push(GameLogic.EMPTY_CHAR);
        
        // 生成逻辑不变
        if (this.gameTime % 4 === 0) {
            if (Math.random() < 0.25 && this.leftTrack[0] === GameLogic.EMPTY_CHAR) this.leftTrack[0] = GameLogic.NOTE_CHAR;
            if (Math.random() < 0.25 && this.rightTrack[GameLogic.TRACK_WIDTH - 1] === GameLogic.EMPTY_CHAR) this.rightTrack[GameLogic.TRACK_WIDTH - 1] = GameLogic.NOTE_CHAR;
        }
        
        this.render();
        
        // 加速逻辑不变
        if (this.gameTime % this.SPEED_INTERVAL === 0 && this.gameSpeed > this.MIN_SPEED) {
            this.gameSpeed -= 10;
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => this.loop(), this.gameSpeed);
        }

        if (this.misses >= this.MAX_MISSES) this.end(true);
    }

    // CHANGED: render 方法现在会智能地构建判定区
    render(status = "") {
        const leftStr = this.leftTrack.join('');
        const rightStr = this.rightTrack.join('');
        const infoStr = `[得分:${this.score}][连击:${this.combo}][失误:${this.misses}/${this.MAX_MISSES}]`;

        const leftJudgeChar = this.leftJudgmentEffect || this.JUDGMENT_VISUAL_DEFAULT.left;
        const rightJudgeChar = this.rightJudgmentEffect || this.JUDGMENT_VISUAL_DEFAULT.right;
        const finalJudgmentVisual = `|${leftJudgeChar}|${rightJudgeChar}|`;
        
        location.hash = `${status} ${infoStr} ${leftStr}${finalJudgmentVisual}${rightStr}`;
    }

    handleKeyPress(key) {
        if (key === this.LEFT_KEY) this.checkHit(this.leftTrack, GameLogic.TRACK_WIDTH - 1, 'left');
        else if (key === this.RIGHT_KEY) this.checkHit(this.rightTrack, 0, 'right');
    }
    
    // CHANGED: checkHit 现在操作视觉效果状态
    checkHit(track, index, side) {
        const effectTarget = side === 'left' ? 'leftJudgmentEffect' : 'rightJudgmentEffect';
        
        if (track[index] === GameLogic.NOTE_CHAR) { // 正确打击
            this.combo++;
            this.score += 1 + this.combo;
            track[index] = GameLogic.EMPTY_CHAR; // 立即清除音符
            this[effectTarget] = GameLogic.HIT_CHAR; // 设置命中效果
        } else { // 错误打击
            this.combo = 0;
            this[effectTarget] = GameLogic.MISS_CHAR; // 设置失误效果
        }
        
        // 统一用一个定时器清除效果
        setTimeout(() => { this[effectTarget] = null; }, this.EFFECT_DISPLAY_TIME);
    }

    // CHANGED: handleMiss 现在也操作视觉效果状态
    handleMiss(track, index, side) {
        this.misses++;
        this.combo = 0;
        // 这里的音符会在下一帧的移动逻辑中被自然清除，所以不用手动清除
        
        const effectTarget = side === 'left' ? 'leftJudgmentEffect' : 'rightJudgmentEffect';
        this[effectTarget] = GameLogic.MISS_CHAR;
        setTimeout(() => { this[effectTarget] = null; }, this.EFFECT_DISPLAY_TIME);
    }
}