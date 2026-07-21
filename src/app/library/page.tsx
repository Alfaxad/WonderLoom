import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { PaperButton } from "@/components/paper-button";
import { listSavedStoriesAsync } from "@/server/session-store";

export const dynamic = "force-dynamic";

export default async function StoryLibraryPage() {
  const stories = await listSavedStoriesAsync();
  return (
    <main id="main-content" className="library-shell">
      <header className="simple-header"><Logo /><PaperButton href="/setup">Begin another story</PaperButton></header>
      <section className="library-intro"><p className="kicker"><span /> Finished books · saved on this device</p><h1>Your story shelf.</h1><p>A personal library for your finished stories</p></section>
      {stories.length > 0 ? <section className="library-grid" aria-label="Saved WonderLoom stories">{stories.map((story) => {
        return <Link href={`/story/${story.id}`} className="library-card" key={story.id}>
          <div className="library-cover">{story.coverImageUrl ? <Image src={story.coverImageUrl} alt="" fill sizes="(max-width: 700px) 92vw, 30vw" /> : <Image src="/images/wonderloom-empty-stage.png" alt="" fill sizes="(max-width: 700px) 92vw, 30vw" />}<span><BookOpen /> Finished book</span></div>
          <div className="library-card-copy"><p>{story.pageCount} pages · {story.contributionCount} contributions</p><h2>{story.titleConfirmed ? story.title : "A story waiting for its title"}</h2><small>{story.generationCount} saved generation records</small><b>Open story <ArrowRight /></b></div>
        </Link>;
      })}</section> : <section className="library-empty"><Sparkles /><h2>Your shelf is waiting.</h2><p>A story appears here only after you title and finish all three pages.</p><PaperButton href="/setup">Begin the first story</PaperButton></section>}
    </main>
  );
}
