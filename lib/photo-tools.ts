export type PhotoToolMode = "crop" | "rotate" | "text" | "all";

export type PhotoToolFaq = {
  question: string;
  answer: string;
};

export type PhotoToolConfig = {
  slug: string;
  mode: PhotoToolMode;
  eyebrow: string;
  title: string;
  description: string;
  hero: string;
  introLabel: string;
  introTitle: string;
  intro: string;
  steps: readonly [string, string][];
  useCasesTitle: string;
  useCases: readonly [string, string][];
  faqs: readonly PhotoToolFaq[];
};

export const photoToolConfigs: Record<PhotoToolMode, PhotoToolConfig> = {
  crop: {
    slug: "crop-image",
    mode: "crop",
    eyebrow: "Free private image cropper",
    title: "Crop Image Online",
    description: "Crop images online for free with preset aspect ratios or a custom crop area. Your PNG, JPEG, or WebP image stays in your browser.",
    hero: "Use this image cropper to trim unwanted edges, change an aspect ratio, or frame the important part of a photo. Nothing is uploaded to BriefVu.",
    introLabel: "Image cropper",
    introTitle: "Crop an Image Without Uploading It",
    intro: "Choose a photo, select a square, portrait, landscape, or custom crop, then export the result. The editor shows the crop before download and preserves the original file on your device.",
    steps: [
      ["Open an image", "Choose a PNG, JPEG, or WebP file, drag it into the editor, or paste an image from your clipboard."],
      ["Set the crop", "Pick an aspect ratio, adjust the crop size, and drag the highlighted area over the part you want to keep."],
      ["Download the result", "Choose PNG, JPEG, or WebP and export a new file. Your original image is not changed."],
    ],
    useCasesTitle: "Common Ways to Use an Online Image Cropper",
    useCases: [
      ["Profile and avatar images", "Create a centered square crop for a profile photo while keeping the original file untouched."],
      ["Social and presentation layouts", "Switch between portrait, landscape, and widescreen ratios without installing an image editor."],
      ["Remove unwanted edges", "Trim excess background, screenshots, or scanned margins before sharing or placing the image in a document."],
    ],
    faqs: [
      { question: "How do I crop an image online?", answer: "Open the image in the editor, choose an aspect ratio or Custom, adjust the crop size, and drag the highlighted crop area to the part you want to keep. Select an output format and download the result. BriefVu creates a new file and does not overwrite the original image." },
      { question: "Can I crop an image to a specific aspect ratio?", answer: "Yes. The image cropper includes square, portrait, landscape, and widescreen presets. Custom mode lets you adjust the crop freely. The dimensions shown below the preview update with the selected crop so you can check the expected output before downloading." },
      { question: "Does cropping reduce image quality?", answer: "Cropping removes pixels outside the selected area but does not need to resize the pixels you keep. JPEG export can introduce normal lossy compression, while PNG is lossless and WebP balances file size and quality. Choose PNG for graphics or transparency and JPEG for photographs when a smaller file matters." },
      { question: "Is my image uploaded to BriefVu?", answer: "No. The file is decoded, edited, and exported locally by your browser. BriefVu does not provide an upload endpoint or cloud storage for this editor. Refreshing or closing the page clears the current editing session, so download the result before leaving." },
    ],
  },
  rotate: {
    slug: "rotate-image",
    mode: "rotate",
    eyebrow: "Free private image rotator",
    title: "Rotate Image Online",
    description: "Rotate an image left or right, flip it horizontally or vertically, and download a new PNG, JPEG, or WebP file in your browser.",
    hero: "Fix a sideways photo or mirror an image without installing software. Rotation and export happen locally in your browser.",
    introLabel: "Image rotation",
    introTitle: "Rotate or Flip a Photo in Seconds",
    intro: "Turn an image 90 degrees left or right, rotate it 180 degrees, or flip it across either axis. The preview updates immediately so you can verify the orientation before exporting.",
    steps: [
      ["Open an image", "Choose, drag, or paste a PNG, JPEG, or WebP image into the private browser editor."],
      ["Rotate or flip", "Use the left, right, horizontal flip, or vertical flip controls and check the live preview."],
      ["Export a copy", "Download the corrected image as PNG, JPEG, or WebP without changing your original file."],
    ],
    useCasesTitle: "When to Rotate or Flip an Image",
    useCases: [
      ["Correct phone orientation", "Turn a photo that opens sideways after it has been copied, exported, or stripped of orientation metadata."],
      ["Mirror a composition", "Flip an image horizontally to test a layout, reverse a visual direction, or create a mirrored reference."],
      ["Prepare documents", "Rotate scans, receipts, diagrams, and screenshots before adding them to a report or presentation."],
    ],
    faqs: [
      { question: "How do I rotate an image online?", answer: "Open the image, then select Rotate left or Rotate right. Each click turns the picture by 90 degrees and updates the preview. When the orientation is correct, choose an output format and download a new copy." },
      { question: "Can I flip an image horizontally or vertically?", answer: "Yes. Horizontal flip mirrors the image from left to right, while vertical flip mirrors it from top to bottom. You can combine a flip with 90-degree rotations, and Reset orientation returns the image to its original direction." },
      { question: "Why does my phone photo appear sideways?", answer: "Some cameras store the sensor pixels in one direction and save orientation separately as metadata. An app that ignores or removes that metadata can show the photo sideways. Rotating and exporting the pixels creates a new file with the visible orientation applied." },
      { question: "Does BriefVu store the image I rotate?", answer: "No. The editor uses browser image and canvas features on your device. BriefVu does not receive or store the image. The current file and edits disappear when you refresh or close the page." },
    ],
  },
  text: {
    slug: "add-text-to-photo",
    mode: "text",
    eyebrow: "Free private text overlay tool",
    title: "Add Text to Photo Online",
    description: "Add text to a photo online, choose color, size and position, then export PNG, JPEG, or WebP. No upload, account, or install required.",
    hero: "Add a caption, label, title, or watermark to a local image. Click the preview to position the text, then download a new file.",
    introLabel: "Text on image",
    introTitle: "Write on a Photo Without Installing an App",
    intro: "Enter the text, choose its size and color, and place it directly on the preview. A contrasting outline keeps the words readable across light and dark parts of the image.",
    steps: [
      ["Open a photo", "Choose, drag, or paste the image you want to label. The source stays on your device."],
      ["Style and position text", "Enter a short caption, set its size and color, then click or tap the preview to move it."],
      ["Download the image", "Export a flattened PNG, JPEG, or WebP copy with the text permanently rendered into it."],
    ],
    useCasesTitle: "Simple Reasons to Add Text to a Photo",
    useCases: [
      ["Captions and announcements", "Add a short title, date, location, or callout before sharing an image or placing it in a post."],
      ["Labels and instructions", "Mark a screenshot, product photo, or reference image with a clear label that remains part of the exported file."],
      ["Lightweight watermarking", "Place a name or source note on an image. This is a visual label, not copy protection or access control."],
    ],
    faqs: [
      { question: "How do I add text to a photo online?", answer: "Open a photo, type the caption in the Text panel, then choose its color and size. Click or tap the preview where you want the text to appear. Export the finished image as PNG, JPEG, or WebP." },
      { question: "Can I move the text on the image?", answer: "Yes. Click or tap any point in the preview to move the text baseline to that location. The editor keeps the text inside the canvas as closely as possible, and you can reposition it before downloading." },
      { question: "Can I add a watermark to a photo?", answer: "You can add a simple visible name or source label. The text is flattened into the downloaded image, but it is not a secure ownership system and can still be cropped or edited. Keep an original copy and use formal licensing information when ownership matters." },
      { question: "Is the photo sent to a server?", answer: "No. The browser reads the local file and draws both the image and text on a canvas on your device. BriefVu does not upload or store the photo, and the session clears when the page is refreshed or closed." },
    ],
  },
  all: {
    slug: "photo-editor",
    mode: "all",
    eyebrow: "Free lightweight photo editor",
    title: "Photo Editor Online",
    description: "Crop, rotate, flip, adjust, and add text to images in a private browser photo editor. Export PNG, JPEG, or WebP with no upload or account.",
    hero: "Make common photo edits in one focused workspace. Your source image stays on your device and the editor runs without an account.",
    introLabel: "Quick photo edits",
    introTitle: "One Browser Editor for Everyday Image Tasks",
    intro: "Crop a photo, correct its orientation, add a label, or make basic brightness, contrast, and saturation adjustments. This tool is for fast flat-image edits; use PhotoCraft Online when you need layers, masks, or PSD workflows.",
    steps: [
      ["Open a local image", "Choose, drag, or paste a PNG, JPEG, or WebP image. BriefVu does not upload it."],
      ["Make the edit", "Switch between Crop, Rotate, Text, and Adjust controls while checking the shared preview."],
      ["Export a new copy", "Choose a standard output format and download the edited image while keeping the original intact."],
    ],
    useCasesTitle: "A Focused Editor for Quick Photo Changes",
    useCases: [
      ["Prepare an image for publishing", "Crop the frame, correct orientation, and make a small tonal adjustment before using the image online."],
      ["Create a labelled visual", "Add a title or short note to a screenshot, reference photo, announcement, or presentation asset."],
      ["Avoid a heavy desktop workflow", "Complete a straightforward flat-image edit without creating an account or opening a full layer-based editor."],
    ],
    faqs: [
      { question: "What can I do with this online photo editor?", answer: "You can crop an image, rotate or flip it, add one text overlay, and adjust brightness, contrast, and saturation. The editor exports a flattened PNG, JPEG, or WebP file. It is intentionally smaller than a full layer-based application." },
      { question: "What image formats can I open and export?", answer: "The editor is designed and tested for PNG, JPEG, and WebP input in modern browsers, and it exports those same three formats. Browser support can vary for other image types, so convert an unusual file to PNG or JPEG before editing." },
      { question: "Is this the same as PhotoCraft Online?", answer: "No. This editor focuses on quick crop, rotate, text, and adjustment tasks. PhotoCraft Online is a larger open-source application for layers, masks, PSD files, and more advanced workflows. Choose the smallest tool that fits the job." },
      { question: "Are my photos private?", answer: "The image is decoded, edited, and exported locally in your browser. BriefVu does not provide an image upload API or cloud storage for this tool. Normal website requests still load the page code, but they do not include your image file." },
    ],
  },
};

