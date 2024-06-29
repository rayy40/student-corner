import Loading from "@/app/loading";

type Props = { url: string | undefined };

export const PDFViewer = ({ url }: Props) => {
  if (!url) {
    return <Loading />;
  }

  return (
    <embed
      src={`${url}#toolbar=0`}
      className="bg-muted hidden lg:block w-full h-full"
    />
  );
};
