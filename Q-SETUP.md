# Amazon Q CLI Context Management

This documentation explains the setup for maintaining consistent Amazon Q CLI context across multiple development environments (VS Codespace, WSL 2 Ubuntu, and MacOS).

## Overview

This setup provides:
- Consistent context for Amazon Q CLI across multiple environments
- Automatic Git integration to include branch and commit information
- Easy context updates with Git synchronization
- Automatic prompts to update context after each Q session

## Files

The setup consists of the following files:

1. **`q-context.txt`**: Contains your base context information about the project
2. **`start-q.sh`**: Script to start Q CLI with your context and Git information
3. **`update-q-context.sh`**: Tool to update your context file
4. **`q-setup.sh`**: One-time setup script to configure your shell environment

## Setup Instructions

### Initial Setup (Once per Environment)

1. Clone this repository to your environment
2. Run the setup script:
   ```bash
   ~/Code/doc-tales/q-setup.sh
   ```
3. Restart your shell or source your configuration file:
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

### Using the Q Context System

#### Starting Q with Context
```bash
qc
```
This alias starts Amazon Q with your saved context plus dynamic Git information.

#### Updating Context Manually
```bash
~/Code/doc-tales/update-q-context.sh
```
This provides a menu to:
- Update your context file
- View current context
- Optionally commit and push changes to Git

#### Automatic Context Updates
When you exit a Q chat session (by typing `/quit`), you'll be prompted to update your context for next time.

## How It Works

### Context Sources

Your Q context combines:
1. **Base context** from `q-context.txt`
2. **Environment detection** (MacOS, WSL 2, or VS Codespace)
3. **Git information**:
   - Current branch
   - Working tree status (clean or with changes)
   - Recent commits (last 3)

### Shell Integration

The setup adds these to your shell configuration:
- `qc` alias to start Q with context
- `q_update_context()` function to update context
- `q_wrapper()` function that wraps the standard `q` command and prompts for context updates

## Customization

### Modifying Base Context
Edit the `q-context.txt` file to update your base context information.

### Changing Git Integration
Modify the `start-q.sh` script to change what Git information is included.

### Adjusting Update Behavior
Edit the `q_wrapper()` function in your shell configuration to change when/how updates are prompted.

## Troubleshooting

### Context Not Loading
- Ensure paths in scripts match your environment
- Check file permissions (all scripts should be executable)
- Verify shell configuration was updated correctly

### Git Information Missing
- Ensure you're in a Git repository
- Check Git is installed and configured

### Update Prompt Not Appearing
- Make sure the `q` command is using the wrapper function
- Check your shell configuration file for the wrapper function
