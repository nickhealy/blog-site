import {
	readdir,
	readFile,
	exists,
	mkdir,
	writeFile,
	unlink,
} from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import Handlebars from "handlebars";

const POSTS_DIR = "posts";
const OUTPUT_PATH = "build";
const SITE_PATH = "Users/nhealy/blog/build/";

const getAllFilesInDirectory = async (dir: string) => {
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

const getAllPosts = async () => await getAllFilesInDirectory(POSTS_DIR);

const parsePostFile = async (path: string) => {
	const file = await readFile(path, { encoding: "utf-8" });
	const parsedFile = parseFile(file);

	if (!parsedFile) {
		throw new Error(`Could not parse file ${path}`);
	}

	return parsedFile;
};

const parseFile = (input: string) => {
	const match = input.match(/---([\s\S]*?)---([\s\S]*)/);

	if (match && match[1] && match[2]) {
		const metadataString = match[1].trim();
		const content = match[2].trim();

		const metadataLines = metadataString.split("\n");
		const metadata: { [key: string]: string } = {};

		metadataLines.forEach((line) => {
			const [key, value] = line.split(":").map((item) => item.trim());
			if (key && value) {
				metadata[key] = value;
			}
		});

		return { metadata, content };
	}

	return null;
};

const convertToLowerCaseWithHyphens = (input: string) => {
	return input.toLowerCase().replace(/\s+/g, "-");
};

const getOutputPath = (name: string) => {
	return `${OUTPUT_PATH}/${convertToLowerCaseWithHyphens(name)}.html`;
};

// @ts-expect-error will fix later
let blogTemplate;
const getBlogTemplate = () => {
	// @ts-expect-error will fix later
	if (!blogTemplate) {
		const template = readFileSync("pages/post.hb.html", {
			encoding: "utf-8",
		});
		blogTemplate = Handlebars.compile(template);
	}
	return blogTemplate;
};

const renderBlogPost = async ({
	title,
	date,
	content,
}: {
	title: string;
	date: string;
	content: string;
}) => {
	const template = getBlogTemplate();
	return template({ title, date, content: marked(content) });
};

const buildPost = async ({
	title,
	date,
	content,
}: {
	title: string;
	date: string;
	content: string;
}) => {
	const outputPath = getOutputPath(title);
	console.log("building post: " + title + " to " + outputPath);
	await writeFile(outputPath, await renderBlogPost({ title, content, date }));
};

const checkBuildDir = async () => {
	if (!(await exists(OUTPUT_PATH))) {
		console.log("Cannot find build directory, making one now");
		await mkdir(OUTPUT_PATH);
	}
};

const resetBuildDir = async () => {
	console.log("Clearing build directory");
	for (const file of await readdir(OUTPUT_PATH)) {
		await unlink(join(OUTPUT_PATH, file));
	}
};

const buildHomepage = async () => {
	const posts = [];
	for (const post of await getAllPosts()) {
		const { metadata } = await parsePostFile(post);
		const { title } = metadata;
		posts.push({ title, path: `${convertToLowerCaseWithHyphens(title)}.html` });
	}
	const template = readFileSync("pages/home.hb.html", {
		encoding: "utf-8",
	});
	const homeTemplate = Handlebars.compile(template);

	await writeFile(`${OUTPUT_PATH}/home.html`, homeTemplate({ posts }));
};

const buildBlogPosts = async () => {
	const promises = [];
	for (const post of await getAllPosts()) {
		const { metadata, content } = await parsePostFile(post);
		const { title, date } = metadata;

		if (!title) {
			throw new Error(`${post} missing post title`);
		}
		if (!date) {
			throw new Error(`${post} missing date`);
		}

		promises.push(buildPost({ title, date, content }));
	}

	await Promise.all(promises);
};

await checkBuildDir();
await resetBuildDir();
await buildHomepage()
await buildBlogPosts();
