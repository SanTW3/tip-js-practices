export const STORAGE_VERSION = 1;

function isValidTask(task) {
  if (task === null || typeof task !== "object") {
    return false;
  }
  if (!Number.isSafeInteger(task.id) || task.id <= 0) {
    return false;
  }
  if (typeof task.title !== "string") {
    return false;
  }
  if (task.title !== task.title.trim() || task.title.length < 1 || task.title.length > 100) {
    return false;
  }
  if (typeof task.completed !== "boolean") {
    return false;
  }
  return task.priority === "low" || task.priority === "medium" || task.priority === "high";
}

function copyTasks(tasks) {
  return tasks.map(function (task) {
    return { ...task };
  });
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) {
    return false;
  }
  const ids = [];
  for (const task of value) {
    if (!isValidTask(task)) {
      return false;
    }
    if (ids.includes(task.id)) {
      return false;
    }
    ids.push(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = copyTasks(fallbackTasks);
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallback };
    }
    const data = JSON.parse(raw);
    if (data === null || typeof data !== "object" || data.version !== STORAGE_VERSION) {
      return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые данные имеют неизвестную версию. Загружен исходный набор." };
    }
    if (!isValidTaskList(data.tasks)) {
      return { ok: false, source: "fallback", tasks: fallback, error: "Сохранённые задачи повреждены. Загружен исходный набор." };
    }
    return { ok: true, source: "storage", tasks: copyTasks(data.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: fallback, error: "Не удалось прочитать сохранённые данные: " + error.message + ". Загружен исходный набор." };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен и не сохранён." };
  }
  try {
    const json = JSON.stringify({ version: STORAGE_VERSION, tasks: tasks });
    storage.setItem(key, json);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось сохранить изменения: " + error.message + ". После перезагрузки они могут пропасть." };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось удалить сохранённые данные: " + error.message };
  }
}
