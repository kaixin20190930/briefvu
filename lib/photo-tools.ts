export type PhotoToolMode = "crop" | "rotate" | "mirror" | "invert" | "text" | "all";

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
  guideTitle: string;
  guideParagraphs: readonly string[];
  faqs: readonly PhotoToolFaq[];
};

export const photoToolConfigs: Record<PhotoToolMode, PhotoToolConfig> = {
  crop: {
    slug: "crop-image",
    mode: "crop",
    eyebrow: "Free private image cropper",
    title: "Crop Image Online — Free Image Cropper",
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
      ["Profile and avatar images", "Create a centered square crop for a profile photo while keeping the original file untouched. Move the crop until the face or subject has enough space around it, then check the preview before export."],
      ["Social and presentation layouts", "Switch between portrait, landscape, and widescreen ratios without installing an image editor. A preset ratio keeps a group of images visually consistent even when their original dimensions differ."],
      ["Remove unwanted edges", "Trim excess background, screenshot controls, or scanned margins before sharing or placing the image in a document. Cropping changes the visible frame without modifying the source file on your device."],
    ],
    guideTitle: "Choose the Right Crop and Output Format",
    guideParagraphs: [
      "Start with the destination rather than guessing at the crop. A square works well for many avatars, a portrait frame emphasizes a person or product, and a landscape or widescreen crop fits slides and horizontal layouts. Custom mode is useful when a preset would remove an important detail. Keep the subject away from the very edge so small differences in how another app displays the image do not cut it off.",
      "Cropping removes the pixels outside your selection; it does not enlarge the remaining area. A very small crop from a large photo can therefore look soft when displayed at a large size. Check the output dimensions shown in the editor before downloading, and return to the original if you need a wider frame or more resolution.",
      "Choose PNG when you need transparency or crisp interface graphics. JPEG is usually smaller for photographs but uses lossy compression. WebP often provides a useful balance between quality and file size for modern websites. The image cropper exports a new file, so you can compare formats without changing the original.",
    ],
    faqs: [
      { question: "How do I crop an image online?", answer: "Open the image in the editor, choose an aspect ratio or Custom, adjust the crop size, and drag the highlighted crop area to the part you want to keep. Select an output format and download the result. BriefVu creates a new file and does not overwrite the original image." },
      { question: "Can I crop an image to a specific aspect ratio?", answer: "Yes. The image cropper includes square, portrait, landscape, and widescreen presets. Custom mode lets you adjust the crop freely. The dimensions shown below the preview update with the selected crop so you can check the expected output before downloading." },
      { question: "Does cropping reduce image quality?", answer: "Cropping removes pixels outside the selected area but does not need to resize the pixels you keep. JPEG export can introduce normal lossy compression, while PNG is lossless and WebP balances file size and quality. Choose PNG for graphics or transparency and JPEG for photographs when a smaller file matters." },
      { question: "What is the difference between cropping and resizing?", answer: "Cropping changes the frame by removing pixels outside a selected area. Resizing changes the width and height of the entire remaining image. BriefVu's image cropper focuses on selecting the part you want to keep and shows the resulting pixel dimensions before export; it does not stretch the crop to a different size." },
      { question: "Can I use the image cropper on a phone?", answer: "Yes, in a modern mobile browser. Open a photo, choose a ratio, drag the crop area, and export the result. Very large camera files may use substantial device memory, so the editor limits inputs to 25 MB and 24 megapixels to keep the page responsive." },
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
    guideTitle: "Rotation, Flipping, and Photo Orientation",
    guideParagraphs: [
      "Rotate left or right when the whole image is sideways. Each action turns the visible pixels by 90 degrees, while a 180-degree correction can be made with two turns. Use the live preview to confirm that text, faces, and the horizon are upright before downloading the new file.",
      "Flipping is different from rotating. A horizontal flip creates a left-to-right mirror image, while a vertical flip swaps the top and bottom. Mirroring can help test a composition or reverse the direction of a visual, but it will also reverse readable text and logos, so inspect those details before export.",
      "Phone cameras may record orientation as metadata instead of physically rotating the stored pixels. Some apps respect that metadata and others do not. Exporting the corrected preview creates a new image with the visible orientation applied, which is often more dependable when moving the file between apps.",
    ],
    faqs: [
      { question: "How do I rotate an image online?", answer: "Open the image, then select Rotate left or Rotate right. Each click turns the picture by 90 degrees and updates the preview. When the orientation is correct, choose an output format and download a new copy." },
      { question: "Can I flip an image horizontally or vertically?", answer: "Yes. Horizontal flip mirrors the image from left to right, while vertical flip mirrors it from top to bottom. You can combine a flip with 90-degree rotations, and Reset orientation returns the image to its original direction." },
      { question: "Why does my phone photo appear sideways?", answer: "Some cameras store the sensor pixels in one direction and save orientation separately as metadata. An app that ignores or removes that metadata can show the photo sideways. Rotating and exporting the pixels creates a new file with the visible orientation applied." },
      { question: "Will rotating an image change its dimensions?", answer: "A 90-degree rotation swaps the image width and height, while a 180-degree rotation keeps them in the same order. The editor does not resize the pixels during rotation. The selected export format can still affect file size and, for JPEG or WebP, compression quality." },
      { question: "Can I rotate and flip the same image?", answer: "Yes. You can combine left or right rotation with a horizontal or vertical flip and inspect the result in the shared preview. If the combination is not right, Reset orientation returns to the image's original direction before you export." },
      { question: "Does BriefVu store the image I rotate?", answer: "No. The editor uses browser image and canvas features on your device. BriefVu does not receive or store the image. The current file and edits disappear when you refresh or close the page." },
    ],
  },
  mirror: {
    slug: "mirror-image",
    mode: "mirror",
    eyebrow: "Free private mirror image tool",
    title: "Mirror Image Online",
    description: "Mirror an image horizontally or vertically in your browser. Preview the flip and export PNG, JPEG, or WebP with no upload or account.",
    hero: "Create a left-to-right or top-to-bottom mirror image with the same private editor used by BriefVu’s rotation tool.",
    introLabel: "Mirror image",
    introTitle: "Flip an Image Without Uploading It",
    intro: "Open a local PNG, JPEG, or WebP image, choose horizontal or vertical flip, check text and directional details in the preview, then export a new copy. The original file stays unchanged.",
    steps: [
      ["Open an image", "Choose, drag, or paste a PNG, JPEG, or WebP file. The browser decodes it locally."],
      ["Choose a mirror direction", "Flip horizontally for a left-to-right mirror or vertically to exchange the top and bottom."],
      ["Download a new copy", "Check text, logos, and visual direction, then export PNG, JPEG, or WebP."],
    ],
    useCasesTitle: "When to Mirror an Image",
    useCases: [
      ["Reverse visual direction", "Turn a subject or arrow toward the opposite side of a layout while preserving the image dimensions."],
      ["Check a composition", "View a mirrored reference to spot balance, spacing, or drawing issues that are easy to miss in the original orientation."],
      ["Create symmetrical assets", "Make an opposite-facing game sprite, decoration, or layout element from a source image you have permission to edit."],
    ],
    guideTitle: "Horizontal Flip, Vertical Flip, and Rotation",
    guideParagraphs: [
      "A horizontal flip creates the familiar mirror effect by exchanging the left and right sides. It also reverses readable text, logos, signs, and handed details, so check those areas before downloading.",
      "A vertical flip exchanges the top and bottom. It is useful for reflections, patterns, and certain graphics, but it is not the same as rotating the image by 180 degrees. Combine rotation and flipping only when the preview shows the intended orientation.",
      "The output keeps the visible pixel dimensions unless a 90-degree rotation is also applied. PNG preserves transparency, JPEG is common for photographs, and WebP can provide smaller modern web assets.",
    ],
    faqs: [
      { question: "How do I mirror an image online?", answer: "Open the image and choose Flip horizontal for a left-to-right mirror. Use Flip vertical when you need to exchange the top and bottom. Preview the result, choose an output format, and download a new copy." },
      { question: "Is mirroring the same as rotating?", answer: "No. Mirroring reverses pixels across an axis, while rotation turns the entire frame. A 180-degree rotation does not produce the same result as a horizontal mirror." },
      { question: "Will text be reversed?", answer: "Yes. A horizontal mirror reverses text and logos just like a physical mirror. Inspect readable details before exporting and use rotation instead if the text must stay readable." },
      { question: "Can I mirror a transparent PNG?", answer: "Yes. Open the PNG, apply the flip, and export PNG to preserve transparency. Choosing JPEG replaces transparency because JPG has no alpha channel." },
      { question: "Is my image uploaded?", answer: "No. BriefVu reads, flips, previews, and exports the image in your browser. The image file is not sent to BriefVu storage." },
    ],
  },
  invert: {
    slug: "invert-image",
    mode: "invert",
    eyebrow: "Free private image inverter",
    title: "Invert Image Colors Online",
    description: "Invert image colors online in your browser. Preview the negative effect, preserve transparency, and export PNG, JPEG, or WebP with no upload.",
    hero: "Create a color negative with one switch, preview the result, and export a new image without uploading the source.",
    introLabel: "Invert colors",
    introTitle: "Turn Image Colors Into Their Opposites",
    intro: "Color inversion maps every red, green, and blue channel to its opposite value while leaving the alpha channel intact. Use the adjustment panel to switch inversion on or off before export.",
    steps: [["Open an image", "Choose, drag, or paste a PNG, JPEG, or WebP file."], ["Invert the colors", "Choose Invert image colors and inspect the negative effect in the shared preview."], ["Export a copy", "Download PNG, JPEG, or WebP while keeping the original file unchanged."]],
    useCasesTitle: "Common Reasons to Invert Image Colors",
    useCases: [["Create a negative effect", "Reverse the RGB values for a photographic negative or high-contrast visual treatment."], ["Inspect light and dark structure", "Temporarily invert a drawing, scan, or interface capture to inspect edges and tonal balance."], ["Prepare alternate graphics", "Generate an opposite-color reference before making more deliberate brand or accessibility adjustments elsewhere."]],
    guideTitle: "What Image Color Inversion Changes",
    guideParagraphs: ["Inversion transforms each RGB channel so dark values become light and complementary colors replace the originals. It is a mathematical color effect, not automatic enhancement or color correction.", "Transparent PNG pixels keep their alpha transparency, although the RGB values of visible and partially visible pixels are inverted. Export PNG when transparency must remain.", "JPEG cannot preserve transparency and uses lossy compression. Choose PNG for graphics and WebP or JPEG when a smaller photographic output is more important."],
    faqs: [{ question: "How do I invert image colors online?", answer: "Open the image, select Invert image colors in the Adjust panel, inspect the preview, and download a new PNG, JPEG, or WebP copy." }, { question: "Is invert the same as black and white?", answer: "No. Inversion maps every RGB value to its opposite. Grayscale removes color information and keeps only tonal brightness." }, { question: "Does inversion preserve transparency?", answer: "The editor preserves alpha transparency in the canvas. Export PNG or WebP to retain it; JPG has no transparency." }, { question: "Is my image uploaded?", answer: "No. The image is decoded, inverted, previewed, and exported in your browser." }],
  },
  text: {
    slug: "add-text-to-photo",
    mode: "text",
    eyebrow: "Free private text overlay tool",
    title: "Add Text to Photo Online Free",
    description: "Add text to a photo online, choose color, size and position, then export PNG, JPEG, or WebP. No upload, account, or install required.",
    hero: "Add a caption, label, title, or watermark to a local image. Click the preview to position the text, then download a new file.",
    introLabel: "Text on image",
    introTitle: "Write on a Photo Without Installing an App",
    intro: "Use this free online tool to enter text, choose its size and color, and place it directly on the photo preview. A contrasting outline keeps the words readable across light and dark parts of the image, and the finished file is created locally in your browser.",
    steps: [
      ["Open a photo", "Choose, drag, or paste the image you want to label. The source stays on your device."],
      ["Style and position text", "Enter a short caption, set its size and color, then click or tap the preview to move it."],
      ["Download the image", "Export a flattened PNG, JPEG, or WebP copy with the text permanently rendered into it."],
    ],
    useCasesTitle: "Simple Reasons to Add Text to a Photo",
    useCases: [
      ["Captions and announcements", "Add a short title, date, location, or callout before sharing an image or placing it in a post. Keep the message concise so it remains readable when the image is displayed at a smaller size."],
      ["Labels and instructions", "Mark a screenshot, product photo, or reference image with a clear label that remains part of the exported file. Position the text near the relevant subject without covering an important detail."],
      ["Lightweight watermarking", "Place a name or source note on an image and export it as part of the pixels. This is a visible label for attribution, not copy protection or access control, and it can still be cropped or edited."],
    ],
    guideTitle: "Make Text Easy to Read on a Photo",
    guideParagraphs: [
      "Write for the final display size. A short caption in a larger font is usually easier to read than a full paragraph placed over an image. Before exporting, zoom out or view the whole preview and make sure the text still works when the photo is shown in a post, message, or presentation.",
      "Choose a color that contrasts with the area behind the words. The editor adds an opposing outline to improve separation across mixed light and dark regions, but placement still matters. Open sky, a plain wall, or another quiet part of the photo usually produces a clearer result than a detailed face or patterned background.",
      "Click or tap the preview to move the text, then export a new flattened copy. PNG is useful for sharp graphics, JPEG is common for photographs, and WebP can reduce file size for web use. The original remains unchanged, so keep it if you may need to revise the wording or position later.",
    ],
    faqs: [
      { question: "How do I add text to a photo online?", answer: "Open a photo, type the caption in the Text panel, then choose its color and size. Click or tap the preview where you want the text to appear. Export the finished image as PNG, JPEG, or WebP." },
      { question: "Can I move the text on the image?", answer: "Yes. Click or tap any point in the preview to move the text baseline to that location. The editor keeps the text inside the canvas as closely as possible, and you can reposition it before downloading." },
      { question: "Can I add a watermark to a photo?", answer: "You can add a simple visible name or source label. The text is flattened into the downloaded image, but it is not a secure ownership system and can still be cropped or edited. Keep an original copy and use formal licensing information when ownership matters." },
      { question: "Does BriefVu add its own watermark?", answer: "No. BriefVu does not add a logo or watermark to the exported image. Only the text you enter is rendered onto the downloaded copy. The tool is free to use and does not require an account." },
      { question: "How can I make text readable over a busy photo?", answer: "Use a short message, choose a strong contrast, and place it over a quieter part of the image. The editor automatically draws a contrasting outline around the text, which helps when the background contains both light and dark areas. Check the full preview before export." },
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
    guideTitle: "Use the Smallest Editor That Fits the Job",
    guideParagraphs: [
      "This workspace combines the most common flat-image changes without trying to reproduce a desktop design application. Use it when you need to crop a frame, correct orientation, add one text overlay, or make a basic tonal adjustment and then export a finished copy.",
      "The focused Crop Image, Rotate Image, and Add Text to Photo pages open the same editor with only the relevant controls visible. They are useful when you want a shorter workflow. This combined page is better when a single image needs more than one of those changes before download.",
      "For layered compositions, masks, PSD files, or repeated design work, open PhotoCraft Online instead. Choosing the smaller tool for a simple task reduces setup and keeps the controls easier to scan, while the larger editor remains available for work that genuinely needs it.",
    ],
    faqs: [
      { question: "What can I do with this online photo editor?", answer: "You can crop an image, rotate or flip it, add one text overlay, and adjust brightness, contrast, and saturation. The editor exports a flattened PNG, JPEG, or WebP file. It is intentionally smaller than a full layer-based application." },
      { question: "What image formats can I open and export?", answer: "The editor is designed and tested for PNG, JPEG, and WebP input in modern browsers, and it exports those same three formats. Browser support can vary for other image types, so convert an unusual file to PNG or JPEG before editing." },
      { question: "Is this the same as PhotoCraft Online?", answer: "No. This editor focuses on quick crop, rotate, text, and adjustment tasks. PhotoCraft Online is a larger open-source application for layers, masks, PSD files, and more advanced workflows. Choose the smallest tool that fits the job." },
      { question: "Can I combine several edits before downloading?", answer: "Yes. Crop the image, rotate or flip it, add a text overlay, and adjust brightness, contrast, or saturation in the same session. The preview combines the active changes, and the exported file is a flattened copy of that result." },
      { question: "Does the editor overwrite my original photo?", answer: "No. The browser reads the selected file and exports a separate PNG, JPEG, or WebP copy. Your original file remains unchanged on the device. Give the downloaded copy a clear name if you want to keep several versions." },
      { question: "Are my photos private?", answer: "The image is decoded, edited, and exported locally in your browser. BriefVu does not provide an image upload API or cloud storage for this tool. Normal website requests still load the page code, but they do not include your image file." },
    ],
  },
};

