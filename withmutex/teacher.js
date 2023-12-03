// teacher.js
const { parentPort } = require("worker_threads");

// function generates random integer from 1 to 5
function randomInt() {
  return Math.floor(Math.random() * 5) + 1;
}

class Teacher {
  constructor(studentsInClass, mutex) {
    this.studentsInClass = studentsInClass;
    this.studentsMap = new Map();
    this.mutex = mutex;

    // Listen for messages from the main thread
    parentPort.on("message", (message) => {
      if (message.command === "studentFinished" && !this.timeIsOut) {
        const student = {
          id: message.id,
          name: message.name,
          mark: randomInt(),
        };

        this.studentsMap.set(student.id, student);

        console.log(
          `[in class - ${this.activeStudents()}] Teacher: Student ${
            student.id
          } ${student.name} got mark ${student.mark}`
        );

        mutex.enter(() => {
          const index = this.studentsInClass.indexOf(student.id);
          this.studentsInClass[index] = -1;
          console.log(
            `[in class - ${this.activeStudents()}] Teacher: Student ${
              student.id
            } ${student.name} left the class`
          );

          mutex.leave();
        });

        if (this.studentsMap.size === this.listOfStudents.length) {
          this.printResults();
          clearInterval(this.interval);
          parentPort.postMessage({ command: "examFinished" });
        }
      } else if (message.command === "startExam") {
        this.listOfStudents = message.listOfStudents;
        this.examTime = message.examTime;
        this.startExam();
      }
    });
  }

  printResults() {
    console.log("\nResults:");
    this.studentsMap.forEach((student) => {
      console.log(
        `Student ${student.id} ${student.name} got mark ${student.mark}`
      );
    });

    this.listOfStudents.forEach((student) => {
      if (!this.studentsMap.has(student.id)) {
        console.log(`Student ${student.id} ${student.name} WAS TOO LATE!`);
      }
    });

    console.log(
      `[in class - ${this.activeStudents()}] Exam finished. Goodbye!`
    );
  }

  maxStudentsInClass() {
    return this.studentsInClass.length;
  }

  activeStudents() {
    return this.studentsInClass.reduce(
      (acc, id) => (id !== -1 ? acc + 1 : acc),
      0
    );
  }

  startExam() {
    this.mutex.enter(() => {
      for (let i = 0; i < this.maxStudentsInClass(); i++) {
        this.studentsInClass[i] = -1;
      }
      console.log("[ Teacher: Exam started! Class is ready!]");
      console.log("[ Teacher: registered students: ", this.listOfStudents.length, "]");
      console.log("[ Teacher: exam time: ", this.examTime, "]");
      this.mutex.leave();
    });

    this.interval = setTimeout(() => {
      console.log("[ Teacher: Time is out! ]");
      console.log("[ Teacher: No more work is accepted. ]");
      this.timeIsOut = true;
      this.printResults();
      parentPort.postMessage({ command: "examFinished" });
    }, this.examTime);
  }
}

module.exports = Teacher;
