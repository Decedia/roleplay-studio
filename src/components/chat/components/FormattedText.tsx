"use client";

import { useMemo } from "react";
import { parseRoleplayText, getSegmentClasses, TextSegment } from "@/lib/text-formatter";
import { CollapsibleTagSection } from "./CollapsibleTagSection";

interface FormattedTextProps {
  content: string;
}

export function FormattedText({ content }: FormattedTextProps) {
  const segments = useMemo(() => parseRoleplayText(content), [content]);
  
  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}`;
        const classes = getSegmentClasses(segment.type);
        
        switch (segment.type) {
          case "action":
            return (
              <span key={key} className={classes}>
                <span className="text-zinc-500">*</span>
                {segment.content}
                <span className="text-zinc-500">*</span>
              </span>
            );
          case "dialogue":
            return (
              <span key={key} className={classes}>
                <span className="text-zinc-400">&ldquo;</span>
                {segment.content}
                <span className="text-zinc-400">&rdquo;</span>
              </span>
            );
          case "thought":
            return (
              <span key={key} className={classes}>
                <span className="text-zinc-500">(</span>
                {segment.content}
                <span className="text-zinc-500">)</span>
              </span>
            );
          case "ooc":
            return (
              <span key={key} className={classes}>
                <span className="text-amber-500">((</span>
                {segment.content}
                <span className="text-amber-500">))</span>
              </span>
            );
          case "bold":
            return (
              <strong key={key} className={classes}>
                {segment.content}
              </strong>
            );
          case "code":
            return (
              <code key={key} className={classes}>
                {segment.content}
              </code>
            );
          case "codeblock":
            return (
              <pre key={key} className={classes}>
                <code>{segment.content}</code>
              </pre>
            );
          case "collapsible":
            return (
              <CollapsibleTagSection 
                key={key} 
                tagName={segment.tagName || "tag"} 
                content={segment.content} 
              />
            );
          default:
            return (
              <span key={key} className={classes}>
                {segment.content}
              </span>
            );
        }
      })}
    </span>
  );
}
