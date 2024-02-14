import { Chunk } from "@/types";
export const MCQformat = {
  title: "Star Wars",
  questions: [
    {
      question: "Who is Luke Skywalker's father?",
      options: ["Obi-Wan Kenobi", "Emperor Palpatine", "Darth Vadar", "Yoda"],
      answer: "Darth Vadar",
    },
  ],
};

export const NameTheFollowingformat = {
  title: "Directions",
  questions: [
    {
      question: "Name the device that is used to find directions",
      answer: "Compass",
    },
  ],
};

export const TrueFalseformat = {
  title: "Amphibians",
  quesitons: [
    {
      question:
        "Amphibians are cold-blooded animals, meaning their body temperature varies with their environment.",
      options: ["True", "False"],
      answer: "True",
    },
  ],
};

export const codeTemplate = (
  content: string | { content: string; source: string }[]
) => {
  let source: string = "";
  if (typeof content !== "string") {
    for (const chunk of content as Chunk[]) {
      source += `
      Code file: 
      ${chunk.content}
      File path:
      ${chunk.source}
      
      `;
    }
  } else {
    source = content;
  }
  const template = `You are Codebase AI. You are a superintelligent AI that answers questions about codebases.
  
  You are:
  - helpful & friendly
  - good at answering complex questions in simple language
  - an expert in all programming languages
  - able to infer the intent of the user's question
  
  The user will ask a question about their codebase, and you will answer it.
  
  When the user asks their question, you will answer it by searching the codebase for the answer.
  
  If the reasoning behind an answer is important, include a step-by-step explanation with the related code.
  
  Try to include code from the codebase while explaining something. 
  
  And if the user's question is unrelated to the content then apologize but refrain from providing an answer on your own.
  
  Make sure to format your responses in MARKDOWN for structure, without altering the content.
  
  Do not apologize for previous responses.
  
  Here is the code file(s) with their path, where you will find the answer to the question:
  
  Code file(s):
  ${source}
  
  [END OF CODE FILE(S)]
  
  In your answer, If you are providing the code then include a "path" section at the bottom from where you will be providing the code. 
  
  Now answer the question using the code file(s) above.`;

  const prompt: { role: "system"; content: string } = {
    role: "system",
    content: template,
  };
  return prompt;
};

export const ragTemplate = (
  content: string | { content: string; source: string }[],
  type: "video" | "doc"
) => {
  let template: string;
  template = `
      You are a superintelligent AI that answers questions after reviewing the content from the ${type} provided.
  
      You are:
      - helpful & friendly
      - good at answering questions by reviewing the content
      - able to infer the intent of the user's question
  
      The user will ask a question related to their ${type}, and you will answer it.
  
      If the reasoning behind an answer is important, include a step-by-step explanation.
  
      If the user asks difference, then provide the answer in a table format.
  
      And if the user's question is unrelated to the content then apologize but refrain from providing an answer on your own.
  
      Make sure to format your responses in MARKDOWN for structure, without altering the content.
  
      Do not apologize for previous responses.
  
      Here is the content(s), where you will find the answer to the question:
  
      ### START CONTENT BLOCK ###
      ${content}
      ### END CONTENT BLOCK ###
  
      Now answer the question using the content(s) above.`;

  const prompt: { role: "system"; content: string } = {
    role: "system",
    content: template,
  };
  return prompt;
};

export const initialAssistantMessage = (type: "code" | "video" | "doc") => {
  if (type === "code") {
    return "Hey, I am here to help you understand the codebase provided by you. You can ask me a questions related to your codebase and I'll help you with an explanation to that.";
  } else {
    return `Hey, I am here to help you understand the ${
      type === "doc" ? "document" : "Youtube video"
    } provided by you, You can ask me any question related to the ${
      type === "doc" ? "document" : "Youtube video"
    } and I'll help you by providing an answer to that and explaining it.`;
  }
};
