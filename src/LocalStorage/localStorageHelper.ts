import { Notifier } from "../Notifications/notifications";

export class LocalStorageHelper {
    static getStoredTopicIds(): Array<string> {
        const data = localStorage.getItem("savedTopicIds");
        return data ? JSON.parse(data) : [];
    }

    static storeTopicId(topicId: string): void {
        const current = LocalStorageHelper.getStoredTopicIds();
        if (!current.includes(topicId)) {
            localStorage.setItem("savedTopicIds", JSON.stringify([topicId, ...current]));
        }
    }

    static deleteTopicId(topicId: string): void {
        const current = LocalStorageHelper.getStoredTopicIds();
        const updated = current.filter((id) => id !== topicId);
        localStorage.setItem("savedTopicIds", JSON.stringify(updated));
    }

    static getThemeMode(): "light" | "dark" {
        const mode = localStorage.getItem("themeMode");
        return mode === "light" || mode === "dark" ? mode : "dark";
    }

    static setThemeMode(mode: "light" | "dark"): void {
        localStorage.setItem("themeMode", mode);
    }

    static exportAppDataToFile(): void {
        const data = {
            savedTopicIds: LocalStorageHelper.getStoredTopicIds(),
            themeMode: LocalStorageHelper.getThemeMode(),
        };

        // Get current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure two digits
        const day = String(now.getDate()).padStart(2, "0"); // Ensure two digits
        const hours = String(now.getHours()).padStart(2, "0"); // Ensure two digits
        const minutes = String(now.getMinutes()).padStart(2, "0"); // Ensure two digits

        // Format timestamp as YYYY-MM-DD-HH-MM
        const timestamp = `${year}-${month}-${day}-${hours}-${minutes}`;

        const filename = `paradoxLocalStorageBackup_${timestamp}.json`; // Create filename with timestamp

        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename; // Set the dynamic filename
        a.click();
        URL.revokeObjectURL(url);
    }

    static importAppDataFromFile(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);

                    if (data.savedTopicIds) {
                        localStorage.setItem("savedTopicIds", JSON.stringify(data.savedTopicIds));
                    }

                    if (data.themeMode) {
                        localStorage.setItem("themeMode", data.themeMode);
                    }

                    Notifier.showSuccess("Data imported successfully");
                    resolve();
                } catch (error) {
                    Notifier.showError(error);
                }
            };

            reader.onerror = () => reject("Error reading the file.");

            reader.readAsText(file);
        });
    }
}
