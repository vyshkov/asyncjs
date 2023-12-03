const { parentPort, workerData } = require("worker_threads");
const Teacher = require("./teacher");
const Mutex = require("../privitives/mutex");

const studentsInClass = new Int32Array(workerData.classQueueBuffer);
const mutex = new Mutex(workerData.mutexBuffer);

new Teacher(
    studentsInClass,
    mutex,
);

