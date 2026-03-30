#!/bin/bash
# -e: arrête en cas d'erreur / -x: affiche les commandes exécutées
set -e 

# On se place dans le dossier du script
cd "$(dirname "$0")"

echo "--- Démarrage de la procédure TTS ---"

# 1. NETTOYAGE : On libère le port 8089 avant tout
echo "Nettoyage du port 8089..."
fuser -k 8089/tcp || true

# 2. Gestion des fichiers de configuration requis par Moshi
[ -f pyproject.toml ] || wget https://raw.githubusercontent.com/kyutai-labs/moshi/9837ca328d58deef5d7a4fe95a0fb49c902ec0ae/rust/moshi-server/pyproject.toml
[ -f uv.lock ] || wget https://raw.githubusercontent.com/kyutai-labs/moshi/9837ca328d58deef5d7a4fe95a0fb49c902ec0ae/rust/moshi-server/uv.lock

# 3. Environnement Virtuel (Correction de l'erreur 'A virtual environment already exists')
if [ ! -d ".venv" ]; then
    echo "Création du venv..."
    uv venv
fi
source .venv/bin/activate

# 4. Variables d'environnement
export LD_LIBRARY_PATH=$(python -c 'import sysconfig; print(sysconfig.get_config_var("LIBDIR"))')
export CXXFLAGS="-include cstdint"

# 5. Installation de moshi-server (si pas déjà présent)
if ! command -v moshi-server &> /dev/null; then
    echo "Installation de moshi-server..."
    cargo install --features cuda moshi-server@0.6.4
fi

# On remonte d'un cran si nécessaire pour trouver les configs
cd ..

# 6. LANCEMENT avec UV
echo "Lancement du worker TTS sur le port 8089..."
# Utilisation de exec pour que le processus moshi récupère le PID du script
exec uv run --locked --project ./dockerless moshi-server worker --config services/moshi-server/configs/tts.toml  --port 8089
