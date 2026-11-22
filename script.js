let products = [
    { id: 1, name: "Mens's bar necklace", price: 180, qty: 1 }
];

function renderProducts() {
    const list = document.getElementById("productList");
    list.innerHTML = "";

    products.forEach((item) => {
        const row = document.createElement("div");
        row.className = "product-row";

        const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);

        row.innerHTML = `
            <input type="text" class="input-name" placeholder="Product Name" value="${escapeHtml(item.name)}"
                oninput="updateProduct(${item.id}, 'name', this.value)">
            <input type="number" placeholder="Price" min="0" value="${item.price}"
                oninput="updateProduct(${item.id}, 'price', this.value)">
            <input type="number" placeholder="Qty" min="1" value="${item.qty}"
                oninput="updateProduct(${item.id}, 'qty', this.value)">
            <div class="row-total" id="total-${item.id}">Tk ${itemTotal}</div>
            <button type="button" class="btn-delete" title="Remove product" onclick="removeProduct(${item.id})">✕</button>
        `;

        list.appendChild(row);
    });

    calculateAll();
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function updateProduct(id, field, value) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (field === "name") {
        product.name = value;
    } else {
        product[field] = Number(value) || 0;
        const rowTotalEl = document.getElementById(`total-${id}`);
        if (rowTotalEl) {
            rowTotalEl.textContent = `Tk ${product.price * product.qty}`;
        }
    }
    calculateAll();
}

function addProduct() {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name: "", price: 0, qty: 1 });
    renderProducts();
}

function removeProduct(id) {
    if (products.length === 1) {
        products[0] = { id: 1, name: "", price: 0, qty: 1 };
    } else {
        products = products.filter(p => p.id !== id);
    }
    renderProducts();
}

function calculateAll() {
    const subtotal = products.reduce((sum, item) => {
        return sum + ((Number(item.price) || 0) * (Number(item.qty) || 0));
    }, 0);

    const deliveryCharge = Number(document.getElementById("deliveryChargeInput").value) || 0;
    const totalPayment = subtotal + deliveryCharge;

    document.getElementById("totalPaymentDisplay").textContent = `Tk ${totalPayment}`;
}

function formatDate(dateObj) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
}

function updateDeliveryDates() {
    const location = document.getElementById("deliveryLocation").value;
    const locationText = document.getElementById("locationText");
    const dateText = document.getElementById("deliveryDateText");

    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    if (location === "outside") {
        locationText.textContent = "Outside Dhaka";
        startDate.setDate(today.getDate() + 2);
        endDate.setDate(today.getDate() + 3);
        dateText.textContent = `2-3 days (${formatDate(startDate)} to ${formatDate(endDate)})`;
    } else {
        locationText.textContent = "Inside Dhaka";
        startDate.setDate(today.getDate() + 1);
        endDate.setDate(today.getDate() + 2);
        dateText.textContent = `1-2 days (${formatDate(startDate)} to ${formatDate(endDate)})`;
    }
}

function handleLocationChange() {
    const location = document.getElementById("deliveryLocation").value;
    const chargeInput = document.getElementById("deliveryChargeInput");

    chargeInput.value = location === "outside" ? 130 : 70;
    updateDeliveryDates();
    calculateAll();
}

function copyText(type) {
    const deliveryCharge = Number(document.getElementById("deliveryChargeInput").value) || 0;
    const subtotal = products.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
    const totalPayment = subtotal + deliveryCharge;
    const locationName = document.getElementById("locationText").textContent;
    const deliveryTiming = document.getElementById("deliveryDateText").textContent;

    const productLines = products
        .filter(p => p.name.trim() !== "" || p.price > 0)
        .map((p, index) => `${index + 1}. ${p.name || "Product"} (${p.qty}x) - Tk ${p.price * p.qty}`)
        .join("\n");

    let textToCopy = "";

    if (type === "quotation") {
        textToCopy = `*S.R. PRIME MART - Price Quotation*\n\n` +
            `${productLines}\n\n` +
            `Delivery Charge (${locationName}): Tk ${deliveryCharge}\n` +
            `*Total Payment: Tk ${totalPayment}*\n` +
            `Payment Method: Full Cash on Delivery\n` +
            `Estimated Delivery: ${deliveryTiming}`;
    } else if (type === "orderForm") {
        textToCopy = `অর্ডারটি কনফার্ম করতে অনুগ্রহ করে নিচের তথ্যগুলো দিন:\n\n` +
            `নাম:\n` +
            `মোবাইল নাম্বার:\n` +
            `সম্পূর্ণ ঠিকানা:\n\n` +
            `--- অর্ডার বিবরণ ---\n` +
            `${productLines}\n` +
            `ডেলিভারি চার্জ: Tk ${deliveryCharge}\n` +
            `সর্বমোট বিল: Tk ${totalPayment} (Full Cash on Delivery)`;
    } else if (type === "fbMessage") {
        textToCopy = `আসসালামু আলাইকুম! S.R. PRIME MART-এ যোগাযোগ করার জন্য ধন্যবাদ।\n\n` +
            `আপনার পছন্দের প্রোডাক্টের বিস্তারিত:\n` +
            `${productLines}\n` +
            `ডেলিভারি চার্জ (${locationName}): Tk ${deliveryCharge}\n` +
            `সর্বমোট: Tk ${totalPayment} (সম্পূর্ণ ক্যাশ অন ডেলিভারি)\n` +
            `সম্ভাব্য ডেলিভারি সময়: ${deliveryTiming}\n\n` +
            `অর্ডার করতে চাইলে আপনার নাম, ঠিকানা এবং ফোন নাম্বারটি দিন।`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Copied to clipboard!");
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// Initialize on page load
renderProducts();
updateDeliveryDates();
