const assert = require("assert");
const fs = require("fs");

const components = fs.readFileSync("components.jsx", "utf8");
const html = fs.readFileSync("花花日记本.html", "utf8");

assert.match(components, /alignItems: "flex-start"/);
assert.match(components, /className="chat-avatar-slot"/);
assert.match(components, /className=\{me \? "chat-bubble chat-bubble-me" : "chat-bubble chat-bubble-them"\}/);
assert.match(components, /left: -9, top: 11/);
assert.doesNotMatch(components.slice(components.indexOf("function Bubble"), components.indexOf("window.Bubble")), /alignItems: "flex-end"/);
assert.match(html, /components\.jsx\?v=20260829c/);

console.log("CHAT_BUBBLE_ALIGNMENT_OK");
