import { useEffect, useRef } from "react";

export default function PixelSnow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.35 + 0.08,
      opacity: Math.random() * 0.6 + 0.15,
    }));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener("resize", resize);

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(59,130,246,${p.opacity})`;

        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(59,130,246,0.8)";

        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.y += p.speed;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pixel-snow" />;
}