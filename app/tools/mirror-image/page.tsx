import type { Metadata } from "next";
import { PhotoToolLanding } from "@/components/PhotoToolLanding";
import { photoToolConfigs } from "@/lib/photo-tools";
import { createPageMetadata } from "@/lib/site";

const config = photoToolConfigs.mirror;
export const metadata: Metadata = createPageMetadata({ title: "Mirror Image Online — Flip Photos Free", description: config.description, path: `/tools/${config.slug}` });
export default function MirrorImagePage() { return <PhotoToolLanding config={config}/>; }
