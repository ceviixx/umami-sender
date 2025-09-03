<p align="center">
  <img src="docs/umamisender.svg" alt="UmamiSender Logo" width="100">
</p>

<h1 align="center">UmamiSender</h1>

<p align="center">
  <i>Open-source automated reports for Umami Analytics – via email or webhook, Cloud & Self-Hosted.</i>
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

**UmamiSender** is an **open-source reporting tool for [Umami Analytics](https://umami.is)**.  
It automatically generates and sends **website analytics reports** via **Email (SMTP)** or **Webhooks** (Slack, Discord, Teams, …).  

Works with both **Umami Cloud** and **Self-Hosted Umami** – perfect for **agencies, teams, and personal projects** who want to share **website stats, traffic, goals, referrers, and top pages** without logging into the dashboard.

---

## 🌍 Use Cases

- Agencies sending **weekly website reports** to clients  
- Teams sharing **Umami Analytics data** automatically in **Slack/Discord**  
- Personal projects needing quick **email summaries** of traffic, goals & referrers  
- Self-hosted setups where **Umami dashboards** aren’t always accessible  

---

## 🖼 Quick Preview

| Dashboard                              | Mailer                              | Webhook                              |
| -------------------------------------- | ----------------------------------- | ------------------------------------ |
| ![](docs/screenshots/01_dashboard.png) | ![](docs/screenshots/04_mailer.png) | ![](docs/screenshots/05_webhook.png) |

---

## 💎 Why I built it

* I wanted my Umami stats without logging in every time.  
* Automating reports saves time and makes analytics **shareable with teams & clients**.  
* Maybe it’s useful for other people too – especially if you run multiple sites or share stats with a team. 🙂  

---

## 🧩 Features

* 📈 **Automated website analytics reports** from Umami (Cloud & Self-Hosted)  
* 📬 Delivery via **Email (SMTP)** or **Webhook** (Slack, Discord, Teams, …)  
* 🧰 Manage **multiple Umami instances**  
* 🗓 Scheduling: **daily, weekly, or monthly**  
* 👥 **Multiple recipients** per job  
* 🌍 **Multilingual interface** (i18n-ready)  
* 🖼 Built-in **HTML email templates** with charts, top pages & referrers  

---

## 🚀 Quick Start

### Default Login

After the first start, sign in with:

```txt
Username: admin
Password: sender
```

You will be prompted to change your password immediately (and can also change the username later).

### Requirements

* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* Optional: Node.js (for local frontend development)

### Start with GHCR images (recommended)

Start **UmamiSender** in minutes with **Docker** – works with both **Umami Cloud** and **Self-Hosted Umami Analytics**:

```bash
mkdir -p nginx && curl -o docker-compose.yml https://raw.githubusercontent.com/ceviixx/umami-sender/main/docker-compose.ghcr.yml      -o nginx/nginx.conf https://raw.githubusercontent.com/ceviixx/umami-sender/main/nginx/nginx.conf

# Start the stack
docker compose up -d
```

Then open:
- UI: http://localhost  
- API: http://localhost/api  

### Start with local build (for development)

```bash
git clone https://github.com/ceviixx/umami-sender.git
cd umami-sender
docker compose -f docker-compose.build.yml up --build -d
```

---

## ⚙️ System Architecture

```txt
frontend/  # Next.js frontend (user interface)
backend/   # FastAPI REST API
worker/    # Celery worker for background jobs
nginx/     # Reverse proxy for unified access
```

---

## ⚙️ Environment Variables

| Variable               | Applies to      | Default | Description                                                                 |
| :--------------------- | :-------------- | :------ | :-------------------------------------------------------------------------- |
| `AUDIT_API_ENABLED`    | backend         | `true`  | Enables API request logging (enabled by default). |
| `AUDIT_WORKER_ENABLED` | worker, beat    | `false` | Enables worker/beat audit logging. May produce lots of logs. Disabled by default. |

> 🗄️ **Retention Policy:**  
> • **System logs** auto-deleted after **30 days**  
> • **User audit logs** auto-deleted after **90 days**  

---

## 🧭 How it works

1. **Add an Umami instance**  
   - Cloud: provide your Umami **API key**  
   - Self-Hosted: provide **hostname + credentials** (a bearer token is stored for reuse)  

2. **Add recipients**  
   - Email sender(s) and/or **webhooks** (Slack, Discord, …)  

3. **Create a report job**  
   - Choose website, frequency (daily/weekly/monthly), recipients  

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
