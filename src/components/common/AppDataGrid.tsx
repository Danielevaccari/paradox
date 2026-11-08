import { FileDownloadOutlined, SearchRounded } from "@mui/icons-material";
import { Box, InputAdornment, TextField, Tooltip } from "@mui/material";
import {
    DataGrid,
    ExportCsv,
    QuickFilter,
    QuickFilterControl,
    Toolbar,
    ToolbarButton,
    type DataGridProps,
    type GridValidRowModel,
} from "@mui/x-data-grid";
import type { ReactNode } from "react";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        /** View-specific controls rendered at the start of the grid toolbar. */
        start?: ReactNode;
        /** Hide search and export (for very narrow lists). */
        minimal?: boolean;
    }
}

/** One toolbar row: the view's own controls, then search and CSV export. Nothing else. */
const AppToolbar = ({ start, minimal }: { start?: ReactNode; minimal?: boolean }) => (
    <Toolbar>
        {start}
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ml: { sm: "auto" },
                "& > div:first-of-type": { flex: { xs: 1, sm: minimal ? 1 : "0 1 auto" } },
                flex: { xs: "1 1 100%", sm: minimal ? "1 1 100%" : "0 1 auto" },
            }}
        >
            <QuickFilter debounceMs={150}>
                <QuickFilterControl
                    render={({ ref, ...other }) => (
                        <TextField
                            {...other}
                            inputRef={ref}
                            placeholder="Search"
                            aria-label="Search rows"
                            fullWidth
                            sx={{ width: minimal ? "100%" : { sm: 220 } }}
                            slotProps={{
                                ...other.slotProps,
                                input: {
                                    ...other.slotProps?.input,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRounded fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    )}
                />
            </QuickFilter>
            {!minimal && (
                <Tooltip title="Download CSV">
                    <ExportCsv render={<ToolbarButton />} options={{ allColumns: true }}>
                        <FileDownloadOutlined fontSize="small" />
                    </ExportCsv>
                </Tooltip>
            )}
        </Box>
    </Toolbar>
);

export const ROW_HEIGHT = 52;
export const ROW_HEIGHT_TWO_LINES = 60;

/**
 * MUI X Data Grid (MIT) with the app's defaults: roomy rows, sticky header, virtualized body,
 * one-row toolbar, no borders or cards. Use it as a flex child; it scrolls its own rows.
 */
export const AppDataGrid = <R extends GridValidRowModel>({ sx, slots, ...props }: DataGridProps<R>) => (
    <DataGrid<R>
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        showToolbar
        pageSizeOptions={[25, 50, 100]}
        rowHeight={ROW_HEIGHT}
        columnHeaderHeight={40}
        {...props}
        slots={{ toolbar: AppToolbar, ...slots }}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } }, ...props.initialState }}
        sx={[
            {
                flex: 1,
                minHeight: 0,
                border: 0,
                borderRadius: 0,
                fontSize: "0.875rem",
                fontVariantNumeric: "tabular-nums",
                "--DataGrid-containerBackground": (theme) => theme.palette.background.default,
                "--DataGrid-t-header-background-base": (theme) => theme.palette.background.default,
                "--DataGrid-t-color-background-base": (theme) => theme.palette.background.default,
                "--DataGrid-t-color-background-overlay": (theme) => theme.palette.background.default,
                bgcolor: "background.default",
                "& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-footerContainer, & .MuiDataGrid-toolbar":
                    {
                        bgcolor: "background.default",
                    },
                "& .MuiDataGrid-toolbar": {
                    flex: "0 0 auto",
                    minHeight: 0,
                    height: "auto",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    gap: 1,
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                },
                "& .MuiDataGrid-columnHeaders": { borderBottom: 1, borderColor: "divider" },
                "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": { px: { xs: 1.5, sm: 2 } },
                "& .MuiDataGrid-columnSeparator": { display: "none" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" },
                "& .MuiDataGrid-cell": { display: "flex", alignItems: "center", borderColor: "divider" },
                "& .MuiDataGrid-cell--textRight": { justifyContent: "flex-end" },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                    { outline: "none" },
                "& .MuiDataGrid-row": { cursor: props.onRowClick ? "pointer" : "default" },
                "& .MuiDataGrid-row.is-selected, & .MuiDataGrid-row.is-selected:hover": { bgcolor: "action.selected" },
                "& .MuiDataGrid-footerContainer": { minHeight: 44, borderColor: "divider" },
                "& .secondary": { color: "text.secondary" },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
    />
);
