"use client";

import Loader from "nextjs-toploader";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NProgress from "nprogress";

export const NextTopLoader = () => {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return <Loader height={5} color="hsl(174, 26%, 50%)" showSpinner={false} />;
};
