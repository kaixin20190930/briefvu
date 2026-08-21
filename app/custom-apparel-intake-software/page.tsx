import { ContentPage } from "@/components/ContentPage";
import { productPage } from "@/lib/seo-pages";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({ title: productPage.title, description: productPage.intro, path: productPage.path });
export default function Page() { return <ContentPage data={productPage} />; }
