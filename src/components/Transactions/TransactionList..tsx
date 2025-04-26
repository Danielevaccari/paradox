import * as React from "react";
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Transaction } from "../../Hedera/types";
import { Hedera } from "../../Hedera/hedera";
import { Notifier } from "../../Notifications/notifications";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { TransferRow } from "./TransferRow";

type Props = {
    className?: string;
    accountId: AccountId | string;
};

let TransactionList = ({ className, accountId }: Props) => {
    const [transactions, setTransactions] = React.useState<Array<Transaction>>([]);

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const txns = await Hedera.getAccountTransactions(accountId);
                setTransactions(txns || []);
            } catch (error) {
                Notifier.showError(error);
            }
        };

        if (accountId) {
            fetchTransactions();
        }
    }, [accountId]);

    return (
        <div className={className}>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Transactions {accountId.toString()}
                </Typography>
                {transactions.length > 0 && (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Txs</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Result</TableCell>
                                <TableCell>Fee</TableCell>
                                <TableCell>Node</TableCell>
                                <TableCell>Timestamp</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TransferRow key={tx.transaction_id} transaction={tx} />
                            ))}
                        </TableBody>
                    </Table>
                )}

                {transactions.length === 0 && <Typography>No transactions found for this account</Typography>}
            </Paper>
        </div>
    );
};

TransactionList = styled(TransactionList)`
    width: 100%;
    height: 100%;
`;

export { TransactionList };
