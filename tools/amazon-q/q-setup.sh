#!/bin/bash

# This script sets up the Q CLI environment with aliases and functions

# Add these lines to your shell configuration
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_CONFIG="$HOME/.bashrc"
else
  echo "Could not find shell configuration file (.zshrc or .bashrc)"
  exit 1
fi

echo "Adding Q CLI aliases and functions to $SHELL_CONFIG"

cat << 'EOF' >> "$SHELL_CONFIG"

# Amazon Q CLI with project context
alias qc="$HOME/Code/doc-tales/start-q.sh"

# Update Q context before session ends
q_update_context() {
  $HOME/Code/doc-tales/update-q-context.sh
}

# Function to automatically prompt for context update when exiting Q
q_wrapper() {
  # Start Q with arguments
  q "$@"
  
  # After Q exits, ask if user wants to update context
  if [[ "$1" == "chat" ]]; then
    read -p "Would you like to update your Q context for next time? (y/n): " update_choice
    if [[ $update_choice == "y" || $update_choice == "Y" ]]; then
      q_update_context
    fi
  fi
}

# Replace standard q command with our wrapper
alias q="q_wrapper"

EOF

echo "Setup complete! Please restart your shell or run:"
echo "source $SHELL_CONFIG"
