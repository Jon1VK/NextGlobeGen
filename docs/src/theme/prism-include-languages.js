import "./prism-treeview.css";

export default function prismIncludeLanguages(Prism) {
  Prism.languages.treeview = {
    "treeview-part": {
      pattern: /(^|\n).+/,
      inside: {
        "entry-line": [
          {
            pattern: /\|-- |├── /,
            alias: "line-h",
          },
          {
            pattern: /\| {3}|│ {3}/,
            alias: "line-v",
          },
          {
            pattern: /`-- |└── /,
            alias: "line-v-last",
          },
          {
            pattern: / {4}/,
            alias: "line-v-gap",
          },
        ],
        "entry-name": {
          pattern: /.*\S.*/,
          inside: {
            step: {
              pattern: /\s.*\)$/,
            },
          },
        },
      },
    },
  };
  Prism.hooks.add("after-tokenize", function (env) {
    if (env.language !== "treeview") return;
    env.tokens.forEach(wrapToken);
  });
}

function wrapToken(token) {
  if (typeof token === "string" || token.type === "entry-line") return;
  if (token.type === "treeview-part") return token.content.forEach(wrapToken);
  const content = token.content.at(0);
  if (/\/.*$/.test(content)) {
    token.content[0] = content.slice(0, -1);
    token.type = token.type.concat(" dir");
    return;
  }
  var ext = content.toLowerCase().split(".").at(-1).split(/\s/).at(0);
  token.type = token.type.concat(` ext-${ext}`);
}
