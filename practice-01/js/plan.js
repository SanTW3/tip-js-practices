"use strict";
 
const totalTasks = 7;
const completedTasks = 2;
const dailyLimit = 2;
 
let hasError = false;
 
if (typeof totalTasks !== 'number' || typeof completedTasks !== 'number' || typeof dailyLimit !== 'number') {
    console.log("Ошибка: вместо числа передана строка.");
    hasError = true;
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks) || Number.isNaN(dailyLimit)) {
    console.log("Ошибка: недопустимое числовое значение.");
    hasError = true;
} else if (totalTasks < 0 || completedTasks < 0) {
    console.log("Ошибка: отрицательное количество.");
    hasError = true;
} else if (totalTasks > 1000) {
    console.log("Ошибка: превышена верхняя граница.");
    hasError = true;
} else if (totalTasks % 1 !== 0 || completedTasks % 1 !== 0 || dailyLimit % 1 !== 0) {
    console.log("Ошибка: дробное количество.");
    hasError = true;
} else if (totalTasks < completedTasks) {
    console.log("Ошибка: некорректное число выполненных задач.");
    hasError = true;
} else if (dailyLimit < 1 || dailyLimit > 1000) {
    console.log("Ошибка; цикл не запускается.");
    hasError = true;
}
 
if (!hasError) {
    let remainingTasks = totalTasks - completedTasks;
 
    console.log(`Осталось задач: ${remainingTasks}`);
 
    if (remainingTasks === 0) {
        console.log("Все задачи уже выполнены.");
        console.log("Потребуется дней: 0");
    } else {
        let day = 0;
 
        while (remainingTasks > 0) {
            day++;
            const tasksToday = Math.min(dailyLimit, remainingTasks);
            remainingTasks -= tasksToday;
            console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
        }
 
        console.log(`Потребуется дней: ${day}`);
    }
}