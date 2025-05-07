import { Box, Collapse, IconButton, TableCell, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import * as React from "react";
import { hbarLogo } from "../../Hedera/constants";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Hedera } from "../../Hedera/hedera";
import { formatDateToDDMMYYYYhhmmss } from "../../Utility/date";
import { Transaction } from "../../Hedera/types";
import { SuccessOrFail } from "../../Hedera/enumerations";
import { AccountId } from "@hashgraph/sdk";

type Props = {
    accountId: AccountId | string;
    transaction: Transaction;
};

const TransferRow = ({ transaction, accountId }: Props) => {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();

    const transferWithCurrentAccountId = transaction.transfers.find((transfer) => transfer.account === accountId)?.amount || 0;

    return (
        <>
            <TableRow sx={{ height: "24px" }}>
                <Tooltip title={transaction.result}>
                    <TableCell
                        sx={{
                            width: "10px",
                            py: "2px",
                            px: "8px",
                            backgroundColor:
                                transaction.result === SuccessOrFail.Success ? theme.palette.success.light : theme.palette.error.light,
                        }}
                    />
                </Tooltip>
                <TableCell sx={{ py: "2px", px: "8px" }}>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    </IconButton>
                    {transaction.transaction_id}
                </TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{`${Hedera.tinybarToHbar(transferWithCurrentAccountId)} ${hbarLogo}`}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{transaction.transfers.length}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{transaction.name}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{transaction.entity_id}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{`${Hedera.tinybarToHbar(transaction.charged_tx_fee)} ${hbarLogo}`}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>{transaction.node}</TableCell>
                <TableCell sx={{ py: "0px", px: "0px" }}>
                    {formatDateToDDMMYYYYhhmmss(new Date(Number(transaction.consensus_timestamp) * 1000))}
                </TableCell>
            </TableRow>

            {open && (
                <TableRow>
                    <TableCell colSpan={9} sx={{ py: 0, px: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 0, p: 0 }}>
                                {transaction.transfers?.map((transfer, index) => (
                                    <Box
                                        key={index}
                                        display="flex"
                                        justifyContent="space-between"
                                        borderBottom={`1px solid ${theme.palette.divider}`}
                                        p="0rem 12rem 0rem 6rem"
                                        py={0}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {transfer.account}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {`${Hedera.tinybarToHbar(transfer.amount)} ${hbarLogo}`}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export { TransferRow };
