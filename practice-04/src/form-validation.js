import { findTaskById } from "./task-service.js";

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;

  if (editingId === null) {
    id = Number(draft.id);
    if (draft.id === "" || draft.id === null || !Number.isSafeInteger(id) || id <= 0) {
      errors.id = "Введите положительное целое число";
    } else if (findTaskById(tasks, id) !== undefined) {
      errors.id = "Задача с таким id уже существует";
    }
  } else {
    id = editingId;
    if (!Number.isSafeInteger(id) || id <= 0 || findTaskById(tasks, id) === undefined) {
      errors.id = "Редактируемая задача не найдена";
    }
  }

  let title = "";
  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    title = draft.title.trim();
    if (title.length < 1 || title.length > 100) {
      errors.title = "Название должно содержать от 1 до 100 символов";
    }
  }

  const priority = draft.priority;
  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    errors.priority = "Выберите приоритет: низкий, средний или высокий";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors: errors };
  }
  return { ok: true, value: { id: id, title: title, priority: priority } };
}
