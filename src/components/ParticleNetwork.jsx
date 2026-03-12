import { useEffect, useRef } from 'react';

export default function ParticleNetwork() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let connections = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    brightness: Math.random() * 0.5 + 0.5,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.01,
                });
            }
        };

        const drawBackground = () => {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1b0f3a');
            gradient.addColorStop(1, '#050816');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const drawStars = () => {
            for (let i = 0; i < 100; i++) {
                const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * canvas.width;
                const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * canvas.height;
                const brightness = (Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7) * 0.6;
                const size = Math.random() * 1 + 0.5;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.fill();
            }
        };

        const drawConnections = () => {
            const connectionDistance = 150;
            const maxConnections = 3;

            for (let i = 0; i < particles.length; i++) {
                let connectionCount = 0;
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance && connectionCount < maxConnections) {
                        const opacity = (1 - distance / connectionDistance) * 0.4;
                        const pulseOpacity = (Math.sin(Date.now() * 0.002 + i * 0.5) * 0.2 + 0.8) * opacity;
                        
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        gradient.addColorStop(0, `rgba(0, 212, 255, ${pulseOpacity})`);
                        gradient.addColorStop(1, `rgba(167, 139, 250, ${pulseOpacity * 0.5})`);
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        
                        connectionCount++;
                    }
                }
            }
        };

        const drawParticles = () => {
            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                particle.pulse += particle.pulseSpeed;
                const pulseFactor = Math.sin(particle.pulse) * 0.3 + 0.7;
                const finalBrightness = particle.brightness * pulseFactor;

                // Glow effect
                const glowGradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 4
                );
                glowGradient.addColorStop(0, `rgba(0, 212, 255, ${finalBrightness * 0.8})`);
                glowGradient.addColorStop(0.4, `rgba(0, 212, 255, ${finalBrightness * 0.2})`);
                glowGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = glowGradient;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${finalBrightness})`;
                ctx.fill();

                // Bright center
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${finalBrightness * 0.8})`;
                ctx.fill();
            });
        };

        const animate = () => {
            drawBackground();
            drawStars();
            drawConnections();
            drawParticles();
            animationId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
}
