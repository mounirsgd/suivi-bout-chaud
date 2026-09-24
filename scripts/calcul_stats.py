#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Calcul des statistiques Bout Chaud a partir de Firebase.

Lecture seule sur /sessions. Aucune ecriture dans Firebase.

Differences avec le Bout Froid :
  - les objectifs ne sont PAS calcules : ils sont saisis chaque jour dans
    l'application, sous ganttData.targets
  - tous les creneaux sont lus (1 a 4), pas seulement le premier
  - aucun seuil de duree : toutes les valeurs comptent

Sortie : data/stats.json
"""

import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, date

import firebase_admin
from firebase_admin import credentials, db

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

DATABASE_URL = "https://gantt-sgd-default-rtdb.europe-west1.firebasedatabase.app"

SORTIE = os.path.join("data", "stats.json")

# Objectif fixe de la mise en regime 2 sections, en minutes
CIBLE_MISE_EN_REGIME = 15

# Taches Bout Chaud (cf. TASKS_RONDELLE dans app.js)
TACHES = [
    ("ron_1",  "Nettoyage de machine"),
    ("ron_2",  "Changement rondelle (cuvette)"),
    ("ron_3",  "Cote Finisseur"),
    ("ron_4",  "Cote Ebaucheur"),
    ("ron_5",  "Entonnoir sous verre"),
    ("ron_6",  "Distributeur sous verre"),
    ("ron_7",  "Demarrage section sans flacon"),
    ("ron_8",  "Debut section avec flacon"),
    ("ron_9",  "Machine complete avec flacon"),
    ("ron_10", "Mise a l arche"),
    ("ron_11", "Changement Traitement Surface"),
    ("ron_12", "Nettoyage SO3"),
]

# Objectifs saisis (cf. ganttData.targets dans app.js)
TARGETS = [
    ("grand_t1",            "TARGET (Grand T1)"),
    ("nettoyage",           "TARGET (Nettoyage)"),
    ("petit_t1",            "TARGET (Petit t1)"),
    ("rondelle",            "TARGET (Rondelle)"),
    ("anticipation_feeder", "TARGET (Anticipation Feeder)"),
    ("passage_so3",         "TARGET (Passage en SO3)"),
]

# Indicateurs affiches sur le tableau de bord
METRIQUES = {
    "NET": "Nettoyage machine",
    "PT1": "Petit t1",
    "RON": "Changement rondelle",
    "MR2": "Mise en regime 2 sections",
}

# Sous-objectifs de la decomposition du Grand T1
DECOMPOSITION = [
    ("nettoyage",           "Nettoyage"),
    ("petit_t1",            "Petit t1"),
    ("rondelle",            "Rondelle"),
    ("anticipation_feeder", "Anticipation Feeder"),
    ("passage_so3",         "Passage en SO3"),
]

# Motifs proposes par l'application (CAUSES_BOUT_CHAUD dans app.js)
MOTIFS_CONNUS = {
    "Nettoyage non réalisé", "Manque de personnel", "Machine très sale",
    "Poids non conforme", "Paraison non conforme", "T°FMS non conforme",
    "Cuvette non conforme", "Formation",
    "Moulerie non conforme", "Equipement variable non conforme",
    "Reprise réglages", "Problème mécanique", "Préparation incomplète",
    "Problème Communication",
    "Problème électrique", "Problème Lubrification",
    "Réglages section non conforme", "Reprise réglages par atelier IS",
    "Equipement non conforme", "Problème Ventilation Machine",
    "Retard réglage section",
    "Retard réglage SO3", "Retard réglage Clear & Safe",
    "Retard réglage enfournement",
    "Retard changement équipement TDS", "Retard réglages",
    "Réglages non conforme",
    "Nettoyage long",
}
MOTIFS_NORMALISES = {m.lower() for m in MOTIFS_CONNUS}

FORMULES_RAS = {"ras", "r.a.s", "rien a signaler", "rien à signaler",
                "neant", "néant", "aucun", "aucune"}

# Reperage des simples releves d'horaires et de numeros
_HEURE = re.compile(r"\d{1,2}\s*[h:]\s*\d{2}")
_LOT = re.compile(r"\blots?\b\s*\d|\bM\d{2,}\b")
_MOTS_POINTAGE = {
    "a", "à", "de", "des", "du", "le", "la", "les", "et", "en", "au", "aux",
    "sur", "top", "lot", "lots", "premier", "premiers", "deux", "section",
    "sections", "toutes", "tous", "arche", "mise", "debut", "début", "fin",
    "machine", "h", "min", "demarrage", "démarrage", "flacon", "flacons",
    "cote", "côte", "finisseur", "ebaucheur", "ébaucheur", "nettoyage",
}


# ─────────────────────────────────────────────────────────────────────────────
# OUTILS
# ─────────────────────────────────────────────────────────────────────────────

def normaliser_ligne(machine):
    """
    Numero de ligne normalise depuis le champ texte libre "machine".
    "Machine 32A" -> "232", "24" -> "224", "Machine 236" -> "236".
    """
    if not machine:
        return None
    trouve = re.search(r"\d+", str(machine))
    if not trouve:
        return None
    chiffres = trouve.group()
    if len(chiffres) == 2:
        return "2" + chiffres
    if len(chiffres) == 3:
        return chiffres
    return None


def heure_vers_minutes(h, m):
    """Minutes depuis minuit, ou None si le champ est vide."""
    if h is None or m is None:
        return None
    h, m = str(h).strip(), str(m).strip()
    if h == "" or m == "":
        return None
    try:
        return int(h) * 60 + int(m)
    except ValueError:
        return None


def lire_creneaux(obj):
    """
    Tous les creneaux renseignes d'une tache ou d'un objectif, sous forme
    de couples (debut, fin) en minutes. Contrairement au Bout Froid, les
    creneaux 2 a 4 sont pris en compte : une tache interrompue puis reprise
    est frequente au Bout Chaud.

    Le passage minuit est corrige creneau par creneau : une fin anterieure
    au debut est reportee au lendemain.
    """
    if not isinstance(obj, dict):
        return []

    suffixes = ["", "2", "3", "4"]
    creneaux = []
    for s in suffixes:
        debut = heure_vers_minutes(obj.get("sh" + s), obj.get("sm" + s))
        fin = heure_vers_minutes(obj.get("eh" + s), obj.get("em" + s))
        if debut is None or fin is None:
            continue
        if fin < debut:
            fin += 1440
        creneaux.append((debut, fin))
    return creneaux


def enveloppe(*objets):
    """
    Duree en minutes du premier debut jusqu'a la derniere fin, tous
    creneaux et tous objets confondus.

    Cote Finisseur de 7h30 a 8h00 et Cote Ebaucheur de 7h45 a 9h00
    donnent 90 minutes : de 7h30 a 9h00, chevauchement compris.
    Deux objets aux memes horaires donnent la duree d'un seul.

    Retourne None si aucun creneau n'est renseigne.
    """
    creneaux = []
    for o in objets:
        creneaux.extend(lire_creneaux(o))
    if not creneaux:
        return None
    duree = max(f for _, f in creneaux) - min(d for d, _ in creneaux)
    return duree if duree > 0 else None


def commentaires(obj):
    """Commentaires non vides de tous les creneaux d'une tache ou target."""
    if not isinstance(obj, dict):
        return []
    textes = []
    for s in ["", "2", "3", "4"]:
        c = (obj.get("comment" + s) or "").strip()
        if c:
            textes.append(c)
    return textes


