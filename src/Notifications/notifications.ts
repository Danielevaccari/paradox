import { SnackbarMessage, enqueueSnackbar } from "notistack";

export class Notifier {
	static showSuccess(message: any) {
		enqueueSnackbar(Notifier.formatMessage(message), {
			variant: "success",
			anchorOrigin: {
				vertical: "top",
				horizontal: "right",
			},
		});
	}

	static showError(message: any) {
		enqueueSnackbar(Notifier.formatMessage(message), {
			variant: "error",
			anchorOrigin: {
				vertical: "top",
				horizontal: "right",
			},
		});
	}

	static showWarning(message: any) {
		enqueueSnackbar(Notifier.formatMessage(message), {
			variant: "warning",
			anchorOrigin: {
				vertical: "top",
				horizontal: "right",
			},
		});
	}

	static showInfo(message: any) {
		enqueueSnackbar(Notifier.formatMessage(message), {
			variant: "info",
			anchorOrigin: {
				vertical: "top",
				horizontal: "right",
			},
		});
	}

	private static formatMessage(message: any): SnackbarMessage {
		if (typeof message === "string" || typeof message === "number") {
			return String(message);
		}

		if (message instanceof Error) {
			return message.message;
		}

		if (typeof message === "object") {
			return JSON.stringify(message);
		}

		return String(message);
	}
}
