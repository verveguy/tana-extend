import TurndownService from "turndown";

export const clip2tanaConfig =
{
  commands: [
    {
      label: "Clip current website to Tana",
      command: "clip2tana",
      doCommand: doClip2tana,
      isContentScript: true
    },
  ],
  configuration: {
    clip2tana: {
      key: "clip2tana",
      label: "Configuration for clip2tana",
      properties: {
        webtag: {
          key: "webtag",
          label: "Tana tag for websites",  type: "string", value: "#website",
        },
        opengraph: {
          key: "opengraph",
          label: "Copy OpenGraph meta attributes", type: "boolean",
          value: false
        }
      },
    }
  }
};

let copyOpenGraph = false;
let webtag = "#website";

function configure(config) {    
  // if no config, use default.
  config = config.clip2tana ?? clip2tanaConfig.configuration;
  copyOpenGraph = config.properties.opengraph.value;
  webtag = config.properties.webtag.value;
}

async function doClip2tana(notes, configuration) {

  configure(configuration);

  // this seems to help avoid "DOMException: not focused" errors from time to time
  // ref: Stackoverflow 
  window.focus();
  // grab the basic info from the page
  const title = document.title;
  const url = window.location.href;
  let description = "";

  // basic format of a tana-paste entry
  let data = `- ${title} ${webtag}`;

  let fields = [];
  fields.push(`\n  - Url:: ${url}`);

  const metaTags = document.querySelectorAll("meta");

  for (const element of metaTags) {
    if (element.name === "description") {
      description = element.content;
      fields.push("\n  - Description:: " + description);
    } else {
      let property = element.getAttribute("property");
      let content = element.content;
      if (copyOpenGraph && property === "og:description") {
        // no point in duplicating the description
        if (content != description) {
          fields.push("\n  - og:Description:: " + content);
        }
      }
      if (copyOpenGraph && property === "og:title") {
        // no point in duplicating the title
        if (content !== title) {
          fields.push("\n  - og:Title:: " + content);
        }
      }
      if (copyOpenGraph && property === "og:url") {
        // no point in duplicating the url
        if (content != url) {
          fields.push("\n  - og:Url:: " + content);
        }
      }
      if (copyOpenGraph && property === "og:type") {
        fields.push("\n  - og:Type:: " + content);
      }
      if (copyOpenGraph && property === "og:image") {
        fields.push("\n  - og:Image:: " + content);
      }

      if (copyOpenGraph && property === "og:site_name") {
        fields.push("\n  - og:Site:: " + content);
      }
    }
  }

  fields.forEach((field) => {
    data += field;
  });

  // do we have selected text as well?
  if (notes) {
    // convert html to markdown
    const markdownService = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "",
      codeBlockStyle: "fenced",
      emDelimiter: "*",
      strongDelimiter: "*",
      linkStyle: "inlined",
      preformattedCode: "true",
      blankReplacement: function (content, node) {
        return node.isBlock ? '\n\n' : ''
      },
    }).addRule('baseUrl', {   // This rule constructs url to be absolute URLs for links & images
      filter: ['a', 'img'],
      replacement: function (content, el, options) {
        if (el.nodeName === 'IMG') {
          const link = el.getAttributeNode('src').value;
          const fullLink = new URL(link, url)
          return `![${content}](${fullLink.href})`
        } else if (el.nodeName === 'A') {
          const link = el.getAttributeNode('href').value;
          const fullLink = new URL(link, url)
          return `[${content}](${fullLink.href})`
        }
      }
    });

    const clipping = markdownService.turndown(notes);
    clipping.split('\n').forEach((line) => {
      if (line.length > 0) {
        // strip any # symbols from the front of the line
        let frags = line.match(/^(#+ *)?(.*)/);
        data += `\n  - ${frags[2]}`;
      }
    });
  }

  return data;
};


export default clip2tanaConfig;