const { parentPort, workerData } = require('worker_threads');

class Student {
  constructor({ id, name }, mutex, studentsQueue) {
    console.log("Student created", { id, name });
    this.id = id;
    this.name = name;
    this.entered = false;
    this.mutex = mutex;
    this.studentsQueue = studentsQueue;
  }

  async monitorEnterClass() {
    do {
      this.entered = await new Promise((resolve) => {
        this.mutex.enter(() => {
          // Find the first -1 in the queue and replace it with the student's ID
          let index = this.studentsQueue.findIndex(
            (value, i) => Atomics.compareExchange(this.studentsQueue, i, -1, this.id) === -1
          );
  
          if (!this.entered && index >= 0) {
            console.log(
              "Found a spot in the queue: ",
              index,
              "for student",
              this.name
            );
            // Update queue
            Atomics.store(this.studentsQueue, index, this.id);
  
            this.takeExam().then(() => {
              // Send a message to the main thread when the student finishes the exam
              parentPort.postMessage({
                id: workerData.id,
                name: workerData.name,
                command: "studentFinished",
              });
              this.entered = true;
              // When a student leaves the queue, notify one sleeping thread
              Atomics.notify(this.studentsQueue, 0, 1);
            });
          }
  
          if (this.mutex.leave()) {
            resolve(index >= 0);
          } else {
            console.log(
              "!!!!!!!!!!!!!!!!! Student",
              name,
              "could not leave the queue"
            );
            resolve(index >= 0);
          }
        });
      });
    } while (this.entered !== true);
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
