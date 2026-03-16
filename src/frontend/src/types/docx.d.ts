declare module "docx" {
  export const BorderStyle: Record<string, string>;
  export const HeadingLevel: Record<string, string>;
  export const WidthType: Record<string, string>;
  export class Document {
    constructor(options: any);
  }
  export const Packer: {
    toBlob(doc: Document): Promise<Blob>;
  };
  export class Paragraph {
    constructor(options: any);
  }
  export class Table {
    constructor(options: any);
  }
  export class TableCell {
    constructor(options: any);
  }
  export class TableRow {
    constructor(options: any);
  }
  export class TextRun {
    constructor(options: any);
  }
}
