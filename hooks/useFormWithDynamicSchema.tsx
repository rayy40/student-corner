import {
  codebaseSchema,
  documentationSchema,
  filesSchema as ChatFilesSchema,
  youtubeSchema,
} from "@/schema/chat_schema";
import {
  paragraphSchema,
  topicSchema,
  filesSchema as QuizFilesSchema,
} from "@/schema/quiz_schema";
import { DynamicFormType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const useFormWithDynamicSchema = <K extends string>({
  kind,
  selectedSchema,
}: DynamicFormType<K>) => {
  const schema = (() => {
    switch (selectedSchema) {
      case "youtube":
        return youtubeSchema;
      case "codebase":
        return codebaseSchema;
      case "documentation":
        return documentationSchema;
      case "files":
        return kind === "quiz" ? QuizFilesSchema : ChatFilesSchema;
      case "topic":
        return topicSchema;
      case "paragraph":
        return paragraphSchema;
      default:
        throw new Error("Invalid schema selection");
    }
  })();

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  return {
    register,
    handleSubmit,
    errors,
    isSubmitted,
    reset,
    trigger,
    setValue,
    watch,
  };
};

export default useFormWithDynamicSchema;
