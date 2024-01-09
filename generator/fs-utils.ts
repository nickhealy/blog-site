import {
	readdir,
	readFile,
	exists,
	mkdir,
	writeFile,
	unlink,
} from "node:fs/promises";
import { join } from "node:path";
import { readFileSync } from "node:fs";

export const OUTPUT_PATH = "build";
export const convertToLowerCaseWithHyphens = (input: string) => {
	return input.toLowerCase().replace(/\s+/g, "-");
};
export const getOutputPath = (name: string) => {
	return `${OUTPUT_PATH}/${convertToLowerCaseWithHyphens(name)}.html`;
};

/*
* Gets all files in a directory, recursively traversing to leaf of file tree
*/
export const getAllFilesInDirectory = async (dir: string) => {
	const files: string[] = [];
	const nextLevelDirs = await readdir(dir, { withFileTypes: true });
	for (const dirEntry of nextLevelDirs) {
		if (dirEntry.isDirectory()) {
			const nextEntries = await getAllFilesInDirectory(
				join(dir, dirEntry.name)
			);
			files.push(...nextEntries);
		} else {
			files.push(join(dir, dirEntry.name));
		}
	}
	return files;
};
export const checkBuildDir = async () => {
	if (!(await exists(OUTPUT_PATH))) {
		console.log("Cannot find build directory, making one now");
		await mkdir(OUTPUT_PATH);
	}
};

export const resetBuildDir = async () => {
	console.log("Clearing build directory");
	for (const file of await readdir(OUTPUT_PATH)) {
		await unlink(join(OUTPUT_PATH, file));
	}
};
