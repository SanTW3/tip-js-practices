import { getTaskStats } from "./task-service.js";

function getPriorityText(priority) {
  if (priority === "low") {
    return "Низкий";
  }
  if (priority === "medium") {
    return "Средний";
  }
  return "Высокий";
}

function createButton(action, text) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;

  const label = document.createElement("span");
  label.className = "action-label";
  label.textContent = text;

  button.append(label);
  return button;
}

export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  if (task.completed) {
    card.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  if (task.completed) {
    status.textContent = "Выполнена";
  } else {
    status.textContent = "В работе";
  }

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = getPriorityText(task.priority);

  const toggleButton = createButton("toggle", "Выполнена");
  if (task.completed) {
    toggleButton.setAttribute("aria-pressed", "true");
  } else {
    toggleButton.setAttribute("aria-pressed", "false");
  }

  const editButton = createButton("edit", "Изменить");
  const deleteButton = createButton("delete", "Удалить");

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggleButton);
  actions.append(editButton);
  actions.append(deleteButton);

  card.append(title);
  card.append(status);
  card.append(priority);
  card.append(actions);
  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren();

  for (const task of tasks) {
    const card = createTaskElement(task);
    listElement.append(card);
  }
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  summaryElement.querySelector('[data-stat="total"]').textContent = stats.total;
  summaryElement.querySelector('[data-stat="completed"]').textContent = stats.completed;
  summaryElement.querySelector('[data-stat="pending"]').textContent = stats.pending;
  summaryElement.querySelector('[data-stat="progress"]').textContent = stats.progress.toFixed(1) + "%";
  summaryElement.querySelector('[data-stat="visible"]').textContent = visibleCount;
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
  } else if (total === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  }
}