def decouper_causes(texte):
    """Un commentaire peut contenir plusieurs causes separees par ' | '."""
    if not texte:
        return []
    return [p.strip() for p in texte.split("|") if p.strip()]


def classer_cause(texte):
    """
    Nature d'un morceau de commentaire :
      "motif"  : coche dans la liste de l'application
      "ras"    : rien a signaler
      "releve" : simple releve d'horaire, pas une cause
      "libre"  : cause reelle, ecrite a la main
    """
    s = (texte or "").strip()
    if not s:
        return "releve"

    if s.lower() in MOTIFS_NORMALISES:
        return "motif"
    if s.lower().strip(".") in FORMULES_RAS:
        return "ras"

    if _HEURE.search(s) or _LOT.search(s):
        reste = _HEURE.sub(" ", s)
        reste = re.sub(r"[0-9()/\-=,.:;+]", " ", reste)
        mots = [m for m in re.split(r"\s+", reste.lower()) if m]
        utiles = [m for m in mots if m not in _MOTS_POINTAGE and len(m) > 2]
        if not utiles:
            return "releve"

    return "libre"


# ─────────────────────────────────────────────────────────────────────────────
# EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

def connecter_firebase():
    cle_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    if not cle_json:
        sys.exit("Erreur : le secret FIREBASE_SERVICE_ACCOUNT est absent.")
    try:
        infos = json.loads(cle_json)
    except json.JSONDecodeError:
        sys.exit("Erreur : FIREBASE_SERVICE_ACCOUNT n'est pas un JSON valide.")
    cred = credentials.Certificate(infos)
    firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})


