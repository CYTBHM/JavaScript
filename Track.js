// Track.js

export default class Track {
    static EMPTY_CHAR = '___';
    static EFFECT_DISPLAY_TIME = 200;

    constructor(width, direction = 'left-to-right') {
        this.width = width;
        this.direction = direction;
        
        this.cells = Array(width).fill(Track.EMPTY_CHAR);
        this.judgmentEffect = null;
        
        this.effectTimer = null;
        this.judgmentDefaultChar = '─';
    }

    reset() {
        this.cells = Array(this.width).fill(Track.EMPTY_CHAR);
        this.judgmentEffect = null;
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
            this.effectTimer = null;
        }
    }

    getNoteAtJudgment() {
        const index = this.direction === 'left-to-right' ? this.width - 1 : 0;
        return this.cells[index];
    }
    
    move() {
        const missedNote = this.getNoteAtJudgment();
        if (this.direction === 'left-to-right') {
            this.cells.pop();
            this.cells.unshift(Track.EMPTY_CHAR);
        } else {
            this.cells.shift();
            this.cells.push(Track.EMPTY_CHAR);
        }
        return missedNote !== Track.EMPTY_CHAR ? missedNote : null;
    }

    placeNote(note) {
        if (note) { 
            const index = this.direction === 'left-to-right' ? 0 : this.width - 1;
            if (this.cells[index] === Track.EMPTY_CHAR) {
                this.cells[index] = note;
            }
        }
    }

    setJudgmentEffect(effect) {
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
        }

        this.judgmentEffect = effect;

        const index = this.direction === 'left-to-right' ? this.width - 1 : 0;
        if (this.cells[index] !== Track.EMPTY_CHAR) {
            this.cells[index] = Track.EMPTY_CHAR;
        }
        
        this.effectTimer = setTimeout(() => {
            this.judgmentEffect = null;
            this.effectTimer = null;
        }, Track.EFFECT_DISPLAY_TIME);
    }

    toString() {
        return this.cells.join('');
    }

    getJudgmentChar() {
        return this.judgmentEffect || this.judgmentDefaultChar;
    }
}