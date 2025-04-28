const formatConsensusTime = (timestamp: string): string => {
    const [seconds] = timestamp.split(".");
    const date = new Date(parseInt(seconds, 10) * 1000);
    return date.toUTCString().slice(5, 22); // e.g., "22 Jan 2024 14:33"
};

const formatDateToDDMMYYYYhhmmss = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0"); // Add seconds
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`; // Include seconds in the returned string
};

const formatDateToDDMMYYYY = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

export { formatConsensusTime, formatDateToDDMMYYYY, formatDateToDDMMYYYYhhmmss };
