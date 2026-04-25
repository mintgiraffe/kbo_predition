export default async function handler(req, res) {
  const date = req.query.date || "2026-04-26";

  const url = `https://eng.koreabaseball.com/Schedule/Scoreboard.aspx?searchDate=${date}`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    res.status(200).json({
      ok: true,
      date,
      url,
      htmlLength: html.length,
      preview: html.slice(0, 300)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
