export const callGeminiAPI = async (question, agent) => {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${agent.systemPrompt}\n\nQuestion:\n${question.description}`,
                },
              ],
            },
          ],
        }),
      }
    );
  
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  };
  