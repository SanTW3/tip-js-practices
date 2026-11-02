import { validateTaskDraft } from "./src/form-validation.js";

const tasks = [];

const good = validateTaskDraft({ id: "20", title: "  Изучить localStorage  ", priority: "high" }, tasks);
console.log("title = \"  Изучить localStorage  \"");
console.log(good);

const bad = validateTaskDraft({ id: "20", title: "   ", priority: "high" }, tasks);
console.log("title = \"   \"");
console.log(bad);
