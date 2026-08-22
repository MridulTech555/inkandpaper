import {
  blockHeadingLevel,
  blockText,
  slugifyHeading,
} from "@/lib/services/articles";
import {
  ArticleBody,
  ArticleHeading,
  ArticleQuote,
  Code,
} from "@/components/ui/typography";

export interface ArticleContentBlock {
  id: string;
  type: string;
  position: number;
  content: unknown;
}

export function ArticleContent({ blocks }: { blocks: ArticleContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => {
        const text = blockText(block.content);
        if (!text) return null;

        switch (block.type) {
          case "HEADING": {
            const level = blockHeadingLevel(block.content);
            return (
              <ArticleHeading
                key={block.id}
                id={slugifyHeading(text)}
                className={level >= 3 ? "text-xl" : undefined}
              >
                {text}
              </ArticleHeading>
            );
          }
          case "QUOTE":
            return <ArticleQuote key={block.id}>{text}</ArticleQuote>;
          case "CODE":
            return (
              <pre
                key={block.id}
                className="bg-surface overflow-x-auto rounded-md p-4"
              >
                <Code className="bg-transparent p-0">{text}</Code>
              </pre>
            );
          default:
            return <ArticleBody key={block.id}>{text}</ArticleBody>;
        }
      })}
    </div>
  );
}
