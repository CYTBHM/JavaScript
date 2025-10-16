// WordLogic.js

// 'export default' 表示这个文件主要导出的就是 WordLogic 这个类
export default class WordLogic {
    // 构造函数：当 new WordLogic() 被调用时，这个函数会自动运行
    constructor(paperElement) {
        this.paper = paperElement;

        // 获取所有需要的元素
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeBtn = document.getElementById('close-btn');
        this.presetTextarea = document.getElementById('preset-text');
        this.boldBtn = document.getElementById('bold-btn');
        this.italicBtn = document.getElementById('italic-btn');
        this.underlineBtn = document.getElementById('underline-btn');
        this.fallbackSwitch = document.getElementById('fallback-switch');

        // 初始化状态
        this.presetText = '';
        this.currentIndex = 0;
        this.allowNormalTyping = false;
    }

    // 初始化事件监听
    init() {
        this.boldBtn.addEventListener('click', () => this.format('bold'));
        this.italicBtn.addEventListener('click', () => this.format('italic'));
        this.underlineBtn.addEventListener('click', () => this.format('underline'));
        this.settingsBtn.addEventListener('click', () => this.settingsModal.classList.remove('hidden'));
        this.closeBtn.addEventListener('click', () => this.settingsModal.classList.add('hidden'));
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.settingsModal.classList.add('hidden');
        });
        this.presetTextarea.addEventListener('input', (e) => {
            this.presetText = e.target.value;
            this.currentIndex = 0;
        });
        this.fallbackSwitch.addEventListener('change', (e) => {
            this.allowNormalTyping = e.target.checked;
        });
    }

    // 格式化方法
    format(command) {
        document.execCommand(command, false, null);
        this.paper.focus();
    }

    // 键盘处理方法
    handleKeyDown(event) {
        if (this.presetText && this.currentIndex < this.presetText.length) {
            event.preventDefault();
            const charToType = this.presetText[this.currentIndex];
            document.execCommand('insertText', false, charToType);
            this.currentIndex++;
        } else {
            if (!this.allowNormalTyping && this.presetText && this.currentIndex >= this.presetText.length) {
                event.preventDefault();
            }
        }
    }
}