// Game.js

import Ticker from './Ticker.js';
import Track from './Track.js';
import Renderer from './Renderer.js';
import NoteGenerator from './NoteGenerator.js';

export default class Game {
    static NOTE_A_CHAR = '☢';
    static NOTE_B_CHAR = '☀';
    static HIT_CHAR = '❤';
    static MISS_CHAR = '☠';

    constructor(onGameEndCallback) {
        this.onGameEnd = onGameEndCallback;

        this.maxMisses = 5;
        this.keys = { 
            f: { side: 'left', type: Game.NOTE_A_CHAR }, 
            d: { side: 'left', type: Game.NOTE_B_CHAR }, 
            j: { side: 'right', type: Game.NOTE_A_CHAR }, 
            k: { side: 'right', type: Game.NOTE_B_CHAR } 
        };
        this.difficultyLevels = { 16: 500, 64: 333, 256: 250 };

        this.score = 0;
        this.combo = 0;
        this.misses = 0;

        this.ticker = new Ticker(() => this.update());
        this.leftTrack = new Track(12, 'left-to-right');
        this.rightTrack = new Track(12, 'right-to-left');
        this.noteGenerator = new NoteGenerator([Game.NOTE_A_CHAR, Game.NOTE_B_CHAR], 8);
        this.renderer = new Renderer(this, this.leftTrack, this.rightTrack);
    }

    start() {
        this.score = 0;
        this.combo = 0;
        this.misses = 0;
        
        this.ticker.setPeriod(1000);
        this.noteGenerator.reset();
        this.leftTrack.reset();
        this.rightTrack.reset();

        let countdown = 3;
        const instructions = `[按F/J消除${Game.NOTE_A_CHAR}][按D/K消除${Game.NOTE_B_CHAR}]`;
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
        if (this.onGameEnd) {
            this.onGameEnd();
        }
    }

    update() {
        const missedLeft = this.leftTrack.move();
        if (missedLeft) this.handleMiss('left');
        
        const missedRight = this.rightTrack.move();
        if (missedRight) this.handleMiss('right');

        this.leftTrack.placeNote(this.noteGenerator.generate());
        this.rightTrack.placeNote(this.noteGenerator.generate());
        
        this.updateDifficulty();
        this.renderer.render();

        if (this.misses >= this.maxMisses) {
            this.end();
            this.renderer.render(`[游戏结束]`);
        }
    }

    handleKeyPress(key) {
        if (!this.ticker.isRunning) return;

        const mapping = this.keys[key];
        if (!mapping) return;

        const track = mapping.side === 'left' ? this.leftTrack : this.rightTrack;
        const noteOnLine = track.getNoteAtJudgment();

        if (noteOnLine === mapping.type) {
            this.combo++;
            this.score += (1 + this.combo);
            track.setJudgmentEffect(Game.HIT_CHAR);
        } else {
            this.combo = 0;
            this.misses++;
            track.setJudgmentEffect(Game.MISS_CHAR);
        }
    }

    handleMiss(side) {
        this.combo = 0;
        this.misses++;
        const track = side === 'left' ? this.leftTrack : this.rightTrack;
        track.setJudgmentEffect(Game.MISS_CHAR);
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