import { ArrowRight, BookOpen, Mic2, PencilLine, Sparkles } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { PaperButton } from "@/components/paper-button";

export default function WelcomePage() {
  return (
    <main id="main-content" className="welcome-shell">
      <nav className="welcome-nav" aria-label="Main navigation">
        <Logo />
        <a className="library-link" href="/library"><BookOpen /> Your stories</a>
      </nav>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <h1>A Tiny Studio<br />For Your Big <em>Imagination.</em></h1>
          <p className="welcome-lede">WonderLoom is a creative studio for art and story telling that enables children ideas take shape while maintaining their autonomy and creative control</p>
          <div className="welcome-actions">
            <PaperButton href="/setup">Begin a story <ArrowRight size={18} /></PaperButton>
            <span className="time-note">About five calm minutes</span>
          </div>
        </div>

        <div className="welcome-art">
          <div className="art-label art-label--top"><Sparkles size={16} /> Imagine</div>
          <div className="welcome-art-frame"><Image src="/images/wonderloom-welcome-hero.png" alt="A handcrafted paper fox carrying a tiny sunrise toward a glowing story doorway" fill priority sizes="(max-width: 860px) 92vw, 48vw" /></div>
          <div className="art-label art-label--bottom"><PencilLine size={16} /> Create</div>
        </div>
      </section>

      <section className="welcome-steps" aria-labelledby="how-it-works">
        <div>
          <p className="section-number">01—03</p>
          <h2 id="how-it-works">A story made<br />in three gentle moves.</h2>
        </div>
        <ol>
          <li><span><Mic2 /></span><div><strong>Ignite your spark</strong><p>Speak or type your idea.</p></div></li>
          <li><span><Sparkles /></span><div><strong>Watch it take shape</strong><p>Your world forms as you create it</p></div></li>
          <li><span><PencilLine /></span><div><strong>Make it truly yours</strong><p>The tools maintains your creative control</p></div></li>
        </ol>
      </section>

      <footer className="welcome-footer">
        <p>Built for child agency and autonomy.</p>
        <p>No data or profile retention · Finished stories saved on your device</p>
      </footer>
    </main>
  );
}
