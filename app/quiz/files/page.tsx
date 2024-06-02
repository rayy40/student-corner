import Form from "@/components/input-form";
import { Format, Questions } from "@/components/quiz-form";
import Document from "@/components/Upload/Documents/Documents";
import { quizes } from "@/lib/constants";
import { DocumentProvider } from "@/providers/form-provider";

const DocumentPage = () => {
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
