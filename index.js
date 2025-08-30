import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const completions = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a Smart personal assistant who answers asked questions.",
        },
        {
          role: "user",
          content: "What is today's wheather in Mumbai? ",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_current_weather",
            description: "Get the current weather in a given location",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The city and state, e.g. San Francisco, CA",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    console.log(JSON.stringify(completions.choices[0].message, null, 2));

    const toolCalls = completions.choices[0].message.tool_calls;
    if (!toolCalls) {
      console.log(`Assistant : ${completions.choices[0].message.content} `);
      return;
    }
    for (const tool of toolCalls) {
      //   console.log("tool :", tool);
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === "get_current_weather") {
        const toolsReasonce = await get_current_weather(
          JSON.parse(functionParams)
        );
        console.log(toolsReasonce);
      }
    }
  } catch (error) {
    console.error("Error calling Groq API:", error);
  }
}

main();

async function get_current_weather({ query }) {
  //Tavily APi Calling
  return "The weather of Mumbai is Sunny Today.";
}
