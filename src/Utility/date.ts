const formatConsensusTime = (timestamp: string): string => {
    const [seconds] = timestamp.split(".");
    const date = new Date(parseInt(seconds, 10) * 1000);
    return date.toUTCString().slice(5, 22); // e.g., "22 Jan 2024 14:33"
};

const formatDateToDDMMYYYY = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

export { formatConsensusTime, formatDateToDDMMYYYY };
