const { Worker } = require("worker_threads");
const generateRandomName = require("../utils/randomName");


class Queue {
  constructor() {
    this.queue = [];
  }

  enqueue(item) {
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }

  length() {
    return this.queue.length;
  }
}

async function main() {
  // Create shared array buffer for monitoring current students in class
  const studentsCountersBuffer = new SharedArrayBuffer(
    2 * Int32Array.BYTES_PER_ELEMENT
  );
  const studentsCounters = new Int32Array(studentsCountersBuffer);

  // Initialize it with 0 students
  studentsCounters[0] = 0;

  // max possible students in class
  studentsCounters[1] = 3;

  // Create a teacher
  const teacher = new Worker("./teacher.worker.js", {
    workerData: { studentsCountersBuffer },
  });

  // Create a queue for students
  const queue = new Queue();

  // Create 10 students
  for (let i = 0; i < 10; i++) {
    const id = i;
    const name = generateRandomName();

    queue.enqueue({
      id,
      name,
      worker: new Worker("./student.worker.js", {
        workerData: { id, name },
      }),
    });
  }

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  console.log("-------");

  // listen for messages from the teacher
  teacher.on("message", (message) => {

    console.log("Teacher: ", message)

    if (message.command === "nextStudent" && studentsCounters[1] === 0) {
      console.log("Teacher: No more work is accepted.");
      teacher.postMessage({ command: "stopExam" });
      return;
    } else if (message.command === "nextStudent" && (studentsCounters[0] < studentsCounters[1])) {
      if (queue.length() === 0) {
        console.log('Teacher: No more students in queue');
        teacher.postMessage({ command: "stopExam" });
        return;
      }

      const student = queue.dequeue();
      console.log("\n");
      teacher.postMessage({
        command: "studentEntered",
        student: { id: student.id, name: student.name },
      });
      student.worker.postMessage({ command: "startExam" });

      student.worker.on("message", (message) => {
        if (message.command === "studentFinished") {
          teacher.postMessage({ command: "studentFinished", id: message.id });
        }
      });
    } else if (message.command === "exit") {
      teacher.terminate();
    } else if (message.command === "timeIsUp") {
      while (queue.length() > 0) {
        const student = queue.dequeue();
        console.log(`Student ${student.name} (${student.id}) didn't enter the class. Time is up!`);
        student.worker.terminate();
      }
    }
  });

  console.log("! Teacher is in class, starting exam !");
  // send message to teacher
  teacher.postMessage({ command: "startExam" });
}

main();
