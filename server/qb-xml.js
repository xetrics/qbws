function createCustomerAdd(customer) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<?qbxml version="13.0"?>
<QBXML>
  <QBXMLMsgsRq onError="stopOnError">
    <CustomerAddRq requestID="${customer.id}">
      <CustomerAdd>
        <Name>${customer.name}</Name>
        ${customer.companyName ? `<CompanyName>${customer.companyName}</CompanyName>` : ''}
        ${customer.email ? `<Email>${customer.email}</Email>` : ''}
        ${customer.phone ? `<Phone>${customer.phone}</Phone>` : ''}
      </CustomerAdd>
    </CustomerAddRq>
  </QBXMLMsgsRq>
</QBXML>`;
}

function createInvoiceAdd(invoice) {
    const date = invoice.date || new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<?qbxml version="13.0"?>
<QBXML>
  <QBXMLMsgsRq onError="stopOnError">
    <InvoiceAddRq requestID="${invoice.id}">
      <InvoiceAdd>
        <CustomerRef>
          <FullName>${invoice.customerId}</FullName>
        </CustomerRef>
        <RefNumber>${invoice.invoiceNumber}</RefNumber>
        <TxnDate>${date}</TxnDate>
        <InvoiceLineAdd>
          <Amount>${invoice.amount.toFixed(2)}</Amount>
          <Desc>${invoice.description}</Desc>
        </InvoiceLineAdd>
      </InvoiceAdd>
    </InvoiceAddRq>
  </QBXMLMsgsRq>
</QBXML>`;
}

function createCustomerQuery(customerId) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<?qbxml version="13.0"?>
<QBXML>
  <QBXMLMsgsRq onError="stopOnError">
    <CustomerQueryRq requestID="1">
      <FullName>${customerId}</FullName>
    </CustomerQueryRq>
  </QBXMLMsgsRq>
</QBXML>`;
}

module.exports = { createCustomerQuery, createInvoiceAdd, createCustomerAdd };