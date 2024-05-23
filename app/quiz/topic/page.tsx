import React from "react";

import { Format, Questions, Topic } from "@/components/quiz-form";
import Form from "@/components/input-form";
import { quizes } from "@/helpers/constants";
import { TopicProvider } from "@/providers/form-provider";

type Props = {};

const TopicPage = ({}: Props) => {
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
