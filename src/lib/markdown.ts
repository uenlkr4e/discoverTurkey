import { marked } from 'marked';

/** Render editor-written Markdown from frontmatter fields (trusted repo content). */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false, gfm: true });
}
