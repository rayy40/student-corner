import Link from "next/link";

const Page = () => {
  return (
    <main className="flex items-center justify-center w-full h-screen p-4 font-sans">
      <div className="flex flex-col w-full lg:flex-row gap-6 items-center lg:justify-between max-w-[1200px] mx-auto">
        <div className="flex max-w-[500px] border border-border p-4 rounded-md w-full lg:w-[50%] gap-4 lg:gap-2 h-fit lg:h-[200px] flex-col justify-between">
          <div>
            <h3 className="pb-2 text-2xl font-medium">Quizify</h3>
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
        <div className="flex max-w-[500px] border border-border p-4 rounded-md w-full lg:w-[50%] gap-4 lg:gap-2 h-fit lg:h-[200px] flex-col justify-between">
          <div>
            <h3 className="pb-2 text-2xl font-medium">Chatbook</h3>
            <p className="text-[#333]">
              Want to interact with a website (preferably a documentation) or a
              github repo, you can do so with ease with the help of AI. You can
              chat with youtube videos and your files too.
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

export default Page;
