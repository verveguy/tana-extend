# tana-extend

The first attempt to build a Tana extension mechanism as a Chrome extension.

This first cut takes the current content of the clipboard and feeds it to ChatGPT

You need to build from source right now and provide an `src/openai.apikey.config.js` file that contains

 ```
 const openaiapikey = '<YOUR OPENAI API KEY>';
 export default openaiapikey;