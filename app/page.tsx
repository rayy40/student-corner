"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect } from "react";

import { api } from "@/convex/_generated/api";
import { useUserIdStore } from "@/providers/user-store";
import { useAuth } from "@clerk/clerk-react";
import Link from "next/link";
import Image from "next/image";
import ChatGif from "../assets/chat.gif";
import QuizGif from "../assets/quiz.gif";

const Home = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { setUserId } = useUserIdStore();

  const storeUser = useMutation(api.users.store);

  const createUser = useCallback(async () => {
    const id = await storeUser();
    setUserId(id);
  }, [storeUser, setUserId]);

  useEffect(() => {
    if (!isSignedIn) return;
    createUser();
  }, [isSignedIn, createUser]);

  if (!isLoaded) {
    return <h1>Loading...</h1>;
  }

  return (
    <main className="p-4 pt-20 font-sans flex items-center justify-center h-screen w-full">
      <div className="flex space-x-40 max-w-[1200px] mx-auto">
        <div className="flex max-w-[500px] border border-border p-4 rounded-md w-[50%] h-[200px] flex-col justify-between">
          <div>
            <h3 className="text-2xl pb-2 font-medium">Quizify</h3>
            <p className="text-[#333]">
              Need help preparing for an exam? Play our quiz by uploading your
              pdfs, paragraphs or just a topic.
            </p>
          </div>
          <Link href={"/quiz"}>
            <button className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold transition-colors rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed">
              Play Quiz
            </button>
          </Link>
        </div>
        <div className="flex max-w-[500px] border border-border p-4 rounded-md w-[50%] h-[200px] flex-col justify-between">
          <div>
            <h3 className="text-2xl pb-2 font-medium">Chatbook</h3>
            <p className="text-[#333]">
              Want to ask a documentation website, on how does a certain thing
              is done? You can chat with a documentation website, codebase,
              youtube or a pdf.
            </p>
          </div>
          <Link href={"/chat"}>
            <button className="flex items-center justify-center w-full gap-2 p-2 mt-2 font-semibold transition-colors rounded-md cursor-pointer enabled:hover:bg-primary-hover bg-primary text-primary-foreground shadow-button disabled:opacity-40 disabled:cursor-not-allowed">
              Chat With AI
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
