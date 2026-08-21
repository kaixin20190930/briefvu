import { ContentPage } from "@/components/ContentPage";
import { screenPrintingPage } from "@/lib/seo-pages";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({ title: screenPrintingPage.title, description: screenPrintingPage.intro, path: screenPrintingPage.path });
export default function Page() { return <ContentPage data={screenPrintingPage} />; }
