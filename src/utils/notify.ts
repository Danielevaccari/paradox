import { enqueueSnackbar } from "notistack";
import { errorMessage } from "./format";

export const notify = {
    success: (message: string) => enqueueSnackbar(message, { variant: "success" }),
    info: (message: string) => enqueueSnackbar(message, { variant: "info" }),
    warning: (message: string) => enqueueSnackbar(message, { variant: "warning" }),
    error: (error: unknown) => enqueueSnackbar(errorMessage(error), { variant: "error", autoHideDuration: 6000 }),
};
