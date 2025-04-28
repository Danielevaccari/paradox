const getRandomNumberBetweenOneAndSixMillion = () => {
    return Math.floor(Math.random() * 6000000) + 1;
};

const calculateByteSize = (content: string) => {
    const encoder = new TextEncoder();
    return encoder.encode(content).length; // Returns the byte length of the content
};

export { getRandomNumberBetweenOneAndSixMillion, calculateByteSize };
