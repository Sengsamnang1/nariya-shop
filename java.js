let cart = 0;
const cartItems = [];
const itemQuantities = {};
const cartStorageKey = "nariya-cart";
const accountsStorageKey = "nariya-accounts";
const currentAccountStorageKey = "nariya-current-account";
const paymentMethodStorageKey = "nariya-payment-method";
const deliveryAddressStorageKey = "nariya-delivery-address";
const qrBankStorageKey = "nariya-qr-bank";
const qrBankFiles = {
    aba: { name: "ABA Bank", file: "Qr.jpg" },
    acleda: { name: "ACLEDA Bank", file: "Qr2.jpg" },
    wing: { name: "Wing Bank", file: "Qr3.jpg" }
};

const cartCount =
    document.getElementById("cartCount");

const cartButton =
    document.getElementById("cartButton");

const accountButton =
    document.getElementById("accountButton");

const authModal =
    document.getElementById("authModal");

const authClose =
    document.getElementById("authClose");

const authTitle =
    document.getElementById("authTitle");

const authMessage =
    document.getElementById("authMessage");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const authAccount =
    document.getElementById("authAccount");

const accountName =
    document.getElementById("accountName");

const logoutButton =
    document.getElementById("logoutButton");

const registerEmailField =
    document.getElementById("registerEmailField");

const registerPhoneField =
    document.getElementById("registerPhoneField");

const contactOptions =
    document.querySelectorAll(".contact-option");

let registrationContactMethod = "phone";

const accounts = JSON.parse(localStorage.getItem(accountsStorageKey) || "[]");
let currentAccount = JSON.parse(localStorage.getItem(currentAccountStorageKey) || "null");

const normalizePhone = phone => phone.replace(/[^\d+]/g, "");

const paymentModal =
    document.getElementById("paymentModal");

const paymentSummary =
    document.getElementById("paymentSummary");

const paymentClose =
    document.getElementById("paymentClose");

const paymentConfirm =
    document.getElementById("paymentConfirm");

const paymentMethod =
    document.getElementById("paymentMethod");

const qrBankChoice =
    document.getElementById("qrBankChoice");

const qrBank =
    document.getElementById("qrBank");

const paymentQr =
    document.querySelector(".payment-qr");

const paymentInstructions =
    document.getElementById("paymentInstructions");

const paymentAccount =
    document.getElementById("paymentAccount");

const deliveryLocation =
    document.getElementById("deliveryLocation");

const deliveryAddress =
    document.getElementById("deliveryAddress");

const receipt =
    document.getElementById("receipt");

const receiptItems =
    document.getElementById("receiptItems");

const receiptQr =
    document.getElementById("receiptQr");

const receiptTotal =
    document.getElementById("receiptTotal");

const buttons =
    document.querySelectorAll(".add-button");

const updateAccountView = () => {
    const loggedIn = Boolean(currentAccount);

    accountButton.textContent = loggedIn ? `Hi, ${currentAccount.name}` : "Account / Login";
    loginForm.hidden = loggedIn;
    registerForm.hidden = true;
    authAccount.hidden = !loggedIn;
    authTitle.textContent = loggedIn ? "Your account" : "Login to your account";
    authMessage.textContent = "";

    if (loggedIn) {
        accountName.textContent = currentAccount.name;
    }
};

const openAuthModal = () => {
    updateAccountView();
    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
};

const closeAuthModal = () => {
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
};

const showLoginForm = () => {
    loginForm.hidden = false;
    registerForm.hidden = true;
    authAccount.hidden = true;
    authTitle.textContent = "Login to your account";
    authMessage.textContent = "";
};

accountButton.addEventListener("click", openAuthModal);
authClose.addEventListener("click", closeAuthModal);
authModal.addEventListener("click", event => {
    if (event.target === authModal) {
        closeAuthModal();
    }
});

document.getElementById("showRegister").addEventListener("click", () => {
    loginForm.hidden = true;
    registerForm.hidden = false;
    authTitle.textContent = "Create your account";
    authMessage.textContent = "";
});

document.getElementById("showLogin").addEventListener("click", showLoginForm);

const updateContactMethod = () => {
    const useEmail = registrationContactMethod === "email";

    registerEmailField.hidden = !useEmail;
    registerPhoneField.hidden = useEmail;
    document.getElementById("registerEmail").required = useEmail;
    document.getElementById("registerPhone").required = !useEmail;

    contactOptions.forEach(option => {
        const selected = option.dataset.contactMethod === registrationContactMethod;

        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", selected ? "true" : "false");
    });
};

