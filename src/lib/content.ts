export type Status = 'draft' | 'in-review' | 'published';

export interface PublishableData {
  status: Status;
}

export function isPublished(data: PublishableData): boolean {
  return data.status === 'published';
}

/** The publication gate: production builds only ever see published entries. */
export function isVisible(data: PublishableData, showDrafts: boolean): boolean {
  return showDrafts || isPublished(data);
}

export function wordCount(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}
