import * as React from "react";
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, TablePagination } from "@mui/material";
import { Transaction } from "../../Hedera/types";
import { Notifier } from "../../Notifications/notifications";
import styled from "styled-components";
import { AccountId } from "@hashgraph/sdk";
import { TransferRow } from "./TransferRow";
import { HederaMirrorNode } from "../../Hedera/hederaMirrorNode";
import { TransactionType } from "../../Hedera/enumerations";

type Props = {
    className?: string;
    accountId: AccountId | string;
    transactionType?: TransactionType;
};

let TransactionList = ({ className, accountId, transactionType }: Props) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [transactions, setTransactions] = React.useState<Array<Transaction>>([]);

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const txns = await HederaMirrorNode.getAccountTransactionsRecursively(accountId.toString(), transactionType);
                setTransactions(txns || []);
            } catch (error) {
                Notifier.showError(error);
            }
        };

        if (accountId) {
            fetchTransactions();
        }
    }, [accountId, transactionType]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when changing rows per page
    };

    // Calculate the transactions to display for the current page
    const paginatedTransactions = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className={className}>
            <Paper elevation={3}>
                {transactions.length > 0 && (
                    <>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Tx ID</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Txs</TableCell>
                                    <TableCell>Type</TableCell>
                                    <Tooltip title="E.g. Topic ID, etc">
                                        <TableCell>Entity ID</TableCell>
                                    </Tooltip>
                                    <TableCell>Fee</TableCell>
                                    <TableCell>Node</TableCell>
                                    <TableCell>Timestamp</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTransactions.map((tx) => (
                                    <TransferRow key={tx.transaction_id} accountId={accountId} transaction={tx} />
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            page={page}
                            component="div"
                            rowsPerPage={rowsPerPage}
                            count={transactions.length}
                            rowsPerPageOptions={[25, 50, 100]}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
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
