const SUPABASE_URL = "https://rfgsmiprdmlpximyeaoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_h9m8acjhlJEAETS7nJZU8g_8M29PNAS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("V1ME Community + Supabase підключено!");


const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const tournament = document.getElementById("tournament").value;
        const teamName = document.getElementById("team").value;
        const discord = document.getElementById("discord").value;
        const captain = document.getElementById("captain").value;
        const players = document.getElementById("players").value;
        const steam = document.getElementById("steam").value;

        const { error } = await supabaseClient
            .from("tournament_applications")
            .insert({
                tournament: tournament,
                team_name: teamName,
                captain_contact: discord,
                captain_name: captain,
                players: players,
                steam: steam
            });

        if (error) {
            console.error(error);
            alert("❌ Не вдалося відправити заявку.");
            return;
        }

        document.getElementById("success").style.display = "block";
        registerForm.reset();
    });
}