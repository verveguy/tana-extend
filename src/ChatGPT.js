import { OpenAIClient } from 'openai-fetch';

let openai = undefined;
let model = "";

export const chatGPTConfig = 
{
  commands: [
    {
      label: "Invoke Chat GPT with prompt",
      command: "chatgpt",
      doCommand: doChatGPT,
      isContentScript: false
    },
    {
      label: "Summarize using ChatGPT",
      command: "summarize",
      doCommand: doChatGPTSummarize,
      isContentScript: false
    },
  ],
  configuration: {
    chatGPT: {
      key: "chatGPT",
      label: "Configuration for Chat GPT",
      properties: {
        openAIAPIKey: {
          key: "openAIAPIKey", type:"string",
          label: "OpenAI API Key", value: " ",
        },
        chatGPTModel: {
          key: "chatGPTModel", label: "ChatGPTModel", type:"string",
          value: "gpt-3.5-turbo",
          options: ["gpt-3.5-turbo", "gpt4.0"]
        }
      },
    },
  }
};

// apply any updated config values
function configure(config) {
  // if no config, use default.
  config = config.chatGPT ?? chatGPTConfig.configuration;

  const apiKey = config.properties.openAIAPIKey.value;
  openai = apiKey ? new OpenAIClient({ apiKey: apiKey }) : undefined;
  model = config.properties.chatGPTModel.value
}

// call ChatGPT to prcess an arbitrary prompt
async function doChatGPT(notes, configuration) {

  configure(configuration);

  const request = {
    model: model,
    messages: [
      { role: "system", content: "You are a diligent note taker" },
      { role: "user", content: notes },
    ]
  };
  return callChatGPT(request);
};

// call ChatGPT to summarie the notes
async function doChatGPTSummarize(notes, configuration) {

  configure(configuration);

  const request = {
    model: model,
    messages: [
      { role: "system", content: "You are a diligent note taker" },
      { role: "user", content: "Please summarize the following notes in bullet point form.\n"+notes },
    ]
  };
  return callChatGPT(request);
};


async function callChatGPT(request) {
  let response;

  if (openai === undefined)
    return "Please set OpenAI API Key in configuration";

  try {
    response = await openai.createChatCompletion(request);
  }
  catch (err) {
    console.error("OpenAI error: " + err);
    return "OpenAI error: " + err;
  }

  const result = response ? response.message.content : "(error)";
  return result ? result : "no result";
};

export default chatGPTConfig;