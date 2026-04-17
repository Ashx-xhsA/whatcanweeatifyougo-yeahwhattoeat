import React, { useEffect, useState } from 'react';

const SpringPetals = () => {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        // Generate 40 falling petals with random properties
        const arr = Array.from({length: 40}).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // random start horizontal %
            animationDuration: 4 + Math.random() * 8, // 4-12s fall time
            animationDelay: Math.random() * 10,
            size: 6 + Math.random() * 6, // 6-12px size for pixel look
            opacity: 0.6 + Math.random() * 0.4,
            driftDirection: Math.random() > 0.5 ? 1 : -1
        }));
        setPetals(arr);
    }, []);

    return (
        <div className="petals-container">
            {petals.map(p => (
                <div key={p.id} className="petal" style={{
                    left: `${p.left}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDuration: `${p.animationDuration}s`,
                    animationDelay: `${p.animationDelay}s`,
                    opacity: p.opacity,
                    '--drift-end': `${p.driftDirection * (50 + Math.random() * 150)}px`
                }} />
            ))}
        </div>
    );
};

export default SpringPetals;
