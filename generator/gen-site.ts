import {
	checkBuildDir,
	resetBuildDir,
} from "./fs-utils";
import { getSiteData } from "./data";
import { buildBlogPosts, buildHomepage } from "./render";

await checkBuildDir();
await resetBuildDir();

const siteData = await getSiteData();
console.log(siteData);

await Promise.all([
	await buildHomepage(siteData),
	await buildBlogPosts(siteData),
]);

