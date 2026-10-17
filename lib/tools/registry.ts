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
  {
    slug: "crop-image",
    name: "Image Cropper",
    shortDescription: "Crop an image with preset or custom aspect ratios without uploading it.",
    href: "/tools/crop-image",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "rotate-image",
    name: "Rotate Image",
    shortDescription: "Rotate or flip a PNG, JPEG, or WebP image directly in your browser.",
    href: "/tools/rotate-image",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "add-text-to-photo",
    name: "Add Text to Photo",
    shortDescription: "Add and position a caption, label, or simple watermark on a photo.",
    href: "/tools/add-text-to-photo",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "photo-editor",
    name: "Photo Editor",
    shortDescription: "Crop, rotate, adjust, and add text to images in one focused editor.",
    href: "/tools/photo-editor",
    category: "Images",
    status: "available",
    tier: "free",
  },
] as const;

export const availableTools = toolRegistry.filter(
  (tool) => tool.status === "available",
);
