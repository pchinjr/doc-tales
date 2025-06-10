#!/bin/bash

# Path to your context file
CONTEXT_FILE="$HOME/Code/doc-tales/q-context.txt"
PROJECT_DIR="$HOME/Code/doc-tales"

# Function to update context
update_context() {
  echo "Updating Q context file..."
  
  # Open the context file in the default editor
  ${EDITOR:-nano} "$CONTEXT_FILE"
  
  echo "Context updated successfully!"
  
  # Optionally commit the changes
  read -p "Commit this context update to Git? (y/n): " commit_choice
  if [[ $commit_choice == "y" || $commit_choice == "Y" ]]; then
    cd "$PROJECT_DIR"
    git add "$CONTEXT_FILE"
    git commit -m "Update Q context file"
    echo "Changes committed to Git."
    
    read -p "Push changes to remote repository? (y/n): " push_choice
    if [[ $push_choice == "y" || $push_choice == "Y" ]]; then
      git push
      echo "Changes pushed to remote repository."
    fi
  fi
}

# Function to show current context
show_context() {
  echo "Current Q context:"
  echo "==================="
  cat "$CONTEXT_FILE"
  echo "==================="
}

# Main menu
echo "Q Context Manager"
echo "1. Update context"
echo "2. Show current context"
echo "3. Exit"
read -p "Choose an option (1-3): " choice

case $choice in
  1) update_context ;;
  2) show_context ;;
  3) echo "Exiting." ;;
  *) echo "Invalid option." ;;
esac
