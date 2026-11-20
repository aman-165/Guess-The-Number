
export const getPlayerLevel = (xp) => {
    if (xp >= 2000) {
        return { level: 6, title: "Legend" };
    } else if (xp >= 1000) {
        return { level: 5, title: "Master" };
    } else if (xp >= 500) {
        return { level: 4, title: "Expert" };
    } else if (xp >= 250) {
        return { level: 3, title: "Skilled" };
    } else if (xp >= 100) {
        return { level: 2, title: "Rookie" };
    }

    return { level: 1, title: "Beginner" };
};

export const getXPProgress = (xp) => {
    const levels = [
        { min: 0, max: 99 },
        { min: 100, max: 249 },
        { min: 250, max: 499 },
        { min: 500, max: 999 },
        { min: 1000, max: 1999 },
        { min: 2000, max: Infinity }
    ];

    const level = getPlayerLevel(xp).level;
    const currentLevel = levels[level - 1];

    if (level === 6) {
        return 100;
    }

    return Math.floor(
        ((xp - currentLevel.min) /
        (currentLevel.max - currentLevel.min + 1)) * 100
    );
};

// Temporary testing
console.log("XP 0:", getPlayerLevel(0), getXPProgress(0));
console.log("XP 150:", getPlayerLevel(150), getXPProgress(150));
console.log("XP 600:", getPlayerLevel(600), getXPProgress(600));
console.log("XP 2500:", getPlayerLevel(2500), getXPProgress(2500));
