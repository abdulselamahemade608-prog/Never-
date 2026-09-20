/* =========================================================
   FULUSAPP - PRODUCTION MINI APP FRONTEND
   ========================================================= */

/*
    IMPORTANT:

    Your backend must provide these endpoints:

    GET  /api/me
    POST /api/check-in
    POST /api/tasks/:id/complete
    POST /api/withdraw
    GET  /api/withdrawals

    The backend must authenticate the user using:

    Telegram.WebApp.initData

    Do NOT trust initDataUnsafe for balance/payment security.
*/


/* =========================================================
   TELEGRAM
   ========================================================= */

const tg = window.Telegram?.WebApp;


/* =========================================================
   BACKEND
   ========================================================= */

/*
    IMPORTANT:

    If your API is on the same domain:

        const API_BASE = "/api";

    If your API is on another server:

        const API_BASE = "https://your-api-domain.com/api";

    Do NOT put your Telegram bot token here.
*/

/*
    REPLACE with your real backend address, e.g.
    "https://fulusapp-backend.onrender.com/api"
    ("/api" only works if the frontend and backend
    are served from the same domain.)
*/

const API_BASE = "https://YOUR-BACKEND-URL/api";


/* =========================================================
   APP STATE
   ========================================================= */

let state = {

    user: null,

    balance: 0,

    streak: 0,

    streakDays: [],

    tasks: [],

    todayEarned: 0,

    referrals: 0,

    referralCode: "",

    referralReward: 0,

    withdrawalRequirements: [],

    paymentMethods: [],

    withdrawalHistory: [],

    selectedPaymentMethod: null

};


/* =========================================================
   START APP
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupTelegram();

    setupBackButton();

    await loadAccount();

});


/* =========================================================
   TELEGRAM SETUP
   ========================================================= */

function setupTelegram() {

    if (!tg) {

        showToast(
            "Please open this app inside Telegram."
        );

        return;
    }

    tg.ready();

    tg.expand();

    /*
        Apply Telegram theme when possible.
    */

    if (tg.setHeaderColor) {

        tg.setHeaderColor("#07100b");

    }

    if (tg.setBackgroundColor) {

        tg.setBackgroundColor("#050806");

    }
}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function setupBackButton() {

    if (!tg?.BackButton) {
        return;
    }

    tg.BackButton.onClick(() => {

        openPage("home");

    });

}


/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    /*
        Telegram Mini App authentication data.

        This is sent to the server so the server
        can validate the Telegram user.
    */

    if (tg?.initData) {

        headers[
            "X-Telegram-Init-Data"
        ] = tg.initData;

    }


    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    let data = null;


    try {

        data = await response.json();

    } catch {

        throw new Error(
            "Invalid server response."
        );

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Request failed."
        );

    }


    return data;
}


/* =========================================================
   LOAD ACCOUNT
   ========================================================= */

async function loadAccount() {

    try {

        /*
            Real server data.
        */

        const data =
            await apiRequest("/me");


        state.user =
            data.user || null;

        state.balance =
            Number(data.balance || 0);

        state.streak =
            Number(data.streak || 0);

        state.streakDays =
            data.streakDays || [];

        state.tasks =
            data.tasks || [];

        state.todayEarned =
            Number(data.todayEarned || 0);

        state.referrals =
            Number(data.referrals || 0);

        state.referralCode =
            data.referralCode || "";

        state.referralReward =
            Number(data.referralReward || 0);

        state.withdrawalRequirements =
            data.withdrawalRequirements || [];

        state.paymentMethods =
            data.paymentMethods || [];

        state.withdrawalHistory =
            data.withdrawalHistory || [];


        renderApp();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Could not load your account."
        );

        /*
            Do NOT insert fake balance here.
        */

    }

}


/* =========================================================
   RENDER APP
   ========================================================= */

function renderApp() {

    renderUser();

    renderBalance();

    renderStreak();

    renderTasks();

    renderReferral();

    renderRequirements();

    renderPaymentMethods();

    renderWithdrawalHistory();


    document
        .getElementById("loadingScreen")
        ?.classList.add("hidden");


    document
        .getElementById("mainApp")
        ?.classList.remove("hidden");


    document
        .getElementById("bottomNav")
        ?.classList.remove("hidden");

}


/* =========================================================
   USER
   ========================================================= */

function renderUser() {

    const name =
        state.user?.firstName ||
        state.user?.username ||
        "User";


    const username =
        state.user?.username;


    document
        .getElementById("userName")
        .textContent =
            username
                ? `@${username}`
                : name;


    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    avatar.textContent =
        String(name)
            .charAt(0)
            .toUpperCase();

}


