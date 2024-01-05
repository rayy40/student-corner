"use client";

import React, { useEffect, useRef, useState } from "react";
import { UseFormSetValue, UseFormReset } from "react-hook-form";
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";
import { QuestionType } from "@/types";

type Props = {
  value: string;
  lists: string[];
  reset?: UseFormReset<QuestionType>;
  setValue?: UseFormSetValue<QuestionType>;
};

const DropDown = ({ lists, value, reset, setValue }: Props) => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const [category, setCategory] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  });

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpenDropDown(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative text-sm ">
      <button
        onClick={() => setOpenDropDown((prev) => !prev)}
        className="w-[152px] flex capitalize items-center gap-2 p-2 border rounded-md border-border shadow-light bg-secondary hover:bg-secondary-hover"
      >
        <span className="text-muted-foreground">By:</span>
        {category}
        <LuChevronsUpDown className={"ml-auto text-muted-foreground"} />
      </button>
      {openDropDown && (
        <div className="absolute left-0 z-10 w-full p-1 mt-3 border rounded-md top-full bg-secondary border-border shadow-medium">
          <ul>
            {lists.map((item, i) => (
              <li
                onClick={() => {
                  setOpenDropDown(false);
                  setCategory(item);
                  reset && reset();
                  setValue &&
                    setValue("by", item as "topic" | "paragraph" | "document");
                }}
                className="flex items-center justify-between p-2 capitalize rounded-md cursor-pointer bg-secondary hover:bg-secondary-hover"
                key={i}
              >
                {item} {category === item && <LuCheck />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDown;
