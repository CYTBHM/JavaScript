// Ticker.js
export default class Ticker {
    constructor(onTickCallback) {
        this.onTick = onTickCallback;
        this.period = 1000; // 默认周期1秒
        this.lastTickTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTickTime = performance.now();
        this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    setPeriod(newPeriod) {
        this.period = newPeriod;
    }

    tick(timestamp) {
        if (!this.isRunning) return;

        const elapsedTime = timestamp - this.lastTickTime;

        if (elapsedTime >= this.period) {
            this.onTick(); // 执行游戏主逻辑
            this.lastTickTime = timestamp;
        }
        
        this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
    }
}