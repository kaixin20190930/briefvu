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
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "text-reverser",
    name: "Text Reverser",
    shortDescription: "Reverse characters, words, individual words, or sentences without breaking emoji.",
    href: "/tools/text-reverser",
    category: "Text",
    status: "available",
    tier: "free",
  },
  {
    slug: "character-remover",
    name: "Character Remover",
    shortDescription: "Remove punctuation, numbers, whitespace, symbols, emoji, or exact characters.",
    href: "/tools/character-remover",
    category: "Text",
    status: "available",
    tier: "free",
  },
  {
    slug: "text-to-lrc",
    name: "Text to LRC Converter",
    shortDescription: "Add timestamps to lyric lines and download a synchronized LRC file.",
    href: "/tools/text-to-lrc",
    category: "Audio & Lyrics",
    status: "available",
    tier: "free",
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    shortDescription: "Convert JPG, PNG, WebP, and AVIF images locally in your browser.",
    href: "/tools/image-converter",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "remove-metadata",
    name: "Metadata Remover",
    shortDescription: "Inspect and remove recognized EXIF, XMP, C2PA, text, and color-profile blocks locally.",
    href: "/tools/remove-metadata",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "sprite-sheet",
    name: "Sprite Sheet Generator",
    shortDescription: "Convert GIF to sprite sheet or sprite sheet to animated GIF in your browser.",
    href: "/tools/sprite-sheet",
    category: "Images",
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
    slug: "mirror-image",
    name: "Mirror Image",
    shortDescription: "Flip an image horizontally or vertically without uploading it.",
    href: "/tools/mirror-image",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "resize-image",
    name: "Resize Image",
    shortDescription: "Change image dimensions by exact pixels or percentage while preserving aspect ratio.",
    href: "/tools/resize-image",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "compress-image",
    name: "Compress Image",
    shortDescription: "Reduce JPG or WebP file size with explicit quality and size comparison.",
    href: "/tools/compress-image",
    category: "Images",
    status: "available",
    tier: "free",
  },
  {
    slug: "invert-image",
    name: "Invert Image",
    shortDescription: "Invert image colors and export a private negative-effect copy.",
    href: "/tools/invert-image",
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
    slug: "rea-mcp-config",
    name: "REA MCP Setup Helper",
    shortDescription: "Generate official REA setup, verification, and troubleshooting commands for your AI coding agent.",
    href: "/tools/rea-mcp-config",
    category: "Developer",
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
