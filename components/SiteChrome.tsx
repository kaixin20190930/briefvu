import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="BriefVu home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span>BriefVu</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/guides">Learn</Link>
        <Link className="header-tool-link" href="/tools">Browse tools <ArrowRight size={15} /></Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true"><span /></span><span>BriefVu</span>
      </Link>
      <p>Private image tools, right in your browser.</p>
      <nav aria-label="Footer navigation">
        <Link href="/tools">Tools</Link>
        <Link href="/guides">Learn</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
      <span>© 2026 BriefVu</span>
    </footer>
  );
}
