import { CardWrapper } from "@/components/ui/card-wrapper";
import React from "react";

const VerifyPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen font-sans">
      <CardWrapper>
        <p>Please login with the link sent to your email address.</p>
      </CardWrapper>
    </div>
  );
};

export default VerifyPage;
