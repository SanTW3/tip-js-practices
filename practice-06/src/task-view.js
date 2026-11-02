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

function createSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

export function createTaskElement(task, category) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  if (task.completed) {
    card.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  let statusText = "В работе";
  if (task.completed) {
    statusText = "Выполнена";
  }
  let categoryText = "Без категории";
  if (category) {
    categoryText = category.name;
  }

  const toggleButton = createButton("toggle", "Выполнена");
  if (task.completed) {
    toggleButton.setAttribute("aria-pressed", "true");
  } else {
    toggleButton.setAttribute("aria-pressed", "false");
  }

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggleButton);
  actions.append(createButton("edit", "Изменить"));
  actions.append(createButton("delete", "Удалить"));

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.append(createSpan("task-status", statusText));
  meta.append(createSpan("task-priority", getPriorityText(task.priority)));
  meta.append(createSpan("task-category", categoryText));

  card.append(title);
  card.append(meta);
  card.append(actions);
  return card;
}

export function renderTaskList(list, tasks, categories) {
  list.replaceChildren();

  for (const task of tasks) {
    const category = categories.find(function (item) {
      return item.id === task.categoryId;
    });
    list.append(createTaskElement(task, category));
  }
}
