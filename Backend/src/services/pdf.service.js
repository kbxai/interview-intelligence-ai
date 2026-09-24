const puppeteer = require('puppeteer');

let browserPromise;
let activeJobs = 0;
const configuredConcurrency = Number(process.env.PDF_MAX_CONCURRENT_JOBS || 2);
const maxConcurrentJobs = Number.isFinite(configuredConcurrency) && configuredConcurrency > 0
    ? Math.floor(configuredConcurrency)
    : 2;

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getBrowser() {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            timeout: Number(process.env.PUPPETEER_LAUNCH_TIMEOUT_MS || 30000),
            args: process.env.PUPPETEER_NO_SANDBOX === 'true' ? ['--no-sandbox'] : []
        }).then((browser) => {
            browser.once('disconnected', () => {
                browserPromise = null;
            });
            return browser;
        }).catch((error) => {
            browserPromise = null;
            throw error;
        });
    }

    return browserPromise;
}

async function generateResumePdf(html) {
    const deadline = Date.now() + Number(process.env.PUPPETEER_PAGE_TIMEOUT_MS || 20000);
    while (activeJobs >= maxConcurrentJobs && Date.now() < deadline) {
        await wait(100);
    }
    if (activeJobs >= maxConcurrentJobs) {
        const error = new Error('PDF generation is busy');
        error.statusCode = 429;
        throw error;
    }

    activeJobs += 1;
    let page;
    let browser;

    try {
        browser = await getBrowser();
        page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        await page.setRequestInterception(true);
        page.on('request', (request) => request.abort());
        await page.setContent(html, {
            waitUntil: 'load',
            timeout: Number(process.env.PUPPETEER_PAGE_TIMEOUT_MS || 20000)
        });
        await page.emulateMediaType('print');

        return await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            timeout: Number(process.env.PUPPETEER_PAGE_TIMEOUT_MS || 20000)
        });
    } catch (error) {
        if (browser && browser.isConnected()) {
            await browser.close().catch(() => {});
        }
        browserPromise = null;
        throw error;
    } finally {
        activeJobs -= 1;
        if (page) await page.close().catch(() => {});
    }
}

async function closeBrowser() {
    if (browserPromise) {
        const browser = await browserPromise.catch(() => null);
        browserPromise = null;
        if (browser) await browser.close();
    }
}

module.exports = { generateResumePdf, closeBrowser };
