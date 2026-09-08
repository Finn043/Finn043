import { mkdir, writeFile } from "node:fs/promises";

const USER = "Finn043";
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "Finn043-profile-renderer",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function github(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${path}`);
  return res.json();
}

function n(value) {
  return new Intl.NumberFormat("en").format(value);
}

function top(items, limit) {
  return [...items].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const user = await github(`/users/${USER}`);
const repos = (await github(`/users/${USER}/repos?per_page=100&sort=updated`))
  .filter((repo) => !repo.fork);

const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
const languages = new Map();
for (const repo of repos) {
  if (repo.language) languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
}

const now = new Date();
const recent = repos.filter((repo) => {
  const pushed = new Date(repo.pushed_at);
  return now - pushed < 1000 * 60 * 60 * 24 * 45;
}).length;

const repoByName = new Map(repos.map((repo) => [repo.name, repo]));

const descriptions = {
  "icmra-strategic-analytics": "Power BI fundraising analytics project covering 2019-2025 pledges, donor behavior, campaign concentration, cohort retention, and board-level risk.",
  "automated-etl-analytics": "Automated ETL and analytics dashboard project with BigQuery-ready modelling, data-quality tests, star schema marts, and Looker Studio dashboard design.",
  "tin-luong-portfolio": "Personal portfolio site for analytics, BI, and applied AI work.",
  "retail-electronics-analytics": "Python analytics project that transforms raw product review data into product, rating, review-volume, and data-quality insights for BI reporting.",
  macrobrief: "Economic insight tool with World Bank API ingestion, time-series marts, stakeholder briefs, and a live Looker Studio dashboard.",
};

const stacks = {
  "icmra-strategic-analytics": "Power BI, Power Query, BI semantic modelling, RFM segmentation, CLV, cohort analysis",
  "automated-etl-analytics": "Python, Pandas, SQLAlchemy, PostgreSQL, BigQuery, GoogleSQL, Looker Studio",
  "tin-luong-portfolio": "React, TypeScript, Vite, Netlify, GitHub Actions",
  "retail-electronics-analytics": "Python, Pandas, JSONL streaming, BI marts, Excel model, Looker Studio-ready exports",
  "snowflake-customer-revenue-mart": "Snowflake, SQL, Snowsight, BI-ready marts, data quality checks",
  macrobrief: "Python, World Bank API, time-series marts, Looker Studio, markdown reporting",
};

const experiences = [
  {
    company: "Filum.ai",
    role: "Data Analyst Intern",
    period: "2024",
    impact: "Built KPI dashboards and lead scoring models that supported a 15% conversion improvement.",
    tools: ["BigQuery", "SQL", "Dashboard QA", "KPI Design"],
    contributions: [
      "Designed customer engagement, conversion, and retention dashboards across 50+ KPIs.",
      "Built lead scoring analysis in BigQuery to identify stronger conversion signals.",
      "Translated stakeholder questions into metric definitions and reusable reporting views.",
    ],
  },
  {
    company: "CoverGo",
    role: "AI Engineer Intern",
    period: "2024",
    impact: "Created validation datasets and Python checks for insurance AI workflows, reducing manual review time by 25%.",
    tools: ["Python", "Pandas", "NLP QA", "Test Datasets"],
    contributions: [
      "Built structured test data covering insurance-product questions, edge cases, and expected answers.",
      "Automated repetitive review checks with Python so QA evidence was easier to reproduce.",
      "Documented model-output issues so product and engineering teams could triage failures faster.",
    ],
  },
  {
    company: "MoMo",
    role: "Data Analyst Intern",
    period: "2023",
    impact: "Supported daily data operations over 1M+ rows with 99.95% uptime and trained teams on dashboard usage.",
    tools: ["SQL", "Excel", "BI Dashboards", "Data Operations"],
    contributions: [
      "Monitored daily reporting pipelines and helped maintain operational dashboards for business teams.",
      "Prepared analysis for product launches and engagement reporting across multiple departments.",
      "Trained stakeholders on dashboard usage, metric interpretation, and recurring reporting workflows.",
    ],
  },
];

const projects = [
  {
    name: "macrobrief",
    title: "MacroBrief",
    status: "Main completed project",
    impact: "Cut macro brief generation time by 45%.",
    summary: descriptions.macrobrief,
    evidence: [
      "Fetches World Bank GDP, inflation, unemployment, and export indicators for Australia, the United States, and Vietnam.",
      "Normalizes raw API JSON into long-form observations, summary marts, country snapshots, and stakeholder-ready markdown briefs.",
      "Publishes a live Looker Studio dashboard with country filters, historical trends, latest-vs-average comparisons, and KPI scorecards.",
    ],
    links: [
      ["GitHub", "https://github.com/Finn043/macrobrief"],
      ["Looker Studio dashboard", "https://datastudio.google.com/reporting/91b52781-28ab-4d0d-aa12-716720592161"],
    ],
  },
  {
    name: "icmra-strategic-analytics",
    title: "ICMRA Strategic Analytics 2019-2025",
    status: "Main completed Power BI project",
    impact: "Analyzed $32.93M in pledges across 2,330 donors and 45,100 transactions.",
    summary: descriptions["icmra-strategic-analytics"],
    evidence: [
      "Built a Power BI dashboard, semantic model, executive infographic, and strategic analytics report.",
      "Measured 1,077% campaign ROI and identified 2024-2025 revenue decline risk.",
      "Used RFM segmentation, CLV analysis, cohort retention, campaign concentration, and what-if scenario planning.",
    ],
    links: [["GitHub", "https://github.com/Finn043/icmra-strategic-analytics"]],
  },
  {
    name: "snowflake-customer-revenue-mart",
    title: "Snowflake Customer Revenue Mart",
    status: "Active work",
    impact: "Models raw customer, order, and marketing spend data into BI-ready revenue marts.",
    summary: "Snowflake analytics engineering project for monthly revenue, customer value, CAC, and ROAS reporting.",
    evidence: [
      "Creates RAW, STAGING, and MARTS schemas in Snowflake with small, inspectable source tables.",
      "Builds monthly revenue, customer revenue, channel performance, and fact-order reporting tables.",
      "Includes quality checks for duplicate orders, orphan records, null keys, and revenue reconciliation variance.",
    ],
    links: [["GitHub", "https://github.com/Finn043/snowflake-customer-revenue-mart"]],
  },
  {
    name: "automated-etl-analytics",
    title: "Automated ETL Analytics",
    status: "Active work / beta",
    impact: "Processes 500,000 deterministic records per run into validated reporting outputs.",
    summary: descriptions["automated-etl-analytics"],
    evidence: [
      "Ingests, validates, and loads transaction/taxi-style data into raw, clean, and aggregate layers.",
      "Documents a Sandbox-first BigQuery path with raw, staging, core, analytics, and monitoring layers.",
      "Designs Looker Studio dashboard flow for business KPIs, demand analysis, and pipeline health.",
    ],
    links: [["GitHub", "https://github.com/Finn043/automated-etl-analytics"]],
  },
  {
    name: "retail-electronics-analytics",
    title: "Retail Electronics Analytics Pipeline",
    status: "Active work / beta",
    impact: "Turns 250,000 valid Amazon review rows into product, rating, trend, and data-quality marts.",
    summary: descriptions["retail-electronics-analytics"],
    evidence: [
      "Streams a large JSONL review dataset without loading the full raw file into memory.",
      "Exports star-schema model tables, BI-ready CSV marts, an Excel workbook, and a static dashboard preview.",
      "Prepares Looker Studio sources for product performance, monthly trends, rating distribution, top terms, and data quality.",
    ],
    links: [["GitHub", "https://github.com/Finn043/retail-electronics-analytics"]],
  },
  {
    name: "tin-luong-portfolio",
    title: "Portfolio Website",
    status: "Live Netlify portfolio",
    impact: "Public portfolio hub for analytics projects, resume, dashboard previews, and AI assistant.",
    summary: descriptions["tin-luong-portfolio"],
    evidence: [
      "Built with React, TypeScript, Vite, Netlify Functions, and a local portfolio knowledge base.",
      "Includes project cards for MacroBrief, ICMRA, Snowflake, Automated ETL, and Retail Electronics.",
      "Provides a small assistant endpoint for recruiter-style questions about experience, projects, stack, and contact details.",
    ],
    links: [
      ["Live site", "https://tin-luong-portfolio.netlify.app"],
      ["GitHub", "https://github.com/Finn043/tin-luong-portfolio"],
    ],
  },
];

const formatLinks = (links) => links.map(([label, url]) => `[${label}](${url})`).join(" / ");
const experienceMarkdown = experiences.map((item) => `### ${item.company} - ${item.role} (${item.period})

**Impact:** ${item.impact}  
**Tools:** ${item.tools.join(", ")}

${item.contributions.map((line) => `- ${line}`).join("\n")}
`).join("\n");
const projectMarkdown = projects.map((project) => {
  const repo = repoByName.get(project.name);
  const updated = repo?.pushed_at ? `  
**Updated:** ${repo.pushed_at.slice(0, 10)}` : "";
  return `### ${project.title}

**Status:** ${project.status}  
**Impact:** ${project.impact}  
**Stack:** ${stacks[project.name] ?? "See project README"}${updated}  
**Links:** ${formatLinks(project.links)}

${project.summary}

${project.evidence.map((line) => `- ${line}`).join("\n")}
`;
}).join("\n");

const iconBase = "https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons";
const badge = (label, color) =>
  `<img src="https://img.shields.io/badge/${label.replaceAll(" ", "%20")}-${color}?style=flat-square" alt="${label}" title="${label}" />`;
const technologyGroups = [
  ["Data", [
    ["Snowflake", null, "29B5E8"],
    ["Python", "python.png"],
    ["Pandas", "pandas.png"],
    ["NumPy", "numpy.png"],
    ["PostgreSQL", "postgresql.png"],
    ["SQLite", "sqlite.png"],
    ["SQLAlchemy", "sqlalchemy.png"],
  ]],
  ["Cloud and Engineering", [
    ["GCP", "gcp.png"],
    ["Docker", "docker.png"],
    ["GitHub Actions", "githubactions.png"],
    ["Git", "git.png"],
    ["GitHub", "github.png"],
  ]],
  ["Analytics and BI", [
    ["Power BI", null, "F2C811"],
    ["Looker Studio", null, "4285F4"],
    ["BigQuery", null, "669DF6"],
    ["Tableau", null, "E97627"],
    ["Excel", null, "217346"],
    ["Apache Spark", "apache_spark.png"],
    ["Databricks", "databricks.png"],
  ]],
  ["AI and ML", [
    ["FastAPI", "fastapi.png"],
    ["PyTorch", "pytorch.png"],
    ["Hugging Face", "huggingface.png"],
  ]],
];
const technologyIconHtml = technologyGroups
  .map(([group, icons]) => `| ${group} | ${icons
    .map(([name, file, color]) => file
      ? `<img src="${iconBase}/${file}" alt="${name}" title="${name}" width="38" height="38" />`
      : badge(name, color))
    .join(" ")} |`)
  .join("\n");

const languageRows = top(languages, 5)
  .map(([lang, count]) => `| ${lang} | ${count} repo${count === 1 ? "" : "s"} |`)
  .join("\n");

const updated = now.toISOString().slice(0, 10);

const readme = `<!-- generated by scripts/render-profile.mjs; edit the script, not this file -->

<p align="center">
  <img src="./assets/data-orbit.svg" alt="Animated analytics orbit" width="100%" />
</p>

# Tin Luong

Data Scientist and AI Engineer based in Melbourne, Australia.

I build analytics and AI systems that turn raw data, documents, and APIs into validated, stakeholder-ready decisions. My work sits across business intelligence, data pipelines, RAG systems, and Python automation for operational data problems.

<p>
  <a href="https://tin-luong-portfolio.netlify.app"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-live-0f766e?style=for-the-badge"></a>
  <a href="https://www.linkedin.com/in/tin-luong"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-Tin%20Luong-2563eb?style=for-the-badge"></a>
  <a href="mailto:tin.bao.luong@gmail.com"><img alt="Email" src="https://img.shields.io/badge/Email-tin.bao.luong%40gmail.com-7c3aed?style=for-the-badge"></a>
</p>

## Live Metrics

<p>
  <img alt="Public repos" src="https://img.shields.io/badge/Public_repos-${n(user.public_repos)}-111827?style=flat-square">
  <img alt="Portfolio repos" src="https://img.shields.io/badge/Tracked_projects-${n(repos.length)}-111827?style=flat-square">
  <img alt="Recent repos" src="https://img.shields.io/badge/Recently_touched-${n(recent)}-111827?style=flat-square">
  <img alt="Stars" src="https://img.shields.io/badge/Stars-${n(totalStars)}-111827?style=flat-square">
  <img alt="Forks" src="https://img.shields.io/badge/Forks-${n(totalForks)}-111827?style=flat-square">
</p>

<p align="center">
  <img src="./assets/metrics.svg" alt="Dynamic profile metrics" width="100%" />
</p>

## Current Focus

- Business intelligence, KPI reporting, and dashboard-ready analytics marts
- Python and SQL pipelines for cleaning, validating, and transforming data
- RAG and document intelligence for cited, source-grounded answers
- API integrations and typed tool interfaces for analyst workflows
- Applied AI for decision support, not generic demos

## Career Experience

${experienceMarkdown}

## Selected Work

${projectMarkdown}

### InsightRAG

**Status:** Planned applied AI project  
**Stack:** FastAPI, React, vector search, BM25, reranking, source citations, retrieval evaluation

Business document intelligence system for querying reports, KPI definitions, policies, and analytics specs with hybrid retrieval and cited answers.

## Project Direction

\`\`\`text
Raw data / documents / APIs
  -> ingestion
  -> validation
  -> transformation / retrieval / modeling
  -> BI-ready marts or cited AI answers
  -> stakeholder-facing dashboards and reports
\`\`\`

## Technical Stack

| Area | Technologies |
| --- | --- |
${technologyIconHtml}

**Languages:** Python, SQL, TypeScript  
**Analytics:** Pandas, NumPy, Power BI, Tableau, Looker, Excel  
**Data:** PostgreSQL, BigQuery, Snowflake, DuckDB, dbt  
**AI:** RAG, LangChain, vector search, prompt engineering, evaluation  
**Backend & Tools:** FastAPI, Docker, GitHub Actions, REST APIs

## Repository Languages

| Language | Count |
| --- | ---: |
${languageRows || "| Updating | 0 |"}

## Contact

- Portfolio: [tin-luong-portfolio.netlify.app](https://tin-luong-portfolio.netlify.app)
- LinkedIn: [linkedin.com/in/tin-luong](https://linkedin.com/in/tin-luong)
- Email: [tin.bao.luong@gmail.com](mailto:tin.bao.luong@gmail.com)

<sub>Last rendered: ${updated}. Metrics refresh daily with GitHub Actions.</sub>
`;

const metricMax = Math.max(...top(languages, 5).map(([, count]) => count), 1);
const bars = top(languages, 5).map(([lang, count], index) => {
  const width = Math.max(42, Math.round((count / metricMax) * 320));
  const y = 88 + index * 38;
  return `<text x="52" y="${y + 18}" fill="#dbeafe" font-size="14" font-family="Arial">${esc(lang)}</text>
  <rect x="160" y="${y}" width="${width}" height="18" rx="9" fill="url(#bar)">
    <animate attributeName="width" from="24" to="${width}" dur="${0.8 + index * 0.12}s" fill="freeze" />
  </rect>
  <text x="${174 + width}" y="${y + 14}" fill="#93c5fd" font-size="12" font-family="Arial">${count}</text>`;
}).join("\n");

const metricsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="330" viewBox="0 0 900 330" role="img" aria-label="Dynamic GitHub profile metrics">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="55%" stop-color="#082f49"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" x2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="900" height="330" rx="18" fill="url(#bg)"/>
  <circle cx="760" cy="76" r="42" fill="none" stroke="#22d3ee" stroke-width="2" opacity=".45" filter="url(#glow)">
    <animate attributeName="r" values="34;52;34" dur="5s" repeatCount="indefinite"/>
  </circle>
  <text x="52" y="48" fill="#f8fafc" font-size="24" font-family="Arial" font-weight="700">GitHub Signal</text>
  <text x="52" y="72" fill="#93c5fd" font-size="13" font-family="Arial">Rendered from live repository metadata on ${updated}</text>
  ${bars}
  <text x="560" y="136" fill="#f8fafc" font-size="42" font-family="Arial" font-weight="700">${n(repos.length)}</text>
  <text x="560" y="160" fill="#93c5fd" font-size="13" font-family="Arial">tracked repos</text>
  <text x="690" y="136" fill="#f8fafc" font-size="42" font-family="Arial" font-weight="700">${n(recent)}</text>
  <text x="690" y="160" fill="#93c5fd" font-size="13" font-family="Arial">recent updates</text>
  <text x="560" y="224" fill="#f8fafc" font-size="42" font-family="Arial" font-weight="700">${n(totalStars)}</text>
  <text x="560" y="248" fill="#93c5fd" font-size="13" font-family="Arial">stars</text>
  <text x="690" y="224" fill="#f8fafc" font-size="42" font-family="Arial" font-weight="700">${n(totalForks)}</text>
  <text x="690" y="248" fill="#93c5fd" font-size="13" font-family="Arial">forks</text>
</svg>
`;

const orbitSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360" role="img" aria-label="Animated data orbit banner">
  <defs>
    <radialGradient id="core" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity=".9"/>
      <stop offset="48%" stop-color="#2563eb" stop-opacity=".34"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="1200" height="360" fill="#020617"/>
  <circle cx="600" cy="180" r="126" fill="url(#core)" opacity=".72"/>
  <g transform="translate(600 180)" fill="none" stroke="url(#line)" stroke-width="2" opacity=".9">
    <circle r="78" stroke-dasharray="10 12">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="18s" repeatCount="indefinite"/>
    </circle>
    <circle r="116" stroke-dasharray="24 18">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="24s" repeatCount="indefinite"/>
    </circle>
    <circle r="154" stroke-dasharray="3 16">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="34s" repeatCount="indefinite"/>
    </circle>
  </g>
  <g opacity=".52" filter="url(#soft)">
    <circle cx="268" cy="92" r="4" fill="#38bdf8"><animate attributeName="opacity" values=".2;1;.2" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="884" cy="98" r="5" fill="#a78bfa"><animate attributeName="opacity" values=".2;.9;.2" dur="4s" repeatCount="indefinite"/></circle>
    <circle cx="1010" cy="256" r="4" fill="#34d399"><animate attributeName="opacity" values=".2;1;.2" dur="3.6s" repeatCount="indefinite"/></circle>
    <circle cx="176" cy="268" r="3" fill="#f8fafc"><animate attributeName="opacity" values=".15;.8;.15" dur="5s" repeatCount="indefinite"/></circle>
  </g>
  <path d="M80 276 C260 188 346 232 500 154 S780 90 1120 148" fill="none" stroke="url(#line)" stroke-width="2" opacity=".28">
    <animate attributeName="stroke-dasharray" values="1 18;18 10;1 18" dur="8s" repeatCount="indefinite"/>
  </path>
  <text x="600" y="170" text-anchor="middle" fill="#f8fafc" font-size="42" font-family="Arial" font-weight="700">Tin Luong</text>
  <text x="600" y="205" text-anchor="middle" fill="#bae6fd" font-size="18" font-family="Arial">Data systems, BI marts, and applied AI</text>
</svg>
`;

await mkdir("assets", { recursive: true });
await writeFile("README.md", readme);
await writeFile("assets/metrics.svg", metricsSvg);
await writeFile("assets/data-orbit.svg", orbitSvg);
