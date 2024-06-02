import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";

import logo from "../assets/logo.svg";
import { SignOut } from "./sign-out";

const Navbar = async () => {
  const session = await auth();

  return (
    <div className="fixed top-0 z-10 flex items-center justify-between w-full p-3 font-sans bg-white shadow-medium">
      <Link className="flex items-center gap-3 w-fit" href={"/"}>
        <Image priority width={40} height={40} src={logo} alt="logo" />
        <h3 className="font-medium hover:underline underline-offset-2">
          Student Corner
        </h3>
      </Link>
      <SignOut isSignedIn={Boolean(session)} />
    </div>
  );
};

export default Navbar;
