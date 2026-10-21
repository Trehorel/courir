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

// ---------- État : niveau et semaine choisis ----------
var lv = "deb";
var wk = 0;

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

    document.getElementById("plan").innerHTML = d.s(wk).map(function (x) {
        return "<li><b>" + esc(x[0]) + "</b>" + esc(x[1]) + "</li>";
    }).join("");

    document.getElementById("tips").innerHTML = d.t.map(function (x) {
        return "<div><h3>" + esc(x[0]) + "</h3><p>" + esc(x[1]) + "</p></div>";
    }).join("");
}

// ---------- Premier affichage ----------
draw();
