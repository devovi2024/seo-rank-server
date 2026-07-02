# SEO Rank – AI Powered SEO Analyzer & Keyword Rank Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/MongoDB-Database-success?style=for-the-badge">
  <img src="https://img.shields.io/badge/Google-Gemini-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Playwright-Web%20Scraping-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Browserless-Cloud%20Browser-purple?style=for-the-badge">
  <img src="https://img.shields.io/badge/REST-API-red?style=for-the-badge">
</p>

---

# Overview

SEO Rank is a production-ready backend application that performs complete website SEO analysis and keyword rank tracking using AI.

The application combines modern web scraping, Google Gemini AI, Browserless cloud browsers, and Playwright automation to generate professional SEO reports, monitor keyword rankings, and store historical ranking data.

This application was built to simulate a real-world SaaS SEO platform where users can:

- Analyze any website
- Get AI-generated SEO recommendations
- Track keyword rankings
- Monitor ranking history
- Compare competitors
- Schedule automatic rank tracking
- Store complete SEO reports

---

# Features

## Authentication

- User Authentication
- JWT Authorization
- Protected Routes
- Secure API Access

---

## SEO Analysis

Analyze any website URL.

The scraper collects:

- Page Title
- Meta Description
- Canonical URL
- Robots Meta
- Open Graph Tags
- Twitter Cards
- Viewport
- Charset
- Heading Structure
- Internal Links
- External Links
- Images
- Missing Alt Attributes
- Word Count
- Page Size
- Load Time

---

## AI SEO Audit

Google Gemini analyzes the scraped data and generates:

- Overall SEO Score
- Performance Score
- SEO Score
- Accessibility Score
- Best Practices Score

It also provides:

- SEO Issues
- Severity Levels
- Actionable Recommendations
- Keyword Extraction
- Keyword Density

---

## Keyword Rank Tracking

Track Google rankings for any keyword.

Features include:

- Current Position
- Google Search Page
- Competitor Websites
- Ranking History
- Best Position
- Position Changes
- Manual Refresh
- Enable/Disable Tracking

---

## Scheduled Rank Tracking

Automatically tracks keywords every day using Cron Jobs.

- Daily Scheduled Tracking
- Automatic Updates
- Ranking History
- Failed Status Recovery

---

## Browser Automation

Powered by:

- Playwright
- Browserless

Capabilities:

- JavaScript Rendering
- Dynamic Website Support
- Google Search Automation
- Headless Browser Sessions

---

## Database

MongoDB stores:

Users

SEO Analysis

Keyword Tracking

Ranking History

Competitors

SEO Reports

---

# Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT

## AI

- Google Gemini

## Browser Automation

- Playwright

## Browser Infrastructure

- Browserless

## Task Scheduling

- node-cron

---

# API Endpoints

## Authentication

```text
POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile
```

---

## SEO Analysis

```text
POST /api/analysis/analyze

GET /api/analysis/list

GET /api/analysis/:id

DELETE /api/analysis/:id
```

---

## Rank Tracking

```text
POST /api/rank

GET /api/rank

GET /api/rank/:id

POST /api/rank/:id/refresh

PATCH /api/rank/:id/toggle

DELETE /api/rank/:id
```

---

# SEO Report Example

```text
Overall Score

92

SEO

95

Performance

88

Accessibility

90

Best Practices

94

Top Keywords

seo
google
website
optimization

Issues

Missing Meta Description

Multiple H1 Tags

Missing Alt Attributes

Large Page Size

Slow Loading Time
```

---

# Keyword Tracking Example

```text
Keyword

best seo tools

Current Position

6

Previous Position

9

Position Change

+3

Google Page

1

Best Position

4
```

---

# Cron Job

The application automatically checks rankings every day.

```text
Schedule

0 6 * * *

Time

06:00 AM
```

---

# Security

JWT Authentication

Protected APIs

MongoDB Validation

Error Handling

Input Validation

Secure Environment Variables

---

# Future Improvements

Frontend Dashboard

Email Notifications

PDF SEO Reports

CSV Export

Scheduled Email Reports

Multi-language Support

Team Collaboration

Projects & Workspaces

Google Search Console Integration

Google Analytics Integration

Backlink Analysis

PageSpeed Insights API

Domain Authority Metrics

Technical SEO Scanner

XML Sitemap Generator

Robots.txt Analyzer