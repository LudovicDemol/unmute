#!/bin/bash
set -euo pipefail
exec > >(tee -a /workspace/boot.log) 2>&1

echo "=== BOOT START $(date) ==="
env >> /etc/environment

apt-get update -qq
apt-get install -y -qq git git-lfs ffmpeg psmisc netcat-openbsd curl

if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
fi
source "$HOME/.cargo/env"
grep -q 'cargo/env' /root/.bashrc || echo 'source "$HOME/.cargo/env"' >> /root/.bashrc

if [ ! -d /workspace/unmute ]; then
  git clone https://${GITHUB_TOKEN}@github.com/LudovicDemol/unmute.git /workspace/unmute
else
  cd /workspace/unmute
  git pull
fi

cd /workspace/unmute
git lfs install
git lfs pull

pip install -q uv
uv sync

cd dockerless
[ -f pyproject.toml ] || wget -q https://raw.githubusercontent.com/kyutai-labs/moshi/9837ca328d58deef5d7a4fe95a0fb49c902ec0ae/rust/moshi-server/pyproject.toml
[ -f uv.lock ] || wget -q https://raw.githubusercontent.com/kyutai-labs/moshi/9837ca328d58deef5d7a4fe95a0fb49c902ec0ae/rust/moshi-server/uv.lock
[ -d .venv ] || uv venv
source .venv/bin/activate
export CXXFLAGS="-include cstdint"

if ! command -v moshi-server >/dev/null 2>&1; then
  echo "Compiling moshi-server..."
  cargo install --features cuda moshi-server@0.6.4
fi

cd /workspace/unmute

export HF_HOME=/workspace/.hf_home
export HUGGING_FACE_HUB_TOKEN="${HF_TOKEN}"
export KYUTAI_LLM_URL="${KYUTAI_LLM_URL}"
export KYUTAI_LLM_MODEL="${LLM_MODEL}"
export KYUTAI_LLM_API_KEY="${LLM_API_KEY}"

pkill -f moshi-server || true
pkill -f uvicorn || true

nohup ./dockerless/start_tts.sh > /tmp/tts.log 2>&1 &
nohup ./dockerless/start_stt.sh > /tmp/stt.log 2>&1 &

echo "Waiting for TTS on 8089..."
until nc -z localhost 8089; do sleep 5; done

echo "Waiting for STT on 8090..."
until nc -z localhost 8090; do sleep 5; done

nohup ./dockerless/start_backend.sh > /tmp/backend.log 2>&1 &

echo "Waiting for backend on 8000..."
until nc -z localhost 8000; do sleep 5; done

echo "=== BOOT DONE $(date) ==="