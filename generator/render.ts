import {
	writeFile,
} from "node:fs/promises";
import { readFileSync } from "node:fs";
import { marked } from "marked";
import Handlebars from "handlebars";
import {
	OUTPUT_PATH,
	getOutputPath,
} from "./fs-utils";
import { Post, SiteData } from "./data";

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

export const renderBlogPost = async ({
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

export const buildPost = async ({
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


export const buildHomepage = async (siteData: SiteData) => {
	const template = readFileSync("pages/home.hb.html", {
		encoding: "utf-8",
	});
	const homeTemplate = Handlebars.compile(template);
	await writeFile(`${OUTPUT_PATH}/home.html`, homeTemplate(siteData));
};

// export const buildBlogPosts = async () => {
// 	const promises = [];
// 	for (const post of await getAllPosts()) {
// 		const { date, content } = await parsePost(post);
// 		const { title, date } = metadata;
//
// 		if (!title) {
// 			throw new Error(`${post} missing post title`);
// 		}
// 		if (!date) {
// 			throw new Error(`${post} missing date`);
// 		}
//
// 		promises.push(buildPost({ title, date, content }));
// 	}
//
// 	await Promise.all(promises);
// };
