/* Suivi Bout Chaud — contenu de la page.
   Ce fichier est charge par index.html avec un parametre unique a chaque
   visite, ce qui empeche le navigateur de servir une version perimee.
   C'est lui qu'il faut remplacer pour toute modification d'affichage. */

(function () {
  "use strict";

  // ── Mise en page injectee dans la coquille ──────────────────────────────
  var STYLES = "\n  :root {\n    --bleu:     #2b3a9c;   /* barres \u2014 bleu marine soutenu */\n    --bleu-s:   #1f2b76;\n    --vert:     #158f4a;   /* objectif */\n    --saumon:   #d9614a;   /* ecart defavorable */\n    --navy:     #14538f;   /* bandeau \u2014 bleu soutenu */\n    --titre:    #0d1520;\n    --texte:    #1c2733;\n    --muted:    #5c6a7a;\n    --cmt:      #33404f;\n    --bg:       #eaf1f5;\n    --surface:  #ffffff;\n    --rule:     #d4dde3;\n  }\n\n  * { box-sizing: border-box; }\n\n  body {\n    margin: 0; background: var(--bg); color: var(--texte);\n    font-family: \"IBM Plex Sans\", \"Segoe UI\", Arial, sans-serif;\n    font-size: 15px; line-height: 1.5; font-variant-numeric: tabular-nums;\n  }\n\n  header {\n    background: var(--navy); color: #fff; padding: 18px 24px;\n    display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 18px;\n  }\n  header h1 { margin: 0; font-size: 19px; font-weight: 600; letter-spacing: .2px; }\n  header .site { color: #b3d0ea; font-size: 14px; }\n  header .maj  { color: #b3d0ea; font-size: 13px; margin-left: auto; }\n\n  main { padding: 20px 24px 48px; max-width: 1360px; margin: 0 auto; }\n\n  /* \u2500\u2500 Filtres \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .filtres {\n    background: var(--surface); border: 1px solid var(--rule);\n    border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;\n    display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start;\n  }\n  .groupe { display: flex; flex-direction: column; gap: 7px; min-width: 0; }\n  .groupe > span { font-size: 12.5px; color: var(--muted); font-weight: 500; }\n  .chips { display: flex; flex-wrap: wrap; gap: 6px; }\n\n  button.chip {\n    font: inherit; font-size: 13px; padding: 6px 13px;\n    border: 1px solid var(--rule); border-radius: 999px;\n    background: #f5f8fa; color: var(--texte); cursor: pointer;\n  }\n  button.chip:hover { border-color: var(--bleu); }\n  button.chip[aria-pressed=\"true\"] {\n    background: var(--bleu); border-color: var(--bleu); color: #fff;\n  }\n  button.chip:focus-visible { outline: 3px solid #9dc8ee; outline-offset: 2px; }\n  .periodes { max-height: 104px; overflow-y: auto; padding-right: 4px; }\n\n  /* \u2500\u2500 Panneaux \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 18px; }\n  .panneau {\n    background: var(--surface); border: 1px solid var(--rule);\n    border-radius: 10px; padding: 16px 18px 18px; min-width: 0;\n  }\n  .panneau h2 { margin: 0 0 2px; font-size: 16.5px; font-weight: 700; color: var(--titre); }\n  .panneau .sous { margin: 0 0 14px; font-size: 12.5px; color: var(--muted); }\n\n  .toile { position: relative; height: 320px; }\n  .vide {\n    height: 200px; display: flex; align-items: center; justify-content: center;\n    text-align: center; color: var(--muted); font-size: 14px;\n    background: #f7fafc; border: 1px dashed var(--rule); border-radius: 8px; padding: 0 20px;\n  }\n\n  .legende { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: 12.5px; color: var(--muted); }\n  .legende i { display: inline-block; vertical-align: middle; margin-right: 7px; }\n  .legende .b { background: var(--bleu); width: 11px; height: 11px; border-radius: 2px; }\n  .legende .t { background: var(--vert); width: 22px; height: 3px; border-radius: 2px; }\n\n\n  /* \u2500\u2500 Nombre de changements \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .demarrages { grid-column: 1 / -1; }\n  .dem-total {\n    font-size: 46px; font-weight: 800; color: var(--titre);\n    line-height: 1; margin: 2px 0 16px;\n  }\n  .dem-lignes { display: flex; flex-wrap: wrap; gap: 8px; }\n  .dem-case {\n    flex: 1 1 150px; min-width: 150px;\n    border: 1px solid var(--rule); border-left: 4px solid var(--bleu);\n    border-radius: 7px; padding: 8px 12px; background: #fbfdff;\n  }\n  .dem-ligne { display: block; font-size: 15px; font-weight: 700; color: var(--titre); }\n  .dem-nb { display: block; font-size: 12px; color: var(--muted); margin-top: 1px; }\n  .dem-jours {\n    display: block; font-size: 11.5px; color: var(--texte);\n    margin-top: 4px; line-height: 1.35;\n  }\n\n  /* \u2500\u2500 Tableaux \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .detail { margin-top: 16px; border-top: 1px solid var(--rule); padding-top: 14px; }\n  .detail h3 { margin: 0 0 3px; font-size: 13.5px; font-weight: 600; color: var(--titre); }\n  .detail .aide { margin: 0 0 10px; font-size: 12px; color: var(--muted); }\n  .cadre { max-height: 260px; overflow: auto; border: 1px solid var(--rule); border-radius: 7px; }\n\n  table { border-collapse: collapse; width: 100%; font-size: 13px; }\n  thead th {\n    position: sticky; top: 0; z-index: 1; background: #f2f6f9; color: var(--muted);\n    font-weight: 600; text-align: left; padding: 8px 10px;\n    border-bottom: 1px solid var(--rule); white-space: nowrap;\n  }\n  tbody td { padding: 7px 10px; border-bottom: 1px solid #eef2f5; vertical-align: top; }\n  tbody tr:last-child td { border-bottom: none; }\n  td.num { text-align: right; white-space: nowrap; }\n  td.ligne { font-weight: 600; color: var(--titre); }\n  td.cmt { color: var(--cmt); min-width: 200px; }\n  .cmt-bloc + .cmt-bloc { margin-top: 7px; }\n  .cmt-tache { display: block; font-weight: 600; color: var(--titre); font-size: 12px; margin-bottom: 1px; }\n  .cmt-texte { display: block; }\n  td.dates { color: var(--muted); font-size: 12px; min-width: 140px; }\n  .plus-lent { color: var(--saumon); font-weight: 600; }\n  .plus-vite { color: var(--vert); font-weight: 600; }\n\n  /* \u2500\u2500 Tableau des causes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .causes { margin-top: 18px; }\n  .causes .cadre { max-height: 420px; }\n  .tab-causes tbody td { padding: 9px 12px; }\n  .tab-causes tbody tr:nth-child(-n+3) .rang { background: var(--bleu); color: #fff; }\n  td.cause { color: var(--texte); }\n  .rang {\n    display: inline-block; min-width: 20px; height: 20px; line-height: 20px;\n    text-align: center; border-radius: 5px; margin-right: 9px;\n    background: #eaf1f6; color: var(--muted); font-size: 11.5px; font-weight: 600; vertical-align: 1px;\n  }\n  .marque {\n    display: inline-block; margin-left: 8px; padding: 1px 7px;\n    border: 1px solid var(--rule); border-radius: 999px;\n    font-size: 11px; color: var(--muted); white-space: nowrap;\n  }\n  td.fois { font-weight: 600; color: var(--titre); width: 58px; }\n  td.pct { width: 110px; white-space: nowrap; }\n  .pct-val { display: block; text-align: right; font-weight: 600; color: var(--titre); }\n  .hors-liste {\n    margin: 10px 0 0; font-size: 12.5px; color: var(--muted);\n    background: #f5f8fa; border: 1px solid var(--rule); border-radius: 7px; padding: 8px 11px;\n  }\n\n  .etat {\n    background: var(--surface); border: 1px solid var(--rule);\n    border-radius: 10px; padding: 28px; text-align: center; color: var(--muted);\n  }\n\n  @media (max-width: 560px) {\n    header, main { padding-left: 14px; padding-right: 14px; }\n    header .maj { margin-left: 0; width: 100%; }\n    .grille { grid-template-columns: 1fr; }\n    .part { grid-template-columns: 110px 1fr; }\n    .part-val { grid-column: 1 / -1; text-align: left; }\n  }\n  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }\n";

  var CORPS = "\n<header>\n  <h1>Suivi Bout Chaud</h1>\n  <span class=\"site\">SGD Pharma \u2014 Sucy-en-Brie</span>\n  <span class=\"maj\" id=\"maj\"></span>\n</header>\n\n<main>\n  <div class=\"filtres\" id=\"filtres\" hidden>\n    <div class=\"groupe\">\n      <span>Periode</span>\n      <div class=\"chips\" id=\"mode\"></div>\n    </div>\n    <div class=\"groupe\" style=\"flex:1\">\n      <span id=\"label-periode\">Mois</span>\n      <div class=\"chips periodes\" id=\"periodes\"></div>\n    </div>\n    <div class=\"groupe\">\n      <span>Unite</span>\n      <div class=\"chips\" id=\"unite\"></div>\n    </div>\n  </div>\n\n  <div class=\"etat\" id=\"etat\">Chargement des donnees\u2026</div>\n  <div class=\"grille\" id=\"grille\" hidden></div>\n  <div id=\"causes\" hidden></div>\n</main>\n";

  var feuille = document.createElement("style");
  feuille.textContent = STYLES;
  document.head.appendChild(feuille);
  document.body.innerHTML = CORPS;

  // ── Chart.js, puis le tableau de bord ───────────────────────────────────
  var chart = document.createElement("script");
  chart.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
  chart.onload = demarrer;
  chart.onerror = function () {
    document.getElementById("etat").textContent =
      "La bibliotheque graphique n'a pas pu etre chargee.";
  };
  document.head.appendChild(chart);

  function demarrer() {
    (function () {
      "use strict";

      var MOIS = ["janvier","fevrier","mars","avril","mai","juin",
                  "juillet","aout","septembre","octobre","novembre","decembre"];

      var BLEU = "#2b3a9c", VERT = "#158f4a", SAUMON = "#d9614a";

      var donnees = null;
      var mode = "mois";
      var periode = null;
      var unite = "min";
      var graphes = {};

      // ── Dates ─────────────────────────────────────────────────────────────────

      function versDate(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); }
      function cleMois(iso) { return iso.slice(0, 7); }
      function libelleMois(cle) { var p = cle.split("-"); return MOIS[+p[1]-1] + " " + p[0]; }

      function lundi(d) {
        var j = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        j.setDate(j.getDate() - ((j.getDay() + 6) % 7));
        return j;
      }
      function isoDate(d) {
        return d.getFullYear() + "-" +
               String(d.getMonth()+1).padStart(2,"0") + "-" +
               String(d.getDate()).padStart(2,"0");
      }
      function cleSemaine(iso) { return isoDate(lundi(versDate(iso))); }
      function libelleSemaine(cle) {
        var d = versDate(cle);
        var f = new Date(d.getFullYear(), d.getMonth(), d.getDate()+6);
        var c = function (x) { return x.getDate() + " " + MOIS[x.getMonth()].slice(0,4); };
        return c(d) + " – " + c(f);
      }
      function cleDe(iso) { return mode === "mois" ? cleMois(iso) : cleSemaine(iso); }
      function libelleDe(cle) { return mode === "mois" ? libelleMois(cle) : libelleSemaine(cle); }

      function jourCourt(iso) {
        var d = versDate(iso);
        return String(d.getDate()).padStart(2,"0") + "/" + String(d.getMonth()+1).padStart(2,"0");
      }

      // ── Durees ────────────────────────────────────────────────────────────────

      function formater(minutes) {
        if (minutes === null || minutes === undefined) return "";
        var t = Math.round(minutes);
        var signe = t < 0 ? "-" : "";
        var a = Math.abs(t);
        if (unite === "min") return signe + a + " min";
        var h = Math.floor(a/60), m = a%60;
        return signe + (h === 0 ? m + "m" : h + "h " + String(m).padStart(2,"0") + "m");
      }
      function convertir(minutes) {
        return unite === "min" ? Math.round(minutes) : Math.round(minutes/6)/10;
      }

      // ── Filtres ───────────────────────────────────────────────────────────────

      function periodesDisponibles() {
        var v = {};
        donnees.mesures.forEach(function (m) { v[cleDe(m.date)] = true; });
        return Object.keys(v).sort();
      }
      function periodeParDefaut(liste) {
        var c = cleDe(isoDate(new Date()));
        if (liste.indexOf(c) > -1) return c;
        return liste.length ? liste[liste.length-1] : null;
      }
      function faireChips(hote, options, actif, auClic) {
        hote.innerHTML = "";
        options.forEach(function (o) {
          var b = document.createElement("button");
          b.className = "chip"; b.type = "button"; b.textContent = o.libelle;
          b.setAttribute("aria-pressed", o.valeur === actif ? "true" : "false");
          b.addEventListener("click", function () { auClic(o.valeur); });
          hote.appendChild(b);
        });
      }
      function dessinerFiltres() {
        faireChips(document.getElementById("mode"),
          [{valeur:"mois",libelle:"Mois"},{valeur:"semaine",libelle:"Semaine"}], mode,
          function (v) {
            if (v === mode) return;
            mode = v;
            document.getElementById("label-periode").textContent = mode === "mois" ? "Mois" : "Semaine";
            periode = periodeParDefaut(periodesDisponibles());
            dessinerFiltres(); dessinerTout();
          });

        faireChips(document.getElementById("periodes"),
          periodesDisponibles().map(function (c) { return {valeur:c, libelle:libelleDe(c)}; }),
          periode, function (v) { periode = v; dessinerFiltres(); dessinerTout(); });

        faireChips(document.getElementById("unite"),
          [{valeur:"min",libelle:"Minutes"},{valeur:"h",libelle:"Heures"}], unite,
          function (v) { unite = v; dessinerFiltres(); dessinerTout(); });

        document.getElementById("filtres").hidden = false;
      }

      // ── Agregation ────────────────────────────────────────────────────────────

      function mesuresPeriode(metrique) {
        return donnees.mesures.filter(function (m) {
          return m.metrique === metrique && cleDe(m.date) === periode;
        });
      }

      // Moyenne du reel et de l'objectif, ligne par ligne.
      // L'objectif suit la periode affichee : il est saisi chaque jour.
      function parLigne(metrique) {
        var cumuls = {};
        mesuresPeriode(metrique).forEach(function (m) {
          if (!cumuls[m.ligne]) cumuls[m.ligne] = { somme:0, nb:0, sommeObj:0, nbObj:0 };
          var c = cumuls[m.ligne];
          c.somme += m.duree_min; c.nb += 1;
          if (m.objectif_min !== null && m.objectif_min !== undefined) {
            c.sommeObj += m.objectif_min; c.nbObj += 1;
          }
        });
        return Object.keys(cumuls).map(function (l) {
          var c = cumuls[l];
          return {
            ligne: l,
            valeur: c.somme / c.nb,
            nb: c.nb,
            objectif: c.nbObj ? c.sommeObj / c.nbObj : null
          };
        }).sort(function (a,b) { return (+a.ligne) - (+b.ligne); });
      }

      // ── Etiquettes dessinees sur le graphe ────────────────────────────────────

      var etiquettes = {
        id: "etiquettes",
        afterDatasetsDraw: function (chart, args, opts) {
          if (!opts || !opts.lignes) return;
          var ctx = chart.ctx;
          var lignes = opts.lignes;

          ctx.save();
          ctx.textAlign = "center";

          var barres = chart.getDatasetMeta(0);
          ctx.font = "600 12.5px 'IBM Plex Sans', Arial, sans-serif";
          ctx.fillStyle = "#0d1520";
          var zones = [];
          barres.data.forEach(function (el, i) {
            var t = opts.formater(lignes[i].valeur);
            var negatif = lignes[i].valeur < 0;
            ctx.textBaseline = negatif ? "top" : "bottom";
            var y = negatif ? el.y + 6 : el.y - 6;
            ctx.fillText(t, el.x, y);
            var demi = ctx.measureText(t).width / 2 + 3;
            zones.push({ x1: el.x - demi, x2: el.x + demi,
                         y1: negatif ? el.y + 3 : el.y - 20,
                         y2: negatif ? el.y + 20 : el.y - 3 });
          });

          if (chart.data.datasets.length < 2) { ctx.restore(); return; }
          var pts = chart.getDatasetMeta(1);
          ctx.font = "600 11.5px 'IBM Plex Sans', Arial, sans-serif";
          pts.data.forEach(function (el, i) {
            var brut = lignes[i].objectif;
            if (brut === null || brut === undefined) return;
            var texte = opts.formater(brut);
            var l = ctx.measureText(texte).width + 12;
            var h = 18;

            var chevauche = function (x, y) {
              for (var k = 0; k < zones.length; k++) {
                var z = zones[k];
                if (x < z.x2 && x + l > z.x1 && y < z.y2 && y + h > z.y1) return true;
              }
              return false;
            };

            var haut = chart.chartArea.top, bas = chart.chartArea.bottom;
            var gauche = chart.chartArea.left, droite = chart.chartArea.right;
            var essais = [
              [el.x - l/2, el.y + 9],
              [el.x - l/2, el.y - h - 9],
              [el.x + 9,   el.y - h/2],
              [el.x - l - 9, el.y - h/2],
              [el.x - l/2, el.y + h + 14],
              [el.x - l/2, el.y - 2*h - 14]
            ];
            var x = essais[0][0], y = essais[0][1], trouve = false;
            for (var e = 0; e < essais.length; e++) {
              var ex = Math.min(Math.max(essais[e][0], gauche + 2), droite - l - 2);
              var ey = essais[e][1];
              if (ey < haut + 1 || ey + h > bas - 1) continue;
              if (!chevauche(ex, ey)) { x = ex; y = ey; trouve = true; break; }
            }
            if (!trouve) {
              x = Math.min(Math.max(el.x - l/2, gauche + 2), droite - l - 2);
              y = Math.min(Math.max(el.y + 9, haut + 1), bas - h - 1);
            }
            zones.push({ x1: x, x2: x + l, y1: y, y2: y + h });

            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = VERT;
            ctx.lineWidth = 1;
            if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, l, h, 4); ctx.fill(); ctx.stroke(); }
            else { ctx.fillRect(x, y, l, h); ctx.strokeRect(x, y, l, h); }
            ctx.fillStyle = VERT;
            ctx.textBaseline = "middle";
            ctx.fillText(texte, x + l/2, y + h/2 + .5);
          });
          ctx.restore();
        }
      };
      Chart.register(etiquettes);

      // ── Tableau de detail ─────────────────────────────────────────────────────

      function construireTableau(metrique) {
        var estRetard = false;
        var lignes = mesuresPeriode(metrique).slice();

        if (estRetard) {
          // la valeur EST deja le retard : un ecart n'aurait pas de sens
          lignes.sort(function (a, b) { return a.duree_min - b.duree_min; });
        } else {
          lignes.forEach(function (m) {
            var t = m.objectif_min;
            m._ecart = (t === null || t === undefined) ? null : m.duree_min - t;
          });
          lignes.sort(function (a, b) {
            if (a._ecart === null) return 1;
            if (b._ecart === null) return -1;
            return b._ecart - a._ecart;
          });
        }

        var bloc = document.createElement("div");
        bloc.className = "detail";

        var h3 = document.createElement("h3");
        h3.textContent = "Detail des changements";
        bloc.appendChild(h3);

        var aide = document.createElement("p");
        aide.className = "aide";
        aide.textContent = lignes.length + " changement" + (lignes.length > 1 ? "s" : "") +
                           ", " + (estRetard ? "du plus gros retard au plus faible."
                                                            : "du plus lent au plus rapide.");
        bloc.appendChild(aide);

        var cadre = document.createElement("div");
        cadre.className = "cadre";
        var table = document.createElement("table");
        table.innerHTML =
          "<thead><tr><th>Date</th><th>Ligne</th>" +
          "<th>" + (estRetard ? "Retard" : "Duree") + "</th>" +
          (estRetard ? "" : "<th>Ecart objectif</th>") +
          "<th>Commentaire</th></tr></thead>";

        var corps = document.createElement("tbody");
        lignes.forEach(function (m) {
          var tr = document.createElement("tr");

          var td1 = document.createElement("td");
          td1.className = "num"; td1.textContent = jourCourt(m.date); tr.appendChild(td1);

          var td2 = document.createElement("td");
          td2.className = "ligne"; td2.textContent = m.ligne; tr.appendChild(td2);

          var td3 = document.createElement("td");
          td3.className = "num" + (estRetard && m.duree_min < 0 ? " plus-lent" : "");
          td3.textContent = formater(m.duree_min); tr.appendChild(td3);

          if (!estRetard) {
            var td4 = document.createElement("td");
            td4.className = "num";
            if (m._ecart === null) {
              td4.textContent = "—";
            } else if (m._ecart === 0) {
              td4.textContent = "a l'objectif";
            } else if (m._ecart > 0) {
              td4.className += " plus-lent";
              td4.textContent = "+" + formater(m._ecart);
            } else {
              td4.className += " plus-vite";
              td4.textContent = formater(m._ecart);
            }
            tr.appendChild(td4);
          }

          var td5 = document.createElement("td");
          td5.className = "cmt";
          var details = m.details || [];
          if (!details.length) {
            td5.textContent = "—";
          } else {
            details.forEach(function (d) {
              var b = document.createElement("div");
              b.className = "cmt-bloc";
              var nom = document.createElement("span");
              nom.className = "cmt-tache"; nom.textContent = d.tache;
              var txt = document.createElement("span");
              txt.className = "cmt-texte"; txt.textContent = d.texte;
              b.appendChild(nom); b.appendChild(txt);
              td5.appendChild(b);
            });
          }
          tr.appendChild(td5);

          corps.appendChild(tr);
        });

        table.appendChild(corps);
        cadre.appendChild(table);
        bloc.appendChild(cadre);
        return bloc;
      }

      // ── Nombre de demarrages ──────────────────────────────────────────────────

      function dessinerDemarrages(hote) {
        var liste = (donnees.demarrages || []).filter(function (d) {
          return cleDe(d.date) === periode;
        });
        if (!liste.length) return;

        var parLigne = {};
        liste.forEach(function (d) {
          if (!parLigne[d.ligne]) parLigne[d.ligne] = [];
          parLigne[d.ligne].push(d.date);
        });
        var lignes = Object.keys(parLigne).sort(function (a, b) { return (+a) - (+b); });

        var panneau = document.createElement("section");
        panneau.className = "panneau demarrages";

        var titre = document.createElement("h2");
        titre.textContent = "Nombre de changements";
        panneau.appendChild(titre);

        var sous = document.createElement("p");
        sous.className = "sous";
        sous.textContent = libelleDe(periode) + ".";
        panneau.appendChild(sous);

        var tot = document.createElement("div");
        tot.className = "dem-total";
        tot.textContent = liste.length;
        panneau.appendChild(tot);

        var grille = document.createElement("div");
        grille.className = "dem-lignes";
        lignes.forEach(function (l) {
          var c = document.createElement("div");
          c.className = "dem-case";
          var n = document.createElement("span");
          n.className = "dem-ligne"; n.textContent = l;
          var dates = parLigne[l].slice().sort();
          var v = document.createElement("span");
          v.className = "dem-nb";
          v.textContent = dates.length + (dates.length > 1 ? " changements" : " changement");

          var j = document.createElement("span");
          j.className = "dem-jours";
          j.textContent = dates.map(jourCourt).join(", ");

          c.appendChild(n); c.appendChild(v); c.appendChild(j);
          grille.appendChild(c);
        });
        panneau.appendChild(grille);

        hote.appendChild(panneau);
      }

      // ── Tableau des causes ────────────────────────────────────────────────────

      var SEUIL = 2;

      function comptageCauses() {
        var periodeCauses = (donnees.causes || []).filter(function (c) {
          return cleDe(c.date) === periode;
        });

        var retenues = periodeCauses.filter(function (c) {
          return c.type !== "releve" && c.type !== "normal";
        });
        var nbReleves = periodeCauses.filter(function (c) { return c.type === "releve"; }).length;
        var nbNormaux = periodeCauses.filter(function (c) { return c.type === "normal"; }).length;

        var compte = {};
        retenues.forEach(function (c) {
          if (!compte[c.cause]) compte[c.cause] = { nb: 0, dates: {}, lignes: {}, type: c.type };
          compte[c.cause].nb += 1;
          compte[c.cause].dates[c.date] = true;
          compte[c.cause].lignes[c.ligne] = true;
        });

        var total = retenues.length;
        var toutes = Object.keys(compte).map(function (nom) {
          return {
            cause: nom, nb: compte[nom].nb, type: compte[nom].type,
            dates: Object.keys(compte[nom].dates).sort(),
            lignes: Object.keys(compte[nom].lignes).sort(function (a,b) { return (+a)-(+b); }),
            part: total ? compte[nom].nb / total * 100 : 0
          };
        }).sort(function (a, b) { return b.nb - a.nb || a.cause.localeCompare(b.cause); });

        var liste = toutes.filter(function (c) { return c.nb >= SEUIL; });
        var uniques = toutes.filter(function (c) { return c.nb < SEUIL; });
        var nbUniques = uniques.reduce(function (s, c) { return s + c.nb; }, 0);
        var partListee = liste.reduce(function (s, c) { return s + c.part; }, 0);

        return { liste: liste, total: total, causesUniques: uniques.length,
                 nbUniques: nbUniques, releves: nbReleves, normaux: nbNormaux,
                 partListee: partListee };
      }

      function dessinerCauses() {
        var hote = document.getElementById("causes");
        hote.innerHTML = "";

        var res = comptageCauses();
        if (!res.total) { hote.hidden = true; return; }
        hote.hidden = false;

        var panneau = document.createElement("section");
        panneau.className = "panneau causes";

        var titre = document.createElement("h2");
        titre.textContent = "Causes de pertes";
        panneau.appendChild(titre);

        var sous = document.createElement("p");
        sous.className = "sous";
        sous.textContent = res.total + " cause" + (res.total > 1 ? "s" : "") +
          " sur " + libelleDe(periode) + ", de la plus frequente a la plus rare.";
        panneau.appendChild(sous);

        if (!res.liste.length) {
          var vide = document.createElement("div");
          vide.className = "vide";
          vide.textContent = "Aucune cause ne revient deux fois sur cette periode.";
          panneau.appendChild(vide);
          hote.appendChild(panneau);
          return;
        }

        var avecLignes = (mode === "semaine");
        var cadre = document.createElement("div");
        cadre.className = "cadre";
        var table = document.createElement("table");
        table.className = "tab-causes";
        table.innerHTML = "<thead><tr><th>Cause</th><th>Fois</th><th>Part</th>" +
          (avecLignes ? "<th>Lignes</th>" : "") + "<th>Dates</th></tr></thead>";

        var corps = document.createElement("tbody");
        res.liste.forEach(function (c, i) {
          var tr = document.createElement("tr");

          var td1 = document.createElement("td");
          td1.className = "cause";
          var rang = document.createElement("span");
          rang.className = "rang"; rang.textContent = i + 1;
          var nom = document.createElement("span");
          nom.textContent = c.cause;
          td1.appendChild(rang); td1.appendChild(nom);
          if (c.type === "libre") {
            var marque = document.createElement("span");
            marque.className = "marque";
            marque.textContent = "texte libre";
            marque.title = "Texte ecrit a la main, pas un motif de la liste";
            td1.appendChild(marque);
          }
          tr.appendChild(td1);

          var td2 = document.createElement("td");
          td2.className = "num fois"; td2.textContent = c.nb; tr.appendChild(td2);

          var td3 = document.createElement("td");
          td3.className = "pct";
          var val = document.createElement("span");
          val.className = "pct-val";
          val.textContent = c.part.toFixed(1).replace(".", ",") + " %";
          td3.appendChild(val);
          tr.appendChild(td3);

          if (avecLignes) {
            var tdL = document.createElement("td");
            tdL.className = "dates";
            tdL.textContent = c.lignes.join(", ");
            tr.appendChild(tdL);
          }

          var td4 = document.createElement("td");
          td4.className = "dates";
          td4.textContent = c.dates.map(jourCourt).join(", ");
          tr.appendChild(td4);

          corps.appendChild(tr);
        });

        table.appendChild(corps);
        cadre.appendChild(table);
        panneau.appendChild(cadre);

        var bouts = ["Ce tableau couvre " + res.partListee.toFixed(0) + " % des causes"];
        if (res.causesUniques) {
          bouts.push(res.causesUniques + " cause" + (res.causesUniques > 1 ? "s" : "") +
                     " vue" + (res.causesUniques > 1 ? "s" : "") + " une seule fois, non affichee" +
                     (res.causesUniques > 1 ? "s" : ""));
        }
        var ecartes = (res.releves || 0) + (res.normaux || 0);
        if (ecartes) {
          bouts.push(ecartes + " note" + (ecartes > 1 ? "s" : "") +
                     " d'horaire ou de norme, ecartee" + (ecartes > 1 ? "s" : ""));
        }
        var note = document.createElement("p");
        note.className = "hors-liste";
        note.textContent = bouts.join(" · ") + ".";
        panneau.appendChild(note);

        hote.appendChild(panneau);
      }

      // ── Rendu ─────────────────────────────────────────────────────────────────

      function dessinerTout() {
        var grille = document.getElementById("grille");
        grille.innerHTML = "";
        grille.hidden = false;
        document.getElementById("etat").hidden = true;

        Object.keys(graphes).forEach(function (k) { graphes[k].destroy(); });
        graphes = {};

        dessinerDemarrages(grille);

        Object.keys(donnees.metriques).forEach(function (code) {
          var lignes = parLigne(code);
          var estRetard = false;

          var panneau = document.createElement("section");
          panneau.className = "panneau";

          var titre = document.createElement("h2");
          titre.textContent = donnees.metriques[code];
          panneau.appendChild(titre);

          var sous = document.createElement("p");
          sous.className = "sous";
          var multiples = lignes.some(function (l) { return l.nb > 1; });
          sous.textContent = (multiples ? "Moyenne par ligne — " : "Valeur par ligne — ")
                           + libelleDe(periode);
          if (code === "MR2") {
            sous.textContent += " · cible " + donnees.cible_mise_en_regime + " min";
          }
          panneau.appendChild(sous);

          if (!lignes.length) {
            var vide = document.createElement("div");
            vide.className = "vide";
            vide.textContent = "Aucun changement sur cette periode. Choisissez une autre periode.";
            panneau.appendChild(vide);
            grille.appendChild(panneau);
            return;
          }

          var toile = document.createElement("div");
          toile.className = "toile";
          var canvas = document.createElement("canvas");
          toile.appendChild(canvas);
          panneau.appendChild(toile);

          var aDesTargets = !estRetard && lignes.some(function (l) { return l.objectif != null; });

          var legende = document.createElement("div");
          legende.className = "legende";
          legende.innerHTML = estRetard
            ? '<span><i class="b" style="background:' + SAUMON + '"></i>Retard</span>' +
              '<span><i class="b" style="background:' + VERT + '"></i>Cible tenue</span>'
            : '<span><i class="b"></i>Temps reel</span>' +
              (aDesTargets ? '<span><i class="t"></i>Objectif saisi</span>' : '');
          panneau.appendChild(legende);

          panneau.appendChild(construireTableau(code));
          grille.appendChild(panneau);

          // Pour la mise en regime, la valeur est deja un ecart, le plus souvent
          // negatif. On trace son ampleur vers le haut : une barre qui monte se
          // lit comme un retard qui grandit.
          var reels = lignes.map(function (l) {
            return convertir(estRetard ? Math.max(0, -l.valeur) : l.valeur);
          });
          var objectifs = lignes.map(function (l) {
            return l.objectif != null ? convertir(l.objectif) : null;
          });

          var couleurs = estRetard
            ? lignes.map(function (l) { return l.valeur >= 0 ? VERT : SAUMON; })
            : BLEU;

          var jeux = [{
            type: "bar", label: estRetard ? "Retard" : "Temps reel", data: reels,
            backgroundColor: couleurs,
            borderRadius: 2, maxBarThickness: 56, order: 2
          }];
          if (aDesTargets) {
            jeux.push({
              type: "line", label: "Objectif", data: objectifs,
              borderColor: VERT, backgroundColor: VERT,
              borderWidth: 2.5, pointRadius: 3.5, spanGaps: true, order: 1
            });
          }

          graphes[code] = new Chart(canvas.getContext("2d"), {
            data: {
              labels: lignes.map(function (l) {
                return [l.ligne, l.nb + (l.nb > 1 ? " changements" : " changement")];
              }),
              datasets: jeux
            },
            options: {
              responsive: true, maintainAspectRatio: false, animation: false,
              layout: { padding: { top: 30 } },
              scales: {
                x: {
                  title: { display: true, text: "Lignes de fabrication", color: "#5c6a7a" },
                  grid: { display: false },
                  ticks: { color: "#0d1520", font: { size: 13, weight: "600" } }
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: estRetard ? "Retard sur la cible (" + (unite === "min" ? "min" : "h") + ")"
                                    : (unite === "min" ? "Minutes" : "Heures"),
                    color: "#5c6a7a"
                  },
                  grid: { color: "#e6edf2" }, ticks: { color: "#5c6a7a" }
                }
              },
              plugins: {
                legend: { display: false },
                etiquettes: {
                  lignes: lignes.map(function (l) {
                    return estRetard
                      ? { ligne: l.ligne, valeur: Math.max(0, -l.valeur),
                          objectif: null, nb: l.nb }
                      : l;
                  }),
                  formater: function (v) {
                    return estRetard && v === 0 ? "a l'objectif" : formater(v);
                  }
                },
                tooltip: {
                  callbacks: {
                    title: function (items) { return "Ligne " + lignes[items[0].dataIndex].ligne; },
                    label: function (ctx) {
                      var l = lignes[ctx.dataIndex];
                      if (ctx.dataset.type === "line") return "Objectif : " + formater(l.objectif);
                      if (estRetard) {
                        return l.valeur >= 0
                          ? "Cible tenue (" + formater(l.valeur) + " de marge)"
                          : "Retard de " + formater(-l.valeur);
                      }
                      return (l.nb > 1 ? "Moyenne : " : "Valeur : ") + formater(l.valeur);
                    },
                    afterBody: function (items) {
                      var l = lignes[items[0].dataIndex];
                      if (estRetard) {
                        return "Cible : " + donnees.cible_mise_en_regime + " min · " +
                               l.nb + " changement" + (l.nb > 1 ? "s" : "");
                      }
                      if (l.objectif == null) return "";
                      var e = Math.round(l.valeur - l.objectif);
                      if (e === 0) return "A l'objectif";
                      return e > 0 ? "Plus lent de " + formater(e)
                                   : "Plus rapide de " + formater(-e);
                    }
                  }
                }
              }
            }
          });
        });

        dessinerCauses();
      }

      // ── Demarrage ─────────────────────────────────────────────────────────────

      function erreur(message) {
        var etat = document.getElementById("etat");
        etat.hidden = false; etat.textContent = message;
        document.getElementById("grille").hidden = true;
        document.getElementById("causes").hidden = true;
      }

      fetch("data/stats.json?" + Date.now())
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (json) {
          donnees = json;
          if (!donnees.mesures || !donnees.mesures.length) {
            erreur("Aucune donnee disponible pour le moment."); return;
          }
          var maj = new Date(donnees.derniere_maj);
          document.getElementById("maj").textContent =
            "Mis a jour le " + maj.toLocaleDateString("fr-FR") + " a " +
            maj.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });

          periode = periodeParDefaut(periodesDisponibles());
          dessinerFiltres();
          dessinerTout();
        })
        .catch(function () {
          erreur("Les donnees n'ont pas pu etre chargees. Le calcul quotidien n'a peut-etre pas encore tourne.");
        });
    })();
  }
})();
