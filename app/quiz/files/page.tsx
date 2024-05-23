import React from "react";

import { Format, Questions } from "@/components/quiz-form";
import Form from "@/components/input-form";
import { quizes } from "@/helpers/constants";
import { DocumentProvider } from "@/providers/form-provider";
import Document from "@/components/Upload/Documents/Documents";

type Props = {
  searchParams: {
    format?: string;
  };
};
const DocumentPage = ({ searchParams }: Props) => {
  return (
    <DocumentProvider>
      <Form kind="quiz" title="Quizify" schema="files" types={quizes}>
        <Document />
        <Questions />
        <Format />
      </Form>
    </DocumentProvider>
  );
};

export default DocumentPage;
