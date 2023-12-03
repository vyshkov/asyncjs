const { Worker } = require("worker_threads");
const generateRandomName = require("../utils/randomName");
const Mutex = require("../privitives/mutex");

const MAX_QUEUE_SIZE = 2;

async function main() {
  // Create shared array buffer for monitoring current students in class
  const classQueueBuffer = new SharedArrayBuffer(
    MAX_QUEUE_SIZE * Int32Array.BYTES_PER_ELEMENT
  );

  const mutexBuffer = new SharedArrayBuffer(4);
  const mutex = new Mutex(mutexBuffer, 0, true);

  // queue will contain ids of students
  // max queue size is N
  // if queue is full, new students will wait until queue is not full
  const classQueue = new Int32Array(classQueueBuffer);

  // create teacher
  const teacher = new Worker("./teacher.worker.js", {
    workerData: {
      classQueueBuffer,
      mutexBuffer,
    },
  });
  console.log("! - - Teacher created - - !");
  await new Promise((r) => setTimeout(r, 1000));

  // create student
  let students = [];

  function createStudent(id) {
    const name = generateRandomName();
    const student = new Worker("./student.worker.js", {
      workerData: {
        id,
        name,
        classQueueBuffer,
        mutexBuffer,
      },
    });

    students.push({ worker: student, id, name });

    student.on("message", (message) => {
      teacher.postMessage(message);
    });
  }

  for (let i = 1; i <= 10; i++) {
    createStudent(i);
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log(" - - - - - ");
  teacher.postMessage({
    command: "startExam",
    listOfStudents: students.map((s) => ({ id: s.id, name: s.name })),
    examTime: 15000,
  });

  const interval = setInterval(() => {
    console.log(classQueue, "locked:", mutex.isLocked());
  }, 1000);

  teacher.on("message", (message) => {
    if (message.command === "examFinished") {
      console.log("!Exam is finished!");
      clearInterval(interval);
      for (let i = 0; i < students.length; i++) {
        students[i].worker.terminate();
      }
    }
    teacher.terminate();
  });
}

main();
