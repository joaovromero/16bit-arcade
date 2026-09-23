"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Gamepad2, Maximize2, MousePointer2, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { games } from "./games";

function PixelRain({ paused }: { paused: boolean }) {
  return <div className={`pixel-rain ${paused ? "is-paused" : ""}`} aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ left: `${(i * 37.7) % 100}%`, "--size": `${3 + i % 4 * 2}px`, "--delay": `${-(i * 1.73)}s`, "--duration": `${12 + i % 9 * 2}s` } as CSSProperties} />)}</div>;
}

export default function Home() {
  const [selected, setSelected] = useState("mario");
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const game = games.find(g => g.id === selected)!;
  const index = games.indexOf(game);
  const motionOff = paused || reduced;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    const fromHash = window.location.hash.slice(1);
    if (games.some(g => g.id === fromHash)) setSelected(fromHash);
    const onHash = () => { const id = window.location.hash.slice(1); if (games.some(g => g.id === id)) setSelected(id); };
    window.addEventListener("hashchange", onHash);
    return () => { media.removeEventListener("change", change); window.removeEventListener("hashchange", onHash); if (timer.current) clearTimeout(timer.current); };
  }, []);

  const act = useCallback(() => {
    if (acting) return;
    setActing(true); setActionCount(v => v + 1);
    timer.current = setTimeout(() => setActing(false), 900);
  }, [acting]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.code !== "Space" || videoOpen || creditsOpen || event.repeat || target.closest("button,a,input,textarea,select,[role=tab]")) return;
      event.preventDefault(); act();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [act, videoOpen, creditsOpen]);

  function choose(id: string) {
    if (timer.current) clearTimeout(timer.current);
    setSelected(id); setActing(false); setActionCount(0); setPointer({ x: 0, y: 0 });
    window.history.replaceState(null, "", `#${id}`);
  }

  return <div className={`arcade ${motionOff ? "motion-off" : ""}`} style={{ "--game-accent": game.color, "--game-rgb": game.rgb } as CSSProperties}>
    <a href="#collection" className="skip-link">Ir para os jogos</a>
    <div className="ambient" aria-hidden="true"><img className="ambient-scene" src={game.thumbnail} alt="" /><div className="ambient-purple" /><div className="ambient-game" /></div>
    <PixelRain paused={motionOff} />
    <header className="site-header shell">
      <a className="brand" href="#mario" onClick={() => choose("mario")} aria-label="16BIT ARCADE — início"><span className="brand-mark"><Gamepad2 size={26} strokeWidth={1.8} /></span><span>16<span className="brand-bit">BIT</span><small>ARCADE</small></span></a>
      <nav aria-label="Navegação principal"><a href="#collection" className="nav-active">Os clássicos <span>06</span></a><a href="#gameplay">Gameplay</a></nav>
      <Button variant="ghost" className="motion-button" onClick={() => setPaused(v => !v)} aria-label={paused ? "Retomar animações" : "Pausar animações"} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}<span>{paused ? "Retomar efeitos" : "Pausar efeitos"}</span></Button>
    </header>

    <main className="shell">
      <Tabs value={selected} onValueChange={choose} className="game-tabs">
        <section id="collection" className="collection-heading" aria-label="Coleção de clássicos"><p className="eyebrow"><span className="tiny-pixels" aria-hidden="true">▦</span> A COLEÇÃO</p><p className="collection-count">SEIS CLÁSSICOS. INFINITAS MEMÓRIAS.</p></section>
        <div className="game-selector-wrap"><TabsList className="game-selector" aria-label="Selecione um jogo">{games.map((item, i) => <TabsTrigger className="game-tab" key={item.id} value={item.id}><span className="tab-number">0{i + 1}</span><span className="tab-name">{item.shortName}</span><span className="tab-line" /></TabsTrigger>)}</TabsList></div>
        {games.map(item => <TabsContent key={item.id} value={item.id} className="game-content">
          <section className="game-hero" aria-labelledby={`title-${item.id}`}>
            <div className="hero-copy">
              <div className="game-kicker"><span className="category">{item.genre}</span><span className="kicker-divider" /><span>{item.year}</span><span className="kicker-divider" /><span>{item.platform}</span></div>
              <h1 id={`title-${item.id}`} className={`game-title title-${item.id}`}><span>{item.title}</span><strong>{item.subtitle}</strong></h1>
              <p className="game-description">{item.description}</p>
              <div className="hero-actions"><Button className="primary-button" onClick={()=>setVideoOpen(true)}><Play size={17} fill="currentColor" />Assistir gameplay<ArrowUpRight size={17} /></Button><button type="button" className="character-action" onClick={act}>{item.action}<kbd>ESPAÇO</kbd></button></div>
              <div className="hero-meta"><span>DESENVOLVEDORA <b>{item.developer}</b></span><span className="meta-separator" /><span>LANÇAMENTO <b>{item.year}</b></span></div>
            </div>
            <div className={`character-stage ${acting ? "is-acting" : ""}`} onPointerMove={e => { if(motionOff || e.pointerType === "touch") return; const r=e.currentTarget.getBoundingClientRect(); setPointer({x:(e.clientX-r.left-r.width/2)/24,y:(e.clientY-r.top-r.height/2)/30}); }} onPointerLeave={() => setPointer({x:0,y:0})}>
              <div className="stage-orbit orbit-one" aria-hidden="true" /><div className="stage-orbit orbit-two" aria-hidden="true" />
              <span className="stage-word" aria-hidden="true">{item.stageWord}</span>
              <div className="stage-topline"><span>PLAYER 01</span><span>0{index + 1} / 06</span></div>
              <div className="stage-spark spark-one" aria-hidden="true">+</div><div className="stage-spark spark-two" aria-hidden="true">+</div>
              <div className="character-position" style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}><button className={`character-button action-${item.id}`} onClick={act} aria-label={`${item.action} com ${item.character}`}><img className="character-sprite" src={motionOff ? item.still : item.sprite} alt={item.character} draggable={false} width={320} height={320} /></button></div>
              <div className="character-shadow" aria-hidden="true" />
              <span className={`action-feedback ${acting ? "visible" : ""}`} aria-live="polite">{acting ? item.feedback : ""}</span>
              <div className="character-label"><span className="character-label-line" /><span>{item.character}</span><small>{item.id === "tetris" ? "SÍMBOLO DO JOGO" : "PIXEL ORIGINAL"}</small></div>
              <div className="stage-hint"><MousePointer2 size={14}/><span>Clique no personagem para interagir</span></div>
              <span className="sr-only" role="status">{actionCount > 0 ? `${item.character}: ${actionCount} ${actionCount === 1 ? "interação" : "interações"}.` : ""}</span>
            </div>
          </section>
          <section id="gameplay" className="gameplay-section" aria-labelledby={`gameplay-title-${item.id}`}>
            <div className="section-heading"><div><p className="eyebrow">APERTE O PLAY</p><h2 id={`gameplay-title-${item.id}`}>De volta à primeira fase<span>.</span></h2></div><div className="game-nav"><Button variant="outline" size="icon" onClick={() => choose(games[(index+5)%6].id)} aria-label="Jogo anterior"><ChevronLeft /></Button><span>0{index+1}<b>/ 06</b></span><Button variant="outline" size="icon" onClick={() => choose(games[(index+1)%6].id)} aria-label="Próximo jogo"><ChevronRight /></Button></div></div>
            <div className="gameplay-grid">
              <button className="gameplay-preview" type="button" onClick={()=>setVideoOpen(true)} aria-label={`Reproduzir gameplay de ${item.name}`}><img src={item.thumbnail} alt={`Cena do gameplay de ${item.name}`} width={960} height={540} loading="lazy" /><span className="video-shade" /><span className="video-label"><span className="red-square" />GAMEPLAY</span><span className="video-play"><Play size={25} fill="currentColor" /></span><span className="video-bottom"><span>{item.name}<small>{item.videoTitle}</small></span><Maximize2 size={18} /></span></button>
              <aside className="game-story"><span className="story-number">0{index+1}<span>/ ARQUIVO</span></span><h3>{item.storyTitle}</h3><p>{item.story}</p><div className="story-detail"><Gamepad2 size={20}/><span>{item.platform}<small>{item.detail}</small></span><ArrowDown size={18} /></div><a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer" className="text-link">Assistir no YouTube <ArrowUpRight size={15}/></a></aside>
            </div>
          </section>
        </TabsContent>)}
      </Tabs>
      <section className="all-games" aria-labelledby="all-games-title"><div className="section-heading"><div><p className="eyebrow">CONTINUE EXPLORANDO</p><h2 id="all-games-title">Escolha sua próxima nostalgia<span>.</span></h2></div><span className="library-total">06 JOGOS</span></div><div className="game-card-grid">{games.map((item, i) => <button className={`game-card ${selected === item.id ? "selected" : ""}`} key={item.id} onClick={() => {choose(item.id); document.getElementById("collection")?.scrollIntoView({behavior:motionOff?"auto":"smooth"});}} style={{"--card-color":item.color} as CSSProperties} aria-label={`Explorar ${item.name}`} aria-pressed={selected===item.id}><div className="card-image"><img src={item.thumbnail} alt="" loading="lazy" width={320} height={180}/><span>0{i+1}</span>{selected===item.id&&<b>SELECIONADO</b>}</div><div className="card-copy"><h3>{item.shortName}</h3><span>{item.year}<ArrowRight size={15}/></span></div></button>)}</div></section>
    </main>
    <footer className="shell site-footer"><a className="footer-brand" href="#collection">16BIT <span>ARCADE</span></a><p>Uma homenagem aos clássicos. Feito para quem nunca deixou de jogar.</p><button onClick={()=>setCreditsOpen(true)}>Créditos <ArrowUpRight size={14}/></button></footer>
    <Dialog open={videoOpen} onOpenChange={setVideoOpen}><DialogContent className="video-dialog" showCloseButton={false}><div className="dialog-top"><div><DialogTitle>{game.name}</DialogTitle><DialogDescription>Gameplay · {game.platform}</DialogDescription></div><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Fechar vídeo"><X/></Button></DialogClose></div><div className="video-frame">{videoOpen && <iframe key={game.videoId} src={`https://www.youtube-nocookie.com/embed/${game.videoId}?autoplay=1&rel=0`} title={`Gameplay de ${game.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}</div><p className="video-help">O vídeo é reproduzido pelo YouTube. <a href={`https://www.youtube.com/watch?v=${game.videoId}`} target="_blank" rel="noopener noreferrer">Abrir diretamente <ArrowUpRight size={14}/></a></p></DialogContent></Dialog>
    <Dialog open={creditsOpen} onOpenChange={setCreditsOpen}><DialogContent className="credits-dialog" showCloseButton={false}><div className="dialog-top"><DialogTitle>Sobre esta coleção</DialogTitle><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Fechar créditos"><X/></Button></DialogClose></div><DialogDescription>A estética celebra a era dos pixels. Os títulos incluem jogos de diferentes gerações, de 8 a 32 bits.</DialogDescription><p>Projeto de homenagem, sem vínculo com as desenvolvedoras. Personagens, marcas e jogos pertencem aos respectivos titulares. Gameplays pertencem aos canais indicados no player.</p><ul>{games.map(item=><li key={item.id}><strong>{item.name}</strong><a href={item.source} target="_blank" rel="noopener noreferrer">Fonte do personagem <ArrowUpRight size={13}/></a></li>)}</ul></DialogContent></Dialog>
  </div>;
}
