// 計算処理のロジック
self.onmessage = (event) => {
  const { t, lines, radius } = event.data;

  const updatedLines = lines.map((line) => {
    line.speed += (line.targetSpeed - line.speed) * 0.05;
    line.waveFrequency += (line.targetWaveFrequency - line.waveFrequency) * 0.05;
    line.waveAmplitude += (line.targetWaveAmplitude - line.waveAmplitude) * 0.05;
    line.phi += line.speed * Math.sin(t * 0.5);
    line.theta += line.speed * Math.cos(t * 0.5);

    const x = radius * Math.sin(line.theta) * Math.cos(line.phi);
    const y = radius * Math.sin(line.theta) * Math.sin(line.phi);
    const z = radius * Math.cos(line.theta);

    return { ...line, x, y, z };
  });

  postMessage(updatedLines);
};
