import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.crop;
export const metadata: Metadata = createPageMetadata({ title: "Image Cropper — Crop Image Online Free", description: config.description, path: `/tools/${config.slug}` });
export default function CropImagePage() { return <PhotoToolLanding config={config} />; }

