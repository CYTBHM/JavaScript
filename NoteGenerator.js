// NoteGenerator.js

export default class NoteGenerator {
    constructor(noteTypes, initialEmptyWeight = 8) {
        this.noteTypes = noteTypes; // e.g., ['☢', '☀']
        this.initialEmptyWeight = initialEmptyWeight;
        
        this.weights = {
            empty: this.initialEmptyWeight,
            note: 1
        };
    }

    reset() {
        this.weights.empty = this.initialEmptyWeight;
    }

    generate() {
        const totalWeight = this.weights.empty + this.weights.note * this.noteTypes.length;
        let random = Math.random() * totalWeight;

        if (random < this.weights.empty) {
            return null;
        }
        random -= this.weights.empty;

        const noteIndex = Math.floor(random / this.weights.note);
        return this.noteTypes[noteIndex] || null;
    }

    increaseDifficulty() {
        if (this.weights.empty > 1) {
            this.weights.empty--;
        }
    }
}