def charger_sessions():
    """Lecture seule de toutes les sessions."""
    return db.reference("sessions").get() or {}


def extraire_mesures(sessions):
    """
    Une entree par indicateur, jour et ligne :
        {"date", "ligne", "metrique", "duree_min", "objectif_min", "details"}

    L'objectif vient des targets saisies dans l'application, sauf pour la
    mise en regime dont la cible est fixe.
    """
    mesures = []

    for _, session in sessions.items():
        if not isinstance(session, dict):
            continue

        jour = session.get("date")
        ligne = normaliser_ligne(session.get("machine"))
        if not jour or not ligne:
            continue

        gantt = session.get("ganttData") or {}
        taches = gantt.get("tasks") or {}
        cibles = gantt.get("targets") or {}

        def detail(cle_tache, libelle):
            textes = commentaires(taches.get(cle_tache))
            return [{"tache": libelle, "texte": t} for t in textes]

        # ── Nettoyage de machine ────────────────────────────────────────────
        reel = enveloppe(taches.get("ron_1"))
        cible = enveloppe(cibles.get("nettoyage"))
        if reel is not None:
            mesures.append({
                "date": jour, "ligne": ligne, "metrique": "NET",
                "duree_min": reel, "objectif_min": cible,
                "details": detail("ron_1", "Nettoyage de machine"),
            })

        # ── Petit t1 : enveloppe Cote Finisseur + Cote Ebaucheur ────────────
        reel = enveloppe(taches.get("ron_3"), taches.get("ron_4"))
        cible = enveloppe(cibles.get("petit_t1"))
        if reel is not None:
            mesures.append({
                "date": jour, "ligne": ligne, "metrique": "PT1",
                "duree_min": reel, "objectif_min": cible,
                "details": detail("ron_3", "Cote Finisseur")
                         + detail("ron_4", "Cote Ebaucheur"),
            })

        # ── Changement rondelle ─────────────────────────────────────────────
        reel = enveloppe(taches.get("ron_2"))
        cible = enveloppe(cibles.get("rondelle"))
        if reel is not None:
            mesures.append({
                "date": jour, "ligne": ligne, "metrique": "RON",
                "duree_min": reel, "objectif_min": cible,
                "details": detail("ron_2", "Changement rondelle (cuvette)"),
            })

        # ── Mise en regime 2 sections ───────────────────────────────────────
        # 15 min moins (enveloppe des deux cotes diminuee de la mise a l'arche)
        # Le resultat est le plus souvent negatif : c'est un retard.
        cotes = enveloppe(taches.get("ron_3"), taches.get("ron_4"))
        arche = enveloppe(taches.get("ron_10"))
        if cotes is not None:
            ecart = CIBLE_MISE_EN_REGIME - (cotes - (arche or 0))
            mesures.append({
                "date": jour, "ligne": ligne, "metrique": "MR2",
                "duree_min": ecart, "objectif_min": CIBLE_MISE_EN_REGIME,
                "details": detail("ron_10", "Mise a l arche"),
            })

    mesures.sort(key=lambda m: (m["date"], m["ligne"], m["metrique"]))
    return mesures


