import type { MetaFunction } from "@remix-run/node";
import Hello from "~/components/Hello";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Hello />
    </div>
  );
}
