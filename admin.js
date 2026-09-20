const supabaseClient = window.supabaseClient;


// ==========================================
// ЕЛЕМЕНТИ
// ==========================================

const loginPanel =
    document.getElementById("loginPanel");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const adminEmail =
    document.getElementById("adminEmail");

const logoutButton =
    document.getElementById("logoutButton");

const globalMessage =
    document.getElementById("globalMessage");


// ==========================================
// ПЕРЕВІРКА СЕСІЇ
// ==========================================

async function checkSession() {

    if (!supabaseClient) {
        console.error("Supabase client не знайдений.");
        showLogin();
        return;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        showLogin();
        return;
    }

    if (data.session) {
        showAdmin(data.session);
    } else {
        showLogin();
    }
}


// ==========================================
// ПОКАЗ LOGIN
// ==========================================

function showLogin() {

    if (loginPanel) {
        loginPanel.classList.remove("hidden");
    }

    if (adminPanel) {
        adminPanel.classList.add("hidden");
    }
}


// ==========================================
// ПОКАЗ ADMIN
// ==========================================

function showAdmin(session) {

    if (loginPanel) {
        loginPanel.classList.add("hidden");
    }

    if (adminPanel) {
        adminPanel.classList.remove("hidden");
    }

    if (adminEmail) {
        adminEmail.textContent =
            session.user.email || "";
    }

    loadTournaments();
    loadApplications();
    loadTeams();
}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (loginError) {
                loginError.className = "message";
                loginError.style.display = "none";
            }

            const emailInput =
                document.getElementById("loginEmail");

            const passwordInput =
                document.getElementById("loginPassword");

            const email =
                emailInput
                ? emailInput.value.trim()
                : "";

            const password =
                passwordInput
                ? passwordInput.value
                : "";

            if (!email || !password) {

                if (loginError) {

                    loginError.textContent =
                        "❌ Введи email і пароль.";

                    loginError.className =
                        "message error";

                    loginError.style.display =
                        "block";
                }

                return;
            }

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });

            if (error) {

                console.error(error);

                if (loginError) {

                    loginError.textContent =
                        "❌ Неправильний email або пароль.";

                    loginError.className =
                        "message error";

                    loginError.style.display =
                        "block";
                }

                return;
            }

            showAdmin(data.session);
        }
    );
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            await supabaseClient.auth.signOut();

            showLogin();

        }
    );
}


// ==========================================
// MENU
// ==========================================

document
    .querySelectorAll(".menu-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".menu-button")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });

                this.classList.add("active");

                document
                    .querySelectorAll(".admin-section")
                    .forEach(section => {
                        section.classList.add("hidden");
                    });

                const sectionId =
                    this.dataset.section;

                const sectionElement =
                    document.getElementById(sectionId);

                if (sectionElement) {
                    sectionElement.classList.remove("hidden");
                }

                if (sectionId === "applicationsSection") {
                    loadApplications();
                }

                if (sectionId === "tournamentsSection") {
                    loadTournaments();
                }

                if (sectionId === "teamsSection") {
                    loadTeams();
                }
            }
        );

    });


// ==========================================
// GLOBAL MESSAGE
// ==========================================

function showMessage(
    message,
    type = "success"
) {

    if (!globalMessage) {
        return;
    }

    globalMessage.textContent =
        message;

    globalMessage.className =
        "message " + type;

    globalMessage.style.display =
        "block";

    setTimeout(() => {

        globalMessage.style.display =
            "none";

    }, 4000);
}


// ==========================================
// TOURNAMENTS
// ==========================================

let editingTournamentId = null;

const tournamentForm =
    document.getElementById("tournamentForm");

const tournamentFormTitle =
    document.getElementById("tournamentFormTitle");

