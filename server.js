import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log("API_KEY:", process.env.API_KEY);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    candidateCount: 1,
    temperature: 2.0,
  },
});

const history = [
  {
    role: "user",
    parts: [
      {
        text: "Brainstorm a unique story idea centered around an unlikely protagonist. Start by imagining a character with an unconventional background, personality trait, or secret. This character has a defining life goal or aspiration that sets them on a path of discovery. Explore potential settings that are unfamiliar to the character—places that challenge their beliefs or abilities. Consider a central conflict that tests their resilience, something personal yet universally relatable. Then, outline possible secondary characters who either support or complicate the protagonist’s journey, adding layers to the story’s theme. End with a twist or unexpected revelation that forces the protagonist to see their world in a new way. \n\nSpecifications: \n- Genre: Open; focus on what resonates most with the character concept. \n- Character Focus: Define quirks, strengths, and weaknesses that drive the protagonist’s actions. \n- Setting Ideas: Choose settings that mirror the character’s emotional landscape. \n- Conflict Ideas: Think of internal vs. external conflict balance to deepen the protagonist’s journey. \n\nPlease note: If the prompt is not about story ideas and character development, kindly accept my apologies and respond in the same language as the user's prompt. What do you think about this prompt?",
      },
    ],
  },
  {
    role: "model",
    parts: [{ text: "Alright I Will DO What You Ask" }],
  },
];

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    let chat = model.startChat({ history });

    const result = await chat.sendMessage(prompt);
    const modelResponse = result.response.text();
    res.json({ result: modelResponse });
    history.push(
      { role: "user", parts: [{ text: prompt }] },
      { role: "model", parts: [{ text: modelResponse }] }
    );
  } catch (error) {
    console.error("Error generating contents:", error);
    res.status(500).json({ error: "Failed to generate contents" });
  }
});

app.use(cors({
  origin: "https://inku-delta.vercel.app/", // URL Vercel kamu
  methods: "GET,POST",
}));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