/* =========================================================
   BALANCE
   ========================================================= */

function renderBalance() {

    const balance =
        formatMoney(state.balance);


    document
        .getElementById("balance")
        .textContent =
            balance;


    document
        .getElementById("withdrawBalance")
        .textContent =
            balance;


    document
        .getElementById("todayEarned")
        .textContent =
            formatMoney(
                state.todayEarned
            );

}


/* =========================================================
   STREAK
   ========================================================= */

function renderStreak() {

    const container =
        document.getElementById(
            "streakDays"
        );


    container.innerHTML = "";


    const rewards = [
        2,
        4,
        5,
        7,
        9,
        11,
        12
    ];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const dayNumber = i + 1;

        const completed =
            dayNumber <= state.streak;


        const today =
            dayNumber ===
            state.streak + 1;


        const div =
            document.createElement("div");


        div.className =
            "streak-day";


        if (completed) {

            div.classList.add(
                "completed"
            );

        }


        if (today) {

            div.classList.add(
                "today"
            );

        }


        div.innerHTML = `

            <div class="streak-circle">
                ${completed ? "✓" : dayNumber}
            </div>

            <small>
                ${rewards[i]} ETB
            </small>

        `;


        container.appendChild(div);

    }


    const progress =
        Math.min(
            state.streak,
            7
        );


    document
        .getElementById(
            "streakProgress"
        )
        .style.width =
            `${(progress / 7) * 100}%`;


    document
        .getElementById(
            "streakProgressText"
        )
        .textContent =
            `${progress} / 7`;


    document
        .getElementById("streak")
        .textContent =
            state.streak;


    const checkButton =
        document.getElementById(
            "checkInButton"
        );


    if (
        state.streakDays
            ?.todayChecked
    ) {

        checkButton.disabled =
            true;

        checkButton.textContent =
            "Checked In ✓";

    }

}


/* =========================================================
   TASKS
   ========================================================= */

function renderTasks() {

    const home =
        document.getElementById(
            "homeTasks"
        );

    const all =
        document.getElementById(
            "allTasks"
        );


    home.innerHTML = "";

    all.innerHTML = "";


    const available =
        Array.isArray(state.tasks)
            ? state.tasks
            : [];


    /*
        Show the first 3 on home.
    */

    available
        .slice(0, 3)
        .forEach(task => {

            home.appendChild(
                createTask(task)
            );

        });


    available.forEach(task => {

        all.appendChild(
            createTask(task)
        );

    });


    if (
        available.length === 0
    ) {

        const empty =
            emptyMessage(
                "No tasks available right now."
            );


        home.appendChild(
            empty.cloneNode(true)
        );

        all.appendChild(empty);

    }

}


/* =========================================================
   CREATE TASK
   ========================================================= */

function createTask(task) {

    const element =
        document.createElement("div");


    element.className =
        "task-item";


    const completed =
        Boolean(task.completed);


    const reward =
        Number(task.reward || 0);


    const progress =
        task.progress
            ? `${task.progress.current}/${task.progress.total}`
            : "";


    element.innerHTML = `

        <div class="task-icon">
            ${task.icon || "✦"}
        </div>

        <div class="task-info">

            <strong>
                ${escapeHTML(
                    task.title || "Task"
                )}
            </strong>

            <p>
                ${
                    escapeHTML(
                        task.description || ""
                    )
                }

                ${
                    progress
                        ? ` • ${progress}`
                        : ""
                }
            </p>

        </div>

        <div class="task-reward">
            +${formatMoney(reward)}
            ETB
        </div>

        <button
            class="task-button ${
                completed
                    ? "completed"
                    : ""
            }"
            ${
                completed
                    ? "disabled"
                    : ""
            }
            onclick="
                completeTask(
                    '${escapeAttribute(task.id)}'
                )
            "
        >
            ${ completed ? "Done" : (task.started ? "Claim" : "Start") }
        </button>

    `;


    return element;
}


/* =========================================================
   COMPLETE TASK
   ========================================================= */

async function completeTask(taskId) {

    try {

        if (!taskId) {

            showToast(
                "Invalid task."
            );

            return;

        }


        showToast(
            "Opening task..."
        );


        /*
            Server decides whether the reward
            is actually granted.
        */

        const result =
            await apiRequest(
                `/tasks/${encodeURIComponent(
                    taskId
                )}/complete`,
                {
                    method: "POST"
                }
            );


        if (result.url) {

            openExternal(
                result.url
            );

        }


        if (result.message) {

            showToast(
                result.message
            );

        }


        /*
            Reload real balance/tasks.
        */

        await loadAccount();


    } catch (error) {

        showToast(
            error.message
        );

    }

}


