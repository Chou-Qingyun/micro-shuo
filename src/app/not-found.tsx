import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[56vh] max-w-2xl place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b405e]">
          Page not found
        </p>
        <h1 className="mt-2 font-serif text-5xl font-semibold text-[#281f2d]">
          This chapter slipped away.
        </h1>
        <p className="mt-4 text-[#6c5b68]">
          Return to the library and find another soft love story.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center rounded-[8px] bg-[#9b405e] px-5 text-sm font-semibold text-white"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

