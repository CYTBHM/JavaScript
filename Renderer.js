// Renderer.js
export default class Renderer {
    constructor(game, leftTrack, rightTrack) {
        this.game = game;
        this.leftTrack = leftTrack;
        this.rightTrack = rightTrack;
        this.JUDGMENT_VISUAL_DEFAULT = { left: '─', right: '─' };
    }

    render(status = "") {
        const info = `[得分:${this.game.score}][连击:${this.game.combo}][失误:${this.game.misses}/${this.game.maxMisses}]`;
        const leftJudgeChar = this.leftTrack.judgmentEffect || this.JUDGMENT_VISUAL_DEFAULT.left;
        const rightJudgeChar = this.rightTrack.judgmentEffect || this.JUDGMENT_VISUAL_DEFAULT.right;
        const judgmentVisual = `|${leftJudgeChar}|${rightJudgeChar}|`;
        
        // 修复乱码问题：将所有组件用非空格字符连接
        const hash = `${status}${info}${this.leftTrack.toString()}${judgmentVisual}${this.rightTrack.toString()}`;
        location.hash = hash;
    }

    showCountdown(countdown, instructions) {
        const hash = `${instructions}[准备...${countdown}]`;
        location.hash = hash;
    }
}