/* =====================================================
   FULUSAPP MINI APP
   ===================================================== */

const tg = window.Telegram?.WebApp;


/* ================= TELEGRAM ================= */

if (tg) {

    tg.ready();

    tg.expand();

    if (tg.setHeaderColor) {
        tg.setHeaderColor("#080b09");
    }

    if (tg.setBackgroundColor) {
        tg.setBackgroundColor("#080b09");
    }
}


/* ================= USER ================= */

let telegramUser = null;

if (tg && tg.initDataUnsafe) {
    telegramUser = tg.initDataUnsafe.user;
}


/* ================= APP DATA ================= */

let balance = 5.00;

let referrals = 0;

let adCompleted = 0;

let selectedPayment = "Telebirr";

let checkedIn = false;


/* ================= USER CODE ================= */

function getReferralCode() {

    if (telegramUser && telegramUser.id) {

        return "FU" + telegramUser.id;

    }

    return "DEMO123";

}


/* ================= UPDATE UI ================= */

function updateUI() {

    const balanceText =
        Number(balance).toFixed(2) + " ETB";


    const balanceElement =
        document.getElementById("balance");

    if (balanceElement) {
        balanceElement.textContent = balanceText;
    }


    const withdrawBalance =
        document.getElementById("withdrawBalance");

    if (withdrawBalance) {
        withdrawBalance.textContent = balanceText;
    }


    const referralCode =
        document.getElementById("referralCode");

    if (referralCode) {
        referralCode.textContent =
            getReferralCode();
    }


    const referralElement =
        document.getElementById("referrals");

    if (referralElement) {
        referralElement.textContent =
            referrals;
    }


    const adCount =
        document.getElementById("adCount");

    if (adCount) {

        adCount.textContent =
            adCompleted + "/10 completed";

    }


    const adProgress =
        document.getElementById("adProgress");

    if (adProgress) {

        const percent =
            Math.min(
                (adCompleted / 10) * 100,
                100
            );

        adProgress.style.width =
            percent + "%";
    }

}


/* ================= PAGE NAVIGATION ================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selected =
        document.getElementById(pageId);

    if (selected) {
        selected.classList.add("active");
    }


    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.page === pageId
        ) {

            button.classList.add("active");

        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ================= CHECK IN ================= */

function checkIn() {

    if (checkedIn) {

        showAlert(
            "You have already checked in today."
        );

        return;
    }


    checkedIn = true;


    balance += 2;


    const button =
        document.getElementById("checkInBtn");

    if (button) {

        button.textContent =
            "✓ Checked In";

        button.disabled = true;

        button.style.opacity = "0.6";

    }


    updateUI();


    showAlert(
        "🎉 You earned 2 ETB!"
    );

}


/* ================= WATCH AD ================= */

function watchAd() {

    if (adCompleted >= 10) {

        showAlert(
            "You completed today's ad limit."
        );

        return;
    }


    /*
       IMPORTANT:

       This is only a demo.

       A real advertising provider
       should call the reward function
       after the ad has actually been completed.
    */


    showAlert(
        "Ad system will be connected here."
    );

}


/*
   Call this function ONLY after
   a real ad has been completed.
*/

function rewardForAd() {

    if (adCompleted >= 10) {
        return;
    }


    adCompleted++;

    balance += 2;


    updateUI();


    showAlert(
        "🎉 +2 ETB added!"
    );

}


/* ================= JOIN CHANNEL ================= */

function joinChannel() {

    const channel =
        "https://t.me/your_channel";


    if (tg && tg.openTelegramLink) {

        tg.openTelegramLink(channel);

    } else {

        window.open(
            channel,
            "_blank"
        );

    }

}


/* ================= INVITE ================= */

function inviteFriends() {

    const botUsername =
        "YOUR_BOT_USERNAME";


    const code =
        getReferralCode();


    const referralLink =
        "https://t.me/" +
        botUsername +
        "?start=" +
        code;


    const text =
        "Join FulusApp and earn rewards!";


    const shareUrl =
        "https://t.me/share/url?url=" +
        encodeURIComponent(referralLink) +
        "&text=" +
        encodeURIComponent(text);


    if (tg && tg.openTelegramLink) {

        tg.openTelegramLink(shareUrl);

    } else {

        window.open(
            shareUrl,
            "_blank"
        );

    }

}


