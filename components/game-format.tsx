import { Dispatch, SetStateAction } from "react";

import { cn, numToChar } from "@/helpers/utils";
import { QuizGameFormats, QuizGameQuestionProps } from "@/lib/types";

const handleOptionChange = (
  setUserAnswers: Dispatch<SetStateAction<QuizGameQuestionProps[] | undefined>>,
  questionNumber: number,
  option: string
) => {
  setUserAnswers((prev: QuizGameQuestionProps[] | undefined) => {
    if (!prev) return;
    const updatedAnswers = [...prev];
    updatedAnswers[questionNumber].yourAnswer = option;
    return updatedAnswers;
  });
};

export const MCQOrTrueFalseFormat = ({
  item,
  setUserAnswers,
  questionNumber,
}: QuizGameFormats) => {
  return (
    <ul className="flex flex-col gap-2">
      {item?.options?.map((option, idx) => (
        <li
          key={idx}
          className={cn(
            "flex items-center gap-8 p-2 transition-colors border rounded-md cursor-pointer border-border shadow-light bg-transparent text-secondary-foreground",
            {
              "bg-muted text-foreground": item.yourAnswer === option,
              " hover:bg-secondary-hover hover:text-secondary-foreground":
                item.yourAnswer !== option,
            }
          )}
          onClick={() =>
            handleOptionChange(setUserAnswers, questionNumber, option)
          }
        >
          <span className="text-[1rem]">{numToChar(idx + 1)})</span>
          <span className="capitalize">{option}</span>
        </li>
      ))}
    </ul>
  );
};

export const NameTheFollowingFormat = ({
  userAnswers,
  setUserAnswers,
  questionNumber,
}: QuizGameFormats) => {
  return (
    <div className="flex items-center gap-2">
      <p className="font-semibold w-[50px] text-muted-foreground">Ans: </p>
      <input
        className="w-[200px] py-2 text-center border-b-2 border-muted focus:border-2 focus:outline-none"
        name={`name-the-following-Q${questionNumber + 1}`}
        id={`Q${(questionNumber + 1).toString()}`}
        type="text"
        value={userAnswers?.[questionNumber].yourAnswer || ""}
        onChange={(e) =>
          handleOptionChange(setUserAnswers, questionNumber, e.target.value)
        }
      />
    </div>
  );
};
