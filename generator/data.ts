import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import {
	convertToLowerCaseWithHyphens,
	getAllFilesInDirectory,
} from "./fs-utils";

export interface Post {
	title: string;
	id: string;
	tags?: string[];
	content: string;
	date: string;
}

interface PostMetadata {
	tags?: string[];
	date: string;
}

const parseMetadata = (path: string, metadataString: string) => {
	const metadata = parse(metadataString);
	if (!metadata.date) {
		throw new Error(`${path} missing date`);
	}
	return metadata as PostMetadata;
};

const getPostData = async (path: string): Promise<Post> => {
	// this could be separated into reading the post and parsing it
	const file = await readFile(path, { encoding: "utf-8" });
	const match = file.match(/---([\s\S]*?)---([\s\S]*)/);

	if (match && match[1] && match[2]) {
		const metadataString = match[1].trim();
		const content = match[2].trim();
		const { date, tags } = parseMetadata(path, metadataString);

		const splitPath = path.split("/");
		const title = splitPath[splitPath.length - 1].split(".")[0]; // posts/testing.md -> testing

		return {
			content,
			title,
			date,
			tags: tags || [],
			id: convertToLowerCaseWithHyphens(title),
		};
	} else {
		throw new Error("could not parse file: " + path);
	}
};

const POSTS_DIR = "posts";
export const getPostsPaths = async () =>
	await getAllFilesInDirectory(POSTS_DIR);

export interface SiteData {
	posts: Record<string, Post>;
	postOrder: string[];
}

const byDateDesc = (postA: Post, postB: Post) => {
	const dateA = new Date(postA.date);
	const dateB = new Date(postB.date);

	if (dateA > dateB) {
		return -1;
	} else if (dateA > dateB) {
		return 1;
	} else {
		return 0;
	}
};

export const getSiteData = async (): Promise<SiteData> => {
	console.log("getting site data");
	const postsData: SiteData["posts"] = {};

	// posts
	for (const postPath of await getPostsPaths()) {
		const postData = await getPostData(postPath); 
		postsData[postData.title] = postData;
	}

	// postOrder
	const postOrder = Object.values(postsData)
		.sort(byDateDesc)
		.map(({ id }) => id);

	return { posts: postsData, postOrder };
};
