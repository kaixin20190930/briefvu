import { photocraftRuntimeReady } from "../photocraft";
import { wordcraftRuntimeReady } from "../wordcraft";

export type ToolStatus = "available" | "coming-soon";
export type ToolTier = "free" | "pro";

export type ToolRegistryEntry = {
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
  category: string;
  status: ToolStatus;
  tier: ToolTier;
};

export const toolRegistry: readonly ToolRegistryEntry[] = [
  {
    slug: "invisible-text",
    name: "Invisible Text Generator",
    shortDescription: "Generate, copy and paste invisible text, then verify which Unicode characters survived.",
    href: "/tools/invisible-text",
    category: "Text",
    status: "available",
    tier: "free",
  },
  {
    slug: "image-color-picker",
    name: "Image Color Picker",
    shortDescription: "Pick exact HEX, RGB and HSL colors from any image or screenshot.",
    href: "/tools/image-color-picker",
    category: "Color",
    status: "available",
    tier: "free",
  },
  {
    slug: "wordcraft-online",
    name: "WordCraft Online",
    shortDescription: "Open and edit Word documents with an open-source browser word processor.",
    href: "/tools/wordcraft-online",
    category: "Documents",
    status: wordcraftRuntimeReady ? "available" : "coming-soon",
    tier: "free",
  },
  {
    slug: "photocraft-online",
    name: "PhotoCraft Online",
    shortDescription: "Edit images with layers, masks, adjustments, and PSD support in your browser.",
    href: "/tools/photocraft-online",
    category: "Images",
    status: photocraftRuntimeReady ? "available" : "coming-soon",
    tier: "free",
  },
] as const;

export const availableTools = toolRegistry.filter(
  (tool) => tool.status === "available",
);
