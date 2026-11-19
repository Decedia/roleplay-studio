"use client";

import { useMemo } from "react";
import { parseRoleplayText, getSegmentClasses, TextSegment } from "@/lib/text-formatter";
import { CollapsibleTagSection } from "./CollapsibleTagSection";

interface FormattedTextProps {
  content: string;
  /** "story" = Storybook chat look: no asterisks, actions dimmed, speech bright */
  variant?: "default" | "story";
}

const STORY_CLASSES: Partial<Record<TextSegment["type"], string>> = {
  action: "italic text-parchment-muted",
  dialogue: "text-parchment",
  thought: "italic text-parchment-soft",
  bold: "font-semibold text-parchment",
  ooc: "font-sans text-sm text-ember bg-ember/10 px-1.5 py-0.5 rounded",
  narration: "text-parchment-soft",
};

function StoryText({ segments }: { segments: TextSegment[] }) {
  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}`;
        const classes = STORY_CLASSES[segment.type] ?? getSegmentClasses(segment.type);
        switch (segment.type) {
          case "dialogue":
            return (
              <span key={key} className={classes}>
                &ldquo;{segment.content}&rdquo;
              </span>
            );
          case "thought":
            return (
              <span key={key} className={classes}>
                ({segment.content})
              </span>
            );
          case "ooc":
            return (
              <span key={key} className={classes}>
                (({segment.content}))
              </span>
            );
          case "bold":
            return <strong key={key} className={classes}>{segment.content}</strong>;
          case "code":
            return <code key={key} className={classes}>{segment.content}</code>;
          case "codeblock":
            return <pre key={key} className={classes}><code>{segment.content}</code></pre>;
          case "collapsible":
            return (
              <CollapsibleTagSection key={key} tagName={segment.tagName || "tag"} content={segment.content} />
            );
          default:
            return <span key={key} className={classes}>{segment.content}</span>;
        }
      })}
    </span>
  );
}

export function FormattedText({ content, variant = "default" }: FormattedTextProps) {
  const segments = useMemo(() => parseRoleplayText(content), [content]);

  if (variant === "story") return <StoryText segments={segments} />;

  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}`;
        const classes = getSegmentClasses(segment.type);
        
        switch (segment.type) {
          case "action":
            return (
              <span key={key} className={classes}>
                <span className="text-parchment-muted">*</span>
                {segment.content}
                <span className="text-parchment-muted">*</span>
              </span>
            );
          case "dialogue":
            return (
              <span key={key} className={classes}>
                <span className="text-parchment-muted">&ldquo;</span>
                {segment.content}
                <span className="text-parchment-muted">&rdquo;</span>
              </span>
            );
          case "thought":
            return (
              <span key={key} className={classes}>
                <span className="text-parchment-muted">(</span>
                {segment.content}
                <span className="text-parchment-muted">)</span>
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
