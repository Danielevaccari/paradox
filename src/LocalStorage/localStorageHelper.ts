import { TransactionType } from "../Hedera/enumerations";
import { HederaNetwork } from "../Hedera/types";
import { Notifier } from "../Notifications/notifications";

export class LocalStorageHelper {
    static getHederaNetwork(): HederaNetwork {
        const value = localStorage.getItem("hederaNetworkInUse") as HederaNetwork;
        return value ?? "testnet"; // default fallback
    }

    static setHederaNetwork(network: HederaNetwork): void {
        localStorage.setItem("hederaNetworkInUse", network);
    }

    private static key(baseKey: string): string {
        return `${this.getHederaNetwork()}_${baseKey}`;
    }

    static getStoredTopicIds(): Array<string> {
        const data = localStorage.getItem(this.key("savedTopicIds"));
        return data ? JSON.parse(data) : [];
    }

    static storeTopicId(topicId: string): void {
        const current = this.getStoredTopicIds();
        if (!current.includes(topicId)) {
            localStorage.setItem(this.key("savedTopicIds"), JSON.stringify([topicId, ...current]));
        }
    }

    static deleteTopicId(topicId: string): void {
        const current = this.getStoredTopicIds();
        const updated = current.filter((id) => id !== topicId);
        localStorage.setItem(this.key("savedTopicIds"), JSON.stringify(updated));
    }

    static getThemeMode(): "light" | "dark" {
        const mode = localStorage.getItem(this.key("themeMode"));
        return mode === "light" || mode === "dark" ? mode : "dark";
    }

    static setThemeMode(mode: "light" | "dark"): void {
        localStorage.setItem(this.key("themeMode"), mode);
    }

    static getTopicMessageFontSize(): number {
        const fontSize = localStorage.getItem(this.key("topicMessageFontSize"));
        const fontSizeNumber = parseInt(fontSize as string, 10);
        return isNaN(fontSizeNumber) ? 12 : fontSizeNumber; // Default font size
    }

    static setTopicMessageFontSize(fontSize: number): void {
        localStorage.setItem(this.key("topicMessageFontSize"), fontSize.toString());
    }

    static getTopicMessageEditorType(): string {
        const editorType = localStorage.getItem(this.key("topicMessageEditorType"));
        return editorType ? editorType : "json"; // Default editor type
    }

    static setTopicMessageEditorType(editorType: string): void {
        localStorage.setItem(this.key("topicMessageEditorType"), editorType);
    }

    static getTransactionListTransactionType() {
        const transactionType = localStorage.getItem(this.key("transactionListTransactionType")) as TransactionType;
        return transactionType ? transactionType : TransactionType.CONSENSUSCREATETOPIC; // Default to undefined
    }

    static setTransactionListTransactionType(transactionType: TransactionType): void {
        localStorage.setItem(this.key("transactionListTransactionType"), transactionType);
    }

    static exportAppDataToFile(): void {
        const data = {
            savedTopicIds: this.getStoredTopicIds(),
            themeMode: this.getThemeMode(),
            topicMessageFontSize: this.getTopicMessageFontSize(),
            topicMessageEditorType: this.getTopicMessageEditorType(),
        };

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        const timestamp = `${year}-${month}-${day}-${hours}-${minutes}`;
        const filename = `paradoxLocalStorageBackup_${this.getHederaNetwork()}_${timestamp}.json`;

        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
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
                        localStorage.setItem(this.key("savedTopicIds"), JSON.stringify(data.savedTopicIds));
                    }

                    if (data.themeMode) {
                        localStorage.setItem(this.key("themeMode"), data.themeMode);
                    }

                    if (data.topicMessageFontSize) {
                        localStorage.setItem(this.key("topicMessageFontSize"), data.topicMessageFontSize);
                    }

                    if (data.topicMessageEditorType) {
                        localStorage.setItem(this.key("topicMessageEditorType"), data.topicMessageEditorType);
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
