import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

console.log("ПР2. Заготовка демонстрационного сценария");
console.log("Количество задач в общем наборе:", demoTasks.length);
console.log("Номер варианта:", variantNumber);
console.log("Количество задач в индивидуальном наборе:", variantTasks.length);

function printSummary(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  if (total === 0) {
    console.log(`${label}: задач пока нет`);
  } else {
    console.log(`${label}: всего ${total}; выполнено ${completed}; осталось ${pending}; прогресс ${progress.toFixed(1)}%`);
  }
}

console.log("=== Общий сценарий (demoTasks) ===");
let currentTasks = demoTasks;

console.log("Исходные задачи:", currentTasks.map((t) => t.id));
console.log("Названия:", getTaskTitles(currentTasks));
console.log("Невыполненные:", getPendingTasks(currentTasks).map((t) => t.id));
printSummary("Исходная сводка", currentTasks);

let result = addTask(currentTasks, 20, "Добавить проверку", "high");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После добавления id=20", currentTasks);

result = setTaskCompleted(currentTasks, 4, true);
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После выполнения id=4", currentTasks);

result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После переименования id=10", currentTasks);

result = removeTask(currentTasks, 7);
if (result.ok) {
  currentTasks = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После удаления id=7", currentTasks);

const failAttempt = addTask(currentTasks, 20, "Повтор", "low");
if (!failAttempt.ok) {
  console.log(`Ожидаемый отказ при повторном id=20: ${failAttempt.error}`);
}
printSummary("Сводка после отказа (не изменилась)", currentTasks);

console.log("Итоговые id:", currentTasks.map((t) => t.id));

console.log("\n=== Сценарий варианта", variantNumber, "(variantTasks) ===");
let currentVariant = variantTasks;

printSummary("Исходная сводка варианта", currentVariant);

result = addTask(currentVariant, 80, "Собрать команду разработки MVP", "medium");
if (result.ok) {
  currentVariant = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После добавления id=80", currentVariant);

result = setTaskCompleted(currentVariant, 11, true);
if (result.ok) {
  currentVariant = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После повторной установки completed=true для id=11", currentVariant);

result = renameTask(currentVariant, 23, "Распределить роли в команде");
if (result.ok) {
  currentVariant = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После переименования id=23", currentVariant);

result = removeTask(currentVariant, 37);
if (result.ok) {
  currentVariant = result.tasks;
} else {
  console.error(`Ошибка: ${result.error}`);
}
printSummary("После удаления id=37", currentVariant);

const variantFail = addTask(currentVariant, 80, "Повторное добавление", "low");
if (!variantFail.ok) {
  console.log(`Ожидаемый отказ при повторном id=80: ${variantFail.error}`);
}
printSummary("Сводка после отказа (не изменилась)", currentVariant);

console.log("Итоговые id варианта:", currentVariant.map((t) => t.id));
//собственные проверки
console.log("\n=== Собственная проверка 1: добавление после удаления ===");
console.log("Ожидаемо: после удаления id=7 из demoTasks список — [1, 4, 10]; затем id=7 можно добавить заново, он свободен.");
let ownTasks = demoTasks;
let own = removeTask(ownTasks, 7);
ownTasks = own.tasks;
console.log("Фактически после удаления:", ownTasks.map((t) => t.id));
own = addTask(ownTasks, 7, "Новая задача на освободившийся id", "low");
console.log("Фактически после повторного добавления id=7:", own.ok, own.tasks.map((t) => t.id));
console.log("demoTasks не изменился:", demoTasks.map((t) => t.id).join(",") === "1,4,7,10");

console.log("\n=== Собственная проверка 2: изменение первой и последней записи ===");
console.log("Ожидаемо: переименование id=11 (первая запись варианта) и завершение id=64 (последняя) не трогают записи 23, 37, 41, 58 между ними.");
let ownVariant = variantTasks;
own = renameTask(ownVariant, 11, "Собрать стартовую команду");
ownVariant = own.tasks;
own = setTaskCompleted(ownVariant, 64, true);
ownVariant = own.tasks;
console.log("Фактически id=11 title:", ownVariant.find((t) => t.id === 11).title);
console.log("Фактически id=64 completed:", ownVariant.find((t) => t.id === 64).completed);
console.log("Средние записи не тронуты:",
  JSON.stringify(ownVariant.filter((t) => [23, 37, 41, 58].includes(t.id))) ===
  JSON.stringify(variantTasks.filter((t) => [23, 37, 41, 58].includes(t.id)))
);

console.log("\n=== Собственная проверка 3: последовательное обновление нескольких задач ===");
console.log("Ожидаемо: завершение сначала id=58, затем id=64 подряд поднимает прогресс до 100%.");
let seqTasks = variantTasks;
printSummary("Фактически старт", seqTasks);
own = setTaskCompleted(seqTasks, 58, true);
seqTasks = own.tasks;
printSummary("Фактически после id=58", seqTasks);
own = setTaskCompleted(seqTasks, 64, true);
seqTasks = own.tasks;
printSummary("Фактически после id=64", seqTasks);