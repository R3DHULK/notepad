// DOM Elements
const editor = document.getElementById('editor');
const fileMenu = document.getElementById('file-menu');
const fileSubmenu = document.getElementById('file-submenu');
const editMenu = document.getElementById('edit-menu');
const editSubmenu = document.getElementById('edit-submenu');
const viewMenu = document.getElementById('view-menu');
const viewSubmenu = document.getElementById('view-submenu');
const fileStatus = document.getElementById('file-status');
const positionStatus = document.getElementById('position-status');
const saveDialogOverlay = document.getElementById('save-dialog-overlay');
const saveFilename = document.getElementById('save-filename');
const saveCancel = document.getElementById('save-cancel');
const saveConfirm = document.getElementById('save-confirm');
const findReplaceDialogOverlay = document.getElementById('find-replace-dialog-overlay');
const findInput = document.getElementById('find-input');
const replaceInput = document.getElementById('replace-input');
const findReplaceCancel = document.getElementById('find-replace-cancel');
const findNext = document.getElementById('find-next');
const replaceBtn = document.getElementById('replace-btn');
const replaceAll = document.getElementById('replace-all');
const findReplaceTitle = document.getElementById('find-replace-title');
const replaceRow = document.getElementById('replace-row');

// Variables
let currentFilename = null;
let isContentModified = false;
let findIndex = -1;

// Init
window.addEventListener('DOMContentLoaded', () => {
    editor.focus();
    updatePositionStatus();
});

// Menu handlers
document.addEventListener('click', (e) => {
    if (e.target !== fileMenu && !fileSubmenu.contains(e.target)) {
        fileSubmenu.classList.remove('active');
    }
    if (e.target !== editMenu && !editSubmenu.contains(e.target)) {
        editSubmenu.classList.remove('active');
    }
    if (e.target !== viewMenu && !viewSubmenu.contains(e.target)) {
        viewSubmenu.classList.remove('active');
    }
});

fileMenu.addEventListener('click', () => {
    toggleSubmenu(fileSubmenu);
    editSubmenu.classList.remove('active');
    viewSubmenu.classList.remove('active');
});

editMenu.addEventListener('click', () => {
    toggleSubmenu(editSubmenu);
    fileSubmenu.classList.remove('active');
    viewSubmenu.classList.remove('active');
});

viewMenu.addEventListener('click', () => {
    toggleSubmenu(viewSubmenu);
    fileSubmenu.classList.remove('active');
    editSubmenu.classList.remove('active');
});

function toggleSubmenu(submenu) {
    submenu.classList.toggle('active');
}

// File Menu Items
document.getElementById('new-file').addEventListener('click', () => {
    confirmDiscardChanges(() => {
        editor.innerHTML = '';
        currentFilename = null;
        fileStatus.textContent = 'Untitled';
        isContentModified = false;
        closeAllMenus();
    });
});

document.getElementById('open-file').addEventListener('click', () => {
    confirmDiscardChanges(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    editor.innerText = e.target.result;
                    currentFilename = file.name;
                    fileStatus.textContent = currentFilename;
                    isContentModified = false;
                };
                reader.readAsText(file);
            }
        };
        input.click();
        closeAllMenus();
    });
});

document.getElementById('save-file').addEventListener('click', () => {
    if (currentFilename) {
        saveFile(currentFilename);
    } else {
        showSaveDialog();
    }
    closeAllMenus();
});

document.getElementById('save-as').addEventListener('click', () => {
    showSaveDialog();
    closeAllMenus();
});

document.getElementById('exit').addEventListener('click', () => {
    confirmDiscardChanges(() => {
        window.close();
    });
    closeAllMenus();
});

// Edit Menu Items
document.getElementById('undo').addEventListener('click', () => {
    document.execCommand('undo');
    closeAllMenus();
});

document.getElementById('redo').addEventListener('click', () => {
    document.execCommand('redo');
    closeAllMenus();
});

document.getElementById('cut').addEventListener('click', () => {
    document.execCommand('cut');
    closeAllMenus();
});

document.getElementById('copy').addEventListener('click', () => {
    document.execCommand('copy');
    closeAllMenus();
});

document.getElementById('paste').addEventListener('click', () => {
    document.execCommand('paste');
    closeAllMenus();
});

document.getElementById('bold').addEventListener('click', () => {
    applyFormatting('bold');
    closeAllMenus();
});

document.getElementById('italic').addEventListener('click', () => {
    applyFormatting('italic');
    closeAllMenus();
});

document.getElementById('underline').addEventListener('click', () => {
    applyFormatting('underline');
    closeAllMenus();
});

document.getElementById('find').addEventListener('click', () => {
    showFindDialog(false);
    closeAllMenus();
});

document.getElementById('replace').addEventListener('click', () => {
    showFindDialog(true);
    closeAllMenus();
});

document.getElementById('select-all').addEventListener('click', () => {
    editor.select();
    closeAllMenus();
});

// View Menu Items
document.getElementById('toggle-fullscreen').addEventListener('click', () => {
    toggleFullscreen();
    closeAllMenus();
});

document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    closeAllMenus();
});

// Save Dialog
function showSaveDialog() {
    saveFilename.value = currentFilename || 'untitled.txt';
    saveDialogOverlay.classList.add('active');
    setTimeout(() => saveFilename.focus(), 100);
}

saveCancel.addEventListener('click', () => {
    saveDialogOverlay.classList.remove('active');
});

saveConfirm.addEventListener('click', () => {
    let filename = saveFilename.value.trim();
    if (!filename.endsWith('.txt')) {
        filename += '.txt';
    }
    saveFile(filename);
    saveDialogOverlay.classList.remove('active');
});

