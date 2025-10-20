// NoteGenerator.js
export default class NoteGenerator {
    constructor(noteTypes) {
        this.noteTypes = noteTypes; // ['▼', '☀']
        this.weights = {
            empty: 16,
            note: 1
        };
    }

    // 根据权重生成一个音符，或者null
    generate() {
        const totalWeight = this.weights.empty + this.weights.note * this.noteTypes.length;
        let random = Math.random() * totalWeight;

        // 检查是否不生成
        if (random < this.weights.empty) {
            return null;
        }
        random -= this.weights.empty;

        // 检查生成哪种音符
        for (const note of this.noteTypes) {
            if (random < this.weights.note) {
                return note;
            }
            random -= this.weights.note;
        }
        return null;
    }

    // 降低不生成的权重，增加难度
    increaseDifficulty() {
        if (this.weights.empty > 1) {
            this.weights.empty-4;
        }
    }
}