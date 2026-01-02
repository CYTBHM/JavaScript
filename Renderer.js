// Renderer.js

export default class Renderer {
    constructor(game, leftTrack, rightTrack) {
        this.game = game;
        this.leftTrack = leftTrack;
        this.rightTrack = rightTrack;
    }

    render(status = "") {
        const info = `[得分:${this.game.score}][连击:${this.game.combo}][失误:${this.game.misses}/${this.game.maxMisses}]`;
        const leftJudgeChar = this.leftTrack.getJudgmentChar();
        const rightJudgeChar = this.rightTrack.getJudgmentChar();
        const judgmentVisual = `|${leftJudgeChar}|${rightJudgeChar}|`;
        const leftTrackStr = this.leftTrack.toString();
        const rightTrackStr = this.rightTrack.toString();

        const rawHash = `${status}${leftTrackStr}${judgmentVisual}${rightTrackStr}${info}`;
        
        this.updateURL(rawHash);
    }

    showCountdown(countdown, instructions) {
        const rawHash = `${instructions}[准备...${countdown}]`;
        this.updateURL(rawHash);
    }

    updateURL(rawHash) {
        try {
            history.replaceState(null, null, '#' + rawHash);
        } catch (e) {
            location.hash = rawHash;
        }
    }
}