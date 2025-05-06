// Global variables
let currentFilename = "Untitled.txt";
let isFileSaved = true;
let lastSavedContent = "";
let wordWrapEnabled = false;
let searchIndex = -1;
let searchMatches = [];
let isReplaceMode = false;

// DOM Elements
const editor = document.getElementById('editor');
const currentFileElement = document.getElementById('current-file');
const statusElement = document.getElementById('status');
const cursorPositionElement = document.getElementById('cursor-position');
const saveModal = document.getElementById('save-modal');
const openModal = document.getElementById('open-modal');
const filenameInput = document.getElementById('filename-input');
const searchDialog = document.getElementById('search-dialog');
const findText = document.getElementById('find-text');
const replaceText = document.getElementById('replace-text');
const replaceRow = document.getElementById('replace-row');
const replaceBtn = document.getElementById('replace-btn');
const replaceAllBtn = document.getElementById('replace-all');

// Menu functionality
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        this.classList.toggle('active');
        // Close other menus
        document.querySelectorAll('.menu-item').forEach(otherItem => {
            if (otherItem !== this) {
                otherItem.classList.remove('active');
            }
        });
    });
});

// Close menus when clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.menu-item')) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Track changes and update status
editor.addEventListener('input', function () {
    if (editor.value !== lastSavedContent) {
        isFileSaved = false;
        currentFileElement.textContent = `${currentFilename} *`;
        statusElement.textContent = 'Modified';
    } else {
        isFileSaved = true;
        currentFileElement.textContent = currentFilename;
        statusElement.textContent = 'Ready';
    }
});

// Track cursor position
editor.addEventListener('click', updateCursorPosition);
editor.addEventListener('keyup', updateCursorPosition);

function updateCursorPosition() {
    const text = editor.value.substring(0, editor.selectionStart);
    const lines = text.split('\n');
    const lineCount = lines.length;
    const charCount = lines[lines.length - 1].length + 1;
    cursorPositionElement.textContent = `Ln ${lineCount}, Col ${charCount}`;
}

// File Menu Functions
document.getElementById('new-file').addEventListener('click', function () {
    checkSaveBeforeAction(() => {
        editor.value = '';
        currentFilename = 'Untitled.txt';
        currentFileElement.textContent = currentFilename;
        lastSavedContent = '';
        isFileSaved = true;
        statusElement.textContent = 'Ready';
    });
});

document.getElementById('open-file').addEventListener('click', function () {
    checkSaveBeforeAction(() => {
        document.getElementById('file-input').value = '';
        openModal.style.display = 'flex';
    });
});

document.getElementById('save-file').addEventListener('click', function () {
    if (currentFilename === 'Untitled.txt') {
        saveModal.style.display = 'flex';
        filenameInput.value = currentFilename;
    } else {
        saveFile(currentFilename);
    }
});

document.getElementById('save-as').addEventListener('click', function () {
    saveModal.style.display = 'flex';
    filenameInput.value = currentFilename;
});

document.getElementById('exit').addEventListener('click', function () {
    checkSaveBeforeAction(() => {
        window.close();
        // If window.close() doesn't work (which is likely in a web app)
        alert("The application cannot close the browser tab. You can manually close it.");
    });
});

// Edit Menu Functions
document.getElementById('cut').addEventListener('click', function () {
    document.execCommand('cut');
});

document.getElementById('copy').addEventListener('click', function () {
    document.execCommand('copy');
});

document.getElementById('paste').addEventListener('click', function () {
    document.execCommand('paste');
});

document.getElementById('find').addEventListener('click', function () {
    isReplaceMode = false;
    searchDialog.style.display = 'block';
    replaceRow.style.display = 'none';
    replaceBtn.classList.add('hidden');
    replaceAllBtn.classList.add('hidden');
    findText.focus();
});

document.getElementById('replace').addEventListener('click', function () {
    isReplaceMode = true;
    searchDialog.style.display = 'block';
    replaceRow.style.display = 'flex';
    replaceBtn.classList.remove('hidden');
    replaceAllBtn.classList.remove('hidden');
    findText.focus();
});

document.getElementById('select-all').addEventListener('click', function () {
    editor.select();
});

// View Menu Functions
document.getElementById('fullscreen').addEventListener('click', function () {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
});

document.getElementById('word-wrap').addEventListener('click', function () {
    wordWrapEnabled = !wordWrapEnabled;
    editor.style.whiteSpace = wordWrapEnabled ? 'pre-wrap' : 'pre';
});

// Save Modal Functions
document.getElementById('save-cancel').addEventListener('click', function () {
    saveModal.style.display = 'none';
});

document.getElementById('save-confirm').addEventListener('click', function () {
    let filename = filenameInput.value.trim();
    if (!filename) {
        alert('Please enter a filename.');
        return;
    }

    // Add .txt extension if not present
    if (!filename.toLowerCase().endsWith('.txt')) {
        filename += '.txt';
    }

    saveFile(filename);
    saveModal.style.display = 'none';
});

// Open Modal Functions
document.getElementById('open-cancel').addEventListener('click', function () {
    openModal.style.display = 'none';
});

