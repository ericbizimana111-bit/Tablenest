import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Only same-site paths become links; "//host" and absolute URLs stay plain text. */
const isInternal = (href: string) => /^\/(?!\/)/.test(href) && !href.includes('\\');

/** Renders the assistant's light markdown: **bold**, line breaks, lists and [links](/internal). No raw HTML. */
export function RichText({ text }: { text: string }) {
  const inline = (s: string, key: string): ReactNode[] => {
    const out: ReactNode[] = [];
    const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1]) out.push(<strong key={`${key}b${i++}`}>{m[1]}</strong>);
      else if (isInternal(m[3])) {
        out.push(
          <Link key={`${key}l${i++}`} to={m[3]} className="font-semibold text-herb-700 underline decoration-saffron-300 decoration-2 underline-offset-2">
            {m[2]}
          </Link>,
        );
      } else out.push(m[2]);
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const bullet = /^\s*[-*•]\s+/.test(line);
        const content = inline(line.replace(/^\s*[-*•]\s+/, ''), `k${i}`);
        if (!line.trim()) return <div key={i} className="h-2" />;
        return bullet ? (
          <div key={i} className="flex gap-2 pl-1">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-saffron-500" />
            <span>{content}</span>
          </div>
        ) : (
          <p key={i}>{content}</p>
        );
      })}
    </>
  );
}
