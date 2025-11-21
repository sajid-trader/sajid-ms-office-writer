![Screenshot_2025_1120_181356](https://github.com/user-attachments/assets/7b82bb93-2e77-4389-9138-0bf5dd3c979a)
# Sajid MS Office Writer

<<<<<<< HEAD
A mobile-friendly Flask-based MS-Office-like writer app that runs on Termux/Ubuntu and can export documents to PDF/RTF.

## Quick start
1. python3 -m venv venv
2. source venv/bin/activate
3. pip install -r requirements.txt
4. python3 app.py   # dev
   OR
   gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app  # production

## Notes
- For PDF export install system package wkhtmltopdf.
- Do NOT commit `.env` or `static/uploads/` or `venv/`.

# If contact me please visit my active account 
Author: Sajid Hussain

Email: buruk6039@gmail.com

WhatsApp: +91 95115 21113

# For visit demo app URL 
https://sajid-ms-office-writer-1.onrender.com

# This app diploy & run on Render with the GitHub repository ![Screenshot_20251121_113833](https://github.com/user-attachments/assets/cee6355a-a500-4ac4-9595-a97830c4cf4f)
![Screenshot_2025_1121_111828](https://github.com/user-attachments/assets/c9c77be2-9007-40ec-9f6b-ab81c1c49695)


# Learn more about this app
This app is completely mobile-based.
Those without a laptop or PC can write their documents in this app, arrange them in their preferred size and colors, select any image from their device, and save it in a PDF format on the same device.

## License
MIT © 2025 Sajid Hussain
=======
Mobile-first, Flask-based web writer — create, edit and export documents (PDF/RTF).  
**Live demo:** https://sajid-ms-office-writer-1.onrender.com

---

## Demo screenshot

![Demo screenshot](docs/screenshot.jpg)

> Note: A few minor UI quirks are intentionally left in the demo for learning/discussion purposes. No sensitive keys or secrets are included in this repo.

---

## Highlights / Features

- Mobile-friendly rich-text editor (formatting, highlights, lists)  
- Insert images, tables, stickers and special characters  
- Draw/hand-draw tool and export drawing as embedded PNG  
- Autosave and file management endpoints (`/api/save`, `/api/list`, `/api/delete`)  
- Export to PDF (uses `wkhtmltopdf` when available; falls back to saved HTML)  
- Quick to run locally and deployable on Render / any VPS with Python

---

## Quick start (developer)

```bash
git clone https://github.com/sajid-trader/sajid-ms-office-writer.git
cd sajid-ms-office-writer

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# dev:
python3 app.py

# production (recommended):
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app


---

## 2) Stage, commit and push (एक ही बार में चलाओ)

```bash
# (repo root में होना चाहिए)
git add README.md docs/screenshot.jpg 2>/dev/null || true
git commit -m "docs: replace README with polished overview, add live demo & contact" || echo "Nothing to commit or commit failed"
git push origin main

# requires GitHub CLI & authenticated
gh repo edit sajid-trader/sajid-ms-office-writer --add-topic flask,python,termux,android,pdf,editor,wkhtmltopdf,web-app,mobile
>>>>>>> chore: local updates (README and cleanup backup file)
