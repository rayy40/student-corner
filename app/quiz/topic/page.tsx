import Form from "@/components/input-form";
import { Format, Questions, Topic } from "@/components/quiz-form";
import { quizes } from "@/lib/constants";
import { TopicProvider } from "@/providers/form-provider";

const TopicPage = () => {
  return (
    <TopicProvider>
      <Form kind="quiz" title="Quizify" schema="topic" types={quizes}>
        <Topic />
        <Questions />
        <Format />
      </Form>
    </TopicProvider>
  );
};

export default TopicPage;
