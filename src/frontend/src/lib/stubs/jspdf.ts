// Stub for jspdf package - replace with actual package when available
export class jsPDF {
  _opts: any;
  constructor(opts?: any) {
    this._opts = opts;
  }
  setFillColor(_r: number, _g: number, _b: number) {}
  setTextColor(_r: number, _g: number, _b: number) {}
  setFontSize(_size: number) {}
  setFont(_family: string, _style?: string) {}
  rect(_x: number, _y: number, _w: number, _h: number, _style?: string) {}
  text(_text: string | string[], _x: number, _y: number) {}
  addPage() {}
  splitTextToSize(text: string, _maxWidth: number): string[] {
    return [text];
  }
  output(_type: string): Blob {
    return new Blob();
  }
}