def extraire_decomposition(sessions):
    """
    Une entree par jour et par ligne, avec la duree du Grand T1 et celle
    de chaque sous-objectif. Sert a voir quelle etape pese le plus lourd
    dans le Grand T1.
    """
    lignes = []

    for _, session in sessions.items():
        if not isinstance(session, dict):
            continue

        jour = session.get("date")
        ligne = normaliser_ligne(session.get("machine"))
        if not jour or not ligne:
            continue

        cibles = (session.get("ganttData") or {}).get("targets") or {}
        total = enveloppe(cibles.get("grand_t1"))
        if total is None:
            continue

        parts = {}
        for cle, libelle in DECOMPOSITION:
            d = enveloppe(cibles.get(cle))
            if d is not None:
                parts[cle] = d

        lignes.append({
            "date": jour, "ligne": ligne,
            "grand_t1": total,
            "parts": parts,
        })

    lignes.sort(key=lambda x: (x["date"], x["ligne"]))
    return lignes


def extraire_causes(sessions):
    """
    Une entree par cause citee. Une meme cause n'est comptee qu'une fois
    par jour et par ligne, meme si elle revient sur plusieurs taches.
    Les commentaires des objectifs sont inclus.
    """
    causes = []
    vues = set()

    for _, session in sessions.items():
        if not isinstance(session, dict):
            continue

        jour = session.get("date")
        ligne = normaliser_ligne(session.get("machine"))
        if not jour or not ligne:
            continue

        gantt = session.get("ganttData") or {}
        taches = gantt.get("tasks") or {}
        cibles = gantt.get("targets") or {}

        sources = [(taches.get(c), lib) for c, lib in TACHES]
        sources += [(cibles.get(c), lib) for c, lib in TARGETS]

        for obj, libelle in sources:
            for texte in commentaires(obj):
                for cause in decouper_causes(texte):
                    cle = (jour, ligne, cause.lower())
                    if cle in vues:
                        continue
                    vues.add(cle)
                    causes.append({
                        "date": jour, "ligne": ligne, "tache": libelle,
                        "cause": cause, "type": classer_cause(cause),
                    })

    causes.sort(key=lambda c: (c["date"], c["ligne"]))
    return causes


# ─────────────────────────────────────────────────────────────────────────────
# PROGRAMME PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

def main():
    connecter_firebase()
    sessions = charger_sessions()
    print("Sessions lues : %d" % len(sessions))

    mesures = extraire_mesures(sessions)
    print("Mesures extraites : %d" % len(mesures))
    for code in METRIQUES:
        n = sum(1 for m in mesures if m["metrique"] == code)
        avec = sum(1 for m in mesures
                   if m["metrique"] == code and m["objectif_min"] is not None)
        print("  %s : %d mesure(s), %d avec objectif" % (code, n, avec))

    decomposition = extraire_decomposition(sessions)
    print("Decomposition Grand T1 : %d jour(s)/ligne(s)" % len(decomposition))

    causes = extraire_causes(sessions)
    repartition = Counter(c["type"] for c in causes)
    retenues = [c for c in causes if c["type"] != "releve"]
    print("Causes citees : %d" % len(causes))
    print("  motifs coches   : %d" % repartition["motif"])
    print("  causes libres   : %d" % repartition["libre"])
    print("  RAS             : %d" % repartition["ras"])
    print("  releves ecartes : %d" % repartition["releve"])
    print("  -> tableau sur %d causes, %d distinctes"
          % (len(retenues), len({c["cause"] for c in retenues})))

    sortie = {
        "derniere_maj": datetime.now().isoformat(timespec="seconds"),
        "metriques": METRIQUES,
        "decomposition_libelles": dict(DECOMPOSITION),
        "cible_mise_en_regime": CIBLE_MISE_EN_REGIME,
        "lignes": sorted({m["ligne"] for m in mesures}),
        "mesures": mesures,
        "decomposition": decomposition,
        "causes": causes,
    }

    os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(sortie, f, ensure_ascii=False, indent=1)

    print("Ecrit : %s" % SORTIE)


if __name__ == "__main__":
    main()
