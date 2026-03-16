// Stub for docx package - replace with actual package when available
export const BorderStyle = { SINGLE: "SINGLE" };
export const HeadingLevel = { HEADING_1: "Heading1" };
export const WidthType = { PERCENTAGE: "pct" };
export class Document {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
export const Packer = {
  toBlob: async (_doc: any): Promise<Blob> => new Blob(),
};
export class Paragraph {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
export class Table {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
export class TableCell {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
export class TableRow {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
export class TextRun {
  _opts: any;
  constructor(opts: any) {
    this._opts = opts;
  }
}
