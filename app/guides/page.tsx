import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Image Tool Guides & Practical Tutorials",
  description: "Learn about photo metadata, image formats, sprite sheets, and the practical workflows behind BriefVu browser tools.",
  path: "/guides",
});

export default function GuidesPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
    ],
  };

  return <main className="content-shell guides-index">
    <JsonLd data={breadcrumbs} />
    <section className="page-hero compact">
      <span className="section-label">Learn with BriefVu</span>
      <h1>Image Tool Guides &amp; Practical Tutorials</h1>
      <p>Understand the file, format, and workflow behind each tool before you change an image.</p>
    </section>
    <section className="guide-directory" aria-label="Available guides">
      <article>
        <div><span>Web images</span><time dateTime="2026-10-20">Updated October 20, 2026</time></div>
        <h2>How to Prepare Images for the Web</h2>
        <p>Crop, resize, choose the final format, compress once, inspect metadata, and verify the image in its real publishing context.</p>
        <Link href="/guides/prepare-images-for-web">Read guide <ArrowRight size={16} /></Link>
      </article>
      <article>
        <div><span>Image privacy</span><time dateTime="2026-10-20">Updated October 20, 2026</time></div>
        <h2>What Is Photo Metadata?</h2>
        <p>Understand EXIF, GPS, XMP, ICC profiles, C2PA Content Credentials, and what a metadata cleaner can and cannot remove.</p>
        <Link href="/guides/what-is-photo-metadata">Read guide <ArrowRight size={16} /></Link>
      </article>
      <article>
        <div><span>Game assets</span><time dateTime="2026-10-20">Updated October 20, 2026</time></div>
        <h2>Sprite Sheet Guide for Game Development</h2>
        <p>Choose a grid, preserve frame order and timing, then import a sprite sheet into Unity, Godot, or Phaser.</p>
        <Link href="/guides/sprite-sheet-game-development">Read guide <ArrowRight size={16} /></Link>
      </article>
      <article>
        <div><span>Image formats</span><time dateTime="2026-10-20">Updated October 20, 2026</time></div>
        <h2>JPG vs PNG vs WebP</h2>
        <p>Compare photo compression, transparency, animation, editing quality, metadata, and common browser workflows.</p>
        <Link href="/guides/image-formats-jpg-png-webp">Read guide <ArrowRight size={16} /></Link>
      </article>
      <article>
        <div><span>Developer tools</span><time dateTime="2026-10-18">Updated October 18, 2026</time></div>
        <h2>REA + Claude Code Setup</h2>
        <p>Install REA with its current guided setup, verify the MCP connection, prepare the right analysis engine, and run a first authorized investigation.</p>
        <Link href="/guides/rea-claude-code">Read guide <ArrowRight size={16} /></Link>
      </article>
    </section>
  </main>;
}
