const { parentPort, workerData } = require('worker_threads');
const Student = require('./student');

// Create a new student using the id from workerData
const student = new Student(workerData);