const saveTournamentButton =
    document.getElementById(
        "saveTournamentButton"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


// ==========================================
// SAVE TOURNAMENT
// ==========================================

if (tournamentForm) {

    tournamentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("tournamentName")
                    .value
                    .trim();

            const prize =
                document
                    .getElementById("tournamentPrize")
                    .value
                    .trim();

            const teamsCount =
                Number(
                    document
                        .getElementById("tournamentTeams")
                        .value
                );

            const tournamentDate =
                document
                    .getElementById("tournamentDate")
                    .value || null;

            const tournamentTime =
                document
                    .getElementById("tournamentTime")
                    .value || null;

            const format =
                document
                    .getElementById("tournamentFormat")
                    .value;

            const status =
                document
                    .getElementById("tournamentStatus")
                    .value;

            if (!name) {

                showMessage(
                    "❌ Введи назву турніру.",
                    "error"
                );

                return;
            }

            const tournamentData = {

                name: name,

                prize: prize,

                teams_count: teamsCount || 8,

                tournament_date:
                    tournamentDate,

                tournament_time:
                    tournamentTime,

                format:
                    format,

                status:
                    status

            };

            let result;

            // EDIT
            if (editingTournamentId) {

                result =
                    await supabaseClient
                        .from("tournaments")
                        .update(tournamentData)
                        .eq(
                            "id",
                            editingTournamentId
                        );

            }

            // CREATE
            else {

                result =
                    await supabaseClient
                        .from("tournaments")
                        .insert(
                            tournamentData
                        );
            }

            if (result.error) {

                console.error(result.error);

                showMessage(
                    "❌ Помилка: " +
                    result.error.message,
                    "error"
                );

                return;
            }

            showMessage(
                editingTournamentId
                    ? "✅ Турнір оновлено!"
                    : "✅ Турнір створено!"
            );

            resetTournamentForm();

            await loadTournaments();
        }
    );
}


// ==========================================
// LOAD TOURNAMENTS
// ==========================================

async function loadTournaments() {

    const list =
        document.getElementById(
            "tournamentsList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        `<div class="empty">Завантаження...</div>`;

    const {
        data,
        error
    } = await supabaseClient
        .from("tournaments")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);

        list.innerHTML =
            `<div class="empty">
                Не вдалося завантажити турніри.<br><br>
                ${escapeHtml(error.message)}
            </div>`;

        return;
    }

    if (!data || data.length === 0) {

        list.innerHTML =
            `<div class="empty">
                Турнірів поки немає.
            </div>`;

        return;
    }

    list.innerHTML = "";

    data.forEach(tournament => {

        const card =
            document.createElement("div");

        card.className =
            "card";

        card.innerHTML = `

            <div class="card-top">

                <div>

                    <h3>
                        ${escapeHtml(
                            tournament.name
                        )}
                    </h3>

                    <div class="muted">
                        ${escapeHtml(
                            tournament.prize || ""
                        )}
                    </div>

                </div>

                <span class="badge ${getStatusClass(
                    tournament.status
                )}">
                    ${getStatusText(
                        tournament.status
                    )}
                </span>

            </div>

            <div class="details">

                <div>
                    👥 Команд:
                    <strong>
                        ${tournament.teams_count || 0}
                    </strong>
                </div>

                <div>
                    📅 Дата:
                    <strong>
                        ${tournament.tournament_date || "—"}
                    </strong>
                </div>

                <div>
                    🕐 Час:
                    <strong>
                        ${tournament.tournament_time || "—"}
                    </strong>
                </div>

                <div>
                    🏆 Формат:
                    <strong>
                        ${escapeHtml(
                            tournament.format || "—"
                        )}
                    </strong>
                </div>

            </div>

            <div class="card-actions">

                <button
                    class="secondary"
                    onclick="editTournament(${tournament.id})"
                >
                    ✏️ Редагувати
                </button>

                <button
                    class="danger"
                    onclick="deleteTournament(${tournament.id})"
                >
                    🗑 Видалити
                </button>

            </div>
        `;

        list.appendChild(card);
    });
}


// ==========================================
// EDIT TOURNAMENT
// ==========================================

