"use strict";

const totalTasks = 12;
const completedTasks = 5;

let progressPercentage = 0;
let status = 'Не начато';

if (totalTasks >= 0 && totalTasks <= 1000 && completedTasks <= totalTasks) {
    if (completedTasks === 0) {
        console.log("Задач пока нет");
        status = 'Не начато';
    } else {
        progressPercentage = (completedTasks / totalTasks) * 100;
        
        if (progressPercentage < 100 && progressPercentage > 0) {
            status = 'В работе';
        }
        if (progressPercentage === 100) {
            status = 'Завершено';
        }
    }
}


let hasError = false;

if (typeof totalTasks !== 'number' || typeof completedTasks !== 'number') {
    console.log("Ошибка: вместо числа передана строка.");
    hasError = true;
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
    console.log("Ошибка: недопустимое числовое значение.");
    hasError = true;
} else if (totalTasks < 0) {
    console.log("Ошибка: отрицательное количество.");
    hasError = true;
} else if (totalTasks > 1000) {
    console.log("Ошибка: превышена верхняя граница.");
    hasError = true;
} else if (totalTasks % 1 !== 0 || completedTasks % 1 !== 0) {
    console.log("Ошибка: дробное количество.");
    hasError = true;
} else if (totalTasks < completedTasks) {
    console.log("Ошибка: выполнено больше, чем существует.");
    hasError = true;
}


if (!hasError) {
    console.log(`Общее количество задач: ${totalTasks}`);
    console.log(`Количество выполненных задач: ${completedTasks}`);
    console.log('Осталось задач: ', totalTasks - completedTasks);
    console.log(`Прогресс выполнения: ${progressPercentage.toFixed(2)}%`);
    console.log(`Статус: ${status}`);
}
