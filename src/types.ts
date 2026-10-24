export type Folder = "note" | "plan";

export type Tag = "Personal" | "Work" | "Ideas" | "Important";

export type NoteMode = "simple" | "blocks";

export type BlockType = "text" | "heading" | "todo" | "bullet";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  blocks: Block[];
  mode: NoteMode;
  folder: Folder;
  pinned: boolean;
  tags: Tag[];
  deletedAt: number | null;
  isPrivate: boolean;
  pinHash: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  darkMode: "system" | "dark" | "light";
  view: "grid" | "list";
  sortBy: "updated" | "created" | "title";
}
