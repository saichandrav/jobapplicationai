const puppeteer = require('puppeteer');
const Job = require('../models/Job');

const scrapeJobs = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL to scrape is required' });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const jobsData = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-card, .job-listing, article');
      const jobs = [];
      jobElements.forEach(el => {
        const title = el.querySelector('h2, .title, .job-title')?.innerText || 'Unknown Title';
        const company = el.querySelector('.company, .employer')?.innerText || 'Unknown Company';
        const location = el.querySelector('.location')?.innerText || 'Unknown Location';
        const link = el.querySelector('a')?.href || '';
        
        if (title !== 'Unknown Title') {
          jobs.push({ title, company, location, url: link });
        }
      });
      return jobs;
    });

    await browser.close();

    const savedJobs = [];
    for (const job of jobsData) {
      const exists = await Job.findOne({ url: job.url });
      if (!exists && job.url) {
        const newJob = await Job.create(job);
        savedJobs.push(newJob);
      }
    }

    res.json({ message: `Scraped ${jobsData.length} jobs, saved ${savedJobs.length} new jobs`, jobs: savedJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { scrapeJobs };
