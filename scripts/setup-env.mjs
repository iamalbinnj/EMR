import { copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const files = [
  ["backend/.env.example", "backend/.env"],
  ["frontend/.env.example", "frontend/.env"],
];

for (const [source, destination] of files) {
  try {
    await access(destination, constants.F_OK);
    console.log(`Skipped ${destination} (already exists)`);
  } catch {
    await copyFile(source, destination);
    console.log(`Created ${destination}`);
  }
}
