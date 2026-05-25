"""
Cinematic Birthday Surprise — Flask backend.

Routes:
  /        -> First screen with the glowing "Open ✨" button
  /reveal  -> Cinematic reveal screen with message + countdown
"""

from datetime import date
from flask import Flask, render_template

app = Flask(__name__)

# ---- Customize me ----------------------------------------------------------
# Change these to personalize the surprise.
RECIPIENT_NAME = "My Dear"          # shown in the reveal message
BIRTHDAY = date(2026, 6, 24)        # target birthday date (YYYY, M, D)
# ---------------------------------------------------------------------------


@app.route("/")
def index():
    """Landing screen with the glowing Open button."""
    return render_template("index.html")


@app.route("/reveal")
def reveal():
    """Cinematic reveal screen with countdown."""
    days_left = max((BIRTHDAY - date.today()).days, 0)
    return render_template(
        "reveal.html",
        name=RECIPIENT_NAME,
        days_left=days_left,
        birthday_iso=BIRTHDAY.isoformat(),
    )


if __name__ == "__main__":
    # debug=True for easy local iteration; switch off in production.
    app.run(debug=True, host="0.0.0.0", port=5000)
