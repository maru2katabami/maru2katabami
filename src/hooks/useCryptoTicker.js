import { useMemo, useEffect, useRef } from "react";
import { CanvasTexture } from "three";

export default function useCryptoTicker() {
  const tickerDataRef = useRef([]);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=layer-1&order=market_cap_desc&per_page=100&page=1&sparkline=true"
    )
      .then((res) => res.json())
      .then((data) => {
        tickerDataRef.current = data.map((item) => ({
          symbol: item.symbol,
          price: item.current_price,
          change: Number(item.price_change_percentage_24h).toFixed(2),
          chart24: item.sparkline_in_7d.price.slice(-24),
        }));
      })
      .catch(console.error);
  }, []);

  const tickerTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const texture = new CanvasTexture(canvas);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 1500 * dpr;
    canvas.height = 100 * dpr;
    context.scale(dpr, dpr);

    let xOffset = 1500; // Declare xOffset outside for consistent behavior

    const draw = () => {
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      tickerDataRef.current.forEach((data, i) => {
        const x = xOffset + i * 200 + 10;
        const y = 10;
        const chartWidth = 180;
        const chartHeight = canvas.height / dpr - 20;
        const gradient = context.createLinearGradient(x, y, x, y + chartHeight);
        if (parseFloat(data.change) >= 0) {
          gradient.addColorStop(0, "rgba(0, 255, 0, 0.3)");
          gradient.addColorStop(1, "rgba(0, 255, 0, 0.1)");
        } else {
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.3)");
          gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)");
        }
        context.fillStyle = gradient;
        const chartData = data.chart24;
        const minPrice = Math.min(...chartData);
        const maxPrice = Math.max(...chartData);
        context.fillStyle = parseFloat(data.change) >= 0 ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";
        context.beginPath();
        chartData.forEach((price, j) => {
          const px = x + (j / (chartData.length - 1)) * chartWidth;
          const py = y + chartHeight - ((price - minPrice) / (maxPrice - minPrice || 1)) * chartHeight;
          j === 0 ? context.moveTo(px, py) : context.lineTo(px, py);
        });
        context.lineTo(x + chartWidth, y + chartHeight);
        context.lineTo(x, y + chartHeight);
        context.closePath();
        context.fill();
        context.strokeStyle = parseFloat(data.change) >= 0 ? "rgb(0,255,0)" : "rgb(255,0,0)";
        context.lineWidth = 1;
        context.stroke();
        context.fillStyle = "black";
        context.textAlign = "center";
        context.font = "20px Arial";
        context.fillText(data.symbol.toUpperCase(), x + chartWidth / 2, y + 25);
        context.font = "12px Arial";
        context.fillText(`$${data.price}`, x + chartWidth / 2, y + 50);
        context.font = "10px Arial";
        context.fillStyle = parseFloat(data.change) >= 0 ? "green" : "red";
        context.fillText(`${parseFloat(data.change) >= 0 ? "▲" : "▼"} ${data.change}%`, x + chartWidth / 2, y + 70);
      });

      xOffset = xOffset <= -200 * tickerDataRef.current.length ? 0 : xOffset - 0.5;
      texture.needsUpdate = true;
      requestAnimationFrame(draw);
    };

    draw();

    return texture;
  }, []);

  return tickerTexture;
}
