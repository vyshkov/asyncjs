const { parentPort, workerData } = require("worker_threads");
const Teacher = require("./teacher");

// Wrap the SharedArrayBuffer in an Int32Array
const studentsCounters = new Int32Array(workerData.studentsCountersBuffer);

new Teacher(
    studentsCounters
);

