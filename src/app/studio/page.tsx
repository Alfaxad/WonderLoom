import { Studio } from "@/components/studio";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session } = await searchParams;
  return session ? <Studio sessionId={session} /> : <main className="loading-studio"><h1>This studio needs a session.</h1><a className="paper-button paper-button--primary" href="/setup">Open a new studio</a></main>;
}
