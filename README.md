# 📦 UmamiSender Templates

This branch contains **report and summary templates** used by UmamiSender.  
It is fully separated from the application source code (`main`/`dev` branches).

---

## 📂 Structure

Templates are organized by **type** (E-Mail vs. Webhook) and **purpose**.

### 📧 E-Mail Templates
- Folder names start with:
  - `EMAIL_REPORT_*` → Report templates (e.g. `EMAIL_REPORT_FUNNEL`, `EMAIL_REPORT_GOALS`)
  - `EMAIL_SUMMARY` → Summary overview template
- Each folder must contain:
  - `template.html` → The HTML file for rendering the e-mail  
  - `demo.json` → Example payload for preview/testing

---

### 🌐 Webhook Templates
- Folder names start with:
  - `WEBHOOK_SUMMARY_{channel}` → Summary template for a specific channel (e.g. `WEBHOOK_SUMMARY_DISCORD`)
  - `WEBHOOK_REPORT_{type}_{channel}` → Report template for a specific type/channel  
    (e.g. `WEBHOOK_REPORT_REVENUE_DISCORD`)
- Each folder must contain:
  - `template.json` → The JSON file for the webhook payload  
  - `demo.json` → Example payload for preview/testing

---

👉 Exactly **one of `template.html` or `template.json`** must exist per folder.  
👉 `demo.json` is **always required**.  

---

## 🚀 How to contribute

1. **Branch from `templates`**  
   ```bash
   git checkout templates
   git switch -c feature/add-my-template
   ```

2. **Create your folder**  
   - Use the naming convention above (`EMAIL_REPORT_*`, `EMAIL_SUMMARY`, `WEBHOOK_SUMMARY_*`, `WEBHOOK_REPORT_*_{channel}`)  
   - Add either `template.html` (for email) or `template.json` (for webhook)  
   - Always include `demo.json`

3. **Validate locally**  
   - Ensure JSON files are valid (`demo.json`, `template.json`)  
   - Ensure HTML is well-formed (`template.html`)

4. **Commit and push**  
   ```bash
   git add .
   git commit -m "Add EMAIL_REPORT_FUNNEL template"
   git push origin feature/add-my-template
   ```

5. **Open a Pull Request**  
   - Base branch: `templates`  
   - Title: *Add EMAIL_REPORT_FUNNEL template*  
   - Description: explain the purpose, add screenshots (emails) or example payloads (webhooks)

---

## 📌 Notes

- PRs must always target `templates` (not `main`/`dev`).  
- Keep PRs focused (one PR = one new template or related fix).  
- Follow naming rules strictly so the system can load your templates.  
