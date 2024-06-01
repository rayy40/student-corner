const PDFViewer = ({ url }: { url?: string }) => {
  if (!url) return;

  return (
    <embed
      src={`${url}#toolbar=0`}
      className="bg-muted hidden lg:block w-full h-full"
    />
  );
};

export default PDFViewer;
