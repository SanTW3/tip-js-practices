export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter(function (task) {
      return task.completed === false;
    });
  }

  if (filter === "completed") {
    return tasks.filter(function (task) {
      return task.completed === true;
    });
  }

  return tasks.slice();
}
