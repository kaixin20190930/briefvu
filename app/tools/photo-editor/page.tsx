import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.all;
export const metadata: Metadata = createPageMetadata({ title: "Browser Photo Editor — Edit Photos Without Uploading", description: config.description, path: `/tools/${config.slug}` });
export default function PhotoEditorPage() { return <PhotoToolLanding config={config} />; }

