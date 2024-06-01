import React from "react";

import Form from "@/components/input-form";
import { chatbooks } from "@/lib/constants";
import { FilesProvider } from "@/providers/form-provider";
import Document from "@/components/Upload/Documents/Documents";

type Props = {
  searchParams: {
    format?: string;
  };
};
const FilesPage = ({ searchParams }: Props) => {
  return (
    <div className="max-w-[500px] mx-auto w-full px-4">
      <FilesProvider>
        <Form kind="chat" title="Chatbook" schema="files" types={chatbooks}>
          <Document />
        </Form>
      </FilesProvider>
    </div>
  );
};

export default FilesPage;
