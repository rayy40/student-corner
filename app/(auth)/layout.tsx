import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="font-sans flex flex-col items-center justify-center relative max-w-[350px] mx-auto w-full h-screen">
      {children}
    </div>
  );
};

export default AuthLayout;
