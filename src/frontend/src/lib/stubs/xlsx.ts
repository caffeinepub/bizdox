// Stub for xlsx package - replace with actual package when available
export const utils = {
  book_new: () => ({}),
  aoa_to_sheet: (_data: any[][]): any => ({ "!cols": [] }),
  book_append_sheet: (_wb: any, _ws: any, _name: string) => {},
};
export function write(_wb: any, _options: any): ArrayBuffer {
  return new ArrayBuffer(0);
}