document.getElementById('open-confirm').addEventListener('click', function () {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        editor.value = e.target.result;
        currentFilename = file.name;
        currentFileElement.textContent = currentFilename;
        lastSavedContent = editor.value;
        isFileSaved = true;
        statusElement.textContent = 'Ready';
    };

    reader.readAsText(file);
    openModal.style.display = 'none';
});

// Search Functions
document.getElementById('find-next').addEventListener('click', findNext);
document.getElementById('replace-btn').addEventListener('click', replaceCurrent);
document.getElementById('replace-all').addEventListener('click', replaceAll);
document.getElementById('close-search').addEventListener('click', function () {
    searchDialog.style.display = 'none';
    searchIndex = -1;
    searchMatches = [];
});

function findNext() {
    const searchTerm = findText.value;
    if (!searchTerm) return;

    // If we're starting a new search
    if (searchIndex === -1 || editor.value !== lastSearchText) {
        searchMatches = [];
        lastSearchText = editor.value;
        let startIndex = 0;
        while (true) {
            const index = editor.value.indexOf(searchTerm, startIndex);
            if (index === -1) break;
            searchMatches.push(index);
            startIndex = index + 1;
        }
        searchIndex = 0;
    } else {
        searchIndex = (searchIndex + 1) % searchMatches.length;
    }

    if (searchMatches.length > 0) {
        const matchIndex = searchMatches[searchIndex];
        editor.focus();
        editor.setSelectionRange(matchIndex, matchIndex + searchTerm.length);
        statusElement.textContent = `Found match ${searchIndex + 1} of ${searchMatches.length}`;
    } else {
        statusElement.textContent = 'No matches found';
    }
}

function replaceCurrent() {
    if (searchMatches.length === 0 || searchIndex === -1) {
        findNext();
        return;
    }

    const searchTerm = findText.value;
    const replaceValue = replaceText.value;
    const matchIndex = searchMatches[searchIndex];

    // Update the text
    editor.value =
        editor.value.substring(0, matchIndex) +
        replaceValue +
        editor.value.substring(matchIndex + searchTerm.length);

    // Reset search as content has changed
    lastSearchText = editor.value;
    const oldMatchIndex = searchIndex;
    searchMatches = [];
    searchIndex = -1;

    // Find matches again
    let startIndex = 0;
    while (true) {
        const index = editor.value.indexOf(searchTerm, startIndex);
        if (index === -1) break;
        searchMatches.push(index);
        startIndex = index + 1;
    }

    // Try to keep the same position in results
    if (searchMatches.length > 0) {
        searchIndex = Math.min(oldMatchIndex, searchMatches.length - 1);
        const newMatchIndex = searchMatches[searchIndex];
        editor.focus();
        editor.setSelectionRange(newMatchIndex, newMatchIndex + searchTerm.length);
        statusElement.textContent = `Replaced and found match ${searchIndex + 1} of ${searchMatches.length}`;
    } else {
        statusElement.textContent = 'Replaced, no more matches';
    }

    // Mark file as modified
    if (editor.value !== lastSavedContent) {
        isFileSaved = false;
        currentFileElement.textContent = `${currentFilename} *`;
    }
}

function replaceAll() {
    const searchTerm = findText.value;
    if (!searchTerm) return;

    const replaceValue = replaceText.value;
    const originalContent = editor.value;

    // Replace all occurrences
    editor.value = editor.value.split(searchTerm).join(replaceValue);

    // Count replacements
    const replacements = (originalContent.match(new RegExp(escapeRegExp(searchTerm), 'g')) || []).length;

    // Reset search
    searchMatches = [];
    searchIndex = -1;

    statusElement.textContent = `Replaced ${replacements} occurrences`;

    // Mark file as modified
    if (editor.value !== lastSavedContent) {
        isFileSaved = false;
        currentFileElement.textContent = `${currentFilename} *`;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Save File Function
function saveFile(filename) {
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    currentFilename = filename;
    currentFileElement.textContent = filename;
    lastSavedContent = content;
    isFileSaved = true;
    statusElement.textContent = 'Saved';
}

// Check if save is needed before performing an action
function checkSaveBeforeAction(action) {
    if (!isFileSaved) {
        if (confirm(`Do you want to save changes to ${currentFilename}?`)) {
            // If "Untitled", show save dialog
            if (currentFilename === 'Untitled.txt') {
                saveModal.style.display = 'flex';
                filenameInput.value = currentFilename;

                // Store action to be called after save
                const originalSaveConfirmAction = document.getElementById('save-confirm').onclick;
                document.getElementById('save-confirm').onclick = function () {
                    const filename = filenameInput.value.trim();
                    if (!filename) {
                        alert('Please enter a filename.');
                        return;
                    }

                    // Add .txt extension if not present
                    const finalFilename = filename.toLowerCase().endsWith('.txt') ? filename : filename + '.txt';
                    saveFile(finalFilename);
                    saveModal.style.display = 'none';

                    // Reset the onclick handler
                    document.getElementById('save-confirm').onclick = originalSaveConfirmAction;

                    // Perform the original action
                    action();
                };
            } else {
                saveFile(currentFilename);
                action();
            }
        } else {
            action();
        }
    } else {
        action();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    updateCursorPosition();
    editor.focus();
});

// Close dropdown menus when clicking on menu items
document.querySelectorAll('.dropdown-content button').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
    });
});