contactOptions.forEach(option => {
    option.addEventListener("click", () => {
        registrationContactMethod = option.dataset.contactMethod;
        updateContactMethod();
    });
});
updateContactMethod();

document.querySelectorAll(".password-eye").forEach(button => {
    button.addEventListener("click", () => {
        const passwordInput = document.getElementById(button.dataset.passwordTarget);
        const isVisible = passwordInput.type === "text";

        passwordInput.type = isVisible ? "password" : "text";
        button.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    });
});

registerForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const phone = normalizePhone(document.getElementById("registerPhone").value.trim());
    const password = document.getElementById("registerPassword").value.trim();
    const passwordConfirm = document.getElementById("registerPasswordConfirm").value.trim();

    if (password !== passwordConfirm) {
        authMessage.textContent = "Passwords do not match.";
        return;
    }

    if (accounts.some(account =>
            (email && account.email === email) ||
            (phone && account.phone === phone)
        )) {
        authMessage.textContent = "This email or phone number is already registered.";
        return;
    }

    createAccount({ name, email, phone, password });
});

const createAccount = account => {
    accounts.push(account);
    localStorage.setItem(accountsStorageKey, JSON.stringify(accounts));
    currentAccount = { name: account.name, email: account.email, phone: account.phone };
    localStorage.setItem(currentAccountStorageKey, JSON.stringify(currentAccount));
    registerForm.reset();
    updateAccountView();
    closeAuthModal();
};

loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const email = identifier.toLowerCase();
    const phone = normalizePhone(identifier);
    const password = document.getElementById("loginPassword").value.trim();
    const account = accounts.find(item =>
        (item.email === email || item.phone === phone) && item.password === password
    );

    if (!account) {
        authMessage.textContent = "Email or password is incorrect.";
        return;
    }

    currentAccount = { name: account.name, email: account.email, phone: account.phone };
    localStorage.setItem(currentAccountStorageKey, JSON.stringify(currentAccount));
    loginForm.reset();
    updateAccountView();
    closeAuthModal();
});

logoutButton.addEventListener("click", () => {
    currentAccount = null;
    localStorage.removeItem(currentAccountStorageKey);
    updateAccountView();
    closeAuthModal();
});

updateAccountView();

const savedCartItems = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
savedCartItems.forEach(item => {
    cartItems.push(item);
    itemQuantities[item.name] = (itemQuantities[item.name] || 0) + 1;
});

const updateCartButton = (button) => {
    const quantity = itemQuantities[button.dataset.product] || 0;
    const removeButton = button.nextElementSibling;

    button.textContent = quantity ? `Add More (${quantity})` : "Add to Cart";
    button.setAttribute("aria-pressed", quantity > 0 ? "true" : "false");
    button.style.background = quantity ? "#ff6f91" : "";

    if (removeButton && removeButton.classList.contains("remove-button")) {
        removeButton.hidden = quantity === 0;
        removeButton.textContent = `- Remove One (${quantity})`;
    }
};

cart = cartItems.length;
cartCount.textContent = cart;
paymentMethod.value = localStorage.getItem(paymentMethodStorageKey) || "qr";
qrBank.value = localStorage.getItem(qrBankStorageKey) || "aba";
deliveryAddress.value = localStorage.getItem(deliveryAddressStorageKey) || "";

buttons.forEach(button => {
    const removeButton = document.createElement("button");

    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.hidden = true;
    removeButton.textContent = "- Remove One";
    removeButton.addEventListener("click", () => {
        const productName = button.dataset.product;
        const itemIndex = cartItems.findIndex(item => item.name === productName);

        if (itemIndex === -1) {
            return;
        }

        cartItems.splice(itemIndex, 1);
        itemQuantities[productName] -= 1;
        if (itemQuantities[productName] === 0) {
            delete itemQuantities[productName];
        }

        cart = cartItems.length;
        localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
        cartCount.textContent = cart;
        updateCartButton(button);
    });

    button.insertAdjacentElement("afterend", removeButton);

    updateCartButton(button);
});


buttons.forEach(button => {

    button.addEventListener("click", () => {

        const productCard = button.closest(".product-card");
        const productName = button.dataset.product;
        const price = Number(productCard.querySelector("strong").textContent.replace("$", ""));

        cartItems.push({
            name: productName,
            price
        });

        itemQuantities[productName] = (itemQuantities[productName] || 0) + 1;

        cart = cartItems.length;
        localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));

        cartCount.textContent = cart;
        updateCartButton(button);

    });

});

