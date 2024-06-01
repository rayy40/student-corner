import React from "react";

import { Format, Paragrah, Questions } from "@/components/quiz-form";
import Form from "@/components/input-form";
import { quizes } from "@/lib/constants";
import { ParagraphProvider } from "@/providers/form-provider";

type Props = {
  searchParams: {
    format?: string;
  };
};
const ParagraphPage = ({ searchParams }: Props) => {
  return (
    <ParagraphProvider>
      <Form kind="quiz" title="Quizify" schema="paragraph" types={quizes}>
        <Paragrah />
        <Questions />
        <Format />
      </Form>
    </ParagraphProvider>
  );
};

export default ParagraphPage;
