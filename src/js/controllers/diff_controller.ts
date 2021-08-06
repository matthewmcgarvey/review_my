import { Controller } from "stimulus";
import { diff_match_patch } from "diff-match-patch";
import he from "he";
import { nextTick } from "process";

// Given an old and new target, calculate the difference and display
// it in the display target.
export default class extends Controller {
  readonly newTarget!: Element;
  readonly oldTarget!: Element;
  readonly displayTarget!: Element;

  static get targets(): Array<string> {
    return ["old", "new", "display"];
  }

  initialize(): void {
    this.calculateAndDisplayDiff();

    this.newTarget.addEventListener("trix-change", () => {
      this.calculateAndDisplayDiff();
    });
  }

  calculateAndDisplayDiff(): void {
    const oldContent = this.cleanInitialHtml(this.oldTarget.innerHTML);
    const newContent = this.cleanInitialHtml(this.newTarget.innerHTML);

    const prettyDiff = this.prettyDiff(oldContent, newContent);
    const sanitizedDiff = this.sanitize(prettyDiff);
    this.displayTarget.innerHTML = this.correctHtmlTagOrder(sanitizedDiff);
  }

  // After our diff-match-patch library creates the diff, sometimes the insert (`ins`) or delete (`del`) tags are placed incorrectly.
  // This method walks the HTML, attempting to correct broken stuff like `</<ins>em>` so that it is `<ins></em>`.
  private correctHtmlTagOrder(html: string): string {
    const regex = new RegExp(/<*([^<>]+)>*/gi);

    let outputStack: string[] = [];
    let incompleteTags: string[] = [];

    html.match(regex)?.forEach((element) => {
      if (this.isGoodHtmlTag(element)) {
        if (element.startsWith("<<")) {
          incompleteTags.push("<");
          element = element.replace("<<", "<");
        }

        if (element.endsWith(">>")) {
          // incompleteTags.push(">");
          element = element.replace(">>", ">");
        }

        outputStack.push(element);
      } else if (this.isBadHtmlTag(element)) {
        if (this.isBadHtmlTagStart(element)) {
          incompleteTags.push(element);
        } else if (this.isBadHtmlTagEnd(element)) {
          const previousBadTag = incompleteTags.pop();

          if (previousBadTag === undefined) {
            return;
          }

          if (this.isBadHtmlTagStart(previousBadTag)) {
            const newElement = `${previousBadTag}${element}`;

            outputStack.push(newElement);
          } else {
            incompleteTags.push(previousBadTag);
            incompleteTags.push(element);
          }
        }
      } else {
        if (element === "br") {
          const previousBadTag = incompleteTags.pop();

          if (previousBadTag !== undefined && previousBadTag === "<") {
            if (previousBadTag === "<") {
              outputStack.push("<br>");
              return;
            } else {
              incompleteTags.push(previousBadTag);
            }
          }
        }
        outputStack.push(element);
      }
    });

    return outputStack.join("");
  }

  private isGoodHtmlTag(tag: string): boolean {
    return /<[^>]+>/i.test(tag);
  }

  private isBadHtmlTag(tag: string): boolean {
    return /<[^>]+>?/i.test(tag) || /<?[^>]+>/i.test(tag);
  }

  private isBadHtmlTagStart(tag: string): boolean {
    return /<\/?/.test(tag);
  }

  private isBadHtmlTagEnd(tag: string): boolean {
    return />/.test(tag);
  }

  // Use the diff-match-patch library to get the diff between two HTML strings.
  private prettyDiff(oldText: string, newText: string): string {
    const differ = new diff_match_patch();

    // Get the main diff, character by character
    const htmlDiff = differ.diff_main(oldText, newText);

    // Make the diff output a bit more readable to a human
    differ.diff_cleanupSemantic(htmlDiff);

    // Take the diff and turn it into valid HTML
    return differ.diff_prettyHtml(htmlDiff);
  }

  // Comments make diffs a pain. Let's kill them.
  // hrefs also makes diffs a pain, so we strip the attribute and keep the `a`
  private cleanInitialHtml(html: string): string {
    let output = html.replace(/<!--\s*block\s*-->/g, "");
    output = output.replace(/<a[^>]+>/g, "<a>");

    return output;
  }

  // Because we're dealing with a Trix editor, <div>s are the only
  // block elements we really run into issues with around <ins> and <del> inline elements.
  // This removes all of the divs, and then wraps them around <br> tags to preserve whitespace.
  private sanitize(html: string): string {
    let returnHtml = he.decode(html);

    // Move newlines from divs to brs, strip comments
    returnHtml = returnHtml.replace(/<\/?div>/g, "");
    returnHtml = returnHtml.replace(/<br>/g, "<span><br></span>");

    // Replace <ins> backgrounds with TailwindCSS colors
    returnHtml = returnHtml.replace(
      /<ins style="background:#.{6};">/g,
      '<ins class="bg-green-200">'
    );

    // Replace <del> backgrounds with TailwindCSS colors
    returnHtml = returnHtml.replace(
      /<del style="background:#.{6};">/g,
      '<del class="bg-red-200">'
    );

    return returnHtml;
  }
}
