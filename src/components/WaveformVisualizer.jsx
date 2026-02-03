import React, { useEffect, useRef } from 'react';

export default function WaveformVisualizer({ audioBuffer, isPlaying, currentTime }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    const channelData = audioBuffer.getChannelData(0);
    const length = channelData.length;
    const step = length / width;

    ctx.strokeStyle = '#8b5cf6'; // Purple
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      const index = Math.floor(i * step);
      const sample = channelData[index];
      const y = (sample + 1) * (height / 2);
      
      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }

    ctx.stroke();

    // Draw playhead
    if (isPlaying && currentTime > 0) {
      const progress = currentTime / audioBuffer.duration;
      const playheadX = progress * width;
      
      ctx.strokeStyle = '#ec4899'; // Pink
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [audioBuffer, isPlaying, currentTime]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={100}
      className="w-full h-24 bg-gray-900 rounded-lg"
    />
  );
}
