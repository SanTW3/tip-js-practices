import { demoTasks } from "./src/data.js";
import { setTaskCompleted, findTaskById } from "./src/task-service.js";

const result = setTaskCompleted(demoTasks, 4, true);
console.log("setTaskCompleted(demoTasks, 4, true) -> ok:", result.ok);
console.log("Новая запись id = 4:", findTaskById(result.tasks, 4));
console.log("Исходная запись id = 4:", findTaskById(demoTasks, 4));
console.log("Новый массив !== исходный:", result.tasks !== demoTasks);

const fail = setTaskCompleted(demoTasks, 777, true);
console.log("setTaskCompleted(demoTasks, 777, true):", fail);
console.log("Исходный demoTasks после отказа, completed:", demoTasks.map((task) => task.completed));
