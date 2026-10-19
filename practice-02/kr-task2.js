import { demoTasks } from "./src/data.js";
import { getPendingTasks } from "./src/task-service.js";

const pendingFromDemo = getPendingTasks(demoTasks);
console.log("getPendingTasks(demoTasks), id:", pendingFromDemo.map((task) => task.id));

const pendingFromEmpty = getPendingTasks([]);
console.log("getPendingTasks([]):", pendingFromEmpty);

console.log("Исходный demoTasks не изменился, id:", demoTasks.map((task) => task.id));
