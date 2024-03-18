import React from "react";

type Props = {
  url: string;
};

const PDFViewer = ({ url }: Props) => {
  return (
    <embed
      src={`${url}#toolbar=0`}
      className="bg-muted hidden lg:block w-full h-full"
    />
  );
};

export default PDFViewer;
