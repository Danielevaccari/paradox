import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import * as React from "react";
import { hbarLogo } from "../../Hedera/constants";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Hedera } from "../../Hedera/hedera";
import { formatDateToDDMMYYYYhhmm } from "../../Utility/date";
import { Transaction } from "../../Hedera/types";
import { SuccessOrFail } from "../../Hedera/enumerations";

type Props = {
    transaction: Transaction;
};

const TransferRow = ({ transaction }: Props) => {
    const [open, setOpen] = React.useState(false);

    const negativeTransfersSummed = transaction.transfers?.reduce((acc, transfer) => {
        if (transfer.amount < 0) {
            return acc + transfer.amount;
        }
        return acc;
    }, 0);

    return (
        <>
            <TableRow>
                <TableCell
                    style={{
                        width: "10px",
                        backgroundColor: transaction.result === SuccessOrFail.Success ? "lightgreen" : "salmon",
                    }}
                />
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    {transaction.transaction_id}
                </TableCell>
                <TableCell>{`${Hedera.tinybarToHbar(negativeTransfersSummed)} ${hbarLogo}`}</TableCell>
                <TableCell>{transaction.transfers.length}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                {/* Removed transaction.result cell because now we show it as a color */}
                <TableCell>{`${Hedera.tinybarToHbar(transaction.charged_tx_fee)} ${hbarLogo}`}</TableCell>
                <TableCell>{transaction.node}</TableCell>
                <TableCell>{formatDateToDDMMYYYYhhmm(new Date(Number(transaction.consensus_timestamp) * 1000))}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={300}>Account</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transaction.transfers?.map((transfer, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{transfer.account}</TableCell>
                                            <TableCell>{`${Hedera.tinybarToHbar(transfer.amount)} ${hbarLogo}`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export { TransferRow };
