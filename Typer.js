// Typer.js
export default class Typer {
    constructor(editorElement) {
        this.editor = editorElement;
        this.presetText = ""; // 剩余待输出的文本
        this.isComposing = false; // 是否正在使用输入法
        this.isPaused = false;    // 是否暂停（如打开设置时）
    }

    init() {
        // 1. 监听预设文本的变更
        const textarea = document.getElementById('preset-text');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.presetText = e.target.value;
            });
        }

        // 2. 绑定键盘事件
        this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.editor.addEventListener('compositionstart', () => this.handleCompStart());
        this.editor.addEventListener('compositionend', (e) => this.handleCompEnd(e));
    }

    // 设置暂停状态
    setPaused(status) {
        this.isPaused = status;
    }

    // 输出指定数量的字符
    typeChars(count = 1) {
        if (this.presetText.length === 0) return;

        // 截取 count 个字符，不够就全部截取
        const realCount = Math.min(count, this.presetText.length);
        const charsToType = this.presetText.substring(0, realCount);

        // 处理换行符：将 \n 替换为 HTML 的换行
        if (charsToType.includes('\n')) {
             // 简单的逐字处理以确保格式正确
             for (let char of charsToType) {
                 if (char === '\n') {
                     document.execCommand('insertHTML', false, '<br><br>');
                 } else {
                     document.execCommand('insertText', false, char);
                 }
             }
        } else {
            // 纯文本直接插入，效率更高
            document.execCommand('insertText', false, charsToType);
        }

        // 更新剩余文本
        this.presetText = this.presetText.substring(realCount);
    }

    // --- 事件处理 ---

    handleKeyDown(e) {
        if (this.isPaused || this.isComposing) return;

        // 允许控制键 (Ctrl/Meta/Alt) 和功能键 (F1-F12)
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) {
            // 特殊：回车键拦截，输出预设的换行
            if (e.key === 'Enter') {
                e.preventDefault();
                this.typeChars(1);
            }
            return;
        }

        // 如果还有预设文本，拦截按键并输出预设
        if (this.presetText.length > 0) {
            e.preventDefault();
            this.typeChars(1); // 普通按键，1键换1字
        }
    }

    handleCompStart() {
        this.isComposing = true;
    }

    handleCompEnd(e) {
        this.isComposing = false;
        
        // e.data 包含刚刚输入的最终文本（例如 "你好"）
        const inputStr = e.data || "";
        const inputLen = inputStr.length;

        if (inputLen > 0 && this.presetText.length > 0) {
            // 1. 撤销刚才上屏的文字 (模拟删除)
            // 由于 contenteditable 的选区特性，这里最稳妥的方式是执行对应次数的 delete
            for (let i = 0; i < inputLen; i++) {
                document.execCommand('delete');
            }

            // 2. 按照刚才输入的长度，输出等长的预设文本
            // 例如：打出 "你好" (2字)，则输出预设文本的前2个字
            this.typeChars(inputLen);
        }
    }
}