import { useRef, useEffect, useCallback, useState } from "react";

/**
 * SVGFollower — chromatic cursor trail.
 *
 * Mounted as a fullscreen overlay in Chromatica with pointer-events: none
 * on the container, so it never intercepts clicks on the wheel, the nav,
 * or the credits modal. We listen to `window` mousemove/touchmove instead
 * of the container, which keeps the trail global without blocking UI.
 */
export function SVGFollower({
  width,
  height,
  colors = ["red", "blue", "green", "yellow", "white"],
  removeDelay = 400,
  className = "",
  fullscreen = false
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const followersRef = useRef([]);
  const animationRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef([]);

  // Follower class — same logic as the source component, ported to JS.
  // Each instance owns one <path> element and a list of recent points.
  class Follower {
    constructor(stage, color) {
      this.stage = stage;
      this.color = color;
      this.points = [];
      this.line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.line.style.fill = color;
      this.line.style.stroke = color;
      this.line.style.strokeWidth = "1";
      this.stage.appendChild(this.line);
    }

    getDrift() {
      return (Math.random() - 0.5) * 3;
    }

    add(position) {
      const direction = { x: 0, y: 0 };
      if (this.points[0]) {
        direction.x = (position.x - this.points[0].position.x) * 0.25;
        direction.y = (position.y - this.points[0].position.y) * 0.25;
      }

      const point = {
        position,
        time: Date.now(),
        drift: {
          x: this.getDrift() + direction.x / 2,
          y: this.getDrift() + direction.y / 2
        },
        age: 0,
        direction
      };

      const shapeChance = Math.random();
      const chance = 0.1;
      if (shapeChance < chance) this.makeCircle(point);
      else if (shapeChance < chance * 2) this.makeSquare(point);
      else if (shapeChance < chance * 3) this.makeTriangle(point);

      this.points.unshift(point);
    }

    createLine(points) {
      const path = [points.length ? "M" : ""];
      if (points.length > 0) {
        let forward = true;
        let i = 0;
        while (i >= 0) {
          const point = points[i];
          const offsetX = point.direction.x * ((i - points.length) / points.length) * 0.6;
          const offsetY = point.direction.y * ((i - points.length) / points.length) * 0.6;
          const x = point.position.x + (forward ? offsetY : -offsetY);
          const y = point.position.y + (forward ? offsetX : -offsetX);
          point.age += 0.2;
          path.push(String(x + point.drift.x * point.age));
          path.push(String(y + point.drift.y * point.age));
          i += forward ? 1 : -1;
          if (i === points.length) {
            i--;
            forward = false;
          }
        }
      }
      return path.join(" ");
    }

    trim() {
      if (this.points.length > 0) {
        const last = this.points[this.points.length - 1];
        const now = Date.now();
        if (last.time < now - removeDelay) {
          this.points.pop();
        }
      }
      this.line.setAttribute("d", this.createLine(this.points));
    }

    makeCircle(point) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const radius = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1;
      circle.setAttribute("r", String(radius));
      circle.style.fill = this.color;
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
      this.moveShape(circle, point);
    }

    makeSquare(point) {
      const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
      const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      square.setAttribute("width", String(size));
      square.setAttribute("height", String(size));
      square.style.fill = this.color;
      this.moveShape(square, point);
    }

    makeTriangle(point) {
      const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
      const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      triangle.setAttribute("points", `0,0 ${size},${size / 2} 0,${size}`);
      triangle.style.fill = this.color;
      this.moveShape(triangle, point);
    }

    moveShape(shape, point) {
      this.stage.appendChild(shape);
      const driftX =
        point.position.x + point.direction.x * (Math.random() * 20) + point.drift.x * (Math.random() * 10);
      const driftY =
        point.position.y + point.direction.y * (Math.random() * 20) + point.drift.y * (Math.random() * 10);

      shape.style.transform = `translate(${point.position.x}px, ${point.position.y}px)`;
      shape.style.transition = "all 0.5s ease-out";

      setTimeout(() => {
        shape.style.transform = `translate(${driftX}px, ${driftY}px) scale(0) rotate(${Math.random() * 360}deg)`;
        setTimeout(() => {
          if (this.stage.contains(shape)) {
            this.stage.removeChild(shape);
          }
        }, 500);
      }, 10);
    }
  }

  const addPosition = useCallback(
    (clientX, clientY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const position = { x: clientX - rect.left, y: clientY - rect.top };
      followersRef.current.forEach((f) => f.add(position));
      if (isRecording) {
        recordingRef.current.push({
          x: rect.width ? (position.x / rect.width) * 100 : 0,
          y: rect.height ? (position.y / rect.height) * 100 : 0
        });
      }
    },
    [isRecording]
  );

  const animate = useCallback(() => {
    followersRef.current.forEach((f) => f.trim());
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Initialize followers once.
  useEffect(() => {
    if (!svgRef.current) return;
    followersRef.current = colors.map((color) => new Follower(svgRef.current, color));
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Clear stage so a re-init (palette change) doesn't double up paths.
      if (svgRef.current) {
        while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      }
      followersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors.join("|")]);

  // Global pointer listeners — so the trail follows the cursor everywhere
  // without the container intercepting clicks on the rest of the app.
  useEffect(() => {
    const onMouseMove = (e) => addPosition(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) addPosition(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [addPosition]);

  const containerStyle = fullscreen
    ? { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }
    : { width, height };

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`} style={containerStyle} aria-hidden="true">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default SVGFollower;