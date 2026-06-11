import { describe, expect, it } from "vitest";
import {
  ensureHead,
  injectCssIntoHtml,
  maskInertSpans,
} from "../openGenerativeUIDocument";

// websandbox splices its bootstrap script into the FIRST literal "<head>" of
// frameContent via frameContent.replace("<head>", ...). Simulate that to
// assert where the bootstrap would land in the assembled document.
function simulateWebsandboxBootstrap(frameContent: string): string {
  return frameContent.replace("<head>", "<head><script>BOOTSTRAP</script>");
}

describe("maskInertSpans", () => {
  it("preserves string length", () => {
    const inputs = [
      "<head><title>t</title><!-- </head> --></head><body>x</body>",
      '<body><style media="x">.a{}</style><script>var a = 1;</script></body>',
      "a<!-- unterminated",
      "<style>unterminated",
    ];
    for (const input of inputs) {
      expect(maskInertSpans(input)).toHaveLength(input.length);
    }
  });

  it("blanks out comments including their delimiters", () => {
    expect(maskInertSpans("a<!-- b -->c")).toBe("a          c");
  });

  it("blanks out style and script content but keeps their tags", () => {
    expect(maskInertSpans("<style>.a{}</style>")).toBe("<style>    </style>");
    expect(maskInertSpans("<script>1</script>")).toBe("<script> </script>");
  });

  it("matches raw-text tags case-insensitively without changing case", () => {
    expect(maskInertSpans("<STYLE>x</STYLE>")).toBe("<STYLE> </STYLE>");
  });

  it("handles attributed raw-text tags", () => {
    expect(maskInertSpans('<style media="x">y</style>')).toBe(
      '<style media="x"> </style>',
    );
  });

  it("does not treat tags merely starting with a raw-text name as raw text", () => {
    const input = "<styleish>x</styleish>";
    expect(maskInertSpans(input)).toBe(input);
  });

  it("masks unterminated comments and raw-text blocks to the end", () => {
    expect(maskInertSpans("a<!-- b")).toBe("a      ");
    expect(maskInertSpans("<style>x")).toBe("<style> ");
  });
});

describe("ensureHead", () => {
  it("returns html with a plain literal head unchanged", () => {
    const input = "<head><title>t</title></head><body>x</body>";
    expect(ensureHead(input)).toBe(input);
  });

  it("prepends a head when none exists", () => {
    expect(ensureHead("<body>x</body>")).toBe("<head></head><body>x</body>");
  });

  it("does not mistake <header> for a head", () => {
    expect(ensureHead("<body><header>h</header></body>")).toBe(
      "<head></head><body><header>h</header></body>",
    );
  });

  it("normalizes an attributed head to a literal <head>", () => {
    expect(ensureHead('<head lang="en"><title>t</title></head>')).toBe(
      "<head><title>t</title></head>",
    );
  });

  it("normalizes an uppercase head open tag", () => {
    expect(ensureHead("<HEAD><title>t</title></head><body>x</body>")).toBe(
      "<head><title>t</title></head><body>x</body>",
    );
  });

  it("ignores a <head> token inside a comment when no real head exists", () => {
    const result = ensureHead("<!-- <head> --><body>x</body>");
    expect(result).toBe("<head></head><!-- <head> --><body>x</body>");
    // The prepended head comes first, so websandbox's bootstrap lands there.
    expect(simulateWebsandboxBootstrap(result)).toBe(
      "<head><script>BOOTSTRAP</script></head><!-- <head> --><body>x</body>",
    );
  });

  it("ignores a <head> token inside script content when no real head exists", () => {
    expect(ensureHead('<body><script>var m = "<head>";</script>x</body>')).toBe(
      '<head></head><body><script>var m = "<head>";</script>x</body>',
    );
  });

  it("ignores a <head> token inside style content when no real head exists", () => {
    expect(ensureHead("<body><style>/* <head> */</style>x</body>")).toBe(
      "<head></head><body><style>/* <head> */</style>x</body>",
    );
  });

  it("anchors the websandbox bootstrap to the real head, not a literal <head> inside an earlier comment", () => {
    const result = ensureHead(
      '<!-- <head> --><head lang="en"><title>t</title></head><body>x</body>',
    );
    expect(result).toBe("<head><title>t</title></head><body>x</body>");
    expect(simulateWebsandboxBootstrap(result)).toBe(
      "<head><script>BOOTSTRAP</script><title>t</title></head><body>x</body>",
    );
  });

  it("normalizes the real head without corrupting a comment mentioning an attributed head", () => {
    const result = ensureHead(
      '<!-- example: <head lang="en"> --><head lang="fr"><title>t</title></head><body>x</body>',
    );
    expect(result).toBe(
      '<!-- example: <head lang="en"> --><head><title>t</title></head><body>x</body>',
    );
    expect(simulateWebsandboxBootstrap(result)).toBe(
      '<!-- example: <head lang="en"> --><head><script>BOOTSTRAP</script><title>t</title></head><body>x</body>',
    );
  });
});

describe("injectCssIntoHtml", () => {
  it("anchors agent css to the real </head>, not a </head> token inside a comment", () => {
    expect(
      injectCssIntoHtml(
        "<head><title>t</title><!-- </head> --></head><body>x</body>",
        "AGENTCSS",
      ),
    ).toBe(
      "<head><title>t</title><!-- </head> --><style>AGENTCSS</style></head><body>x</body>",
    );
  });

  it("anchors agent css past a </head> token inside style content", () => {
    expect(
      injectCssIntoHtml(
        '<head><style>p::after{content:"</head>"}</style></head><body>x</body>',
        "AGENTCSS",
      ),
    ).toBe(
      '<head><style>p::after{content:"</head>"}</style><style>AGENTCSS</style></head><body>x</body>',
    );
  });

  it("anchors agent css past a </head> token inside script content", () => {
    expect(
      injectCssIntoHtml(
        '<head><script>var a = "</head>";</script></head><body>x</body>',
        "AGENTCSS",
      ),
    ).toBe(
      '<head><script>var a = "</head>";</script><style>AGENTCSS</style></head><body>x</body>',
    );
  });

  it("prepends a styled head when the only </head> token is inside a comment", () => {
    expect(
      injectCssIntoHtml("<!-- </head> --><body>x</body>", "AGENTCSS"),
    ).toBe(
      "<head><style>AGENTCSS</style></head><!-- </head> --><body>x</body>",
    );
  });

  it("prepends a styled head when no </head> exists", () => {
    expect(injectCssIntoHtml("<body>x</body>", "AGENTCSS")).toBe(
      "<head><style>AGENTCSS</style></head><body>x</body>",
    );
  });
});

describe("final document assembly (ensureHead + injectCssIntoHtml)", () => {
  it("keeps agent css out of comments and the bootstrap in the real head", () => {
    const html =
      '<!-- <head> --><head lang="en"><title>t</title><!-- </head> --></head><body>x</body>';
    const assembled = injectCssIntoHtml(ensureHead(html), "AGENTCSS");
    expect(assembled).toBe(
      "<head><title>t</title><!-- </head> --><style>AGENTCSS</style></head><body>x</body>",
    );
    expect(simulateWebsandboxBootstrap(assembled)).toBe(
      "<head><script>BOOTSTRAP</script><title>t</title><!-- </head> --><style>AGENTCSS</style></head><body>x</body>",
    );
  });
});
