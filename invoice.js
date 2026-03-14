// Invoice Management System
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let currentInvoiceId = parseInt(localStorage.getItem('currentInvoiceId')) || 10000;

// Service line template
function createServiceLine() {
  const lineId = Date.now();
  return `
    <div class="service-line-item" data-line-id="${lineId}">
      <div class="service-line-header">
        <div class="form-group">
          <label>Qty</label>
          <input type="number" class="service-qty" min="1" value="1" data-line="${lineId}">
        </div>
        <div class="form-group">
          <label class="required">Service/Product</label>
          <select class="service-description" data-line="${lineId}" required>
            <option value="">Select Service</option>
            <optgroup label="Auto Detailing">
                <option value="exterior">Exterior Detailing</option>
                <option value="interior">Interior Detailing</option>
                <option value="full">Full Detailing Package</option>
                <option value="protection">Paint Protection</option>
                <option value="engine">Engine Bay Cleaning</option>
                <option value="headlight">Headlight Restoration</option>
                <option value="ceramic">Ceramic Coating</option>
                <option value="tinting">Window Tinting</option>
            </optgroup>
            <optgroup label="Residential Cleaning">
                <option value="res-deep">Residential Deep Clean</option>
                <option value="kitchen">Kitchen Deep Clean</option>
                <option value="bathroom">Bathroom Deep Clean</option>
                <option value="carpet">Carpet Shampooing</option>
                <option value="windows">Window Cleaning</option>
                <option value="move">Move-In/Move-Out Cleaning</option>
            </optgroup>
            <optgroup label="Commercial Cleaning">
                <option value="office">Office Deep Clean</option>
                <option value="restroom">Restroom Sanitization</option>
                <option value="floor">Floor Care & Polishing</option>
                <option value="construction">Post-Construction Cleaning</option>
            </optgroup>
            <optgroup label="Snow Removal - Residential">
                <option value="driveway">Driveway Snow Clearing</option>
                <option value="sidewalk">Sidewalk Snow Clearing</option>
                <option value="res-package">Residential Snow Package</option>
                <option value="roof">Roof Snow Removal</option>
            </optgroup>
            <optgroup label="Snow Removal - Commercial">
                <option value="parking">Commercial Parking Lot Clearing</option>
                <option value="emergency">Emergency Snow Clearing</option>
                <option value="seasonal">Seasonal Snow Contract</option>
                <option value="24-7">24/7 Emergency Snow Service</option>
            </optgroup>
          </select>
        </div>
        <div class="form-group">
          <label>Model/Type</label>
          <input type="text" class="service-model" data-line="${lineId}" placeholder="3M Ceramic, etc.">
        </div>
        <div class="form-group">
          <label>Price ($)</label>
          <input type="number" class="service-price" step="0.01" min="0" value="0" data-line="${lineId}">
        </div>
        <button type="button" class="btn-remove-line" data-line="${lineId}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
}

// Initialize invoice form
function initializeInvoiceForm() {
  const serviceLines = document.getElementById('serviceLines');
  const addServiceBtn = document.getElementById('addServiceBtn');

  // Add first service line
  if (serviceLines && serviceLines.children.length === 0) {
    serviceLines.insertAdjacentHTML('beforeend', createServiceLine());
    attachServiceLineListeners();
  }

  // Add service line button
  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', () => {
      serviceLines.insertAdjacentHTML('beforeend', createServiceLine());
      attachServiceLineListeners();
    });
  }

  // Tax rate and deposit listeners
  const taxRate = document.getElementById('taxRate');
  const depositPaid = document.getElementById('depositPaid');

  if (taxRate) taxRate.addEventListener('input', calculateTotals);
  if (depositPaid) depositPaid.addEventListener('input', calculateTotals);

  // Form submission
  const invoiceForm = document.getElementById('invoiceForm');
  if (invoiceForm) {
    invoiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveInvoice();
    });
  }

  // Preview button
  const previewBtn = document.getElementById('previewInvoiceBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', previewInvoice);
  }
}

// Attach listeners to service lines
function attachServiceLineListeners() {
  // Service selection change
  document.querySelectorAll('.service-description').forEach(select => {
    select.removeEventListener('change', handleServiceChange);
    select.addEventListener('change', handleServiceChange);
  });

  // Quantity and price changes
  document.querySelectorAll('.service-qty, .service-price').forEach(input => {
    input.removeEventListener('input', calculateTotals);
    input.addEventListener('input', calculateTotals);
  });

  // Remove line buttons
  document.querySelectorAll('.btn-remove-line').forEach(btn => {
    btn.removeEventListener('click', handleRemoveLine);
    btn.addEventListener('click', handleRemoveLine);
  });
}

// Handle service selection
function handleServiceChange(e) {
  const select = e.target;
  const lineId = select.dataset.line;
  const priceInput = document.querySelector(`.service-price[data-line="${lineId}"]`);

  const prices = {
    'exterior': 149,
    'full': 299,
    'interior': 129,
    'protection': 599,
    'ceramic': 499,
    'engine': 99,
    'headlight': 79,
    'tinting': 250,
    'res-deep': 200,
    'kitchen': 150,
    'bathroom': 120,
    'carpet': 100,
    'windows': 80,
    'move': 250,
    'office': 300,
    'restroom': 100,
    'floor': 120,
    'construction': 400,
    'driveway': 75,
    'sidewalk': 50,
    'res-package': 200,
    'roof': 150,
    'parking': 250,
    'emergency': 300,
    'seasonal': 1500,
    '24-7': 400
  };

  if (priceInput && prices[select.value]) {
    priceInput.value = prices[select.value];
    calculateTotals();
  } else if (priceInput && select.value === 'Custom Service') {
    priceInput.value = 0; // Reset price for custom service
    calculateTotals();
  }
}

// Remove service line
function handleRemoveLine(e) {
  const lineId = e.currentTarget.dataset.line;
  const lineElement = document.querySelector(`.service-line-item[data-line-id="${lineId}"]`);
  if (lineElement) {
    lineElement.remove();
    calculateTotals();
  }
}

// Calculate totals
function calculateTotals() {
  let subtotal = 0;

  document.querySelectorAll('.service-line-item').forEach(line => {
    const qty = parseFloat(line.querySelector('.service-qty').value) || 0;
    const price = parseFloat(line.querySelector('.service-price').value) || 0;
    subtotal += qty * price;
  });

  const taxRate = parseFloat(document.getElementById('taxRate')?.value || 0) / 100;
  const depositPaid = parseFloat(document.getElementById('depositPaid')?.value || 0);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  const balance = total - depositPaid;

  document.getElementById('displaySubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('displayTax').textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById('displayTotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('displayDeposit').textContent = `$${depositPaid.toFixed(2)}`;
  document.getElementById('displayBalance').textContent = `$${balance.toFixed(2)}`;
}

// Save invoice
function saveInvoice() {
  const invoice = {
    id: currentInvoiceId++,
    date: new Date().toISOString(),
    customer: {
      name: document.getElementById('customerName').value,
      email: document.getElementById('customerEmail').value,
      phone: document.getElementById('customerPhone').value,
      address: document.getElementById('customerAddress').value
    },
    services: [],
    taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
    depositPaid: parseFloat(document.getElementById('depositPaid').value) || 0,
    warrantyInfo: document.getElementById('warrantyInfo').value,
    specialInstructions: document.getElementById('specialInstructions').value,
    internalNotes: document.getElementById('internalNotes').value
  };

  // Collect service lines
  document.querySelectorAll('.service-line-item').forEach(line => {
    const qty = parseFloat(line.querySelector('.service-qty').value) || 0;
    const description = line.querySelector('.service-description').value;
    const model = line.querySelector('.service-model').value;
    const price = parseFloat(line.querySelector('.service-price').value) || 0;

    if (description && qty > 0) {
      invoice.services.push({ qty, description, model, price });
    }
  });

  // Calculate totals
  invoice.subtotal = invoice.services.reduce((sum, s) => sum + (s.qty * s.price), 0);
  invoice.taxAmount = invoice.subtotal * (invoice.taxRate / 100);
  invoice.total = invoice.subtotal + invoice.taxAmount;
  invoice.balance = invoice.total - invoice.depositPaid;
  invoice.status = invoice.balance <= 0 ? 'paid' : invoice.depositPaid > 0 ? 'partial' : 'unpaid';

  invoices.unshift(invoice);
  localStorage.setItem('invoices', JSON.stringify(invoices));
  localStorage.setItem('currentInvoiceId', currentInvoiceId.toString());

  // Show send modal after saving
  showSendModalAfterSave(invoice.id);

  document.getElementById('invoiceForm').reset();
  document.getElementById('invoiceFormContainer').style.display = 'none';
  document.getElementById('invoicesList').style.display = 'block';
  loadInvoices();
}

// Preview invoice
function previewInvoice() {
  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerAddress = document.getElementById('customerAddress').value;
  const warrantyInfo = document.getElementById('warrantyInfo').value;
  const specialInstructions = document.getElementById('specialInstructions').value;

  let servicesHTML = '';
  let itemCount = 0;
  document.querySelectorAll('.service-line-item').forEach(line => {
    const qty = line.querySelector('.service-qty').value;
    const description = line.querySelector('.service-description').value;
    const model = line.querySelector('.service-model').value;
    const price = parseFloat(line.querySelector('.service-price').value) || 0;
    const amount = qty * price;

    if (description) {
      servicesHTML += `
        <tr>
          <td style="text-align: center;">${qty}</td>
          <td>${description}</td>
          <td>${model}</td>
          <td></td>
          <td style="text-align: right;">$${amount.toFixed(2)}</td>
        </tr>
      `;
      itemCount++;
    }
  });

  // Add empty rows to fill table
  for (let i = itemCount; i < 4; i++) {
    servicesHTML += `<tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>`;
  }

  const subtotal = parseFloat(document.getElementById('displaySubtotal').textContent.replace('$', ''));
  const tax = parseFloat(document.getElementById('displayTax').textContent.replace('$', ''));
  const total = parseFloat(document.getElementById('displayTotal').textContent.replace('$', ''));
  const deposit = parseFloat(document.getElementById('displayDeposit').textContent.replace('$', ''));
  const balance = parseFloat(document.getElementById('displayBalance').textContent.replace('$', ''));

  const previewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice Preview</title>
      <link href="invoice.css" rel="stylesheet">
    </head>
    <body style="background: #f5f5f5; padding: 20px;">
      <div class="invoice-preview">
        <div class="invoice-print">
          <div class="invoice-print-header">
            <h1>YAS A TO Z CLEANING SERVICES</h1>

            <div class="business-info">
              127 Manville Rd, Unit 1, Scarborough, ON<br>
              Email: info@yasatozcleaning.com | Phone: (647) 778-8430 / (437) 545-7974<br>
              Business Number: 70105 1361
            </div>
          </div>

          <div class="invoice-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${customerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${customerPhone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${customerAddress}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 60px;">Qty</th>
                <th>Description</th>
                <th style="width: 150px;">Model</th>
                <th style="width: 100px;">Serial #</th>
                <th style="width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>

          <div class="invoice-footer-grid">
            <div class="notes-section">
              <h4>Notes:</h4>
              <p>${specialInstructions}</p>
              <h4 style="margin-top: 15px;">Warranty:</h4>
              <p>${warrantyInfo}</p>
            </div>
            <div class="totals-section">
              <div class="total-row">
                <span>Sub Total</span>
                <strong>$${subtotal.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Tax</span>
                <strong>$${tax.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Total</span>
                <strong>$${total.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Deposit</span>
                <strong>$${deposit.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Balance</span>
                <strong>$${balance.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div class="warranty-section">
            Warranty: Free Rock Chip Repair
          </div>

          <div class="signature-section">
            <strong>Customer's Signature X</strong>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="background: linear-gradient(135deg, #D4AF37, #B8960F); border: none; color: #0A1128; padding: 1rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
          <i class="fas fa-print"></i> Print Invoice
        </button>
        <button onclick="window.close()" style="background: transparent; border: 2px solid #D4AF37; color: #D4AF37; padding: 1rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem; margin-left: 10px;">
          Close Preview
        </button>
      </div>
    </body>
    </html>
  `;

  const previewWindow = window.open('', '_blank', 'width=900,height=800');
  previewWindow.document.write(previewHTML);
  previewWindow.document.close();
}

