import { FileDownloadOutlined, FilterListRounded, SearchRounded, ViewColumnOutlined } from "@mui/icons-material";
import { Badge, Box, InputAdornment, TextField, Tooltip } from "@mui/material";
import {
    ColumnsPanelTrigger,
    DataGrid,
    ExportCsv,
    FilterPanelTrigger,
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
    }
}

/** One toolbar row: the view's own controls, then search, column picker, filters and CSV export. */
const AppToolbar = ({ start }: { start?: ReactNode }) => (
    <Toolbar>
        {start}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, ml: "auto" }}>
            <QuickFilter debounceMs={200}>
                <QuickFilterControl
                    render={({ ref, ...other }) => (
                        <TextField
                            {...other}
                            inputRef={ref}
                            placeholder="Search"
                            aria-label="Search rows"
                            sx={{ width: { xs: 140, sm: 200 } }}
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
            <Tooltip title="Columns">
                <ColumnsPanelTrigger render={<ToolbarButton />}>
                    <ViewColumnOutlined fontSize="small" />
                </ColumnsPanelTrigger>
            </Tooltip>
            <Tooltip title="Filters">
                <FilterPanelTrigger
                    render={(props, state) => (
                        <ToolbarButton {...props}>
                            <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                <FilterListRounded fontSize="small" />
                            </Badge>
                        </ToolbarButton>
                    )}
                />
            </Tooltip>
            <Tooltip title="Download CSV">
                <ExportCsv render={<ToolbarButton />} options={{ allColumns: true }}>
                    <FileDownloadOutlined fontSize="small" />
                </ExportCsv>
            </Tooltip>
        </Box>
    </Toolbar>
);

/**
 * MUI X Data Grid (MIT) with the app's defaults: compact rows, sticky header, virtualized body,
 * one-row toolbar, and styling that follows the theme. Use it as a flex child of a fill card;
 * it scrolls its own rows.
 */
export const AppDataGrid = <R extends GridValidRowModel>({ sx, slots, ...props }: DataGridProps<R>) => (
    <DataGrid<R>
        density="compact"
        disableRowSelectionOnClick
        showToolbar
        pageSizeOptions={[25, 50, 100]}
        rowHeight={36}
        columnHeaderHeight={36}
        {...props}
        slots={{ toolbar: AppToolbar, ...slots }}
        initialState={{ pagination: { paginationModel: { pageSize: 50 } }, ...props.initialState }}
        sx={[
            {
                flex: 1,
                minHeight: 0,
                border: 0,
                borderRadius: 0,
                fontSize: "0.8125rem",
                "--DataGrid-containerBackground": (theme) => theme.palette.background.paper,
                "& .MuiDataGrid-toolbar": {
                    flex: "0 0 auto",
                    minHeight: 0,
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    gap: 1,
                    p: 1,
                },
                "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
                "& .MuiDataGrid-cell--textRight": { justifyContent: "flex-end" },
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                    { outline: "none" },
                "& .MuiDataGrid-row": { cursor: props.onRowClick ? "pointer" : "default" },
                "& .MuiDataGrid-footerContainer": { minHeight: 40 },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
    />
);
