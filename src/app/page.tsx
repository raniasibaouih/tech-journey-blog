import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="content">
        <h1>Welcome to your fresh Next.js app</h1>
        <p>
          This project has been reset to a minimal starter. Open the code in <code>src/app</code> and begin building.
        </p>
        <p>
          Try editing <code>src/app/page.tsx</code> and refresh the browser.
        </p>
        <Link href="/about">Go to example page</Link>
      </div>
    </main>
  );
}
