import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.rotate;
export const metadata: Metadata = createPageMetadata({ title: "Rotate Image Online — Flip Photos Free", description: config.description, path: `/tools/${config.slug}` });
export default function RotateImagePage() { return <PhotoToolLanding config={config} />; }

