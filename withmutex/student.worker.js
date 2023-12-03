const { parentPort, workerData } = require("worker_threads");
const Student = require("./student");
const Mutex = require("../privitives/mutex");

// Create a new student using the id from workerData
const { id, name, classQueueBuffer, mutexBuffer } = workerData;
const studentsQueue = new Int32Array(classQueueBuffer);
const mutex = new Mutex(mutexBuffer);
const student = new Student(workerData, mutex, studentsQueue);

student.monitorEnterClass();
