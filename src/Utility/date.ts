const formatConsensusTime = (timestamp: string): string => {
    const [seconds] = timestamp.split(".");
    const date = new Date(parseInt(seconds, 10) * 1000);
    return date.toUTCString().slice(5, 22); // e.g., "22 Jan 2024 14:33"
};

export { formatConsensusTime };
