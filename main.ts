import { Plugin } from 'obsidian';

export default class MultiAsmPlugin extends Plugin {
  private pollInterval: number;

  onload() {
    const setupInterval = setInterval(() => {
      if (typeof CodeMirror !== 'undefined' && CodeMirror.defineSimpleMode) {

        const asmMode = {
          start: [
            { regex: /;.*/, token: "comment" },
            { regex: /\b(?:mov|add|sub|imul|idiv|mul|div|and|or|xor|not|neg|inc|dec|cmp|test|jmp|je|jne|jz|jnz|jg|jl|jge|jle|call|ret|push|pop|leave|lea|nop|int|syscall|cld|std|rep|repe|repne)\b/i, token: "keyword" },
            { regex: /\b(?:rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh|r8|r9|r1[0-5]|r8d|r9d|r1[0-5]d|r8w|r9w|r1[0-5]w|r8b|r9b|r1[0-5]b)\b/i, token: "register" },
            {
              regex: /\b(?:byte|word|dword|qword|tword|ptr)?\s*\[.*?\]/i,
              token: "memory"
            },
            {
              regex: /\b[A-Z_][A-Z0-9_]*\b/,
              token: "constant"
            },
            {
              regex: /\.(?:text|data|bss|rodata|section|globl|extern|align|org|type|size|endp|proc|code|stack|model|assume|db|dw|dd|dq|dt|equ|define|segment|ends|include)/i,
              token: "directive"
            },
            { regex: /,/, token: "separator" },
            { regex: /^\s*[a-zA-Z_][a-zA-Z0-9_]*:/, token: "label" },
            { regex: /\b(?:0x[0-9A-Fa-f]+|(?:0[0-9A-Fa-f]*|[1-9][0-9A-Fa-f]*)h)\b/i, token: "hexadecimal" },
            { regex: /^\-?\d[\d_]*(?:\.\d[\d_]*)?(?:[Ee]\-?\d[\d_]*)?/, token: "decimal" },
          ]
        };

        // 注册所有语法模式
        CodeMirror.defineSimpleMode('asm', asmMode);

        // 刷新编辑器视图
        this.app.workspace.iterateAllLeaves(leaf => {
          if (leaf.view?.getViewType() === 'markdown') {
            (leaf.view as any).previewMode.rerender(true);
          }
        });

        clearInterval(setupInterval);
        this.pollInterval = setupInterval;
      }
    }, 100);
  }

  onunload() {
    // 清理注册的模式
    delete CodeMirror.modes['asm'];

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}