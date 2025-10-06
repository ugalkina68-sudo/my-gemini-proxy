const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const openAIResponse = {
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-pro",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant", 
            content: text
          },
          finish_reason: "stop
        }
      ]
    };

    res.json(openAIResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
