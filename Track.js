// Track.js
export default class Track {
    constructor(width, direction = 'left-to-right') {
        this.width = width;
        this.direction = direction;
        this.cells = Array(width).fill('─');
        this.judgmentEffect = null;
    }

    // 获取判定区的音符
    getNoteAtJudgment() {
        const index = this.direction === 'left-to-right' ? this.width - 1 : 0;
        return this.cells[index];
    }
    
    // 移动轨道
    move() {
        const missedNote = this.getNoteAtJudgment();
        if (this.direction === 'left-to-right') {
            this.cells.pop();
            this.cells.unshift('─');
        } else {
            this.cells.shift();
            this.cells.push('─');
        }
        return missedNote !== '─' ? missedNote : null;
    }

    // 在轨道起点放置音符
    placeNote(note) {
        if (note) {
            const index = this.direction === 'left-to-right' ? 0 : this.width - 1;
            if (this.cells[index] === '─') {
                this.cells[index] = note;
            }
        }
    }

    // 设置判定区的效果
    setJudgmentEffect(effect) {
        this.judgmentEffect = effect;
        setTimeout(() => { this.judgmentEffect = null; }, 150);
        // 清除判定区的音符，因为它已经被判定了
        const index = this.direction === 'left-to-right' ? this.width - 1 : 0;
        if (this.cells[index] !== '─') {
            this.cells[index] = '─';
        }
    }

    // 获取轨道的字符串表示
    toString() {
        return this.cells.join('');
    }

    reset() {
        this.cells = Array(this.width).fill('─');
        this.judgmentEffect = null;
    }
}