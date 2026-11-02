import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { addTask, findTaskById, removeTask, setTaskCompleted, updateTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const listElement = document.querySelector("#task-list");
const filtersElement = document.querySelector("#task-filters");
const summaryElement = document.querySelector("#task-summary");
const emptyElement = document.querySelector("#empty-message");
const messageElement = document.querySelector("#operation-message");
const datasetLabel = document.querySelector("#dataset-label");
const storageStatus = document.querySelector("#storage-status");
const form = document.querySelector("#task-form");
const formHeading = document.querySelector("#form-heading");
const formMode = document.querySelector("#form-mode");
const formMessage = document.querySelector("#form-message");
const idInput = document.querySelector("#task-id");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const submitButton = document.querySelector("#form-submit");
const cancelButton = document.querySelector("#cancel-edit");
const resetButton = document.querySelector("#reset-data");

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";

let initialTasks = demoTasks;
let datasetName = "demo";
if (isVariant) {
  initialTasks = variantTasks;
  datasetName = "variant";
  datasetLabel.textContent = "Индивидуальный вариант: " + variantNumber;
} else {
  datasetLabel.textContent = "Общий контрольный набор";
}

let storageKey = "tip-js-practice-04:" + datasetName;
if (isCheckRun) {
  storageKey = "tip-js-practice-04:checks:" + datasetName;
}

const loaded = loadTasks(window.localStorage, storageKey, initialTasks);
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

if (loaded.source === "storage") {
  storageStatus.textContent = "Данные восстановлены из localStorage.";
} else if (loaded.ok) {
  storageStatus.textContent = "Используется исходный набор; сохранённых данных пока нет.";
} else {
  storageStatus.textContent = loaded.error;
  storageStatus.classList.add("is-warning");
}

function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(listElement, visibleTasks);
  renderSummary(summaryElement, currentTasks, visibleTasks.length);
  renderEmptyState(emptyElement, currentTasks.length, visibleTasks.length);

  const filterButtons = filtersElement.querySelectorAll("button[data-filter]");
  for (const button of filterButtons) {
    if (button.dataset.filter === currentFilter) {
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    }
  }
}

function clearFieldError(name) {
  const input = form.elements.namedItem(name);
  const message = form.querySelector('[data-error-for="' + name + '"]');
  if (input !== null) {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  }
  if (message !== null) {
    message.textContent = "";
  }
}

function clearFormErrors() {
  clearFieldError("id");
  clearFieldError("title");
  clearFieldError("priority");
  formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const name in errors) {
    const input = form.elements.namedItem(name);
    const message = form.querySelector('[data-error-for="' + name + '"]');
    if (input !== null) {
      input.setCustomValidity(errors[name]);
      input.setAttribute("aria-invalid", "true");
    }
    if (message !== null) {
      message.textContent = errors[name];
    }
  }
  form.reportValidity();
}

function setFormMode(id = null) {
  if (id === null) {
    editingId = null;
    form.reset();
    clearFormErrors();
    idInput.disabled = false;
    formHeading.textContent = "Добавление задачи";
    formMode.textContent = "Режим создания новой задачи.";
    submitButton.textContent = "Добавить задачу";
    cancelButton.hidden = true;
    idInput.focus();
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (task === undefined) {
    messageElement.textContent = "Задача с id = " + id + " не найдена";
    return;
  }

  editingId = id;
  clearFormErrors();
  idInput.value = task.id;
  titleInput.value = task.title;
  priorityInput.value = task.priority;
  idInput.disabled = true;
  formHeading.textContent = "Редактирование задачи";
  formMode.textContent = "Изменяется задача с id = " + id + ".";
  submitButton.textContent = "Сохранить изменения";
  cancelButton.hidden = false;
  titleInput.focus();
}

function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  if (saved.ok) {
    storageStatus.classList.remove("is-warning");
    storageStatus.textContent = "Изменения сохранены в localStorage.";
    messageElement.textContent = successMessage;
  } else {
    storageStatus.classList.add("is-warning");
    storageStatus.textContent = saved.error;
    messageElement.textContent = successMessage + " " + saved.error;
  }
  renderApp();
  return saved;
}

function restoreTaskFocus(id, action) {
  const actionButton = listElement.querySelector(
    '[data-task-id="' + id + '"] button[data-action="' + action + '"]',
  );
  if (actionButton !== null) {
    actionButton.focus();
    return;
  }
  const filterButton = filtersElement.querySelector('[data-filter="' + currentFilter + '"]');
  filterButton.focus();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const checked = validateTaskDraft(draft, currentTasks, editingId);
  if (!checked.ok) {
    showFormErrors(checked.errors);
    return;
  }

  const value = checked.value;
  let result;
  if (editingId === null) {
    result = addTask(currentTasks, value.id, value.title, value.priority);
  } else {
    result = updateTask(currentTasks, value.id, value.title, value.priority);
  }

  if (!result.ok) {
    formMessage.textContent = result.error;
    return;
  }

  let successMessage = "Задача " + value.id + " добавлена.";
  if (editingId !== null) {
    successMessage = "Задача " + value.id + " изменена.";
  }

  currentTasks = result.tasks;
  setFormMode(null);
  persistCurrentTasks(successMessage);
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (button === null || !listElement.contains(button)) {
    return;
  }

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "edit" && action !== "delete") {
    return;
  }

  const card = button.closest("li[data-task-id]");
  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    messageElement.textContent = "Некорректный идентификатор задачи: " + card.dataset.taskId;
    return;
  }

  if (action === "edit") {
    setFormMode(id);
    return;
  }

  let result;
  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (task === undefined) {
      messageElement.textContent = "Задача с id = " + id + " не найдена";
      return;
    }
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    messageElement.textContent = result.error;
    return;
  }

  currentTasks = result.tasks;
  if (action === "delete" && editingId === id) {
    setFormMode(null);
  }

  if (action === "toggle") {
    persistCurrentTasks("Статус задачи " + id + " изменён.");
  } else {
    persistCurrentTasks("Задача " + id + " удалена.");
  }
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-filter]");
  if (button === null || !filtersElement.contains(button)) {
    return;
  }

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") {
    return;
  }

  currentFilter = filter;
  messageElement.textContent = "";
  renderApp();
}

function handleResetClick() {
  const removed = removeSavedTasks(window.localStorage, storageKey);
  if (!removed.ok) {
    storageStatus.classList.add("is-warning");
    storageStatus.textContent = removed.error;
    return;
  }

  currentTasks = initialTasks.map(function (task) {
    return { ...task };
  });
  currentFilter = "all";
  setFormMode(null);
  storageStatus.classList.remove("is-warning");
  storageStatus.textContent = "Сохранённые данные удалены. Используется исходный набор.";
  messageElement.textContent = "";
  renderApp();
}

form.addEventListener("submit", handleFormSubmit);
form.addEventListener("input", function (event) {
  clearFieldError(event.target.name);
});
listElement.addEventListener("click", handleTaskListClick);
filtersElement.addEventListener("click", handleFilterClick);
cancelButton.addEventListener("click", function () {
  setFormMode(null);
});
resetButton.addEventListener("click", handleResetClick);

try {
  setFormMode(null);
  renderApp();
} catch (error) {
  messageElement.textContent = "Ошибка запуска: " + error.message;
  console.error(error);
}
