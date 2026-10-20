import Link from "next/link";

export function ImageToolBreadcrumbs({ current }: { current: string }) {
  return (
    <nav className="tool-breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">BriefVu</Link>
      <span aria-hidden="true">/</span>
      <Link href="/tools">Image Tools</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}
