import Link from "next/link";

const NotFound = () => {
  return (
    <div
      className="w-full font-sans h-screen flex flex-col gap-6
     items-center justify-center"
    >
      <h1 className="text-6xl text-[#333] text-center font-medium uppercase">
        404
      </h1>
      <p className="text-center max-w-[50ch]">
        The page you are looking for doesn&#39;t exist. You may have mistyped
        the address or the page may have moved.
      </p>
      <Link
        className="self-center transition-colors duration-200 text-[#444] bg-muted/80 rounded-full px-4 hover:bg-muted-hover/80 text-nowrap min-h-[50px] flex items-center justify-center shadow-light border border-border gap-[0.3em]"
        href="/"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
