"use client";
import { useEffect, useRef } from "react";

export default function Page() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let rafId = 0;
    let particles = [];
    let off = document.createElement("canvas");
    let octx = off.getContext("2d");
    let width = 0, height = 0, dpr = 1;

    const pointer = {
      x: 0,
      y: 0,
      down: false,
      active: false,
      radius: 60, // タッチ時は拡大
    };

    const config = {
      gap: 5,            // ドット間隔（px）
      size: 2.2,         // ドット半径
      spring: 0.08,      // 元位置へ戻る力
      friction: 0.85,    // 減衰
      repulse: 1400,     // 反発の強さ
      fitScale: 0.8,     // 画像フィット比
      bg: "white",       // 背景色
      highlightRatio: 0.1,   // 近い順 上位10%
      hueSpeed: 60,          // 1秒あたりのHue回転角度（度/秒）
      hueJitter: 45,         // 粒ごとの位相ずらし（最大±）
      lightness: 55,         // ハイライトの明度（%）
      saturation: 90,        // ハイライトの彩度（%）
      pulse: true,           // ほんのり明滅
    };

    function setCanvasSize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(240, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sampleImageToParticles(img) {
      // 画像をキャンバスにフィット
      const scale = Math.min(
        (width * config.fitScale) / img.width,
        (height * config.fitScale) / img.height
      );
      const iw = Math.max(1, Math.floor(img.width * scale));
      const ih = Math.max(1, Math.floor(img.height * scale));
      const ix = Math.floor((width - iw) / 2);
      const iy = Math.floor((height - ih) / 2);

      off.width = iw;
      off.height = ih;
      octx.clearRect(0, 0, iw, ih);
      octx.drawImage(img, 0, 0, iw, ih);

      const { data } = octx.getImageData(0, 0, iw, ih);
      const next = [];
      for (let y = 0; y < ih; y += config.gap) {
        for (let x = 0; x < iw; x += config.gap) {
          const idx = (y * iw + x) * 4;
          const a = data[idx + 3];
          if (a > 80) {
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const px = ix + x;
            const py = iy + y;
            next.push({
              x: px + (Math.random() - 0.5) * 40, // ばら撒き出現
              y: py + (Math.random() - 0.5) * 40,
              vx: 0,
              vy: 0,
              ox: px,
              oy: py,
              color: `rgb(${r},${g},${b})`,
              phase: Math.random() * 2 - 1, // -1..1 の位相（色のずらしに使用）
            });
          }
        }
      }
      particles = next;
    }

    // 動的ハイライト色（HSL）
    function highlightColor(i, t) {
      // t: 秒
      const p = particles[i];
      // 粒ごとに ±hueJitter の位相ずらし
      const jitter = (p?.phase ?? 0) * config.hueJitter;
      const hue = (t * config.hueSpeed + jitter) % 360;
      // ほんのり明滅（明度を±5%）
      const pulse = config.pulse ? 5 * Math.sin(t * 2 + (p?.phase ?? 0)) : 0;
      const l = Math.max(0, Math.min(100, config.lightness + pulse));
      return `hsl(${hue} ${config.saturation}% ${l}%)`;
    }

    function draw(now) {
      const t = (now ?? performance.now()) * 0.001; // 秒へ

      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, width, height);

      const pr = pointer.active ? (pointer.down ? pointer.radius * 1.4 : pointer.radius) : 0;
      const r2 = pr * pr;

      // 半径内の {i, dist2} を収集
      const inside = [];

      // 物理更新
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (pr > 0) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < r2 && dist2 > 1e-6) {
            inside.push({ i, dist2 });
            const force = config.repulse / dist2;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        // 元位置へスプリング
        p.vx += (p.ox - p.x) * config.spring;
        p.vy += (p.oy - p.y) * config.spring;

        // 摩擦
        p.vx *= config.friction;
        p.vy *= config.friction;

        // 位置更新
        p.x += p.vx;
        p.y += p.vy;
      }

      // 近い順 上位10% をハイライト集合に
      let highlight = new Set();
      if (inside.length > 0) {
        inside.sort((a, b) => a.dist2 - b.dist2);
        const count = Math.max(1, Math.floor(inside.length * config.highlightRatio));
        for (let k = 0; k < count; k++) {
          highlight.add(inside[k].i);
        }
      }

      // 描画
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, config.size, 0, Math.PI * 2);
        ctx.fillStyle = highlight.has(i) ? highlightColor(i, t) : p.color;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    let img = new Image();
    img.src = "/m2k.png"; // public/m2k.png に置いてね
    img.decode?.().catch(() => {}).finally(() => {
      setCanvasSize();
      sampleImageToParticles(img);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    });

    // リサイズ対応（再サンプリング）
    const onResize = () => {
      const wasLen = particles.length;
      setCanvasSize();
      sampleImageToParticles(img);
      // 継承で動きに連続性を少し残す
      for (let i = 0; i < Math.min(wasLen, particles.length); i++) {
        particles[i].vx *= 0.3;
        particles[i].vy *= 0.3;
      }
    };
    window.addEventListener("resize", onResize);

    // ポインタイベント（マウス＆タッチ統一）
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left);
      pointer.y = (e.clientY - rect.top);
      pointer.active = true;
    };
    const onPointerDown = (e) => {
      pointer.down = true;
      pointer.radius = e.pointerType === "touch" ? 90 : 60;
      onPointerMove(e);
    };
    const onPointerUp = () => {
      pointer.down = false;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.down = false;
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <main onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} className="size-full" />
    </main>
  );
}
