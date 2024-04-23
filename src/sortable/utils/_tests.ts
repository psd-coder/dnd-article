import { buildFolder, buildFile } from "@/data";
import { flatItem } from "./tree";

/*
It creates such tree structure:
- Folder 1 ______ 0
  - Folder 2 ____ 1
    - File 1 ____ 2
    - File 2 ____ 3
  - File 3 ______ 4
  - File 4 ______ 5
- Folder 3 ______ 6
  - File 5 ______ 7
  - File 6 ______ 8
- File 8 ________ 9
- File 9 _______ 10
*/
const files = Array.from({ length: 10 }, (_, i) =>
  buildFile(`File ${i + 1}`, `file-${i + 1}`)
);
const folders = [
  buildFolder("Folder 1", [], false, "folder-1"),
  buildFolder("Folder 2", [], true, "folder-2"),
  buildFolder("Folder 3", [], false, "folder-3"),
];

folders[2].children.push(files[4], files[5]);
folders[1].children.push(files[0], files[1]);
folders[0].children.push(folders[1], files[2], files[3]);

export const tree = [folders[0], folders[2], files[6], files[7]];
export const flatList = [
  flatItem(folders[0], null, 0),
  flatItem(folders[1], folders[0].id, 1),
  flatItem(files[0], folders[1].id, 2),
  flatItem(files[1], folders[1].id, 2),
  flatItem(files[2], folders[0].id, 1),
  flatItem(files[3], folders[0].id, 1),
  flatItem(folders[2], null, 0),
  flatItem(files[4], folders[2].id, 1),
  flatItem(files[5], folders[2].id, 1),
  flatItem(files[6], null, 0),
  flatItem(files[7], null, 0),
];
