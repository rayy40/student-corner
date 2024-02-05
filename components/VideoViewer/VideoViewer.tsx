import { getYouTubeVideoId } from "@/helpers/utils";
import React from "react";
import YouTube from "react-youtube";

type Props = {
  url: string;
};

const VideoViewer = ({ url }: Props) => {
  const options = {
    playerVars: {
      rel: 0,
      modestBreanding: 0,
      showInfo: 0,
    },
  };

  return (
    <div className="bg-muted w-full h-full flex items-center justify-center">
      <YouTube
        opts={options}
        className="aspect-video max-w-[800px] w-[90%] p-2 border border-muted-foreground"
        iframeClassName="w-full h-full shadow-medium"
        videoId={getYouTubeVideoId(url) ?? ""}
      />
    </div>
  );
};

export default VideoViewer;
