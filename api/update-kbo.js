import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://kbo-prediction-72dfe-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  const date = req.query.date || "2026-04-26";

  const url = `https://eng.koreabaseball.com/Schedule/Scoreboard.aspx?searchDate=${date}`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // 🔥 팀 이름 추출 (간단 버전)
    const teamRegex = /class="team">(.*?)<\/span>/g;
    const teams = [];
    let match;

    while ((match = teamRegex.exec(html)) !== null) {
      teams.push(match[1].trim());
    }

    // 🔥 2개씩 묶어서 경기 생성
    const matches = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (teams[i] && teams[i + 1]) {
        matches.push({
          id: matches.length,
          team1: teams[i],
          team2: teams[i + 1],
          pitcher1: "",
          pitcher2: "",
          time: "18:30",
          stadium: "",
          result: null
        });
      }
    }

    // 🔥 Firebase 저장
    await set(ref(db, `kbo_${date}/matches`), matches);

    res.status(200).json({
      ok: true,
      savedMatches: matches
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