// Load invoices into table
function loadInvoices() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;

  const filteredInvoices = invoices;

  tbody.innerHTML = filteredInvoices.map(invoice => `
    <tr>
      <td>#${invoice.id}</td>
      <td>
        <div class="client-info">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(invoice.customer.name)}&background=D4AF37&color=0A1128" alt="${invoice.customer.name}">
          <span>${invoice.customer.name}</span>
        </div>
      </td>
      <td>${new Date(invoice.date).toLocaleDateString()}</td>
      <td>$${invoice.total.toFixed(2)}</td>
      <td>$${invoice.balance.toFixed(2)}</td>
      <td><span class="invoice-status ${invoice.status}">${invoice.status}</span></td>
      <td>
        <button class="action-btn" onclick="viewInvoice(${invoice.id})" title="View"><i class="fas fa-eye"></i></button>
        <button class="action-btn" onclick="showSendModal(${invoice.id})" title="Send"><i class="fas fa-paper-plane"></i></button>
        <button class="action-btn" onclick="printInvoice(${invoice.id})" title="Print"><i class="fas fa-print"></i></button>
        <button class="action-btn" onclick="deleteInvoice(${invoice.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// View invoice
function viewInvoice(id) {
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return;

  alert(`Invoice #${id} - ${invoice.customer.name}\nTotal: $${invoice.total.toFixed(2)}\nBalance: $${invoice.balance.toFixed(2)}`);
}

