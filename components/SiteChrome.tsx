import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Briefvu home">
        <span className="brand-mark"><span /></span>
        <span>briefvu</span>
        <em>Beta</em>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/custom-apparel-intake-software">Product</Link>
        <Link href="/use-cases/screen-printing-enquiries">Use cases</Link>
        <Link href="/examples">Examples</Link>
        <Link href="/guides/custom-apparel-quote-intake-checklist">Guide</Link>
        <Link className="pilot-link" href="/#pilot">Early shop plan <ArrowUpRight size={14} /></Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="brand" href="/">
        <span className="brand-mark"><span /></span><span>briefvu</span>
      </Link>
      <p>Intake clarity for busy apparel shops.</p>
      <nav aria-label="Footer navigation">
        <Link href="/custom-apparel-intake-software">Product</Link>
        <Link href="/use-cases/embroidery-enquiries">Embroidery</Link>
        <Link href="/examples">Examples</Link>
      </nav>
      <span>© 2026 Briefvu</span>
    </footer>
  );
}
