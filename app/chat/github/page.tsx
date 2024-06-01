import React from "react";

import Form from "@/components/input-form";
import { chatbooks } from "@/lib/constants";
import { GithubProvider } from "@/providers/form-provider";
import { Github } from "@/components/chat-form";

type Props = {
  searchParams: {
    format?: string;
  };
};

const GithubPage = ({ searchParams }: Props) => {
  return (
    <div className="max-w-[500px] mx-auto w-full px-4">
      <GithubProvider>
        <Form kind="chat" title="Chatbook" schema="github" types={chatbooks}>
          <Github />
        </Form>
      </GithubProvider>
    </div>
  );
};

export default GithubPage;