// Print invoice
function printInvoice(id) {
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return;

  let servicesHTML = '';
  invoice.services.forEach(service => {
    const amount = service.qty * service.price;
    servicesHTML += `
      <tr>
        <td style="text-align: center;">${service.qty}</td>
        <td>${service.description}</td>
        <td>${service.model}</td>
        <td></td>
        <td style="text-align: right;">$${amount.toFixed(2)}</td>
      </tr>
    `;
  });

  // Fill empty rows
  for (let i = invoice.services.length; i < 4; i++) {
    servicesHTML += `<tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>`;
  }

  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${invoice.id}</title>
      <link href="invoice.css" rel="stylesheet">
    </head>
    <body style="background: white;">
      <div class="invoice-preview">
        <div class="invoice-print">
          <div class="invoice-print-header">
            <h1>YAS A TO Z CLEANING SERVICES</h1>

            <div class="business-info">
              127 Manville Rd, Unit 1, Scarborough, ON<br>
              Email: info@yasatozcleaning.com | Phone: (647) 778-8430 / (437) 545-7974<br>
              Business Number: 70105 1361
            </div>
          </div>

          <div class="invoice-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${invoice.customer.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${invoice.customer.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${invoice.customer.address}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(invoice.date).toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 60px;">Qty</th>
                <th>Description</th>
                <th style="width: 150px;">Model</th>
                <th style="width: 100px;">Serial #</th>
                <th style="width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>

          <div class="invoice-footer-grid">
            <div class="notes-section">
              <h4>Notes:</h4>
              <p>${invoice.specialInstructions}</p>
              <h4 style="margin-top: 15px;">Warranty:</h4>
              <p>${invoice.warrantyInfo}</p>
            </div>
            <div class="totals-section">
              <div class="total-row">
                <span>Sub Total</span>
                <strong>$${invoice.subtotal.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Tax</span>
                <strong>$${invoice.taxAmount.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Total</span>
                <strong>$${invoice.total.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Deposit</span>
                <strong>$${invoice.depositPaid.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Balance</span>
                <strong>$${invoice.balance.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div class="warranty-section">
            Warranty: Free Rock Chip Repair
          </div>

          <div class="signature-section">
            <strong>Customer's Signature X</strong>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printHTML);
  printWindow.document.close();
}

// Delete invoice
function deleteInvoice(id) {
  if (confirm(`Are you sure you want to delete invoice #${id}?`)) {
    invoices = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    loadInvoices();
  }
}

// Send invoice modal after saving
function showSendModalAfterSave(invoiceId) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  const modal = document.createElement('div');
  modal.className = 'send-modal-overlay';
  modal.innerHTML = `
    <div class="send-modal">
      <div class="send-modal-header">
        <h3><i class="fas fa-check-circle"></i> Invoice #${invoice.id} Created Successfully!</h3>
        <button class="close-modal" onclick="this.closest('.send-modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="send-modal-body">
        <p class="send-modal-subtitle">How would you like to send this invoice to <strong>${invoice.customer.name}</strong>?</p>

        <div class="send-options">
          <div class="send-option" onclick="downloadInvoicePDF(${invoice.id})">
            <div class="send-option-icon pdf">
              <i class="fas fa-file-pdf"></i>
            </div>
            <h4>Download as PDF</h4>
            <p>Download and save the invoice as a PDF file</p>
          </div>

          <div class="send-option" onclick="sendInvoiceEmailHTML(${invoice.id})">
            <div class="send-option-icon email">
              <i class="fas fa-envelope"></i>
            </div>
            <h4>Send via Email</h4>
            <p>Email invoice to ${invoice.customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Send invoice modal
function showSendModal(invoiceId) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) return;

  const modal = document.createElement('div');
  modal.className = 'send-modal-overlay';
  modal.innerHTML = `
    <div class="send-modal">
      <div class="send-modal-header">
        <h3><i class="fas fa-paper-plane"></i> Send Invoice #${invoice.id}</h3>
        <button class="close-modal" onclick="this.closest('.send-modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="send-modal-body">
        <p class="send-modal-subtitle">Choose how you'd like to send this invoice to <strong>${invoice.customer.name}</strong></p>

        <div class="send-options">
          <div class="send-option" onclick="downloadInvoicePDF(${invoice.id})">
            <div class="send-option-icon pdf">
              <i class="fas fa-file-pdf"></i>
            </div>
            <h4>Download as PDF</h4>
            <p>Download and save the invoice as a PDF file to your device</p>
          </div>

          <div class="send-option" onclick="sendInvoiceEmail(${invoice.id})">
            <div class="send-option-icon email">
              <i class="fas fa-envelope"></i>
            </div>
            <h4>Send via Email</h4>
            <p>Email the invoice directly to ${invoice.customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Download invoice as PDF
function downloadInvoicePDF(id) {
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return;

  // Close modal
  document.querySelector('.send-modal-overlay')?.remove();

  // Generate invoice HTML
  const invoiceHTML = generateInvoiceHTML(invoice);

  // Create a temporary window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Trigger print dialog which allows saving as PDF
  setTimeout(() => {
    printWindow.print();
  }, 250);

  // Show success message
  showNotification('PDF download initiated! Use your browser\'s print dialog to save as PDF.', 'success');
}

// Send invoice via email with HTML using EmailJS
function sendInvoiceEmailHTML(id) {
  const invoice = invoices.find(inv => inv.id === id);
  if (!invoice) return;

  // Close modal
  document.querySelector('.send-modal-overlay')?.remove();

  // Show loading notification
  showNotification('Sending invoice via email...', 'info');

  // Generate service rows HTML
  let servicesHTML = '';
  invoice.services.forEach(service => {
    const amount = service.qty * service.price;
    servicesHTML += `
      <tr>
        <td style="text-align: center; padding: 10px; border: 2px solid #000000;">${service.qty}</td>
        <td style="padding: 10px; border: 2px solid #000000;">${service.description}</td>
        <td style="padding: 10px; border: 2px solid #000000;">${service.model}</td>
        <td style="padding: 10px; border: 2px solid #000000;"></td>
        <td style="text-align: right; padding: 10px; border: 2px solid #000000;">$${amount.toFixed(2)}</td>
      </tr>
    `;
  });

  // Fill empty rows
  for (let i = invoice.services.length; i < 3; i++) {
    servicesHTML += `<tr><td style="padding: 10px; border: 2px solid #000000;"></td><td style="padding: 10px; border: 2px solid #000000;"></td><td style="padding: 10px; border: 2px solid #000000;"></td><td style="padding: 10px; border: 2px solid #000000;"></td><td style="padding: 10px; border: 2px solid #000000;"></td></tr>`;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 2px solid #000000;">

          <tr>
            <td style="padding: 20px; text-align: center; border-bottom: 2px solid #000000;">
              <h1 style="margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase;">YAS A TO Z CLEANING SERVICES</h1>
              <p style="margin: 5px 0; font-size: 11px;">127 Manville Rd, Unit 1, Scarborough, ON</p>
              <p style="margin: 5px 0; font-size: 11px;">Email: info@yasatozcleaning.com | Phone: (647) 778-8430 / (437) 545-7974</p>
              <p style="margin: 5px 0; font-size: 11px;">Business Number: 70105 1361</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 15px; border-bottom: 2px solid #000000;">
              <table width="100%" cellpadding="5" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 13px;"><strong>Customer:</strong></td>
                  <td style="font-size: 13px;">${invoice.customer.name}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px;"><strong>Phone:</strong></td>
                  <td style="font-size: 13px;">${invoice.customer.phone}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px;"><strong>Address:</strong></td>
                  <td style="font-size: 13px;">${invoice.customer.address}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px;"><strong>Date:</strong></td>
                  <td style="font-size: 13px;">${new Date(invoice.date).toISOString().split('T')[0]}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f0f0f0;">
                    <th style="border: 1px solid #000000; font-size: 13px; text-align: center; width: 50px;">Qty</th>
                    <th style="border: 1px solid #000000; font-size: 13px; text-align: left;">Description</th>
                    <th style="border: 1px solid #000000; font-size: 13px; text-align: left; width: 120px;">Model</th>
                    <th style="border: 1px solid #000000; font-size: 13px; text-align: left; width: 80px;">Serial #</th>
                    <th style="border: 1px solid #000000; font-size: 13px; text-align: right; width: 100px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${servicesHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60%" style="padding: 15px; border-right: 1px solid #000000; border-top: 2px solid #000000; vertical-align: top;">
                    <h4 style="margin: 0 0 10px 0; font-size: 13px;">Notes:</h4>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5;">${invoice.specialInstructions || 'No special instructions'}</p>
                    <h4 style="margin: 15px 0 10px 0; font-size: 13px;">Warranty:</h4>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5;">${invoice.warrantyInfo || 'Standard warranty applies'}</p>
                  </td>
                  <td width="40%" style="border-top: 2px solid #000000; vertical-align: top;">
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 13px; border-bottom: 1px solid #000000;">Sub Total</td>
                        <td style="font-size: 13px; text-align: right; border-bottom: 1px solid #000000;"><strong>$${invoice.subtotal.toFixed(2)}</strong></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; border-bottom: 1px solid #000000;">Tax</td>
                        <td style="font-size: 13px; text-align: right; border-bottom: 1px solid #000000;"><strong>$${invoice.taxAmount.toFixed(2)}</strong></td>
                      </tr>
                      <tr style="background-color: #f5f5f5;">
                        <td style="font-size: 15px; font-weight: bold; border-bottom: 1px solid #000000;">Total</td>
                        <td style="font-size: 15px; text-align: right; border-bottom: 1px solid #000000;"><strong>$${invoice.total.toFixed(2)}</strong></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; border-bottom: 1px solid #000000;">Deposit</td>
                        <td style="font-size: 13px; text-align: right; border-bottom: 1px solid #000000;"><strong>$${invoice.depositPaid.toFixed(2)}</strong></td>
                      </tr>
                      <tr style="background-color: #f5f5f5;">
                        <td style="font-size: 15px; font-weight: bold;">Balance</td>
                        <td style="font-size: 15px; text-align: right;"><strong>$${invoice.balance.toFixed(2)}</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 15px; text-align: center; border-top: 2px solid #000000; font-weight: bold; font-size: 13px;">
              Warranty: Free Rock Chip Repair
            </td>
          </tr>

          <tr>
            <td style="padding: 15px; border-top: 2px solid #000000;">
              <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold;">Customer's Signature X ___________________________________</p>
            </td>
          </tr>

        </table>

        <table width="600" cellpadding="20" cellspacing="0" border="0">
          <tr>
            <td style="text-align: center; color: #666666; font-size: 12px;">
              <p>Thank you for choosing YAS A TO Z CLEANING SERVICES!</p>
              <p>For any questions, please contact us at (647) 778-8430 or info@yasatozcleaning.com</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // EmailJS configuration
  const emailJSConfig = {
    serviceID: 'service_d86vrjt',
    templateID: 'template_z4s6se9',
    publicKey: 'HM61dF31CNgav6AFw'
  };

  // Prepare email parameters
  const templateParams = {
    to_email: invoice.customer.email,
    to_name: invoice.customer.name,
    from_name: 'YAS A TO Z CLEANING SERVICES',
    subject: `Invoice #${invoice.id} - YAS A TO Z CLEANING SERVICES`,
    invoice_number: invoice.id,
    customer_name: invoice.customer.name,
    total_amount: `$${invoice.total.toFixed(2)}`,
    balance_due: `$${invoice.balance.toFixed(2)}`,
    html_content: htmlContent,
    invoice_date: new Date(invoice.date).toLocaleDateString(),
    message: `Dear ${invoice.customer.name},\n\nPlease find your invoice #${invoice.id} attached below.\n\nTotal Amount: $${invoice.total.toFixed(2)}\nBalance Due: $${invoice.balance.toFixed(2)}\n\nThank you for choosing YAS A TO Z CLEANING SERVICES!\n\nBest regards,\nYAS A TO Z CLEANING SERVICES`
  };

  // Check if EmailJS is loaded
  if (typeof emailjs === 'undefined') {
    showNotification('EmailJS library not loaded. Please check your internet connection.', 'error');
    console.error('EmailJS is not loaded. Make sure to include the EmailJS SDK in your HTML.');
    return;
  }

  // Send email using EmailJS
  emailjs.send(emailJSConfig.serviceID, emailJSConfig.templateID, templateParams, emailJSConfig.publicKey)
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
      showNotification(`Invoice successfully sent to ${invoice.customer.email}!`, 'success');
    })
    .catch((error) => {
      console.error('Failed to send email:', error);
      showNotification('Failed to send email. Please check your EmailJS configuration.', 'error');
    });
}

// Send invoice via email (legacy text version)
function sendInvoiceEmail(id) {
  sendInvoiceEmailHTML(id);
}

// Generate invoice HTML
function generateInvoiceHTML(invoice) {
  let servicesHTML = '';
  invoice.services.forEach(service => {
    const amount = service.qty * service.price;
    servicesHTML += `
      <tr>
        <td style="text-align: center;">${service.qty}</td>
        <td>${service.description}</td>
        <td>${service.model}</td>
        <td></td>
        <td style="text-align: right;">$${amount.toFixed(2)}</td>
      </tr>
    `;
  });

  for (let i = invoice.services.length; i < 4; i++) {
    servicesHTML += `<tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${invoice.id}</title>
      <link href="invoice.css" rel="stylesheet">
    </head>
    <body style="background: white;">
      <div class="invoice-preview">
        <div class="invoice-print">
          <div class="invoice-print-header">
            <h1>YAS A TO Z CLEANING SERVICES</h1>

            <div class="business-info">
              127 Manville Rd, Unit 1, Scarborough, ON<br>
              Email: info@yasatozcleaning.com | Phone: (647) 778-8430 / (437) 545-7974<br>
              Business Number: 70105 1361
            </div>
          </div>

          <div class="invoice-info-grid">
            <div>
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${invoice.customer.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${invoice.customer.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${invoice.customer.address}</span>
              </div>
            </div>
            <div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(invoice.date).toISOString().split('T')[0]}</span>
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 60px;">Qty</th>
                <th>Description</th>
                <th style="width: 150px;">Model</th>
                <th style="width: 100px;">Serial #</th>
                <th style="width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>

          <div class="invoice-footer-grid">
            <div class="notes-section">
              <h4>Notes:</h4>
              <p>${invoice.specialInstructions}</p>
              <h4 style="margin-top: 15px;">Warranty:</h4>
              <p>${invoice.warrantyInfo}</p>
            </div>
            <div class="totals-section">
              <div class="total-row">
                <span>Sub Total</span>
                <strong>$${invoice.subtotal.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Tax</span>
                <strong>$${invoice.taxAmount.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Total</span>
                <strong>$${invoice.total.toFixed(2)}</strong>
              </div>
              <div class="total-row">
                <span>Deposit</span>
                <strong>$${invoice.depositPaid.toFixed(2)}</strong>
              </div>
              <div class="total-row final">
                <span>Balance</span>
                <strong>$${invoice.balance.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div class="warranty-section">
            Warranty: Free Rock Chip Repair
          </div>

          <div class="signature-section">
            <strong>Customer's Signature X</strong>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => window.print(), 250);
        };
      </script>
    </body>
    </html>
  `;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const newInvoiceBtn = document.getElementById('newInvoiceBtn');
  if (newInvoiceBtn) {
    newInvoiceBtn.addEventListener('click', () => {
      document.getElementById('invoiceFormContainer').style.display = 'block';
      document.getElementById('invoicesList').style.display = 'none';
      initializeInvoiceForm();
    });
  }

  loadInvoices();
});