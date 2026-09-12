import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-slate-400 text-sm mb-4">The requested resource could not be found.</p>
      <Link
        href="/"
        className="text-amber-400 hover:text-amber-300 underline text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
