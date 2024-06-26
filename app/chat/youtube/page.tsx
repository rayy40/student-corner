import Form from "@/components/input-form";
import { chatbooks } from "@/lib/constants";
import { YoutubeProvider } from "@/providers/form-provider";
import { Youtube } from "@/components/chat-form";

const YoutubePage = () => {
  return (
    <div className="max-w-[500px] px-4 mx-auto w-full">
      <YoutubeProvider>
        <Form kind="chat" title="Chatbook" schema="youtube" types={chatbooks}>
          <Youtube />
        </Form>
      </YoutubeProvider>
    </div>
  );
};

export default YoutubePage;
