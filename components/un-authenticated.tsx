import Link from "next/link";

export const UnAuthenticated = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-6 font-sans">
      <h1 className="text-6xl text-[#333] text-center font-medium uppercase">
        Unauthenticated
      </h1>
      <p className="text-center max-w-[50ch]">
        You are not signed in. Please sign in to continue.
      </p>
      <Link
        className="self-center transition-colors duration-200 text-[#444] bg-muted/80 rounded-full px-4 hover:bg-muted-hover/80 text-nowrap min-h-[50px] flex items-center justify-center shadow-light border border-border gap-[0.3em]"
        href="/login"
      >
        Sign In
      </Link>
    </div>
  );
};
