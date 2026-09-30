"use strict";

const totalTasks = 7;
const completedTasks = 2;
const dailyLimit = 2;

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function validate(total, completed, limit) {
  if (typeof total !== "number" || typeof completed !== "number" || typeof limit !== "number") {
    return "Ошибка: вместо числа передана строка.";
  }
  if (Number.isNaN(total) || Number.isNaN(completed) || Number.isNaN(limit)) {
    return "Ошибка: недопустимое числовое значение.";
  }
  if (!Number.isInteger(total) || !Number.isInteger(completed) || !Number.isInteger(limit)) {
    return "Ошибка: дробное количество.";
  }
  if (total < 0 || completed < 0 || limit < 1) {
    return "Ошибка: недопустимые входные данные.";
  }
  if (completed > total) {
    return "Ошибка: выполнено больше, чем существует.";
  }
  return null;
}

function planWeek(total, completed, limit) {
  const error = validate(total, completed, limit);
  if (error) {
    console.log(error);
    return;
  }

  let remaining = total - completed;
  let day = 0;
  let workingDays = 0;

  while (remaining > 0) {
    const weekday = day % 7;
    const isWeekend = weekday === 5 || weekday === 6;

    if (isWeekend) {
      console.log("День", day + 1, WEEKDAYS[weekday] + ": выходной, осталось", remaining);
    } else {
      const done = Math.min(limit, remaining);
      remaining -= done;
      workingDays += 1;
      console.log("День", day + 1, WEEKDAYS[weekday] + ": выполнено", done, ", осталось", remaining);
    }

    day += 1;
  }

  console.log("Рабочих дней с выполнением задач:", workingDays);
  console.log("Календарных дней до завершения:", day);
}

function demo(label, total, completed, limit) {
  console.log("--", label, "--");
  planWeek(total, completed, limit);
  console.log("");
}

demo("Контрольный случай", totalTasks, completedTasks, dailyLimit);

demo("Проверка 1: задачи уже выполнены", 5, 5, 2);

demo("Проверка 2: остаток закрывается за один день", 10, 7, 3);

demo("Проверка 3: укладывается в неделю без выходных", 5, 0, 1);

demo("Проверка 4: пересекает два выходных", 13, 0, 1);

demo("Проверка 5: недопустимая дневная норма", 8, 0, 0);