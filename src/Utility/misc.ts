const getEditorHeight = (message: string, fontSize: number) => {
    const lines = message.split("\n").length;
    const lineHeight = fontSize * 1.6; // Monaco uses ~1.6em line height
    const cappedHeight = Math.min(lines * lineHeight, 700); // cap height to 700px
    const minHeight = 200; // minimum height
    return `${Math.max(minHeight, cappedHeight)}px`; // cap height if needed
};

export { getEditorHeight };
