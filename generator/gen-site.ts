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
import { OUTPUT_PATH, checkBuildDir, getAllFilesInDirectory, getOutputPath, resetBuildDir } from "./fs-utils";
import { getSiteData, parsePost } from "./data";
import { buildBlogPosts, buildHomepage } from "./render";

await checkBuildDir();
await resetBuildDir();
// await buildBlogPosts();

const siteData = await getSiteData()
console.log(siteData)
await buildHomepage(siteData);

// what if i were to create a global object with site data?
/*
* 
posts: { 
	title: { 
		title: 'some title',
		path: 'some-path',
		date: 'some-date',
		content: 'content'
	}, 
	some-other-title: { 
		title: 'some-other title',
		path: 'some-other-path',
		date: 'some-other-date',
		content: 'content'
	} 
},
recent-posts: ['title', 'some-other-title']
also do not need to add the date, as its baked into the path
*/

