import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Interview Intelligence</h1>
      <p className="text-muted-foreground">
        Phase 1 scaffold — feature pages land in later milestones.
      </p>
      <Button>shadcn/ui pipeline check</Button>
    </main>
  );
}
