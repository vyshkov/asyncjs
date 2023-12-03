const { parentPort, workerData } = require('worker_threads');

class Student {
  constructor({ id, name }) {
    console.log("Student created", { id, name });
    this.id = id;
    this.name = name;

    // listen for messages from the main thread
    parentPort.on("message", (message) => {
      if (message.command === "startExam") {
        this.takeExam().then(() => {
          // Send a message to the main thread when the student finishes the exam
          parentPort.postMessage({
            id: workerData.id,
            command: "studentFinished",
          });

          // Exit the worker thread
          process.exit();
        });
      }
    });
  }

  takeExam() {
    console.log(`Student ${this.name} (${this.id}) is taking the exam...`);
    return new Promise((resolve) => {
      // Simulate the time it takes for the student to take the exam
      const examTime = Math.floor(Math.random() * 5000) + 1000; // Random time between 1-5 seconds
      setTimeout(() => {
        console.log(`Student ${this.name} (${this.id}) finished the exam.`);
        resolve();
      }, examTime);
    });
  }
}

module.exports = Student;