window.editTournament =
    async function(id) {

        const {
            data,
            error
        } = await supabaseClient
            .from("tournaments")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {

            console.error(error);

            showMessage(
                "❌ Не вдалося завантажити турнір.",
                "error"
            );

            return;
        }

        editingTournamentId =
            id;

        document
            .getElementById("tournamentName")
            .value =
            data.name || "";

        document
            .getElementById("tournamentPrize")
            .value =
            data.prize || "";

        document
            .getElementById("tournamentTeams")
            .value =
            data.teams_count || 8;

        document
            .getElementById("tournamentDate")
            .value =
            data.tournament_date || "";

        document
            .getElementById("tournamentTime")
            .value =
            data.tournament_time || "";

        document
            .getElementById("tournamentFormat")
            .value =
            data.format ||
            "Single Elimination";

        document
            .getElementById("tournamentStatus")
            .value =
            data.status ||
            "upcoming";

        if (tournamentFormTitle) {
            tournamentFormTitle.textContent =
                "Редагувати турнір";
        }

        if (saveTournamentButton) {
            saveTournamentButton.textContent =
                "Зберегти зміни";
        }

        if (cancelEditButton) {
            cancelEditButton.classList.remove(
                "hidden"
            );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


// ==========================================
// DELETE TOURNAMENT
// ==========================================

window.deleteTournament =
    async function(id) {

        const confirmed =
            confirm(
                "Точно видалити цей турнір?"
            );

        if (!confirmed) {
            return;
        }

        const {
            error
        } = await supabaseClient
            .from("tournaments")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(error);

            showMessage(
                "❌ Не вдалося видалити турнір: " +
                error.message,
                "error"
            );

            return;
        }

        showMessage(
            "✅ Турнір видалено!"
        );

        await loadTournaments();
    };


// ==========================================
// CANCEL EDIT
// ==========================================

if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        function() {

            resetTournamentForm();

        }
    );
}


// ==========================================
// RESET TOURNAMENT FORM
// ==========================================

function resetTournamentForm() {

    editingTournamentId =
        null;

    if (tournamentForm) {
        tournamentForm.reset();
    }

    const teamsInput =
        document.getElementById(
            "tournamentTeams"
        );

    if (teamsInput) {
        teamsInput.value = "8";
    }

    const formatInput =
        document.getElementById(
            "tournamentFormat"
        );

    if (formatInput) {
        formatInput.value =
            "Single Elimination";
    }

    const statusInput =
        document.getElementById(
            "tournamentStatus"
        );

    if (statusInput) {
        statusInput.value =
            "upcoming";
    }

    if (tournamentFormTitle) {
        tournamentFormTitle.textContent =
            "Створити турнір";
    }

    if (saveTournamentButton) {
        saveTournamentButton.textContent =
            "Створити турнір";
    }

    if (cancelEditButton) {
        cancelEditButton.classList.add(
            "hidden"
        );
    }
}


// ==========================================
// APPLICATIONS
// ==========================================

let allApplications = [];


// ==========================================
// LOAD APPLICATIONS
// ==========================================

