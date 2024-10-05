
class NKSemaphore {
    constructor( initialCount ) {
        this.max = initialCount;
        this.count = initialCount;
        this.waitingQueue = [];
        this.waitingEmptyQueue = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
        } else {
            await new Promise(resolve => this.waitingQueue.push(resolve));
        }
    }

    async wait() {
        if ( this.count !== this.max ) {
            await new Promise(resolve => this.waitingEmptyQueue.push(resolve));
        }
    }

    release() {
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift();
            resolve();
        } else if ( this.count < this.max ) {
            this.count++;
        }

        if ( this.count === this.max ) {
            while ( this.waitingEmptyQueue.length > 0 ) {
                const resolve = this.waitingEmptyQueue.shift();
                resolve();
            }
        }
    }
}