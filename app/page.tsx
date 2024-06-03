import Link from "next/link";

import { HeroImage } from "@/components/hero-image";
import { SubmitButton } from "@/components/ui/button";

const Page = () => {
  return (
    <main className="flex items-center justify-center w-full h-screen p-4 font-sans">
      <div className="flex relative flex-col w-full gap-6 items-center max-w-[1200px] mx-auto">
        <div className="relative rounded-lg">
          <HeroImage />
          <div className="z-10 pt-5 space-y-2 md:pt-0 lg:space-y-4 text-foreground md:text-white md:absolute bottom-10 left-10">
            <h2 className="text-3xl font-medium md:text-4xl lg:text-5xl">
              Ace Your Exams with Student Corner
            </h2>
            <p className="lg:text-lg max-w-[70ch]">
              Create custom quizes or get help from AI, whether it&#39;s
              websites, videos or code repositories.
            </p>
          </div>
          <div className="absolute inset-0 hidden rounded-lg md:block opacity-40 bg-gradient-to-b from-transparent to-black"></div>
        </div>
        <div className="flex w-full gap-6">
          <Link className="w-1/2" href={"/quiz/topic"}>
            <SubmitButton className="p-4 lg:text-lg">Play Quiz</SubmitButton>
          </Link>
          <Link className="w-1/2" href={"/chat/youtube"}>
            <SubmitButton className="p-4 shadow-light border border-border bg-[#f5efe8] enabled:hover:bg-[#f5efe8]/80 text-secondary-foreground lg:text-lg">
              Chat with AI
            </SubmitButton>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
