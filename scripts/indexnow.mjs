/*
  Tells IndexNow search engines (Bing, Yandex, Seznam, Naver and others) that pages changed,
  so they recrawl now instead of on their own schedule. Bing's index also feeds ChatGPT search
  and Copilot, so this is the fastest way to get changes into those answers.

  The key is the 32-character hex file in public/, served at https://horalix.com/<key>.txt.
  Run after a deploy:

    node scripts/indexnow.mjs              # every URL in the live sitemap
    node scripts/indexnow.mjs /glossary    # only the given paths
*/
import { readdir, readFile } from "node:fs/promises";

const host = "horalix.com";
const origin = `https://${host}`;

const keyFile = (await readdir("public")).find((name) => /^[a-f0-9]{32}\.txt$/.test(name));
if (!keyFile) {
  console.error("No IndexNow key file (32 hex characters + .txt) found in public/.");
  process.exit(1);
}
const key = (await readFile(`public/${keyFile}`, "utf8")).trim();

const paths = process.argv.slice(2);
let urlList;
if (paths.length) {
  urlList = paths.map((path) => new URL(path, origin).href);
} else {
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

// The key file has to be live before engines will accept the submission.
const published = await fetch(`${origin}/${keyFile}`);
if (!published.ok || (await published.text()).trim() !== key) {
  console.error(`${origin}/${keyFile} does not serve the key yet. Deploy first.`);
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${origin}/${keyFile}`, urlList }),
});
// 200 and 202 both mean accepted; 202 means the key is still being validated.
console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URL(s).`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
