import Link from "next/link";

export const AuthError = () => {
  return (
    <>
      <h2 className="text-xl text-center md:text-2xl text-error">
        Oops! Something went wrong!
      </h2>
      <Link
        className="mt-3 underline text-secondary-foreground underline-offset-2"
        href={"/auth/login"}
      >
        <button className="p-2 px-4 transition-colors border rounded-md hover:bg-secondary-hover bg-secondary border-border">
          Back to login
        </button>
      </Link>
    </>
  );
};
