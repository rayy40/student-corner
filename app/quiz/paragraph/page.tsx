import Form from "@/components/input-form";
import { Format, Paragrah, Questions } from "@/components/quiz-form";
import { quizes } from "@/lib/constants";
import { ParagraphProvider } from "@/providers/form-provider";

const ParagraphPage = () => {
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
