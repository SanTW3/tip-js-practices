import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом");
  }
  const query = {};
  for (const key in filters) {
    if (!ALLOWED_FILTERS.has(key)) {
      throw new TypeError("Неизвестный фильтр: " + key);
    }
  }
  if (filters.completed !== undefined) {
    if (typeof filters.completed !== "boolean") {
      throw new TypeError("completed должен быть true или false");
    }
    query.completed = filters.completed;
  }
  if (filters.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.has(filters.priority)) {
      throw new TypeError("priority должен быть low, medium или high");
    }
    query.priority = filters.priority;
  }
  if (filters.categoryId !== undefined) {
    if (!isPositiveSafeInteger(filters.categoryId)) {
      throw new TypeError("categoryId должен быть положительным целым числом");
    }
    query.categoryId = filters.categoryId;
  }
  if (filters.q !== undefined) {
    if (typeof filters.q !== "string") {
      throw new TypeError("q должен быть строкой");
    }
    const q = filters.q.trim();
    if (q.length > 100) {
      throw new TypeError("q должен быть не длиннее 100 символов");
    }
    if (q !== "") {
      query.q = q;
    }
  }
  return query;
}

function hasUniqueIds(items) {
  const ids = [];
  for (const item of items) {
    if (ids.includes(item.id)) {
      return false;
    }
    ids.push(item.id);
  }
  return true;
}

function checkId(id) {
  if (!isPositiveSafeInteger(id)) {
    throw new TypeError("id должен быть положительным целым числом");
  }
}

function readTask(payload) {
  if (!payload || !isTask(payload.data)) {
    throw invalidResponse("Задача в ответе не соответствует схеме.");
  }
  return payload.data;
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Нужен клиент с методом requestJson");
  }

  async function getTasks(filters = {}, options = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query: query, signal: options.signal });

    if (!payload || !Array.isArray(payload.data)) {
      throw invalidResponse("В ответе нет массива задач.");
    }
    if (!payload.data.every(isTask) || !hasUniqueIds(payload.data)) {
      throw invalidResponse("Задачи в ответе не соответствуют схеме.");
    }
    if (!payload.meta || payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total не совпадает с количеством задач.");
    }
    return { tasks: payload.data, meta: payload.meta };
  }

  async function getTaskById(id, options = {}) {
    checkId(id);
    const payload = await client.requestJson("/tasks/" + id, { signal: options.signal });
    return readTask(payload);
  }

  async function getCategories(options = {}) {
    const payload = await client.requestJson("/categories", { signal: options.signal });
    if (!payload || !Array.isArray(payload.data)) {
      throw invalidResponse("В ответе нет массива категорий.");
    }
    if (!payload.data.every(isCategory) || !hasUniqueIds(payload.data)) {
      throw invalidResponse("Категории в ответе не соответствуют схеме.");
    }
    return payload.data;
  }

  async function loadInitialData(filters = {}, options = {}) {
    const tasksPromise = getTasks(filters, options);
    const categoriesPromise = getCategories(options);
    const results = await Promise.all([tasksPromise, categoriesPromise]);
    return { tasks: results[0].tasks, categories: results[1], meta: results[0].meta };
  }

  async function createTask(draft, options = {}) {
    const payload = await client.requestJson("/tasks", { method: "POST", body: draft, signal: options.signal });
    return readTask(payload);
  }

  async function updateTask(id, changes, options = {}) {
    checkId(id);
    const payload = await client.requestJson("/tasks/" + id, { method: "PATCH", body: changes, signal: options.signal });
    return readTask(payload);
  }

  async function setTaskCompleted(id, completed, options = {}) {
    checkId(id);
    if (typeof completed !== "boolean") {
      throw new TypeError("completed должен быть true или false");
    }
    const payload = await client.requestJson("/tasks/" + id, { method: "PATCH", body: { completed: completed }, signal: options.signal });
    return readTask(payload);
  }

  async function deleteTask(id, options = {}) {
    checkId(id);
    const payload = await client.requestJson("/tasks/" + id, { method: "DELETE", signal: options.signal });
    if (payload !== null) {
      throw invalidResponse("После удаления сервер должен вернуть пустой ответ 204.");
    }
    return null;
  }

  async function resetDemoData(options = {}) {
    const payload = await client.requestJson("/debug/reset", { method: "POST", signal: options.signal });
    if (!payload || !payload.data || payload.data.reset !== true) {
      throw invalidResponse("Сервер не подтвердил восстановление данных.");
    }
    return payload.data;
  }

  return {
    getTasks: getTasks,
    getTaskById: getTaskById,
    getCategories: getCategories,
    loadInitialData: loadInitialData,
    createTask: createTask,
    updateTask: updateTask,
    setTaskCompleted: setTaskCompleted,
    deleteTask: deleteTask,
    resetDemoData: resetDemoData,
  };
}
