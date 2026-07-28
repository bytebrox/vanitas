import { Fragment, type ElementType } from 'react';
import { Link } from '@/i18n/navigation';

type Segment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; label: string; href: string };

const MARKDOWN_LITE_TOKEN =
  /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\((?:\/[^)\s]*|https?:\/\/[^)\s]+)\))/g;

function parseMarkdownLite(input: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKDOWN_LITE_TOKEN.exec(input)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', value: input.slice(last, match.index) });
    }
    const token = match[0];
    if (token.startsWith('`')) {
      segments.push({ type: 'code', value: token.slice(1, -1) });
    } else if (token.startsWith('**')) {
      segments.push({ type: 'bold', value: token.slice(2, -2) });
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        segments.push({ type: 'link', label: linkMatch[1]!, href: linkMatch[2]! });
      } else {
        segments.push({ type: 'text', value: token });
      }
    }
    last = MARKDOWN_LITE_TOKEN.lastIndex;
  }

  if (last < input.length) {
    segments.push({ type: 'text', value: input.slice(last) });
  }

  return segments;
}

export interface RichTextProps {
  children?: string;
  /** Alias for `children` (FAQ answers). */
  text?: string;
  className?: string;
  codeClassName?: string;
  linkClassName?: string;
  boldClassName?: string;
}

/**
 * Renders markdown-lite: `inline code` and [label](/path) or [label](https://…).
 */
export function RichText({
  children,
  text,
  className,
  codeClassName = 'font-mono text-ink',
  linkClassName = 'text-accent hover:underline',
  boldClassName = 'text-ink font-medium',
}: RichTextProps) {
  const source = text ?? children ?? '';
  const segments = parseMarkdownLite(source);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <Fragment key={i}>{seg.value}</Fragment>;
        }
        if (seg.type === 'code') {
          return (
            <code key={i} className={codeClassName}>
              {seg.value}
            </code>
          );
        }
        if (seg.type === 'bold') {
          return (
            <strong key={i} className={boldClassName}>
              {seg.value}
            </strong>
          );
        }
        if (seg.href.startsWith('http://') || seg.href.startsWith('https://')) {
          return (
            <a
              key={i}
              href={seg.href}
              className={linkClassName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {seg.label}
            </a>
          );
        }
        return (
          <Link key={i} href={seg.href} className={linkClassName}>
            {seg.label}
          </Link>
        );
      })}
    </span>
  );
}

export interface RichParagraphProps {
  text: string;
  as?: ElementType;
  className?: string;
  codeClassName?: string;
  linkClassName?: string;
  boldClassName?: string;
}

export function RichParagraph({
  text,
  as: Tag = 'p',
  className,
  codeClassName,
  linkClassName,
  boldClassName,
}: RichParagraphProps) {
  return (
    <Tag className={className}>
      <RichText
        text={text}
        codeClassName={codeClassName}
        linkClassName={linkClassName}
        boldClassName={boldClassName}
      />
    </Tag>
  );
}
