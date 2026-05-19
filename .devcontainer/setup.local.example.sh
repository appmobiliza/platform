#!/bin/bash
# ============================================================
# CONFIGURAÇÃO LOCAL DO GIT — por pessoa
# ============================================================
# Como usar:
#   1. Copie este arquivo:
#      cp .devcontainer/setup.local.example.sh .devcontainer/setup.local.sh
#
#   2. Edite com SEU nome e email:
#      git config --global user.name "Seu Nome"
#      git config --global user.email "seu@email.com"
#
#   3. setup.local.sh está no .gitignore → NUNCA vai pro repositório
#
#   4. Pronto! Toda vez que o devcontainer criar/rebuildar,
#      o postCreateCommand roda esse script automaticamente.
# ============================================================

git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
