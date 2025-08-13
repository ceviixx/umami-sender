<p align="center">
  <img src="frontend/public/umamisender.png" alt="UmamiSender Logo" width="100">
</p>

<h1 align="center">UmamiSender</h1>

<p align="center">
  <i>Automated reports for Umami – via email or webhook, right from your dashboard.</i>
</p>

<p align="center">

  [![Release](https://img.shields.io/github/release/ceviixx/umami-sender.svg)](https://github.com/ceviixx/umami-sender/releases)
  [![CI](https://img.shields.io/github/actions/workflow/status/ceviixx/umami-sender/ci.yml)](https://github.com/ceviixx/umami-sender/actions)
  ![Node](https://img.shields.io/badge/node-20.19.x-brightgreen)
  ![Next.js](https://img.shields.io/badge/Next.js-14.2.30-blue)
  [![Umami](https://img.shields.io/badge/umami-2.19.x-black)](https://umami.is)
  ![Last commit](https://img.shields.io/github/last-commit/ceviixx/umami-sender)

</p>

---

## ✨ What is UmamiSender?

**UmamiSender** is an open-source tool to automatically send scheduled reports from [Umami Analytics](https://umami.is) via email or webhook (e.g. Slack, Discord).  
Perfect for teams, client projects, or personal dashboards.

> Works with both **Umami Cloud** and **Self-Hosted Umami**.

---

## 🔐 Default Login

After starting the app, you can log in using:

```txt
Username: admin
Password: sender
````

> On first login, you will be **prompted to change your password immediately**.  
> You can also change the **username** later in the **Account** page.

## 🧩 Features

- 📈 Automated reporting from Umami
- 📬 Delivery via email or webhook
- 🌐 Supports multiple Umami instances
- 🔗 Webhook integrations (Slack, Discord, etc.)
- 🗓 Scheduling: daily, weekly, or monthly
- 🌍 Multilingual interface (i18n-ready)

---

## 🖼 Screenshots

| Dashboard | Mailer | Webhook |
|----------|---------------|------------------------|
| ![](docs/screenshots/01_dashboard.png) | ![](docs/screenshots/04_mailer.png) | ![](docs/screenshots/05_webhook.png) |

---

## ⚙️ System Architecture

```txt
frontend/  # Next.js frontend (user interface)
backend/   # FastAPI REST API
worker/    # Celery worker for background jobs
nginx/     # Reverse proxy for unified access
```

---

## 🚀 Getting Started

### Requirements

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Optional: Node.js (for local frontend development)

### Start the App (Local Build)

```bash
docker compose -f docker-compose.build.yml up --build
```

### Start the App (Using GHCR Images)
```bash
docker compose -f docker-compose.ghcr.yml up
```

### Available at:

- UI: http://localhost  
- API: http://localhost/api

---

## 🔁 API Routing

Thanks to the built-in NGINX reverse proxy, everything runs on port 80:

| Path      | Destination          |
|-----------|----------------------|
| `/`       | Web UI (Next.js)     |
| `/api/*`  | Backend API (FastAPI)|

---

## 🤝 Contributing

Pull requests, suggestions, and bug reports are very welcome!

### Potential improvements for contributors:

- 🧩 Customizing templates for emails and webhook platforms (e.g. Discord, Microsoft Teams)

---

## 💬 Community

Got questions or feedback? Create issue or PR on GitHub