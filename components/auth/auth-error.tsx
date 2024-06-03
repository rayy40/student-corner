import Link from "next/link";
import { LuAlertTriangle } from "react-icons/lu";

export const AuthError = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <LuAlertTriangle className="text-5xl text-error" />
      <p className="text-lg text-center text-error">
        {"Something went wrong."}
      </p>
      <Link href={"/auth/login"}>
        <button className="px-4 py-2 transition-colors border rounded-md border-border shadow-light text-foreground/80 bg-input hover:input/80">
          Go Back
        </button>
      </Link>
    </div>
  );
};
