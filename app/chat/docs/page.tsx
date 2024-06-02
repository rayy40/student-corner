import Form from "@/components/input-form";
import { chatbooks } from "@/lib/constants";
import { DocsProvider } from "@/providers/form-provider";
import { Docs } from "@/components/chat-form";

const DocumentationPage = () => {
  return (
    <div className="max-w-[500px] mx-auto w-full px-4">
      <DocsProvider>
        <Form
          kind="chat"
          title="Chatbook"
          schema="documentation"
          types={chatbooks}
        >
          <Docs />
        </Form>
      </DocsProvider>
    </div>
  );
};

export default DocumentationPage;
