import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || typeof api.loadInitialData !== "function" || typeof api.getTasks !== "function") {
    throw new TypeError("Нужен api с методами loadInitialData и getTasks");
  }
  if (!view || typeof view.setListState !== "function" || typeof view.setTasks !== "function") {
    throw new TypeError("Нужен view с методами setListState и setTasks");
  }

  let tasks = [];
  let categories = null;
  let filters = {};
  let editingId = null;
  let activeLoad = null;
  let loadNumber = 0;

  async function loadCurrentTasks() {
    if (activeLoad !== null) {
      activeLoad.abort();
    }
    const abortController = new AbortController();
    activeLoad = abortController;
    loadNumber += 1;
    const myNumber = loadNumber;

    view.setListState("loading");
    try {
      let result;
      if (categories === null) {
        result = await api.loadInitialData(filters, { signal: abortController.signal });
        if (myNumber !== loadNumber) {
          return;
        }
        categories = result.categories;
        view.setCategories(categories);
      } else {
        result = await api.getTasks(filters, { signal: abortController.signal });
        if (myNumber !== loadNumber) {
          return;
        }
      }

      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      if (tasks.length === 0) {
        view.setListState("empty");
      } else {
        view.setListState("ready");
      }
    } catch (error) {
      if (myNumber !== loadNumber) {
        return;
      }
      if (error instanceof ApiError && error.kind === "aborted") {
        return;
      }
      view.setListState("error", messageForError(error));
    } finally {
      if (myNumber === loadNumber) {
        activeLoad = null;
      }
    }
  }

  async function runMutation(action, successMessage) {
    view.setMutationPending(true);
    try {
      await action();
      view.notify(successMessage, "success");
      await loadCurrentTasks();
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  function findTask(id) {
    return tasks.find(function (task) {
      return task.id === id;
    });
  }

  function start(startFilters = {}) {
    filters = { ...startFilters };
    return loadCurrentTasks();
  }

  function applyFilters(newFilters = {}) {
    filters = { ...newFilters };
    return loadCurrentTasks();
  }

  function refresh() {
    return loadCurrentTasks();
  }

  async function submit(draft) {
    let knownCategories = categories;
    if (knownCategories === null) {
      knownCategories = [];
    }
    const checked = validateDraft(draft, knownCategories);
    if (!checked.valid) {
      view.showFormErrors(checked.errors);
      return;
    }
    view.showFormErrors({});

    const id = editingId;
    if (id === null) {
      await runMutation(async function () {
        await api.createTask(checked.value);
        editingId = null;
        view.setFormTask(null);
      }, "Задача добавлена.");
    } else {
      await runMutation(async function () {
        await api.updateTask(id, checked.value);
        editingId = null;
        view.setFormTask(null);
      }, "Задача " + id + " изменена.");
    }
  }

  function beginEdit(id) {
    const task = findTask(id);
    if (task === undefined) {
      view.notify("Задача уже отсутствует в списке. Обновите список.", "error");
      return;
    }
    editingId = id;
    view.showFormErrors({});
    view.setFormTask(task);
  }

  function cancelEdit() {
    editingId = null;
    view.showFormErrors({});
    view.setFormTask(null);
  }

  async function toggleTask(id) {
    const task = findTask(id);
    if (task === undefined) {
      view.notify("Задача уже отсутствует в списке. Обновите список.", "error");
      return;
    }
    await runMutation(async function () {
      await api.setTaskCompleted(id, !task.completed);
    }, "Статус задачи " + id + " изменён.");
  }

  async function deleteTask(id) {
    await runMutation(async function () {
      await api.deleteTask(id);
      if (editingId === id) {
        cancelEdit();
      }
    }, "Задача " + id + " удалена.");
  }

  async function resetData() {
    await runMutation(async function () {
      await api.resetDemoData();
      cancelEdit();
    }, "Исходные данные восстановлены.");
  }

  function destroy() {
    if (activeLoad !== null) {
      activeLoad.abort();
      activeLoad = null;
    }
  }

  return {
    start: start,
    applyFilters: applyFilters,
    refresh: refresh,
    submit: submit,
    beginEdit: beginEdit,
    cancelEdit: cancelEdit,
    toggleTask: toggleTask,
    deleteTask: deleteTask,
    resetData: resetData,
    destroy: destroy,
  };
}
