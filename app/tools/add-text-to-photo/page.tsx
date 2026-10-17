import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.text;
export const metadata: Metadata = createPageMetadata({ title: "Add Text to Photo Online Free", description: config.description, path: `/tools/${config.slug}` });
export default function AddTextToPhotoPage() { return <PhotoToolLanding config={config} />; }

