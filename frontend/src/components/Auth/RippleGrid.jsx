import React, { useRef, useEffect } from 'react';

const RippleGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let points = [];
    let cols = 0;
    let rows = 0;
    const gridSize = 40;
    let width = 0;
    let height = 0;

    let mouse = { x: -1000, y: -1000, active: false };

    const initGrid = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      
      points = [];
      cols = Math.floor(width / gridSize) + 2;
      rows = Math.floor(height / gridSize) + 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = i * gridSize;
          let y = j * gridSize;
          points.push({ ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 });
        }
      }
    };

    initGrid();
    window.addEventListener('resize', initGrid);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update physics for points
      for (let i = 0; i < points.length; i++) {
        let p = points[i];
        
        if (mouse.active) {
          let dx = p.x - mouse.x;
          let dy = p.y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            let angle = Math.atan2(dy, dx);
            // push points away
            let force = (200 - dist) / 200;
            p.vx += Math.cos(angle) * force * 3;
            p.vy += Math.sin(angle) * force * 3;
          }
        }
        
        // Spring back to original position
        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        
        // Damping/Friction
        p.vx *= 0.85;
        p.vy *= 0.85;
        
        p.x += p.vx;
        p.y += p.vy;
      }
      
      // Draw lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let idx = i * rows + j;
          let p = points[idx];
          if (!p) continue;
          
          if (j < rows - 1) {
            let nextY = points[idx + 1];
            if (nextY) {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(nextY.x, nextY.y);
            }
          }
          if (i < cols - 1) {
            let nextX = points[(i + 1) * rows + j];
            if (nextX) {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(nextX.x, nextX.y);
            }
          }
        }
      }
      
      ctx.stroke();
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initGrid);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

export default RippleGrid;
