const util = require('util');
const path = require('path');
const fs = require('fs-extra')
const express = require('express');
const puppeteer = require('puppeteer');
const colors = require('colors');

const routesMap = require('../config/routes-map');

async function snapshot(browser, routePath) {
  let page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(path => {
    return window.__router__.navigate(path);
  }, routePath);
  return page.content();
}

async function persist(html, routePath) {
  let fileName = path.join(distPath, routePath, 'index.html');

  await fs.ensureDir(path.dirname(fileName), { recursive: true });
  let exists = await fs.exists(fileName);
  if (exists) {
    await fs.unlink(fileName);
  }
  await fs.writeFile(fileName, html);

  return fileName;
}

let server = express();
let distPath = path.join(__dirname, '..', 'dist');
server.use(express.static(distPath));

server.listen(3000, async function () {
  let browser = await puppeteer.launch({ headless: true });
  let routes = routesMap();
  let paths = Object.keys(routes);

  await Promise.all(paths.map(async (routePath) => {
    let html = await snapshot(browser, routePath);
    let fileName = await persist(html, routePath);

    console.log(`${routePath} => ${fileName}.`.blue);
  }));
  console.log(`\nRendered ${paths.length} routes.`.green);
  
  await browser.close();
  process.exit(0);
});
