const mots = ["LIBERTE", "EGALITE", "FRATERNITE", "LAICITE", "DEMOCRATIE", "JUSTICE"];
const taille = 12;

let grille = [];
let cellules = [];
let selection = [];
let motsTrouves = [];
let positionsMots = {}; // Stocke tous les indices possibles de chaque mot
let selecting = false;

const grilleElt = document.getElementById("grille");
const smiley = document.getElementById("smiley");
const message = document.getElementById("message");
const listeMotsElt = document.getElementById("mots");

/* ---------------- NOUVELLE PARTIE ---------------- */

function nouvellePartie() {
    grille = [];
    cellules = [];
    selection = [];
    motsTrouves = [];
    positionsMots = {};
    selecting = false;

    grilleElt.innerHTML = "";
    listeMotsElt.innerHTML = "";
    message.textContent = "";
    smiley.textContent = "😄";

    // Grille vide
    for (let i = 0; i < taille * taille; i++) grille.push("-");

    // Placement mots et stockage positions
    mots.forEach(mot => placerMot(mot));

    // Compléter lettres aléatoires
    for (let i = 0; i < grille.length; i++) {
        if (grille[i] === "-") grille[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    // Créer grille HTML
    for (let i = 0; i < grille.length; i++) {
        const div = document.createElement("div");
        div.className = "cellule";
        div.textContent = grille[i];

        if (estLettreDeMot(i)) div.classList.add("mot");

        // CLIQUE
        div.addEventListener("click", () => {
            if (!div.classList.contains("mot")) return;
            if (!div.classList.contains("selection")) {
                div.classList.add("selection");
                selection.push(div);
            } else {
                div.classList.remove("selection");
                selection = selection.filter(c => c !== div);
            }
        });

        // GLISSER
        div.addEventListener("mousedown", () => startSelection(div));
        div.addEventListener("mouseover", () => hoverSelection(div));
        div.addEventListener("mouseup", endSelection);

        grilleElt.appendChild(div);
        cellules.push(div);
    }

    // Liste mots à droite
    mots.forEach(mot => {
        const li = document.createElement("li");
        li.textContent = mot;
        li.id = "mot-" + mot;
        listeMotsElt.appendChild(li);
    });
}

/* ---------------- LOGIQUE GRILLE ---------------- */

function placerMot(mot) {
    const dirs = [
        { dx: 1, dy: 0 },   // horizontal
        { dx: 0, dy: 1 },   // vertical
        { dx: 1, dy: 1 },   // diagonal ↘
        { dx: -1, dy: 1 }   // diagonal ↙
    ];

    let place = false;
    while (!place) {
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        let x = Math.floor(Math.random() * taille);
        let y = Math.floor(Math.random() * taille);

        let indices = [];
        let ok = true;
        for (let i = 0; i < mot.length; i++) {
            let nx = x + dir.dx * i;
            let ny = y + dir.dy * i;
            if (nx < 0 || ny < 0 || nx >= taille || ny >= taille || grille[ny * taille + nx] !== "-") {
                ok = false;
                break;
            }
            indices.push(ny * taille + nx);
        }

        if (ok) {
            for (let i = 0; i < mot.length; i++) {
                let nx = x + dir.dx * i;
                let ny = y + dir.dy * i;
                grille[ny * taille + nx] = mot[i];
            }
            positionsMots[mot] = positionsMots[mot] || [];
            positionsMots[mot].push(indices);
            place = true;
        }
    }
}

function estLettreDeMot(index) {
    return Object.values(positionsMots).flat().some(pos => pos.includes(index));
}

/* ---------------- SELECTION ---------------- */

function startSelection(cell) {
    if (!cell.classList.contains("mot")) return;
    selecting = true;
    selection = [];
    ajouterCellule(cell);
}

function hoverSelection(cell) {
    if (selecting && cell.classList.contains("mot")) ajouterCellule(cell);
}

function endSelection() {
    selecting = false;
    verifierMot();
}

function ajouterCellule(cell) {
    if (!selection.includes(cell)) {
        selection.push(cell);
        cell.classList.add("selection");
    }
}

/* ---------------- VERIFICATION MOT ---------------- */

function verifierMot() {
    const selectionIndices = selection.map(c => cellules.indexOf(c));

    let motTrouve = null;

    // Vérifier chaque mot
    for (let mot of mots) {
        if (motsTrouves.includes(mot)) continue;
        for (let pos of positionsMots[mot]) {
            if (compareArrays(pos, selectionIndices) || compareArrays(pos.slice().reverse(), selectionIndices)) {
                motTrouve = mot;
                break;
            }
        }
        if (motTrouve) break;
    }

    if (motTrouve) {
        motsTrouves.push(motTrouve);
        selection.forEach(c => {
            c.classList.remove("selection");
            c.classList.add("trouve");
        });
        document.getElementById("mot-" + motTrouve).classList.add("trouve");
        smiley.textContent = "😎";
    } else {
        selection.forEach(c => c.classList.remove("selection"));
        smiley.textContent = "😐";
    }

    selection = [];
    verifierVictoire();
}

/* ---------------- UTILITAIRES ---------------- */

function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

/* ---------------- VICTOIRE ---------------- */

function verifierVictoire() {
    if (motsTrouves.length === mots.length) {
        message.textContent = "🎉 Tous les mots ont été trouvés !";
        smiley.textContent = "🏆";
    }
}

/* ---------------- INIT ---------------- */
nouvellePartie();
