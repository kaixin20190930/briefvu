import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.invert;
export const metadata: Metadata = createPageMetadata({ title: "Invert Image Colors Online — Free Negative Tool", description: config.description, path: `/tools/${config.slug}` });
export default function InvertImagePage() { return <PhotoToolLanding config={config}/>; }
