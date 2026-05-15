import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Share2, Download, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const W = 1080;
const H = 1920;


function wrapText(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}


function renderCanvas(canvas, result) {
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;

  // Cosmic gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0b1228");
  grad.addColorStop(0.6, "#1e1b4b");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Starfield
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2.2;
    ctx.globalAlpha = 0.25 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Header - brand pill
  ctx.fillStyle = "rgba(99,102,241,0.18)";
  ctx.strokeStyle = "rgba(165,180,252,0.35)";
  ctx.lineWidth = 2;
  const pillX = 80;
  const pillY = 110;
  const pillW = 620;
  const pillH = 80;
  const pillR = 40;
  ctx.beginPath();
  ctx.moveTo(pillX + pillR, pillY);
  ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, pillR);
  ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, pillR);
  ctx.arcTo(pillX, pillY + pillH, pillX, pillY, pillR);
  ctx.arcTo(pillX, pillY, pillX + pillW, pillY, pillR);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c7d2fe";
  ctx.font = "bold 28px Nunito, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("✦ BEHAVIOURSCOPE™ · EDUSENSE", pillX + 40, pillY + pillH / 2);

  // Child label
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "bold 32px Nunito, sans-serif";
  ctx.fillText("A reading for", 80, 280);

  // Child name (big)
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 86px Nunito, sans-serif";
  let nameLines = wrapText(ctx, result.name || "Your child", W - 160);
  let y = 360;
  for (const ln of nameLines.slice(0, 2)) {
    ctx.fillText(ln, 80, y);
    y += 100;
  }

  // Sun sign + Age
  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 38px Nunito, sans-serif";
  const subline = `${result.sun_sign || ""}${result.age ? ` · age ${result.age}` : ""}`;
  ctx.fillText(subline, 80, y + 10);
  y += 90;

  // Niche label
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "bold 30px Nunito, sans-serif";
  ctx.fillText("NICHE", 80, y);
  y += 60;

  // Niche big
  ctx.fillStyle = "#facc15";
  ctx.font = "900 100px Nunito, sans-serif";
  const nicheLines = wrapText(ctx, result.niche || "", W - 160);
  for (const ln of nicheLines.slice(0, 3)) {
    ctx.fillText(ln, 80, y);
    y += 110;
  }
  y += 30;

  // Traits
  if (Array.isArray(result.traits) && result.traits.length) {
    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 30px Nunito, sans-serif";
    ctx.fillText("TOP TRAITS", 80, y);
    y += 60;
    const traits = result.traits.slice(0, 3);
    ctx.font = "bold 36px Nunito, sans-serif";
    let x = 80;
    for (const t of traits) {
      const text = ` ${t} `;
      const tw = ctx.measureText(text).width;
      const bw = tw + 50;
      const bh = 70;
      if (x + bw > W - 80) { x = 80; y += bh + 20; }
      ctx.fillStyle = "rgba(56,189,248,0.18)";
      ctx.strokeStyle = "rgba(125,211,252,0.45)";
      ctx.lineWidth = 2;
      const r = 35;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + bw, y, x + bw, y + bh, r);
      ctx.arcTo(x + bw, y + bh, x, y + bh, r);
      ctx.arcTo(x, y + bh, x, y, r);
      ctx.arcTo(x, y, x + bw, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e0f2fe";
      ctx.fillText(text, x + 25, y + bh / 2);
      x += bw + 18;
    }
    y += 110;
  }

  // Parenting tip card
  const tip = (result.behaviour_scope?.parenting_tips || [])[0];
  if (tip) {
    const cardX = 80;
    const cardY = y;
    const cardW = W - 160;
    ctx.fillStyle = "rgba(250, 204, 21, 0.10)";
    ctx.strokeStyle = "rgba(250, 204, 21, 0.35)";
    ctx.lineWidth = 2;
    ctx.font = "30px Nunito, sans-serif";
    const tipLines = wrapText(ctx, tip, cardW - 80);
    const cardH = 60 + tipLines.length * 44 + 40;
    const rr = 32;
    ctx.beginPath();
    ctx.moveTo(cardX + rr, cardY);
    ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, rr);
    ctx.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, rr);
    ctx.arcTo(cardX, cardY + cardH, cardX, cardY, rr);
    ctx.arcTo(cardX, cardY, cardX + cardW, cardY, rr);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 28px Nunito, sans-serif";
    ctx.fillText("PARENTING TIP", cardX + 40, cardY + 50);
    ctx.fillStyle = "#fef3c7";
    ctx.font = "30px Nunito, sans-serif";
    let ty = cardY + 100;
    for (const ln of tipLines.slice(0, 6)) {
      ctx.fillText(ln, cardX + 40, ty);
      ty += 44;
    }
    y = cardY + cardH + 40;
  }

  // Footer brand bar
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fillRect(0, H - 180, W, 180);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px Nunito, sans-serif";
  ctx.fillText("EDUSENSE", 80, H - 110);
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "bold 30px Nunito, sans-serif";
  ctx.fillText("by Code An Apple · BehaviourScope™ for the primary years", 80, H - 60);
}


export default function ShareScopeButton({ result, testid = "share-scope-btn" }) {
  const canvasRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState("");
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    setRendering(true);
    // Defer to next tick to let dialog mount
    const t = setTimeout(() => {
      try {
        renderCanvas(canvasRef.current, result);
        setDataUrl(canvasRef.current.toDataURL("image/png"));
      } catch (e) {
        toast.error("Could not generate share image: " + e.message);
      } finally {
        setRendering(false);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [open, result]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `BehaviourScope-${(result.name || "child").replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Image downloaded");
  };

  const nativeShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `BehaviourScope-${(result.name || "child").replace(/\s+/g, "-")}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${result.name}'s BehaviourScope™`,
          text: `${result.name} · ${result.sun_sign} · ${result.niche} - via EDUSENSE BehaviourScope™`,
        });
        toast.success("Shared!");
      } else {
        download();
      }
    } catch (e) {
      if (e.name !== "AbortError") toast.error("Share failed: " + e.message);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 hover:opacity-90 text-white font-bold px-6 py-3 btn-lift"
        data-testid={testid}
      >
        <Share2 size={16} className="mr-1.5" strokeWidth={2.5} /> Share my BehaviourScope
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" data-testid="share-scope-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles size={18} className="text-indigo-500" strokeWidth={2.5} /> Your shareable BehaviourScope™ card</DialogTitle>
            <DialogDescription>1080×1920 PNG - perfect for WhatsApp Status, Instagram Stories or saving for your records.</DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[300px]" data-testid="share-scope-preview">
            {rendering && <Loader2 className="animate-spin text-slate-400" size={28} />}
            <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: rendering ? "none" : "block" }} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button onClick={nativeShare} disabled={!dataUrl} className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex-1" data-testid="share-scope-share-btn">
              <Share2 size={16} className="mr-1.5" strokeWidth={2.5} /> Share
            </Button>
            <Button onClick={download} disabled={!dataUrl} variant="outline" className="rounded-full font-bold flex-1" data-testid="share-scope-download-btn">
              <Download size={16} className="mr-1.5" strokeWidth={2.5} /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
