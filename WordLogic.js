// WordLogic.js

export default class WordLogic {
    constructor(paperElement) {
        this.paper = paperElement;
        
        // 元素引用先设为null，在init中安全获取
        this.boldBtn = null;
        this.italicBtn = null;
        this.underlineBtn = null;
        this.fontSelect = null;
        this.fontsizeSelect = null;
        this.fontcolorPicker = null;
        this.alignLeftBtn = null;
        this.alignCenterBtn = null;
        this.alignRightBtn = null;
        this.alignJustifyBtn = null;
        this.insertEmojiBtn = null;
        this.emojiPanel = null;
        this.emojiCloseBtn = null;
        this.settingsBtn = null;
        this.settingsModal = null;
        this.closeBtn = null;
        this.presetTextarea = null;
        
        // 状态
        this.presetText = '';
        this.isEmojiPanelOpen = false;
        this.emojis = [
            '😊', '😄', '😂', '😍', '🤔', '😢', '😠', '👍',
            '👎', '❤️', '👋', '🙏', '🐶', '🐱', '🍕', '🎉',
            '🚀', '💡', '💰', '✅', '❌', '❓', '❗️', '🔥'
        ];
        this.lastSelectionRange = null;
    }

    init() {
        // --- 在这里安全地获取所有元素 ---
        this.boldBtn = document.getElementById('bold-btn');
        this.italicBtn = document.getElementById('italic-btn');
        this.underlineBtn = document.getElementById('underline-btn');
        this.fontSelect = document.getElementById('font-select');
        this.fontsizeSelect = document.getElementById('fontsize-select');
        this.fontcolorPicker = document.getElementById('fontcolor-picker');
        this.alignLeftBtn = document.getElementById('align-left-btn');
        this.alignCenterBtn = document.getElementById('align-center-btn');
        this.alignRightBtn = document.getElementById('align-right-btn');
        this.alignJustifyBtn = document.getElementById('align-justify-btn');
        this.insertEmojiBtn = document.getElementById('insert-emoji-btn');
        this.emojiPanel = document.getElementById('emoji-panel');
        this.emojiCloseBtn = document.getElementById('emoji-close-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeBtn = document.getElementById('close-btn');
        this.presetTextarea = document.getElementById('preset-text');

        // --- 添加所有事件监听 ---
        this.paper.addEventListener('blur', () => this.saveSelection());
        
        this.emojis.forEach(emoji => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            emojiSpan.addEventListener('click', () => {
                this.insertAtCursor(emoji);
                this.toggleEmojiPanel(false);
            });
            this.emojiPanel.appendChild(emojiSpan);
        });

        // 样式和格式化按钮
        this.boldBtn.addEventListener('click', () => this.format('bold'));
        this.italicBtn.addEventListener('click', () => this.format('italic'));
        this.underlineBtn.addEventListener('click', () => this.format('underline'));
        this.fontSelect.addEventListener('change', (e) => this.format('fontName', e.target.value));
        this.fontsizeSelect.addEventListener('change', (e) => this.format('fontSize', e.target.value));
        this.fontcolorPicker.addEventListener('input', (e) => this.format('foreColor', e.target.value));
        this.alignLeftBtn.addEventListener('click', () => this.format('justifyLeft'));
        this.alignCenterBtn.addEventListener('click', () => this.format('justifyCenter'));
        this.alignRightBtn.addEventListener('click', () => this.format('justifyRight'));
        this.alignJustifyBtn.addEventListener('click', () => this.format('justifyFull'));
        
        // 表情面板交互
        this.insertEmojiBtn.addEventListener('click', () => this.toggleEmojiPanel(true));
        this.emojiCloseBtn.addEventListener('click', () => this.toggleEmojiPanel(false));
        
        // 设置面板交互
        this.settingsBtn.addEventListener('click', () => {
            this.presetTextarea.value = this.presetText;
            this.settingsModal.classList.remove('hidden');
        });
        this.closeBtn.addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
        });
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.settingsModal.classList.add('hidden');
            }
        });
        this.presetTextarea.addEventListener('input', (e) => {
            this.presetText = e.target.value;
        });
        
        // 内部键盘监听
        this.paper.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }
    
    saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.paper.contains(selection.anchorNode)) {
            this.lastSelectionRange = selection.getRangeAt(0).cloneRange();
        }
    }
    
    restoreSelection() {
        this.paper.focus(); 
        if (this.lastSelectionRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.lastSelectionRange);
        }
    }

    insertAtCursor(content) {
        this.restoreSelection();
        document.execCommand('insertText', false, content);
        this.saveSelection();
    }

    toggleEmojiPanel(forceState) {
        const shouldBeOpen = typeof forceState === 'boolean' ? forceState : !this.isEmojiPanelOpen;
        if (shouldBeOpen) {
            this.saveSelection();
            const btnRect = this.insertEmojiBtn.getBoundingClientRect();
            this.emojiPanel.style.top = `${window.scrollY + btnRect.bottom + 5}px`;
            this.emojiPanel.style.left = `${window.scrollX + btnRect.left}px`;
            this.emojiPanel.classList.remove('hidden');
        } else {
            this.emojiPanel.classList.add('hidden');
        }
        this.isEmojiPanelOpen = shouldBeOpen;
    }

    format(command, value = null) {
        this.restoreSelection();
        document.execCommand(command, false, value);
        this.saveSelection();
    }
    
    handleKeyDown(event) {
        if (this.presetText.length > 0) {
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                const charToType = this.presetText.substring(0, 1);
                this.insertAtCursor(charToType);
                this.presetText = this.presetText.substring(1);
            }
        }
    }
}