async function loadApplications() {

    const list =
        document.getElementById(
            "applicationsList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        `<div class="empty">
            Завантаження заявок...
        </div>`;

    const {
        data,
        error
    } = await supabaseClient
        .from("tournament_applications")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);

        list.innerHTML =
            `<div class="empty">
                ❌ Не вдалося завантажити заявки.<br><br>
                ${escapeHtml(
                    error.message
                )}
            </div>`;

        return;
    }

    allApplications =
        data || [];

    renderApplications();
}


// ==========================================
// RENDER APPLICATIONS
// ==========================================

function renderApplications() {

    const list =
        document.getElementById(
            "applicationsList"
        );

    if (!list) {
        return;
    }

    const filterElement =
        document.getElementById(
            "applicationFilter"
        );

    const filter =
        filterElement
            ? filterElement.value
            : "all";

    let applications =
        allApplications;

    if (filter !== "all") {

        applications =
            applications.filter(
                application =>
                    application.status ===
                    filter
            );
    }

    if (
        !applications ||
        applications.length === 0
    ) {

        list.innerHTML =
            `<div class="empty">
                Заявок у цій категорії немає.
            </div>`;

        return;
    }

    list.innerHTML = "";

    applications.forEach(
        application => {

            const card =
                document.createElement("div");

            card.className =
                "card";

            const status =
                application.status ||
                "pending";

            card.innerHTML = `

                <div class="card-top">

                    <div>

                        <h3>
                            ${escapeHtml(
                                application.team_name ||
                                "Без назви"
                            )}
                        </h3>

                        <div class="muted">
                            ${escapeHtml(
                                application.tournament ||
                                "Турнір не вказано"
                            )}
                        </div>

                    </div>

                    <span class="badge ${getApplicationStatusClass(
                        status
                    )}">
                        ${getApplicationStatusText(
                            status
                        )}
                    </span>

                </div>

                <div class="details">

                    <div>
                        👤 Капітан:
                        <strong>
                            ${escapeHtml(
                                application.captain_name ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>
                        💬 Discord:
                        <strong>
                            ${escapeHtml(
                                application.captain_contact ||
                                "—"
                            )}
                        </strong>
                    </div>

                    <div>

                        🎮 Steam:

                        <strong>

                            ${
                                application.steam
                                ? `
                                    <a
                                        href="${escapeHtml(
                                            application.steam
                                        )}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style="color:#a78bfa;"
                                    >
                                        Відкрити профіль
                                    </a>
                                  `
                                : "—"
                            }

                        </strong>

                    </div>

                    <div>

                        👥 Гравці:

                        <div class="application-players">

                            ${escapeHtml(
                                application.players ||
                                "Не вказано"
                            )}

                        </div>

                    </div>

                    <div>

                        🕐 Подано:

                        <strong>
                            ${formatDate(
                                application.created_at
                            )}
                        </strong>

                    </div>

                </div>

                ${
                    status === "pending"
                    ? `

                        <div class="card-actions">

                            <button
                                class="success-button"
                                onclick="acceptApplication(${application.id})"
                            >
                                ✅ Прийняти
                            </button>

                            <button
                                class="danger"
                                onclick="rejectApplication(${application.id})"
                            >
                                ❌ Відхилити
                            </button>

                        </div>

                    `
                    : ""
                }

            `;

            list.appendChild(card);

        }
    );
}


// ==========================================
// ACCEPT APPLICATION
// ==========================================

window.acceptApplication =
    async function(id) {

        const confirmed =
            confirm(
                "Прийняти цю заявку та додати команду до турніру?"
            );

        if (!confirmed) {
            return;
        }

        try {

            // ==================================
            // 1. ОТРИМУЄМО ЗАЯВКУ
            // ==================================

            const {
                data: application,
                error: applicationError
            } = await supabaseClient
                .from("tournament_applications")
                .select("*")
                .eq("id", id)
                .single();

            if (applicationError) {

                console.error(applicationError);

                showMessage(
                    "❌ Не вдалося отримати заявку: " +
                    applicationError.message,
                    "error"
                );

                return;
            }

            if (!application) {

                showMessage(
                    "❌ Заявку не знайдено.",
                    "error"
                );

                return;
            }

            if (application.status === "approved") {

                showMessage(
                    "⚠️ Ця заявка вже прийнята.",
                    "error"
                );

                return;
            }


            // ==================================
            // 2. ШУКАЄМО ТУРНІР ПО ID
            // ==================================

            let tournament = null;

            if (application.tournament_id) {

                const {
                    data: tournamentById,
                    error: tournamentIdError
                } = await supabaseClient
                    .from("tournaments")
                    .select("*")
                    .eq(
                        "id",
                        application.tournament_id
                    )
                    .maybeSingle();

                if (tournamentIdError) {
                    console.error(
                        tournamentIdError
                    );
                }

                if (tournamentById) {
                    tournament =
                        tournamentById;
                }
            }


            // ==================================
            // 3. СТАРІ ЗАЯВКИ — ПО НАЗВІ
            // ==================================

            if (
                !tournament &&
                application.tournament
            ) {

                const {
                    data: tournamentByName,
                    error: tournamentNameError
                } = await supabaseClient
                    .from("tournaments")
                    .select("*")
                    .eq(
                        "name",
                        application.tournament
                    )
                    .maybeSingle();

                if (tournamentNameError) {
                    console.error(
                        tournamentNameError
                    );
                }

                if (tournamentByName) {
                    tournament =
                        tournamentByName;
                }
            }


            // ==================================
            // 4. ТУРНІТ НЕ ЗНАЙДЕНИЙ
            // ==================================

            if (!tournament) {

                showMessage(
                    "❌ Такого турніру не існує.",
                    "error"
                );

                return;
            }


            // ==================================
            // 5. ПЕРЕВІРКА КІЛЬКОСТІ КОМАНД
            // ==================================

            const {
                count,
                error: countError
            } = await supabaseClient
                .from("teams")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "tournament_id",
                    tournament.id
                );

            if (countError) {

                console.error(countError);

                showMessage(
                    "❌ Не вдалося перевірити кількість команд: " +
                    countError.message,
                    "error"
                );

                return;
            }

            const currentTeams =
                count || 0;

            const maxTeams =
                Number(
                    tournament.teams_count || 0
                );

            if (
                maxTeams > 0 &&
                currentTeams >= maxTeams
            ) {

                showMessage(
                    `❌ Турнір заповнений: ${currentTeams}/${maxTeams}`,
                    "error"
                );

                return;
            }


            // ==================================
            // 6. ПЕРЕВІРКА ДУБЛІКАТА КОМАНДИ
            // ==================================

            const {
                data: existingTeam,
                error: duplicateError
            } = await supabaseClient
                .from("teams")
                .select("id, name")
                .eq(
                    "tournament_id",
                    tournament.id
                )
                .eq(
                    "name",
                    application.team_name
                )
                .maybeSingle();

            if (duplicateError) {

                console.error(
                    duplicateError
                );

                showMessage(
                    "❌ Помилка перевірки команди: " +
                    duplicateError.message,
                    "error"
                );

                return;
            }

            if (existingTeam) {

                showMessage(
                    `⚠️ Команда "${application.team_name}" вже є в цьому турнірі.`,
                    "error"
                );

                return;
            }


            // ==================================
            // 7. СТВОРЮЄМО КОМАНДУ
            // ==================================

            const {
                data: createdTeam,
                error: teamError
            } = await supabaseClient
                .from("teams")
                .insert({
                    name:
                        application.team_name,

                    tournament_id:
                        tournament.id,

                    players:
                        application.players ||
                        null,

                    substitutes:
                        null
                })
                .select()
                .single();

            if (teamError) {

                console.error(
                    teamError
                );

                showMessage(
                    "❌ Не вдалося створити команду: " +
                    teamError.message,
                    "error"
                );

                return;
            }


            // ==================================
            // 8. ОНОВЛЮЄМО ЗАЯВКУ
            // ==================================

            const {
                error: updateError
            } = await supabaseClient
                .from("tournament_applications")
                .update({
                    status:
                        "approved",

                    tournament_id:
                        tournament.id
                })
                .eq(
                    "id",
                    id
                );

            if (updateError) {

                console.error(
                    updateError
                );

                // Якщо команду створили,
                // але заявку не оновили —
                // пробуємо прибрати команду,
                // щоб не створити дубль.

                if (createdTeam?.id) {

                    await supabaseClient
                        .from("teams")
                        .delete()
                        .eq(
                            "id",
                            createdTeam.id
                        );
                }

                showMessage(
                    "❌ Не вдалося оновити заявку: " +
                    updateError.message,
                    "error"
                );

                return;
            }


            // ==================================
            // 9. ГОТОВО
            // ==================================

            showMessage(
                `✅ Заявку прийнято! Команда "${application.team_name}" додана до "${tournament.name}".`
            );

            await loadApplications();
            await loadTeams();
            await loadTournaments();

        } catch (error) {

            console.error(
                "acceptApplication:",
                error
            );

            showMessage(
                "❌ Сталася помилка: " +
                error.message,
                "error"
            );
        }
    };


// ==========================================
// СТАРА НАЗВА ФУНКЦІЇ
// ==========================================

window.approveApplication =
    async function(id) {

        return window.acceptApplication(id);

    };


// ==========================================
// REJECT APPLICATION
// ==========================================

window.rejectApplication =
    async function(id) {

        const confirmed =
            confirm(
                "Відхилити цю заявку?"
            );

        if (!confirmed) {
            return;
        }

        const {
            error
        } = await supabaseClient
            .from("tournament_applications")
            .update({
                status:
                    "rejected"
            })
            .eq(
                "id",
                id
            );

        if (error) {

            console.error(error);

            showMessage(
                "❌ Не вдалося відхилити заявку: " +
                error.message,
                "error"
            );

            return;
        }

        showMessage(
            "❌ Заявку відхилено."
        );

        await loadApplications();
    };


// ==========================================
// APPLICATION FILTER
// ==========================================

const applicationFilter =
    document.getElementById(
        "applicationFilter"
    );

if (applicationFilter) {

    applicationFilter.addEventListener(
        "change",
        renderApplications
    );
}


// ==========================================
// REFRESH APPLICATIONS
// ==========================================

const refreshApplicationsButton =
    document.getElementById(
        "refreshApplicationsButton"
    );

if (refreshApplicationsButton) {

    refreshApplicationsButton.addEventListener(
        "click",
        loadApplications
    );
}


// ==========================================
// STATUS FUNCTIONS
// ==========================================

function getStatusText(status) {

    if (status === "live") {
        return "LIVE";
    }

    if (status === "finished") {
        return "Завершений";
    }

    return "Майбутній";
}


function getStatusClass(status) {

    if (status === "live") {
        return "badge-live";
    }

    if (status === "finished") {
        return "badge-finished";
    }

    return "badge-upcoming";
}


function getApplicationStatusText(status) {

    if (status === "approved") {
        return "Прийнята";
    }

    if (status === "rejected") {
        return "Відхилена";
    }

    return "Очікує";
}


function getApplicationStatusClass(status) {

    if (status === "approved") {
        return "badge-approved";
    }

    if (status === "rejected") {
        return "badge-rejected";
    }

    return "badge-pending";
}


// ==========================================
// DATE
// ==========================================

function formatDate(date) {

    if (!date) {
        return "—";
    }

    const d =
        new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "—";
    }

    return d.toLocaleString(
        "uk-UA"
    );
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// 👥 КОМАНДИ
// ==========================================

let editingTeamId = null;


// ==========================================
// LOAD TEAMS
// ==========================================

async function loadTeams() {

    const list =
        document.getElementById(
            "teamsList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        "⏳ Завантаження команд...";

    const {
        data,
        error
    } = await supabaseClient
        .from("teams")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);

        list.innerHTML = `
            <div class="error-box">
                ❌ Не вдалося завантажити команди.<br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-box">
                👥 Команд поки немає.
            </div>
        `;

        return;
    }

    list.innerHTML =
        data.map(team => {

            const players =
                team.players
                ? team.players
                    .split("\n")
                    .filter(Boolean)
                : [];

            const substitutes =
                team.substitutes
                ? team.substitutes
                    .split("\n")
                    .filter(Boolean)
                : [];

            return `
                <div class="application-card">

                    <div class="application-header">

                        <div>

                            <h3>
                                👥 ${escapeHtml(team.name)}
                            </h3>

                            <div class="application-status approved">
                                Команда
                            </div>

                        </div>

                        <div class="application-actions">

                            <button
                                class="edit-btn"
                                onclick="editTeam(${team.id})"
                            >
                                ✏️ Редагувати
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteTeam(${team.id})"
                            >
                                🗑️ Видалити
                            </button>

                        </div>

                    </div>

                    <div class="team-info">

                        <h4>👤 Основний склад</h4>

                        ${
                            players.length
                            ? `
                                <ul>
                                    ${players.map(
                                        player => `
                                            <li>
                                                ${escapeHtml(player)}
                                            </li>
                                        `
                                    ).join("")}
                                </ul>
                              `
                            : `<p>Немає гравців</p>`
                        }

                        <h4>🔄 Заміни</h4>

                        ${
                            substitutes.length
                            ? `
                                <ul>
                                    ${substitutes.map(
                                        player => `
                                            <li>
                                                ${escapeHtml(player)}
                                            </li>
                                        `
                                    ).join("")}
                                </ul>
                              `
                            : `<p>Немає замін</p>`
                        }

                    </div>

                </div>
            `;

        })
        .join("");
}


// ==========================================
// OPEN TEAM FORM
// ==========================================

window.openTeamForm =
    async function(team = null) {

        editingTeamId =
            team
            ? team.id
            : null;

        const modal =
            document.getElementById(
                "teamModal"
            );

        if (modal) {
            modal.style.display =
                "flex";
        }

        const title =
            document.getElementById(
                "teamModalTitle"
            );

        if (title) {
            title.textContent =
                team
                ? "✏️ Редагувати команду"
                : "➕ Додати команду";
        }

        const teamName =
            document.getElementById(
                "teamName"
            );

        if (teamName) {
            teamName.value =
                team?.name || "";
        }

        const teamPlayers =
            document.getElementById(
                "teamPlayers"
            );

        if (teamPlayers) {
            teamPlayers.value =
                team?.players || "";
        }

        const teamSubstitutes =
            document.getElementById(
                "teamSubstitutes"
            );

        if (teamSubstitutes) {
            teamSubstitutes.value =
                team?.substitutes || "";
        }

        await loadTeamTournaments();

        const tournamentSelect =
            document.getElementById(
                "teamTournament"
            );

        if (tournamentSelect) {
            tournamentSelect.value =
                team?.tournament_id || "";
        }
    };


// ==========================================
// CLOSE TEAM FORM
// ==========================================

window.closeTeamForm =
    function() {

        const modal =
            document.getElementById(
                "teamModal"
            );

        if (modal) {

            modal.style.display =
                "none";
        }

        editingTeamId =
            null;
    };


// ==========================================
// LOAD TEAM TOURNAMENTS
// ==========================================

async function loadTeamTournaments() {

    const select =
        document.getElementById(
            "teamTournament"
        );

    if (!select) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("tournaments")
        .select(
            "id, name"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);
        return;
    }

    select.innerHTML = `
        <option value="">
            Без турніру
        </option>
    `;

    (data || []).forEach(
        tournament => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                tournament.id;

            option.textContent =
                tournament.name;

            select.appendChild(
                option
            );
        }
    );
}


// ==========================================
// SAVE TEAM
// ==========================================

window.saveTeam =
    async function() {

        const nameElement =
            document.getElementById(
                "teamName"
            );

        const tournamentElement =
            document.getElementById(
                "teamTournament"
            );

        const playersElement =
            document.getElementById(
                "teamPlayers"
            );

        const substitutesElement =
            document.getElementById(
                "teamSubstitutes"
            );

        const name =
            nameElement
            ? nameElement.value.trim()
            : "";

        const tournamentValue =
            tournamentElement
            ? tournamentElement.value
            : "";

        const players =
            playersElement
            ? playersElement.value.trim()
            : "";

        const substitutes =
            substitutesElement
            ? substitutesElement.value.trim()
            : "";

        if (!name) {

            alert(
                "❌ Введи назву команди."
            );

            return;
        }

        const teamData = {

            name:

                name,

            tournament_id:

                tournamentValue
                ? Number(tournamentValue)
                : null,

            players:

                players,

            substitutes:

                substitutes

        };

        let result;

        if (editingTeamId) {

            result =
                await supabaseClient
                    .from("teams")
                    .update(teamData)
                    .eq(
                        "id",
                        editingTeamId
                    );

        } else {

            result =
                await supabaseClient
                    .from("teams")
                    .insert(
                        teamData
                    );
        }

        if (result.error) {

            console.error(
                result.error
            );

            alert(
                "❌ Не вдалося зберегти команду:\n\n" +
                result.error.message
            );

            return;
        }

        alert(
            "✅ Команду збережено!"
        );

        window.closeTeamForm();

        await loadTeams();
    };


// ==========================================
// EDIT TEAM
// ==========================================

window.editTeam =
    async function(id) {

        const {
            data,
            error
        } = await supabaseClient
            .from("teams")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();

        if (error) {

            alert(
                "❌ Не вдалося завантажити команду:\n\n" +
                error.message
            );

            return;
        }

        window.openTeamForm(data);
    };


// ==========================================
// DELETE TEAM
// ==========================================

window.deleteTeam =
    async function(id) {

        const confirmDelete =
            confirm(
                "Точно видалити цю команду?"
            );

        if (!confirmDelete) {
            return;
        }

        const {
            error
        } = await supabaseClient
            .from("teams")
            .delete()
            .eq(
                "id",
                id
            );

        if (error) {

            alert(
                "❌ Не вдалося видалити команду:\n\n" +
                error.message
            );

            return;
        }

        alert(
            "🗑️ Команду видалено."
        );

        await loadTeams();
    };


// ==========================================
// START
// ==========================================

checkSession();