// Producer-consumer queue
// will store queue of async tasks
class Queue {
  constructor() {
    this.queue = [];
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  push(task) {
    this.queue.push(task);
    this.notifyListeners();
  }

  pop() {
    return this.queue.pop();
  }

  shift() {
    return this.queue.shift();
  }

  length() {
    return this.queue.length;
  }
}

// will poll queue and execute tasks
class Consumer {
  // consumer will only process N tasks at a time from the queue
  constructor(queue, N) {
    this.queue = queue;
    this.N = N;
    this.currentlyProcessing = [];

    this.listeners = [];

    queue.addListener(() => {
      console.log("Queue changed");
      this.processQueue();
    });
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  // consumer should detect new items in queue
  // and process them
  processQueue() {
    console.log("Processing queue", this.currentlyProcessing);
    while (
      this.queue.queue.length &&
      this.currentlyProcessing.length < this.N
    ) {
      const task = this.queue.shift();
      if (task) {
        this.currentlyProcessing.push(task);
        this.notifyListeners();
        task
          .executor()
          .then(() => {
            console.log("Task finished");
            this.currentlyProcessing = this.currentlyProcessing.filter(
              (t) => t.id !== task.id
            );
            this.notifyListeners();
            this.queue.notifyListeners();
          })
          .catch((error) => {
            console.error("An error occurred:", error);
          })
          .finally(() => this.processQueue());
      }
    }
  }
}

const queue = new Queue();
const consumer = new Consumer(queue, 5);
