export type CommandCategory =
  | "navigation"
  | "search"
  | "action";

export type Command = {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  keywords?: string[];
  href?: string;
  action?: () => void;
  permission?: string;
};
