export function validateTaskDraft(draft, categories) {
  const errors = {};

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

  const categoryId = Number(draft.categoryId);
  const category = categories.find(function (item) {
    return item.id === categoryId;
  });
  if (draft.categoryId === "" || !Number.isSafeInteger(categoryId) || category === undefined) {
    errors.categoryId = "Выберите существующую категорию";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors: errors };
  }
  return { valid: true, value: { title: title, priority: priority, categoryId: categoryId }, errors: {} };
}
