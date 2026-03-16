declare module "xlsx" {
  export const utils: {
    book_new(): any;
    aoa_to_sheet(data: any[][]): any;
    book_append_sheet(wb: any, ws: any, name: string): void;
  };
  export function write(wb: any, options: any): any;
}
