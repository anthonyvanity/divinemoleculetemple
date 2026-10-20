import { chromium } from "playwright";
import { readFileSync } from "fs";

const svg = readFileSync("/workspace/public/favicon.svg", "utf8");
const html = `<!doctype html><html><body style="margin:0;background:#111">
<div style="display:flex;gap:16px;padding:16px;align-items:flex-end">
  <img id="i16" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="16" height="16" />
  <img id="i32" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="32" height="32" />
  <img id="i64" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="64" height="64" />
</div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROME || undefined });
const page = await browser.newPage({ viewport: { width: 240, height: 120 } });
await page.setContent(html, { waitUntil: "load" });
await page.locator("#i16").screenshot({ path: "/workspace/.grok/favicon-16.png" });
await page.locator("#i32").screenshot({ path: "/workspace/.grok/favicon-32.png" });
await page.locator("#i64").screenshot({ path: "/workspace/.grok/favicon-64.png" });
await page.screenshot({ path: "/workspace/.grok/favicon-strip.png" });
await browser.close();
console.log("wrote rasters");
