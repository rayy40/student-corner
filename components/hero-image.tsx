"use client";

import Image from "next/image";
import Bg from "../assets/student-corner-bg.webp";
import BgMobile from "../assets/student-corner-bg-mobile.webp";
import { useEffect, useState } from "react";

export const HeroImage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Image
      className="rounded-lg"
      alt="hero-bg"
      quality={100}
      placeholder="blur"
      src={isMobile ? BgMobile : Bg}
      priority
    />
  );
};
