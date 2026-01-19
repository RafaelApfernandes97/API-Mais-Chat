class RequestQueue {
  constructor({ minTimeMs = 200, maxQueueSize = 200 } = {}) {
    this.minTimeMs = minTimeMs;
    this.maxQueueSize = maxQueueSize;
    this.queues = new Map();
  }

  enqueue(key, taskFn) {
    if (!key) {
      return Promise.reject(new Error('Queue key is required'));
    }

    const queueState = this._getQueueState(key);
    if (queueState.queue.length >= this.maxQueueSize) {
      return Promise.reject(new Error('Fila cheia para este tenant'));
    }

    return new Promise((resolve, reject) => {
      queueState.queue.push({ taskFn, resolve, reject });
      this._processNext(key);
    });
  }

  _getQueueState(key) {
    if (!this.queues.has(key)) {
      this.queues.set(key, {
        queue: [],
        running: false,
        lastRunAt: 0
      });
    }
    return this.queues.get(key);
  }

  async _processNext(key) {
    const state = this.queues.get(key);
    if (!state || state.running) {
      return;
    }

    const nextItem = state.queue.shift();
    if (!nextItem) {
      return;
    }

    state.running = true;
    const waitMs = Math.max(0, this.minTimeMs - (Date.now() - state.lastRunAt));
    if (waitMs > 0) {
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    try {
      const result = await nextItem.taskFn();
      nextItem.resolve(result);
    } catch (error) {
      nextItem.reject(error);
    } finally {
      state.lastRunAt = Date.now();
      state.running = false;
      if (state.queue.length > 0) {
        this._processNext(key);
      }
    }
  }
}

module.exports = RequestQueue;
