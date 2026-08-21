import { ContentPage } from "@/components/ContentPage";
import { checklistPage } from "@/lib/seo-pages";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({ title: checklistPage.title, description: checklistPage.intro, path: checklistPage.path });
export default function Page() { return <ContentPage data={checklistPage} />; }
