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
            <TableRow>
                <Tooltip title={transaction.result}>
                    <TableCell
                        style={{
                            width: "10px",
                            backgroundColor:
                                transaction.result === SuccessOrFail.Success ? theme.palette.success.light : theme.palette.error.light,
                        }}
                    />
                </Tooltip>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    {transaction.transaction_id}
                </TableCell>
                <TableCell>{`${Hedera.tinybarToHbar(transferWithCurrentAccountId)} ${hbarLogo}`}</TableCell>
                <TableCell>{transaction.transfers.length}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>{transaction.entity_id}</TableCell>
                <TableCell>{`${Hedera.tinybarToHbar(transaction.charged_tx_fee)} ${hbarLogo}`}</TableCell>
                <TableCell>{transaction.node}</TableCell>
                <TableCell>{formatDateToDDMMYYYYhhmmss(new Date(Number(transaction.consensus_timestamp) * 1000))}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={2}>
                            {transaction.transfers?.map((transfer, index) => (
                                <Box
                                    key={index}
                                    display="flex"
                                    padding="0.25rem 1rem"
                                    justifyContent="space-between"
                                    borderBottom={`1px solid ${theme.palette.divider}`}
                                >
                                    <Typography color="text.secondary">{transfer.account}</Typography>
                                    <Typography color="text.secondary">{`${Hedera.tinybarToHbar(transfer.amount)} ${hbarLogo}`}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export { TransferRow };
