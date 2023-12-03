// teacher.js
const { parentPort } = require("worker_threads");

// function generates random integer from 1 to 5
function randomInt() {
  return Math.floor(Math.random() * 5) + 1;
}

class Teacher {
  constructor(studentsCounters) {
    this.studentsCounters = studentsCounters;
    this.studentsMap = new Map();

    setTimeout(() => {
      console.log('Teacher: Time is out!');
      console.log('Teacher: No more work is accepted.')
      this.studentsCounters[1] = 0;
      parentPort.postMessage({ command: "timeIsUp" });
    }, 6000);

    // Listen for messages from the main thread
    parentPort.on("message", (message) => {
      if (message.command === "startExam") {
        this.poll();
      } else if (message.command === "studentEntered") {
        this.studentsCounters[0]++;
        console.log(`[in class - ${this.activeStudents()}] Student ${message.student.name} (${message.student.id}) entered the class`);
        const student = message.student;
        this.studentsMap.set(student.id, student);
        this.poll();
      } else if (message.command === "studentFinished") {
        this.studentsCounters[0]--;
        const student = this.studentsMap.get(message.id);
        console.log(`[in class - ${this.activeStudents()}] Teacher checking ${student.name} (${student.id}) work...`);
        this.studentsMap.set(student.id, { ...student, finished: true, mark: randomInt() });
        console.log(`[in class - ${this.activeStudents()}] Student ${student.name} (${student.id}) got mark ${this.studentsMap.get(student.id).mark}`);
        parentPort.postMessage({ command: "nextStudent" });
      } else if (message.command === "stopExam" && this.activeStudents() === 0) {
        console.log(`[in class - ${this.activeStudents()}] Teacher: No more students in queue`);
        this.printResults();
        parentPort.postMessage({ command: "exit" });
      }
    });
  }

  printResults() {
    console.log("\nResults:");
    this.studentsMap.forEach((student) => {
      console.log(`Student ${student.id} ${student.name} got mark ${student.mark}`);
    });
    console.log(`[in class - ${this.activeStudents()}] Exam finished. Goodbye!`);
  }

  poll() {
    if (this.activeStudents() < this.maxStudentsInClass()) {
      console.log(`[in class - ${this.activeStudents()}] Call for next...`);
      parentPort.postMessage({ command: "nextStudent" });
    }
  }

  activeStudents() {
    return this.studentsCounters[0];
  }

  maxStudentsInClass() {
    return this.studentsCounters[1];
  }

}

module.exports = Teacher;
