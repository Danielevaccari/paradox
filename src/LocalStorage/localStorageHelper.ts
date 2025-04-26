export class LocalStorageHelper {
    static getStoredTopicIds(): Array<string> {
        const data = localStorage.getItem("savedTopicIds");
        return data ? JSON.parse(data) : [];
    }

    static storeTopicId(topicId: string): void {
        const current = LocalStorageHelper.getStoredTopicIds();

        // Check if the topic id already exists and do not save if it does
        if (!current.includes(topicId)) {
            localStorage.setItem("savedTopicIds", JSON.stringify([topicId, ...current]));
        }
    }

    static deleteTopicId(topicId: string): void {
        const current = LocalStorageHelper.getStoredTopicIds();
        const updated = current.filter((id) => id !== topicId);

        localStorage.setItem("savedTopicIds", JSON.stringify(updated));
    }
}
