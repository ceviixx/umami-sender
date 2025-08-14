<p align="center">
  <img src="docs/umamisender.svg" alt="UmamiSender Logo" width="100">
</p>

<h1 align="center">UmamiSender</h1>

<p align="center">
  <i>Automated reports for Umami – via email or webhook, right from your dashboard.</i>
</p>

<p align="center">
  <a href="https://github.com/ceviixx/umami-sender/releases"><img src="https://img.shields.io/github/release/ceviixx/umami-sender.svg" alt="Release"></a>
  <a href="https://github.com/ceviixx/umami-sender/actions"><img src="https://img.shields.io/github/actions/workflow/status/ceviixx/umami-sender/ci.yml" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-20.19.x-brightgreen" alt="Node">
  <img src="https://img.shields.io/badge/Next.js-14.2.30-blue" alt="Next.js">
  <a href="https://umami.is"><img src="https://img.shields.io/badge/umami-2.19.x-black" alt="Umami"></a>
  <img src="https://img.shields.io/github/last-commit/ceviixx/umami-sender" alt="Last commit">
</p>

---

## ✨ What is UmamiSender?

**UmamiSender** is an open-source tool to automatically send scheduled reports from [Umami Analytics](https://umami.is) via email or webhook (e.g. Slack, Discord).
Perfect for hobby projects, small teams, client work, or personal dashboards.

> Works with both **Umami Cloud** and **Self-Hosted Umami**.

---

## 🖼 Quick Preview

| Dashboard                              | Mailer                              | Webhook                              |
| -------------------------------------- | ----------------------------------- | ------------------------------------ |
| ![](docs/screenshots/01_dashboard.png) | ![](docs/screenshots/04_mailer.png) | ![](docs/screenshots/05_webhook.png) |

---

## 💎 Why I built it

* I wanted my Umami stats without logging in every time.
* It's fun to automate stuff and learn new tech along the way.
* Maybe it’s useful for other people too – especially if you run multiple sites or share stats with a team. 🙂

---

## 🧩 Features

* 📈 Automated reporting from Umami
* 📬 Delivery via **email** or **webhook**
* 🧰 Manage **multiple Umami instances** (Cloud & Self-Hosted)
* 🗓 Scheduling: **daily, weekly, or monthly**
* 👥 **Multiple recipients** per job
* 🌍 **Multilingual interface** (i18n-ready)
* 🖼 Built-in **HTML email template** & preview

---

## 🚀 Quick Start

### Requirements

* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* Optional: Node.js (for local frontend development)

### Start with GHCR images (recommended)

```bash
docker compose -f docker-compose.ghcr.yml up -d
```

### Start with local build

```bash
docker compose -f docker-compose.build.yml up --build -d
```

### Access

* UI: [http://localhost](http://localhost)
* API: [http://localhost/api](http://localhost/api)

---

## 🔐 Default Login

After starting the app, sign in with:

```txt
Username: admin
Password: sender
```

On first login you will be **prompted to change your password immediately**.
You can also change the **username** later on the **Account** page.

---

## ⚙️ System Architecture

```txt
frontend/  # Next.js frontend (user interface)
backend/   # FastAPI REST API
worker/    # Celery worker for background jobs
nginx/     # Reverse proxy for unified access
```

---

## 🧭 How it works

1. **Add an Umami instance**

   * Cloud: provide your Umami **API key**
   * Self-Hosted: provide **hostname + credentials** (a bearer token is stored for reuse)

2. **Add recipients**

   * Email sender(s) and/or **webhooks** (Slack, Discord, …)

3. **Create a report job**

   * Choose website, frequency (daily/weekly/monthly), recipients

4. **Done** – UmamiSender will deliver reports on schedule.

---

## 🧪 Try it locally (dev hints)

* Use the provided Compose files to spin up the full stack.
* Most configuration is handled in the **web UI** (instances, senders, webhooks, jobs).
* SMTP settings and webhook URLs are entered when creating senders/webhooks.

---

## 🤝 Contributing

Pull requests, suggestions, and bug reports are very welcome!

**Nice starter ideas:**

* 🎨 Customizable templates for emails and popular webhook platforms
* 🔔 More webhook destinations (Microsoft Teams, Mattermost, …)
* 🌐 Additional languages for the UI

---

## 📄 License

MIT License – free to use in personal and commercial projects.

---

> **Note**: UmamiSender is an independent open-source project and is not affiliated with [Umami](https://umami.is).
