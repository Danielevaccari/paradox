import * as React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Tooltip, TablePagination, Paper, Box } from "@mui/material";
import { Transaction } from "../../Hedera/types";
import { Notifier } from "../../Notifications/notifications";
import { styled } from "@mui/material/styles";
import { AccountId } from "@hiero-ledger/sdk";
import { TransferRow } from "./TransferRow";
import { HederaMirrorNode } from "../../Hedera/hederaMirrorNode";
import { TransactionType } from "../../Hedera/enumerations";

type Props = {
    className?: string;
    accountId: AccountId | string;
    transactionType?: TransactionType;
};

const TransactionListBase = ({ className, accountId, transactionType }: Props) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
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

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedTransactions = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className={className}>
            <Paper elevation={2} className="table-container">
                <Box className="table-body">
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
                </Box>
                <TablePagination
                    page={page}
                    component="div"
                    rowsPerPage={rowsPerPage}
                    count={transactions.length}
                    rowsPerPageOptions={[25, 50, 100]}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
};

const TransactionList = styled(TransactionListBase)`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .table-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .table-body {
        overflow-y: auto;
        flex: 1;
    }

    .MuiTableCell-root {
        padding: 0rem 0.5rem 0rem 0.5rem;
    }

    .MuiTableRow-root {
        height: 24px;
    }
`;

export { TransactionList };
