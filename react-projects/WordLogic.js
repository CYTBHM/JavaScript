// WordLogic.js

export default class WordLogic {
    constructor(paperElement) {
        this.paper = paperElement;
        
        // UI 引用
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
        
        this.presetText = '';
        this.isEmojiPanelOpen = false;
        
        // 新增：输入法状态标记
        this.isComposing = false;

        this.emojis = [
            '😊', '😄', '😂', '😍', '🤔', '😢', '😠', '👍',
            '👎', '❤️', '👋', '🙏', '🐶', '🐱', '🍕', '🎉',
            '🚀', '💡', '💰', '✅', '❌', '❓', '❗️', '🔥'
        ];
        this.lastSelectionRange = null;
    }

    init() {
        // 绑定 DOM 元素
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

        // 保存光标位置，防止点击按钮后焦点丢失
        this.paper.addEventListener('blur', () => this.saveSelection());
        
        // 初始化表情面板
        this.emojis.forEach(emoji => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            emojiSpan.addEventListener('click', () => {
                this.insertAtCursor(emoji);
                this.toggleEmojiPanel(false);
            });
            this.emojiPanel.appendChild(emojiSpan);
        });

        // 绑定工具栏事件
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
        
        this.insertEmojiBtn.addEventListener('click', () => this.toggleEmojiPanel(true));
        this.emojiCloseBtn.addEventListener('click', () => this.toggleEmojiPanel(false));
        
        // 设置模态框逻辑
        this.settingsBtn.addEventListener('click', () => {
            // 打开设置时，把当前的剩余文本填回去，或者清空看你需要
            // 这里我们保持简单的逻辑，仅显示弹窗
            this.settingsModal.classList.remove('hidden');
        });
        this.closeBtn.addEventListener('click', () => {
            this.settingsModal.classList.add('hidden');
            // 关闭设置后，立刻聚焦回纸张，方便开始表演
            this.paper.focus();
        });
        // 点击遮罩层关闭
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.settingsModal.classList.add('hidden');
            }
        });
        
        // 监听预设文本输入
        this.presetTextarea.addEventListener('input', (e) => {
            this.presetText = e.target.value;
        });
        
        // --- 核心输入监听逻辑 (修改部分) ---

        // 1. 监听键盘按下 (用于拦截普通英文输入)
        this.paper.addEventListener('keydown', (event) => this.handleKeyDown(event));

        // 2. 监听输入法开始 (例如开始打拼音)
        this.paper.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        // 3. 监听输入法结束 (例如选中了汉字)
        this.paper.addEventListener('compositionend', (event) => this.handleCompositionEnd(event));
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
        // 如果是换行符，做特殊处理
        if (content === '\n') {
            document.execCommand('insertHTML', false, '<br><br>');
        } else {
            document.execCommand('insertText', false, content);
        }
        this.saveSelection();
    }

    toggleEmojiPanel(forceState) {
        const shouldBeOpen = typeof forceState === 'boolean' ? forceState : !this.isEmojiPanelOpen;
        if (shouldBeOpen) {
            this.saveSelection();
            // 计算面板位置
            const btnRect = this.insertEmojiBtn.getBoundingClientRect();
            this.emojiPanel.style.top = `${btnRect.bottom + 5}px`;
            // 防止面板溢出右边界
            const leftPos = btnRect.left - 100; 
            this.emojiPanel.style.left = `${leftPos > 0 ? leftPos : 10}px`;
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
    
    // --- 核心逻辑实现 ---

    // 辅助方法：输出一个预设字符
    typePresetChar() {
        if (this.presetText.length > 0) {
            const charToType = this.presetText.substring(0, 1);
            this.insertAtCursor(charToType);
            this.presetText = this.presetText.substring(1);
        }
    }

    handleKeyDown(event) {
        // 如果正在使用输入法，不要拦截 keydown，让浏览器处理拼音过程
        if (this.isComposing) {
            return;
        }

        // 允许功能键 (Ctrl, Meta, F键等)
        if (event.ctrlKey || event.metaKey || event.altKey || event.key.length > 1) {
            // 特殊处理：如果是回车键，我们希望它输出预设文本中的换行，而不是真正的换行
            if (event.key === 'Enter') {
                event.preventDefault();
                this.typePresetChar();
            }
            // Backspace 默认允许删除，不做拦截
            return;
        }

        // 拦截普通字符输入
        if (this.presetText.length > 0) {
            event.preventDefault();
            this.typePresetChar();
        }
    }

    handleCompositionEnd(event) {
        this.isComposing = false;

        // 获取刚刚输入法输入的文本长度 (例如 "你好" 长度为2)
        const insertedData = event.data || "";
        const lengthToDelete = insertedData.length;

        // 这里的逻辑是：用户刚才把“你好”打上屏幕了
        // 我们需要把这俩字删掉，然后替换成预设文本

        if (this.presetText.length > 0) {
            // 1. 删除刚才输入的汉字
            // document.execCommand('delete') 不支持参数，所以我们循环执行 delete
            for (let i = 0; i < lengthToDelete; i++) {
                document.execCommand('delete');
            }
            
            // 2. 输入预设字符
            // 你可以选择：打了一个词，就出一个预设字？还是出等长的预设字？
            // 建议：无论打多长的词，都只出一个预设字，这样更容易控制节奏
            this.typePresetChar();
        }
    }
}