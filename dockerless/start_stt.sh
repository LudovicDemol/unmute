#!/bin/bash
set -e # On enlève le -x pour plus de clarté, mais on garde le -e

cd "$(dirname "$0")/.."

# 1. Préparation de l'environnement Python
[ -d .venv ] || uv venv
source .venv/bin/activate
export LD_LIBRARY_PATH=$(python -c 'import sysconfig; print(sysconfig.get_config_var("LIBDIR"))')
export CXXFLAGS="-include cstdint"

# 2. NETTOYAGE : On libère le port 8090 s'il est occupé
echo "Nettoyage du port 8090..."
fuser -k 8090/tcp || echo "Port déjà libre."

# 3. INSTALLATION (Seulement si binaire absent)
if ! command -v moshi-server &> /dev/null; then
    echo "Installation de moshi-server..."
    cargo install --features cuda moshi-server@0.6.4
fi
moshi-server worker --config services/moshi-server/configs/stt.toml --port 8090
