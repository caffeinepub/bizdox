export function navigate(path: string): void {
  window.location.hash = `#${path}`;
}

export function getCurrentPath(): string {
  return window.location.hash.slice(1) || "/";
}
