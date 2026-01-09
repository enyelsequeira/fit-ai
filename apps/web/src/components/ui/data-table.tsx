import { Table as MantineTable } from "@mantine/core";

function Table({ children, ...props }: React.ComponentProps<typeof MantineTable>) {
  return (
    <MantineTable highlightOnHover {...props}>
      {children}
    </MantineTable>
  );
}

function TableHeader({ children, ...props }: React.ComponentProps<typeof MantineTable.Thead>) {
  return <MantineTable.Thead {...props}>{children}</MantineTable.Thead>;
}

function TableBody({ children, ...props }: React.ComponentProps<typeof MantineTable.Tbody>) {
  return <MantineTable.Tbody {...props}>{children}</MantineTable.Tbody>;
}

function TableFooter({ children, ...props }: React.ComponentProps<typeof MantineTable.Tfoot>) {
  return <MantineTable.Tfoot {...props}>{children}</MantineTable.Tfoot>;
}

function TableRow({ children, ...props }: React.ComponentProps<typeof MantineTable.Tr>) {
  return <MantineTable.Tr {...props}>{children}</MantineTable.Tr>;
}

function TableHead({ children, ...props }: React.ComponentProps<typeof MantineTable.Th>) {
  return <MantineTable.Th {...props}>{children}</MantineTable.Th>;
}

function TableCell({ children, ...props }: React.ComponentProps<typeof MantineTable.Td>) {
  return <MantineTable.Td {...props}>{children}</MantineTable.Td>;
}

function TableCaption({ children, ...props }: React.ComponentProps<typeof MantineTable.Caption>) {
  return <MantineTable.Caption {...props}>{children}</MantineTable.Caption>;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
