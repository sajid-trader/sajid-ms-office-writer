# Sajid MS Office Writer

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

## License
MIT © 2025 Sajid Hussain
