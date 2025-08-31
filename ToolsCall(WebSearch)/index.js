import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

async function main() {
  const messages = [
    {
      role: "system",
      content:
        "You are a Smart personal assistant who answers asked questions.",
    },
    {
      role: "user",
      content: "What is currency rate of USD now?",
    },
  ]

  try {
    while (true) {
      const completions = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: messages,
        tools: [
          {
            type: "function",
            function: {
              name: "webSearch",
              description: "Search the latest information and realTime Data on internet",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The Query to perform seach on.",
                  },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });
      messages.push(completions.choices[0].message)
      
      messages.push(completions.choices[0].message)
      const toolCalls = completions.choices[0].message.tool_calls;
      if (!toolCalls) {
        console.log(`Assistant : ${completions.choices[0].message.content} `);
        break;
      }

      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const functionParams = tool.function.arguments;

        if (functionName === "webSearch") {
          const toolsResult = await get_current_weather(
            JSON.parse(functionParams)
          );
          messages.push({
            tool_call_id: tool.id,
            role: 'tool',
            name: functionName,
            content: toolsResult
          })
        }
      }
    }

  } catch (error) {
    console.error("Error calling Groq API:", error);
  }
}
main();

async function get_current_weather({ query }) {
  console.log("Web Searching.......")
  const response = await tvly.search(query)
  const finalResult = response.results.map((result) => result.content).join('\n\n')
  return finalResult;
}