/* =========================================================
   CHECK IN
   ========================================================= */

async function checkIn() {

    const button =
        document.getElementById(
            "checkInButton"
        );


    button.disabled = true;

    button.textContent =
        "Checking...";


    try {

        const result =
            await apiRequest(
                "/check-in",
                {
                    method: "POST"
                }
            );


        if (result.message) {

            showToast(
                result.message
            );

        }


        await loadAccount();


    } catch (error) {

        button.disabled = false;

        button.textContent =
            "Check In";


        showToast(
            error.message
        );

    }

}


/* =========================================================
   REFERRAL
   ========================================================= */

function renderReferral() {

    document
        .getElementById(
            "referralCode"
        )
        .textContent =
            state.referralCode ||
            "Unavailable";


    document
        .getElementById(
            "totalReferrals"
        )
        .textContent =
            state.referrals;


    document
        .getElementById(
            "referralReward"
        )
        .textContent =
            formatMoney(
                state.referralReward
            );

}


/* =========================================================
   COPY REFERRAL
   ========================================================= */

async function copyReferral() {

    if (!state.referralCode) {

        showToast(
            "Referral code unavailable."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            state.referralCode
        );


        showToast(
            "Referral code copied."
        );


    } catch {

        showToast(
            "Could not copy code."
        );

    }

}


/* =========================================================
   INVITE FRIENDS
   ========================================================= */

function inviteFriends() {

    if (!state.referralCode) {

        showToast(
            "Referral link unavailable."
        );

        return;

    }


    const botUsername =
        state.user?.botUsername;


    if (!botUsername) {

        showToast(
            "Bot referral link unavailable."
        );

        return;

    }


    const link =
        `https://t.me/${botUsername}?startapp=ref_${encodeURIComponent(
            state.referralCode
        )}`;


    const shareText =
        "Join FulusApp and start earning rewards!";


    if (
        tg?.openTelegramLink
    ) {

        tg.openTelegramLink(
            `https://t.me/share/url?url=${encodeURIComponent(
                link
            )}&text=${encodeURIComponent(
                shareText
            )}`
        );

    } else {

        openExternal(link);

    }

}


/* =========================================================
   REQUIREMENTS
   ========================================================= */

function renderRequirements() {

    const container =
        document.getElementById(
            "requirementsList"
        );


    container.innerHTML = "";


    const requirements =
        Array.isArray(
            state.withdrawalRequirements
        )
            ? state.withdrawalRequirements
            : [];


    requirements.forEach(requirement => {

        const row =
            document.createElement("div");


        row.className =
            "requirement";


        if (requirement.completed) {

            row.classList.add("ok");

        }


        row.innerHTML = `

            <div class="requirement-icon">
                ${
                    requirement.completed
                        ? "✓"
                        : "•"
                }
            </div>

            <span>
                ${
                    escapeHTML(
                        requirement.text || ""
                    )
                }
            </span>

        `;


        container.appendChild(row);

    });

}


/* =========================================================
   PAYMENT METHODS
   ========================================================= */

function renderPaymentMethods() {

    const container =
        document.getElementById(
            "paymentMethods"
        );


    container.innerHTML = "";


    state.paymentMethods
        .forEach(method => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "payment-method";


            if (
                state.selectedPaymentMethod ===
                method.id
            ) {

                button.classList.add(
                    "selected"
                );

            }


            button.textContent =
                method.name;


            button.onclick = () => {

                state.selectedPaymentMethod =
                    method.id;


                renderPaymentMethods();

            };


            container.appendChild(
                button
            );

        });


    if (
        state.paymentMethods.length === 0
    ) {

        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                color:#69756e;
                font-size:11px;
                padding:10px;
                text-align:center;
            ">
                No payment methods available.
            </div>
        `;

    }

}


/* =========================================================
   WITHDRAW
   ========================================================= */

async function submitWithdrawal() {

    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );


    const accountInput =
        document.getElementById(
            "paymentAccount"
        );


    const amount =
        Number(
            amountInput.value
        );


    const account =
        accountInput.value.trim();


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid amount."
        );

        return;

    }


    if (
        amount > state.balance
    ) {

        showToast(
            "Insufficient balance."
        );

        return;

    }


    if (
        !state.selectedPaymentMethod
    ) {

        showToast(
            "Select a payment method."
        );

        return;

    }


    if (!account) {

        showToast(
            "Enter your account number."
        );

        return;

    }


    const button =
        document.getElementById(
            "withdrawBut
