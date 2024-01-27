import React from "react";

type Props = {
  url: string;
};

const PDFViewer = ({ url }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${url}&embedded=true`}
      className="bg-muted w-full h-full"
    ></iframe>
  );
};

export default PDFViewer;
