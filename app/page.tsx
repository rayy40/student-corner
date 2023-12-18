"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect } from "react";

import { api } from "@/convex/_generated/api";
import { useUserIdStore } from "@/providers/store";
import { useAuth } from "@clerk/clerk-react";

const Home = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { userId, setUserId } = useUserIdStore();

  const storeUser = useMutation(api.users.store);

  const createUser = useCallback(async () => {
    const id = await storeUser();
    setUserId(id);
  }, [storeUser, setUserId]);

  useEffect(() => {
    if (!isSignedIn) return;
    createUser();
  }, [isSignedIn, createUser]);

  if (!isLoaded) {
    return <h1>Loading...</h1>;
  }
  console.log(userId);

  return (
    <main className="p-4 pt-20">
      <h1>Hello World</h1>
    </main>
  );
};

export default Home;
