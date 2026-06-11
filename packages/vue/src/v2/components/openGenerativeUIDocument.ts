/**
 * Helpers that assemble the final document handed to websandbox as
 * `frameContent` once html streaming completes.
 *
 * websandbox anchors everything it injects to literal `<head>` tokens: it
 * rejects frame content without one and splices its bootstrap script via
 * `frameContent.replace("<head>", ...)`, so the first literal `<head>`
 * occurrence wins. Agent-generated html can legally carry `<head>`/`</head>`
 * tokens inside HTML comments or `<style>`/`<script>` blocks, so every token
 * search here runs against a masked copy of the document (maskInertSpans)
 * whose indices map 1:1 to the original, and splices happen on the original.
 */

const HEAD_OPEN = /<head(\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/i;
const COMMENT = /<!--[\s\S]*?(?:-->|$)/g;
const RAW_TEXT_TAGS = ["style", "script"];

function rawTextTagAt(lower: string, index: number): string | undefined {
  for (const tag of RAW_TEXT_TAGS) {
    if (!lower.startsWith(`<${tag}`, index)) continue;
    const next = lower.charAt(index + 1 + tag.length);
    if (next === "" || next === ">" || next === "/" || /\s/.test(next)) {
      return tag;
    }
  }
  return undefined;
}

/**
 * Returns a same-length copy of `html` where HTML comments and the text
 * content of `<style>`/`<script>` blocks are blanked out with spaces, so
 * `<head>`/`</head>` searches cannot match inside spans the HTML parser
 * treats as comment data or raw text. Indices in the masked string address
 * the same characters in the original.
 */
export function maskInertSpans(html: string): string {
  // ASCII-only lowering keeps indices aligned with `html` (toLowerCase can
  // change the length for some non-ASCII code points).
  const lower = html.replace(/[A-Z]/g, (char) => char.toLowerCase());
  const parts: string[] = [];
  let i = 0;

  while (i < html.length) {
    if (lower.startsWith("<!--", i)) {
      const close = lower.indexOf("-->", i + 4);
      const end = close === -1 ? html.length : close + 3;
      parts.push(" ".repeat(end - i));
      i = end;
      continue;
    }

    const tag = rawTextTagAt(lower, i);
    if (tag) {
      const openTagEnd = lower.indexOf(">", i);
      if (openTagEnd === -1) {
        parts.push(" ".repeat(html.length - i));
        break;
      }
      const contentStart = openTagEnd + 1;
      const close = lower.indexOf(`</${tag}`, contentStart);
      const contentEnd = close === -1 ? html.length : close;
      parts.push(
        html.slice(i, contentStart),
        " ".repeat(contentEnd - contentStart),
      );
      i = contentEnd;
      continue;
    }

    const nextOpen = lower.indexOf("<", i + 1);
    const end = nextOpen === -1 ? html.length : nextOpen;
    parts.push(html.slice(i, end));
    i = end;
  }

  return parts.join("");
}

/**
 * Guarantees the document's real head-open tag is spelled exactly `<head>`
 * and is the first literal `<head>` in the string, since that is where
 * websandbox splices its bootstrap script. Documents without a real head
 * get one prepended.
 */
export function ensureHead(html: string): string {
  const match = HEAD_OPEN.exec(maskInertSpans(html));
  if (!match) return `<head></head>${html}`;

  const start = match.index;
  const end = start + match[0].length;
  let prefix = html.slice(0, start);
  if (prefix.includes("<head>")) {
    // A literal "<head>" before the real head can only live inside an inert
    // span (otherwise it would be the head-open match). Drop the comments
    // carrying one so websandbox's first-occurrence replace cannot splice
    // its bootstrap into commented-out text.
    prefix = prefix.replace(COMMENT, (comment) =>
      comment.includes("<head>") ? "" : comment,
    );
  }
  if (match[0] === "<head>" && prefix.length === start) return html;
  return `${prefix}<head>${html.slice(end)}`;
}

/**
 * Splices the agent css `<style>` right before the document's real
 * `</head>`, located on the masked copy so a `</head>` token inside a
 * comment or style/script content cannot capture the splice. Documents
 * without a real `</head>` get a head prepended instead.
 */
export function injectCssIntoHtml(html: string, css: string): string {
  const headCloseIdx = maskInertSpans(html).indexOf("</head>");
  if (headCloseIdx !== -1) {
    return (
      html.slice(0, headCloseIdx) +
      `<style>${css}</style>` +
      html.slice(headCloseIdx)
    );
  }
  return `<head><style>${css}</style></head>${html}`;
}
