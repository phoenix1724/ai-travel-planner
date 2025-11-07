// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send({ ok: true, msg: "AI Travel Planner backend running" }));

function generateMockItinerary(destination, startDate, endDate) {
  return {
    title: `Mock Itinerary for ${destination}`,
    destination,
    startDate,
    endDate,
    days: 3,
    budget: "Medium",
    items: [
      {
        day: 1,
        date: startDate,
        highlights: ["Arrival", "Explore city center", "Try local food"],
        meals: ["Breakfast at hotel", "Lunch in city square", "Dinner at rooftop cafe"],
        notes: "Take it easy after travel.",
      },
      {
        day: 2,
        date: "2025-11-09",
        highlights: ["Visit museum", "Boat tour", "Evening market"],
        meals: ["Breakfast buffet", "Lunch by river", "Dinner street food"],
        notes: "Carry water and comfortable shoes.",
      },
      {
        day: 3,
        date: endDate,
        highlights: ["Morning walk", "Souvenir shopping", "Departure"],
        meals: ["Breakfast at cafe", "Lunch at airport"],
        notes: "Check out by 11 AM.",
      },
    ],
  };
}

app.post("/api/generate-itinerary", async (req, res) => {
  const { destination, startDate, endDate, interests = "", budget = "" } = req.body;

  if (!destination || !startDate || !endDate) {
    return res.status(400).json({ error: "destination, startDate, and endDate are required" });
  }

  // If no API key, return mock data
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️ No API key detected — returning mock itinerary.");
    return res.json(generateMockItinerary(destination, startDate, endDate));
  }

  // --- Real API logic (will run only when key added) ---
  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a travel planner. Return ONLY valid JSON itinerary." },
        { role: "user", content: `Destination: ${destination}, Start: ${startDate}, End: ${endDate}, Interests: ${interests}, Budget: ${budget}` },
      ],
      temperature: 0.6,
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";
    const json = JSON.parse(text);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API error", details: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Backend running on http://localhost:${port}`));
