import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";

const listElement = document.querySelector("#task-list");
const filtersElement = document.querySelector("#task-filters");
const summaryElement = document.querySelector("#task-summary");
const emptyElement = document.querySelector("#empty-message");
const messageElement = document.querySelector("#operation-message");
const datasetLabel = document.querySelector("#dataset-label");

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";

let initialTasks = demoTasks;
if (isVariant) {
  initialTasks = variantTasks;
  datasetLabel.textContent = "Индивидуальный вариант: " + variantNumber;
} else {
  datasetLabel.textContent = "Общий контрольный набор";
}

let currentTasks = initialTasks.map(function (task) {
  return { ...task };
});
let currentFilter = "all";

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

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (button === null || !listElement.contains(button)) {
    return;
  }

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") {
    return;
  }

  const card = button.closest("li[data-task-id]");
  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    messageElement.textContent = "Некорректный идентификатор задачи: " + card.dataset.taskId;
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
  messageElement.textContent = "";
  renderApp();
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

listElement.addEventListener("click", handleTaskListClick);
filtersElement.addEventListener("click", handleFilterClick);

try {
  renderApp();
} catch (error) {
  messageElement.textContent = "Ошибка запуска: " + error.message;
  console.error(error);
}