// Find and Replace Dialog
function showFindDialog(withReplace) {
    findReplaceTitle.textContent = withReplace ? 'Find and Replace' : 'Find';
    replaceRow.style.display = withReplace ? 'flex' : 'none';
    replaceBtn.style.display = withReplace ? 'block' : 'none';
    replaceAll.style.display = withReplace ? 'block' : 'none';

    findIndex = -1;
    findReplaceDialogOverlay.classList.add('active');
    setTimeout(() => findInput.focus(), 100);
}

findReplaceCancel.addEventListener('click', () => {
    findReplaceDialogOverlay.classList.remove('active');
});

findNext.addEventListener('click', () => {
    const searchText = findInput.value;
    if (!searchText) return;

    // For contenteditable, we need to use the window.find() method
    // or implement our own search using DOM traversal
    const found = window.find(searchText);

    if (!found) {
        alert('No more matches found.');
    }
});

replaceBtn.addEventListener('click', () => {
    const searchText = findInput.value;
    const replaceText = replaceInput.value;

    // For contenteditable replacement
    if (window.getSelection) {
        const selection = window.getSelection();
        if (selection.toString() === searchText) {
            // We have the text selected, so replace it
            document.execCommand('insertText', false, replaceText);
            isContentModified = true;
        } else {
            // Try to find it first
            if (window.find(searchText)) {
                document.execCommand('insertText', false, replaceText);
                isContentModified = true;
            }
        }
    }
});

replaceAll.addEventListener('click', () => {
    const searchText = findInput.value;
    const replaceText = replaceInput.value;

    if (!searchText) return;

    // For contenteditable, we need a different approach
    const text = editor.innerText;
    if (!text.includes(searchText)) {
        alert(`No occurrences of "${searchText}" found.`);
        return;
    }

    // Save scroll position
    const scrollTop = editor.scrollTop;

    // Replace all occurrences
    let count = 0;
    let currentText = editor.innerHTML;

    // Simple replace for plain text
    // Note: This is a simplified approach and might not work perfectly for complex HTML content
    const regex = new RegExp(escapeRegExp(searchText), 'g');
    const newContent = text.replace(regex, replaceText);

    if (newContent !== text) {
        editor.innerText = newContent;
        count = (text.match(regex) || []).length;
        isContentModified = true;
        alert(`Replaced ${count} occurrence(s) of "${searchText}".`);

        // Restore scroll position
        editor.scrollTop = scrollTop;
    } else {
        alert(`No occurrences of "${searchText}" found.`);
    }
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Save functionality
function saveFile(filename) {
    // For contenteditable, get innerHTML if formatted, or innerText if plain
    const content = editor.innerText || editor.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    currentFilename = filename;
    fileStatus.textContent = filename;
    isContentModified = false;
}

// Fullscreen functionality
function toggleFullscreen() {
    const container = document.querySelector('.container');
    container.classList.toggle('fullscreen');

    if (container.classList.contains('fullscreen')) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Register keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+N: New File
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('new-file').click();
    }
    // Ctrl+O: Open File
    else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        document.getElementById('open-file').click();
    }
    // Ctrl+S: Save File
    else if (e.ctrlKey && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('save-file').click();
    }
    // Ctrl+Shift+S: Save As
    else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        document.getElementById('save-as').click();
    }
    // Ctrl+Z: Undo
    else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        document.getElementById('undo').click();
    }
    // Ctrl+Y: Redo
    else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        document.getElementById('redo').click();
    }
    // Ctrl+B: Bold
    else if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.getElementById('bold').click();
    }
    // Ctrl+I: Italic
    else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.getElementById('italic').click();
    }
    // Ctrl+U: Underline
    else if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        document.getElementById('underline').click();
    }
    // Ctrl+F: Find
    else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('find').click();
    }
    // Ctrl+H: Find and Replace
    else if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        document.getElementById('replace').click();
    }
    // Ctrl+T: Toggle Theme
    else if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('toggle-theme').click();
    }
    // F11: Toggle Fullscreen
    else if (e.key === 'F11') {
        e.preventDefault();
        document.getElementById('toggle-fullscreen').click();
    }
});

// Track cursor position for contenteditable
editor.addEventListener('click', updatePositionStatus);
editor.addEventListener('keyup', updatePositionStatus);

function updatePositionStatus() {
    // Using Selection and Range API for contenteditable elements
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        // Get the text before cursor
        const textBeforeCursor = preCaretRange.toString();
        const lines = textBeforeCursor.split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;

        positionStatus.textContent = `Line: ${lineNumber}, Column: ${columnNumber}`;
    }
}

// Track content changes for contenteditable
editor.addEventListener('input', () => {
    isContentModified = true;
    // Add an asterisk to filename if modified
    if (!fileStatus.textContent.startsWith('*')) {
        fileStatus.textContent = '*' + fileStatus.textContent;
    }
});

// Confirm before discarding changes
function confirmDiscardChanges(callback) {
    if (isContentModified) {
        if (confirm('You have unsaved changes. Do you want to continue and discard them?')) {
            callback();
        }
    } else {
        callback();
    }
}

// Text formatting function
function applyFormatting(command) {
    document.execCommand(command, false, null);
    editor.focus();
}

// Helper function to close all menus
function closeAllMenus() {
    fileSubmenu.classList.remove('active');
    editSubmenu.classList.remove('active');
    viewSubmenu.classList.remove('active');
}

// Close dialogs on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        saveDialogOverlay.classList.remove('active');
        findReplaceDialogOverlay.classList.remove('active');
    }
});

// Prevent closing the browser tab without saving
window.addEventListener('beforeunload', (e) => {
    if (isContentModified) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});