cartButton.addEventListener("click", () => {

    if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    paymentSummary.textContent = `${cartItems.length} item${cartItems.length === 1 ? "" : "s"} ready for payment - $${total.toFixed(2)}`;
    receipt.hidden = true;
    receiptQr.hidden = true;
    paymentMethod.hidden = false;
    paymentConfirm.hidden = false;
    paymentQr.hidden = false;
    paymentInstructions.hidden = false;
    paymentAccount.hidden = false;
    deliveryLocation.hidden = paymentMethod.value !== "cash";
    deliveryAddress.required = paymentMethod.value === "cash";
    paymentMethod.dispatchEvent(new Event("change"));
    paymentModal.classList.add("is-open");
    paymentModal.setAttribute("aria-hidden", "false");

});

paymentMethod.addEventListener("change", () => {

    const method = paymentMethod.value;
    localStorage.setItem(paymentMethodStorageKey, method);

    paymentQr.hidden = method !== "qr";
    qrBankChoice.hidden = method !== "qr";
    paymentAccount.hidden = method === "cash";
    deliveryLocation.hidden = method !== "cash";
    deliveryAddress.required = method === "cash";

    if (method === "cash") {
        paymentInstructions.textContent = "Pay in cash when your order is delivered.";
    } else if (method === "bank") {
        paymentInstructions.textContent = "Transfer the order total to the account below.";
    } else {
        paymentInstructions.textContent = "Scan the QR code with your banking app to pay.";
    }

});

qrBank.addEventListener("change", () => {
    const bank = qrBankFiles[qrBank.value];

    localStorage.setItem(qrBankStorageKey, qrBank.value);
    paymentQr.src = bank.file;
    paymentQr.alt = `${bank.name} QR payment code`;
});

paymentMethod.dispatchEvent(new Event("change"));
qrBank.dispatchEvent(new Event("change"));

const closePayment = () => {

    paymentModal.classList.remove("is-open");
    paymentModal.setAttribute("aria-hidden", "true");

};

paymentClose.addEventListener("click", closePayment);

paymentModal.addEventListener("click", event => {

    if (event.target === paymentModal) {
        closePayment();
    }

});

paymentConfirm.addEventListener("click", () => {

    if (paymentMethod.value === "cash" && !deliveryAddress.value.trim()) {
        deliveryAddress.focus();
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const itemList = Object.entries(itemQuantities)
        .map(([name, quantity]) => `${name} x${quantity}`)
        .join("\n");
    const location = deliveryAddress.value.trim();
    const selectedBank = qrBankFiles[qrBank.value].name;

    if (paymentMethod.value === "cash") {
        localStorage.setItem(deliveryAddressStorageKey, location);
    }

    receiptItems.textContent = itemList;
    receiptQr.src = paymentQr.src;
    receiptQr.alt = `${selectedBank} QR payment code`;
    receiptQr.hidden = paymentMethod.value !== "qr";
    if (paymentMethod.value === "cash") {
        receiptItems.textContent += ` | Delivery location: ${location}`;
    } else if (paymentMethod.value === "qr") {
        receiptItems.textContent += ` | Paid with: ${selectedBank} QR`;
    }
    receiptTotal.textContent = `Total: $${total.toFixed(2)}`;
    paymentMethod.hidden = true;
    paymentQr.hidden = true;
    qrBankChoice.hidden = true;
    paymentInstructions.hidden = true;
    paymentAccount.hidden = true;
    deliveryLocation.hidden = true;
    paymentConfirm.hidden = true;
    receipt.hidden = false;

});


// VIEW ALL BUTTON

const showAllButton =
    document.getElementById("showAll");

const products =
    document.querySelector(".products");

const categoryLinks =
    document.querySelectorAll(".category-card[data-filter]");

categoryLinks.forEach(categoryLink => {

    categoryLink.addEventListener("click", () => {

        products.classList.toggle(
            "dress-only",
            categoryLink.dataset.filter === "dress"
        );

        products.classList.remove("show-all");
        showAllButton.textContent = "View All →";

    });

});

showAllButton.addEventListener("click", () => {

    const showingAll =
        products.classList.toggle("show-all");

    showAllButton.textContent =
        showingAll ? "Show Less ↑" : "View All →";

    if (showingAll) {
        products.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

});