export function createTask(id, title, priority = "medium") {
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return { ok: false, error: "id должен быть положительным целым числом в безопасном диапазоне" };
  }

  if (typeof title !== "string") {
    return { ok: false, error: "title должен быть строкой" };
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    return { ok: false, error: "title после обрезки пробелов должен содержать от 1 до 100 символов" };
  }

  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    return { ok: false, error: 'priority должен быть одним из: "low", "medium", "high"' };
  }

  return {
    ok: true,
    task: { id, title: trimmedTitle, completed: false, priority },
  };
}

function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "title должен быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: "title после обрезки пробелов должен содержать от 1 до 100 символов" };
  }
  return { ok: true, title: trimmed };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
    return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
    return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) {
    return created;
  }
  if (findTaskById(tasks, created.task.id) !== undefined) {
    return { ok: false, error: `Задача с id = ${created.task.id} уже существует` };
  }
  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
    if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом в безопасном диапазоне" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть логическим значением" };
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  return { ok: true, tasks: tasks.map((task) => (task.id === id ? { ...task, completed } : task)) };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом в безопасном диапазоне" };
  }
  const normalized = normalizeTitle(title);
  if (!normalized.ok) {
    return normalized;
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  return { ok: true, tasks: tasks.map((task) => (task.id === id ? { ...task, title: normalized.title } : task)) };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом в безопасном диапазоне" };
  }
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
export function updateTask(tasks, id, title, priority) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным целым числом в безопасном диапазоне" };
  }
  const task = findTaskById(tasks, id);
  if (task === undefined) {
    return { ok: false, error: `Задача с id = ${id} не найдена` };
  }
  const checked = createTask(id, title, priority);
  if (!checked.ok) {
    return checked;
  }
  const newTasks = tasks.map(function (item) {
    if (item.id === id) {
      return { ...item, title: checked.task.title, priority: checked.task.priority };
    }
    return item;
  });
  return { ok: true, tasks: newTasks };
}