/* ================= PAYMENT METHOD ================= */

function selectPayment(
    element,
    method
) {

    selectedPayment = method;


    const methods =
        document.querySelectorAll(
            ".payment-method"
        );


    methods.forEach(item => {

        item.classList.remove("active");

    });


    element.classList.add("active");


    const label =
        document.getElementById(
            "accountLabel"
        );

    const input =
        document.getElementById(
            "accountNumber"
        );


    if (method === "Telebirr") {

        label.textContent =
            "Telebirr Phone Number";

        input.placeholder =
            "Enter Telebirr phone number";

    }


    if (method === "CBE") {

        label.textContent =
            "CBE Account Number";

        input.placeholder =
            "Enter CBE account number";

    }


    if (method === "Awash Bank") {

        label.textContent =
            "Awash Bank Account Number";

        input.placeholder =
            "Enter account number";

    }

}


/* ================= WITHDRAW ================= */

function requestWithdraw() {

    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );

    const accountInput =
        document.getElementById(
            "accountNumber"
        );


    const amount =
        Number(amountInput.value);

    const account =
        accountInput.value.trim();


    if (!amount || amount <= 0) {

        showAlert(
            "Please enter a valid amount."
        );

        return;
    }


    if (amount < 100) {

        showAlert(
            "Minimum withdrawal is 100 ETB."
        );

        return;
    }


    if (amount > balance) {

        showAlert(
            "Insufficient balance."
        );

        return;
    }


    if (!account) {

        showAlert(
            "Please enter your account number."
        );

        return;
    }


    /*
       Frontend demo only.

       The real version should send
       the request to your backend.
    */


    const withdrawal = {

        user_id:
            telegramUser
                ? telegramUser.id
                : null,

        amount: amount,

        method: selectedPayment,

        account: account,

        created_at:
            new Date().toISOString(),

        status: "pending"

    };


    console.log(
        "Withdrawal request:",
        withdrawal
    );


    balance -= amount;


    updateUI();


    amountInput.value = "";
    accountInput.value = "";


    addWithdrawalHistory(
        withdrawal
    );


    showAlert(
        "✅ Withdrawal request submitted."
    );

}


/* ================= WITHDRAW HISTORY ================= */

function addWithdrawalHistory(
    withdrawal
) {

    const container =
        document.getElementById(
            "withdrawHistory"
        );


    if (!container) {
        return;
    }


    if (
        container.querySelector(
            ".empty-history"
        )
    ) {

        container.innerHTML = "";

    }


    const item =
        document.createElement("div");


    item.className =
        "task-card";


    item.innerHTML = `

        <div class="task-icon">
            💸
        </div>

        <div class="task-info">

            <h3>
                ${withdrawal.method}
            </h3>

            <p>
                ${withdrawal.amount.toFixed(2)}
                ETB
            </p>

        </div>

        <strong>
            Pending
        </strong>

    `;


    container.prepend(item);

}


/* ================= TERMS ================= */

function showTerms() {

    showAlert(
        "Terms: Users must be 18+ where legally required, use one account, and follow the reward rules."
    );

}


/* ================= PRIVACY ================= */

function showPrivacy() {

    showAlert(
        "Privacy: The app may process Telegram user ID, username, balances, referrals and withdrawal information needed to provide the service."
    );

}


/* ================= SUPPORT ================= */

function contactSupport() {

    const support =
        "https://t.me/YOUR_SUPPORT_USERNAME";


    if (tg && tg.openTelegramLink) {

        tg.openTelegramLink(
            support
        );

    } else {

        window.open(
            support,
            "_blank"
        );

    }

}


/* ================= ALERT ================= */

function showAlert(message) {

    if (
        tg &&
        typeof tg.showAlert === "function"
    ) {

        tg.showAlert(message);

    } else {

        alert(message);

    }

}


/* ================= TELEGRAM DATA ================= */

function getTelegramData() {

    if (!tg) {
        return null;
    }


    return {

        initData:
            tg.initData || "",

        user:
            tg.initDataUnsafe?.user || null

    };

}


/* ================= START ================= */

updateUI();

console.log(
    "FulusApp loaded."
);

console.log(
    "Telegram user:",
    telegramUser
);
