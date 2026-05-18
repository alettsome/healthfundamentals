const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, "Business", "Zoho", "tasks.json");
const outputPath = path.join(projectRoot, "Business", "Zoho", "zoho-project-tasks.csv");

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function main() {
  const tasks = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const headers = ["task_name", "description", "owner", "status", "priority", "phase"];
  const lines = [
    headers.map(csvEscape).join(","),
    ...tasks.map((task) => headers.map((header) => csvEscape(task[header])).join(","))
  ];
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Zoho CSV written to ${outputPath}`);
}

main();
