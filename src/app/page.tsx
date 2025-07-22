import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <main className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h1 className="text-3xl">Welcome to CollabHub 👋</h1>
        <p className="text-lg">Create, discover, and collaborate on projects with the right people.</p>
        <div className="flex gap-4">
          <Link href="/auth/sign-up">
          <Button>Get Started</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
