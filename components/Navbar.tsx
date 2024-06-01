import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import logo from "../assets/logo.svg";
import { auth } from "@/auth";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import { useSession } from "next-auth/react";

const Navbar = () => {
  // const { signOut } = useClerk();
  // const { isSignedIn } = useAuth();
  // const { setUserId } = useUserIdStore();
  // const router = useRouter();
  // const pathname = usePathname();

  return (
    <div
      className={`font-sans fixed top-0 z-10 items-center justify-between w-full p-3 bg-white shadow-medium`}
    >
      <Link className="flex w-fit items-center gap-3" href={"/"}>
        <Image priority width={40} height={40} src={logo} alt="logo" />
        <h3 className="font-medium hover:underline underline-offset-2">
          Student Corner
        </h3>
      </Link>
      {/* Add sign out func */}
      {/* <form>
        <button type="submit">Sign Out</button>
      </form> */}
      {/* <button
        onClick={() =>
          isSignedIn
            ? signOut(() => {
                setUserId(null);
                router.push("/");
              })
            : router.push("/sign-up")
        }
        className="p-2 transition-colors border rounded-md hover:bg-muted-hover border-border bg-muted shadow-light"
      >
        {isSignedIn ? "Sign Out" : "Sign Up"}
      </button> */}
    </div>
  );
};

export default Navbar;
