import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function NetworkBackground() {
    const [init, setInit] = useState(false);
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = useCallback(async container => {
    }, []);

    if (!init) {
        return <div style={{position: 'fixed', inset: 0, zIndex: -1, background: '#02060f'}}/>;
    }

    return (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={{
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 45,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 2,
                        },
                        repulse: {
                            distance: 100,
                            duration: 0.35,
                        },
                    },
                },
                particles: {
                    color: {
                        value: '#7f95a2', // soft neutral nodes
                    },
                    links: {
                        color: '#6d8ca4',
                        distance: 120,
                        enable: true,
                        opacity: 0.18,
                        width: 1,
                        triangles: {
                            enable: false,
                        }
                    },
                    collisions: {
                        enable: false,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 0.15,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 2200,
                        },
                        value: 32,
                    },
                    opacity: {
                        value: 0.60,
                        animation: {
                            enable: true,
                            speed: 0.4,
                            minimumValue: 0.1,
                        }
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 0.8, max: 1.6 },
                        animation: {
                            enable: true,
                            speed: 0.6,
                            minimumValue: 0.2,
                            sync: false
                        }
                    },
                    shadow: {
                        enable: true,
                        color: "#7f95a2",
                        blur: 8,
                    }
                },
                detectRetina: true,
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                background: '#02060f'
            }}
        />
    );
}
