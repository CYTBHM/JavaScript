// Toolbar.js
export default class Toolbar {
    constructor(editorElement, onSettingsOpen) {
        this.editor = editorElement; // #paper 元素
        this.onSettingsOpen = onSettingsOpen; // 回调函数
        
        // UI 状态
        this.isEmojiPanelOpen = false;
        this.emojis = ['😊', '😄', '😂', '😍', '🤔', '😢', '😠', '👍', '👎', '❤️', '👋', '🙏', '🐶', '🐱', '🍕', '🎉', '🚀', '💡', '💰', '✅', '❌', '❓', '❗️', '🔥'];
    }

    init() {
        this.bindFormattingButtons();
        this.bindEmojiPanel();
        this.bindSettings();
        
        // 失去焦点时保存选区，防止点击按钮失效
        this.editor.addEventListener('blur', () => this.saveSelection());
    }

    bindFormattingButtons() {
        const bind = (id, command, valueFn = null) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            // 使用 mousedown 而不是 click，防止焦点从编辑器完全移开
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault(); // 阻止按钮抢焦点
                const value = valueFn ? valueFn(e) : null;
                this.format(command, value);
            });
            // 兼容 select 的 change 事件
            if (btn.tagName === 'SELECT') {
                btn.addEventListener('change', (e) => {
                    this.format(command, e.target.value);
                });
            }
            // 兼容 color input
            if (btn.type === 'color') {
                btn.addEventListener('input', (e) => {
                    this.format(command, e.target.value);
                });
            }
        };

        bind('bold-btn', 'bold');
        bind('italic-btn', 'italic');
        bind('underline-btn', 'underline');
        bind('font-select', 'fontName', (e) => e.target.value);
        bind('fontsize-select', 'fontSize', (e) => e.target.value);
        bind('fontcolor-picker', 'foreColor', (e) => e.target.value);
        bind('align-left-btn', 'justifyLeft');
        bind('align-center-btn', 'justifyCenter');
        bind('align-right-btn', 'justifyRight');
        bind('align-justify-btn', 'justifyFull');
    }

    bindEmojiPanel() {
        const btn = document.getElementById('insert-emoji-btn');
        const panel = document.getElementById('emoji-panel');
        const close = document.getElementById('emoji-close-btn');

        if (!btn || !panel) return;

        // 初始化表情 DOM
        this.emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.addEventListener('click', () => {
                this.insertText(emoji);
                panel.classList.add('hidden');
                this.isEmojiPanelOpen = false;
            });
            panel.appendChild(span);
        });

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.toggleEmojiPanel();
        });

        if (close) {
            close.addEventListener('click', () => {
                panel.classList.add('hidden');
                this.isEmojiPanelOpen = false;
            });
        }
    }

    bindSettings() {
        const btn = document.getElementById('settings-btn');
        const modal = document.getElementById('settings-modal');
        const close = document.getElementById('close-btn');

        if (btn) {
            btn.addEventListener('click', () => {
                modal.classList.remove('hidden');
                if (this.onSettingsOpen) this.onSettingsOpen(); // 通知外部暂停打字
            });
        }

        const closeModal = () => {
            modal.classList.add('hidden');
            this.editor.focus(); // 关掉设置后立刻聚焦编辑器
        };

        if (close) close.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    }

    toggleEmojiPanel() {
        const btn = document.getElementById('insert-emoji-btn');
        const panel = document.getElementById('emoji-panel');
        
        this.isEmojiPanelOpen = !this.isEmojiPanelOpen;
        
        if (this.isEmojiPanelOpen) {
            const rect = btn.getBoundingClientRect();
            panel.style.top = `${rect.bottom + 5}px`;
            // 简单的边界检测
            const left = rect.left - 100;
            panel.style.left = `${left > 0 ? left : 10}px`;
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }

    // --- 核心格式化工具 ---
    saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
            this.lastSelectionRange = selection.getRangeAt(0).cloneRange();
        }
    }

    restoreSelection() {
        this.editor.focus();
        if (this.lastSelectionRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.lastSelectionRange);
        }
    }

    format(command, value = null) {
        this.restoreSelection();
        document.execCommand(command, false, value);
        this.saveSelection();
    }

    insertText(text) {
        this.restoreSelection();
        document.execCommand('insertText', false, text);
        this.saveSelection();
    }
}