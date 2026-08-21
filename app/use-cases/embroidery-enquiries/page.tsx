import { ContentPage } from "@/components/ContentPage";
import { embroideryPage } from "@/lib/seo-pages";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({ title: embroideryPage.title, description: embroideryPage.intro, path: embroideryPage.path });
export default function Page() { return <ContentPage data={embroideryPage} />; }
