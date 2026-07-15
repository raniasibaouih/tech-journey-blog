import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell home-shell">
      <section className="hero-card">
        <p className="eyebrow">A polished checkers experience</p>
        <h1>Play modern checkers with classic rules, elegant visuals, and both single-player and two-player modes.</h1>
        <p>
          The board is fully interactive, supports mandatory captures, crown promotions, and a thoughtful AI opponent for solo play.
        </p>
        <div className="hero-actions">
          <Link href="/checkers" className="primary-link">
            Launch the game
          </Link>
          <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="secondary-link">
            Learn more about Next.js
          </a>
        </div>
      </section>
    </main>
  );
}
