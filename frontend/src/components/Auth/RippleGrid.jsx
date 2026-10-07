import React, { useRef, useEffect } from 'react';

const RippleGrid = ({ disableRipple = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let points = [];
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;

    let mouse = { x: -1000, y: -1000, active: false };

    // Offsets for the global gliding motion
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    const initGrid = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      
      points = [];
      targetOffsetX = 0;
      targetOffsetY = 0;
      currentOffsetX = 0;
      currentOffsetY = 0;
      
      // Generate a grid much larger than the screen (from -width to 2*width) to allow panning
      let x_stops = [];
      let current_x = -width;
      while (current_x < width * 2) {
        x_stops.push(current_x);
        current_x += 20 + Math.random() * 80; 
      }
      
      let y_stops = [];
      let current_y = -height;
      while (current_y < height * 2) {
        y_stops.push(current_y);
        current_y += 20 + Math.random() * 80; 
      }

      cols = x_stops.length;
      rows = y_stops.length;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let x = x_stops[i];
          let y = y_stops[j];
          // baseOx/baseOy store the absolute coordinates in the giant grid
          points.push({ baseOx: x, baseOy: y, ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 });
        }
      }
    };

    initGrid();
    window.addEventListener('resize', initGrid);

    const handleMouseMove = (e) => {
      if (disableRipple) return;
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

    if (!disableRipple) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseout', handleMouseLeave);
    }

    // 5-second gliding animation loop
    const shiftInterval = setInterval(() => {
      const directions = [
        { dx: 1, dy: 0 },   // Right
        { dx: -1, dy: 0 },  // Left
        { dx: 0, dy: 1 },   // Down
        { dx: 0, dy: -1 },  // Up
        { dx: 1, dy: 1 },   // Diagonal down-right
        { dx: -1, dy: -1 }, // Diagonal up-left
        { dx: 1, dy: -1 },  // Diagonal up-right
        { dx: -1, dy: 1 }   // Diagonal down-left
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      
      // Shift distance per glide
      const shiftDistance = 250; 
      
      let nextX = targetOffsetX + (dir.dx * shiftDistance);
      let nextY = targetOffsetY + (dir.dy * shiftDistance);

      // Constrain movements so we don't pan past the giant grid edges
      const maxOffsetX = width * 0.6;
      const maxOffsetY = height * 0.6;

      if (nextX > maxOffsetX || nextX < -maxOffsetX) {
        nextX = targetOffsetX - (dir.dx * shiftDistance); // Reverse direction if out of bounds
      }
      if (nextY > maxOffsetY || nextY < -maxOffsetY) {
        nextY = targetOffsetY - (dir.dy * shiftDistance);
      }

      targetOffsetX = nextX;
      targetOffsetY = nextY;
    }, 5000);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Smoothly interpolate the global offset towards the target offset
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.02;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.02;

      // Update physics for points
      for (let i = 0; i < points.length; i++) {
        let p = points[i];
        
        // Solid piece displacement: Update the point's resting position
        p.ox = p.baseOx + currentOffsetX;
        p.oy = p.baseOy + currentOffsetY;

        if (mouse.active && !disableRipple) {
          let dx = p.x - mouse.x;
          let dy = p.y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            let angle = Math.atan2(dy, dx);
            let force = (200 - dist) / 200;
            p.vx += Math.cos(angle) * force * 3;
            p.vy += Math.sin(angle) * force * 3;
          }
        }
        
        // Spring back to updated resting position
        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        
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
      clearInterval(shiftInterval);
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
