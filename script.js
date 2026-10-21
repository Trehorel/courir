// ---------- Données : une entrée par niveau ----------
// s(w) renvoie les séances de la semaine w (0 à 3)
// t contient les conseils propres au niveau
var L = {
    deb: {
        nom: "Débutant",
        d: "3 séances par semaine, surtout en alternant marche et course. Objectif : tenir 30 minutes sans s’arrêter.",
        s: function (w) {
            return [
                ["Séance 1", "25 min : " + (2 + w) + " min de course / 1 min de marche, à répéter"],
                ["Séance 2", "25 min : " + (2 + w) + " min de course / 1 min de marche, à répéter"],
                ["Séance 3 (plus longue)", (30 + w * 5) + " min en alternant " + (3 + w) + " min de course / 1 min de marche"]
            ];
        },
        t: [
            ["Allure", "Tu dois pouvoir parler en courant. Si tu es essoufflé, ralentis."],
            ["Repos", "Un jour de repos entre deux séances, pas moins."],
            ["Équipement", "Une bonne paire de chaussures suffit pour commencer."]
        ]
    },

    int: {
        nom: "Intermédiaire",
        d: "4 séances par semaine, avec du fractionné et une sortie longue. Objectif : 10 km régulier.",
        s: function (w) {
            return [
                ["Footing", (40 + w * 3) + " min à allure facile"],
                ["Fractionné", (6 + w * 2) + " × 1 min vite / 1 min de trot, avec 10 min d’échauffement"],
                ["Footing de récupération", "30 min très tranquille"],
                ["Sortie longue", (60 + w * 5) + " min à allure facile"]
            ];
        },
        t: [
            ["Fractionné", "Vite, pas à fond : tu dois pouvoir tenir la dernière répétition au même rythme que la première."],
            ["Semaine 4", "Gère-la comme une semaine d’adaptation : ne dépasse pas ce qui est prévu."],
            ["Récupération", "Dors 7 à 8 heures : c’est là que tu progresses."]
        ]
    },

    exp: {
        nom: "Confirmé",
        d: "5 séances par semaine, avec travail au seuil, VMA et sortie longue avec allure spécifique. Objectif : semi-marathon.",
        s: function (w) {
            return [
                ["Footing", (45 + w * 3) + " min à allure facile"],
                ["Seuil", "3 × " + (8 + w * 2) + " min allure seuil, 2 min de récupération"],
                ["VMA", (8 + w) + " × 400 m vite, 1 min 30 de récupération"],
                ["Footing de récupération", "35 min très tranquille"],
                ["Sortie longue", (90 + w * 5) + " min dont " + (20 + w * 5) + " min à allure semi"]
            ];
        },
        t: [
            ["Seuil", "Allure « confortablement difficile » : tu peux dire quelques mots mais pas tenir une conversation."],
            ["80/20", "Environ 80 % de ton volume reste en allure facile."],
            ["Charge", "Après trois semaines qui montent, prévois une semaine plus légère."]
        ]
    }
};

// ---------- État : niveau, semaine et séances cochées ----------
var lv = "deb";
var wk = 0;
var done = {};

try {
    done = JSON.parse(localStorage.getItem("done") || "{}");
} catch (e) {}

function save() {
    try {
        localStorage.setItem("done", JSON.stringify(done));
    } catch (e) {}
}

// ---------- Crée une rangée de boutons ----------
function mk(parent, items, cur, fn) {
    parent.innerHTML = "";

    items.forEach(function (it) {
        var b = document.createElement("button");
        b.textContent = it[1];
        b.setAttribute("aria-pressed", it[0] === cur);
        b.onclick = function () {
            fn(it[0]);
        };
        parent.appendChild(b);
    });
}

// ---------- Protège le texte inséré dans le HTML ----------
function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

// ---------- Barre de progression de la semaine ----------
function updateProgress(total) {
    var prefix = lv + "-" + wk + "-";
    var n = Object.keys(done).filter(function (k) {
        return k.indexOf(prefix) === 0;
    }).length;

    document.getElementById("bar").style.width = (n / total * 100) + "%";
    document.getElementById("count").textContent = n + " / " + total + " séances faites";
}

// ---------- Liste des séances avec cases à cocher ----------
function renderPlan(sessions) {
    var plan = document.getElementById("plan");
    plan.innerHTML = "";

    sessions.forEach(function (x, i) {
        var key = lv + "-" + wk + "-" + i;

        var li = document.createElement("li");
        var label = document.createElement("label");
        var box = document.createElement("input");
        var span = document.createElement("span");
        var title = document.createElement("b");

        box.type = "checkbox";
        box.checked = !!done[key];
        li.className = box.checked ? "done" : "";

        box.onchange = function () {
            if (box.checked) {
                done[key] = true;
            } else {
                delete done[key];
            }
            li.className = box.checked ? "done" : "";
            save();
            updateProgress(sessions.length);
        };

        title.textContent = x[0];
        span.appendChild(title);
        span.appendChild(document.createTextNode(x[1]));

        label.appendChild(box);
        label.appendChild(span);
        li.appendChild(label);
        plan.appendChild(li);
    });

    updateProgress(sessions.length);
}

// ---------- Affiche la page selon le niveau et la semaine ----------
function draw() {
    var d = L[lv];

    mk(
        document.getElementById("levels"),
        Object.keys(L).map(function (k) {
            return [k, L[k].nom];
        }),
        lv,
        function (k) {
            lv = k;
            draw();
        }
    );

    mk(
        document.getElementById("weeks"),
        [0, 1, 2, 3].map(function (i) {
            return [i, "Semaine " + (i + 1)];
        }),
        wk,
        function (i) {
            wk = i;
            draw();
        }
    );

    document.getElementById("desc").textContent = d.d;
    renderPlan(d.s(wk));

    document.getElementById("tips").innerHTML = d.t.map(function (x) {
        return "<div><h3>" + esc(x[0]) + "</h3><p>" + esc(x[1]) + "</p></div>";
    }).join("");
}

// ---------- Calculateur d’allure ----------
function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.round(sec % 60);

    if (s === 60) {
        m++;
        s = 0;
    }
    return m + ":" + (s < 10 ? "0" : "") + s;
}

function calc() {
    var km = parseFloat(document.getElementById("dist").value);
    var m = parseInt(document.getElementById("min").value, 10) || 0;
    var s = parseInt(document.getElementById("sec").value, 10) || 0;
    var total = m * 60 + s;
    var out = document.getElementById("result");

    if (!(km > 0) || total <= 0) {
        out.textContent = "Entre une distance et un temps.";
        return;
    }

    out.textContent = fmt(total / km) + " min/km · " + (km / (total / 3600)).toFixed(1) + " km/h";
}

["dist", "min", "sec"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", calc);
});

// ---------- Thème clair / sombre ----------
function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try {
        localStorage.setItem("theme", t);
    } catch (e) {}
}

try {
    var saved = localStorage.getItem("theme");
    if (saved) {
        applyTheme(saved);
    }
} catch (e) {}

document.getElementById("theme").onclick = function () {
    var cur = document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(cur === "dark" ? "light" : "dark");
};

// ---------- Premier affichage ----------
draw();
calc();
