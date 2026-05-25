# 🎂 Cinematic Birthday Surprise

A dark, elegant, glassmorphic birthday surprise site built with Flask + GSAP.

## Run it

```bash
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000

## Customize

- **Name & date** — edit `RECIPIENT_NAME` and `BIRTHDAY` at the top of `app.py`.
- **Background music** — drop an `.mp3` into `static/music/` named `ambient.mp3`
  (or change the filename in `templates/reveal.html`). The site works fine
  without music — it just stays silent.
- **Photos** — place images in `static/images/` and reference them in the
  templates wherever you'd like.
- **Lottie animations** — drop `.json` files into `static/animations/` and
  load them via the `lottie-player` web component (already loadable from CDN).

## Structure

```
birthday-surprise/
├── app.py
├── requirements.txt
├── templates/
│   ├── index.html      # Open ✨ screen
│   └── reveal.html     # Cinematic reveal + countdown
└── static/
    ├── css/style.css
    ├── js/script.js
    ├── music/          # put ambient.mp3 here
    ├── images/
    └── animations/
```
