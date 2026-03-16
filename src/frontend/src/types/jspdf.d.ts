declare module "jspdf" {
  export class jsPDF {
    constructor(options?: any);
    setFillColor(r: number, g: number, b: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    setFont(family: string, style?: string): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    text(text: string | string[], x: number, y: number): void;
    addPage(): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    output(type: string): any;
  }
}
