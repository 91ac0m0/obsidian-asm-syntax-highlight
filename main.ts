import { Plugin } from 'obsidian';

export default class MultiAsmPlugin extends Plugin {
  async onload() {
    // wait for layout to be ready to perform the rest
    // console.log("Plugin loaded, waiting for layout to be ready");
    this.app.workspace.layoutReady ? this.layoutReady() : this.app.workspace.on('layout-ready', this.layoutReady);
  }

  layoutReady = () => {
    // don't need the event handler anymore, get rid of it
    // console.log("Layout ready, setting up syntax highlighting");
    this.app.workspace.off('layout-ready', this.layoutReady);
    if (typeof CodeMirror !== 'undefined' && CodeMirror.defineSimpleMode) {
      // console.log("CodeMirror is defined, setting up syntax highlighting");
      this.defineAsmMode();
      this.refresh();
    } else {
      const setupInterval = setInterval(() => {
        if (typeof CodeMirror !== 'undefined' && CodeMirror.defineSimpleMode) {
          // console.log("CodeMirror is defined, setting up syntax highlighting");
          this.defineAsmMode();
          this.refresh();
          this.app.workspace.activeLeaf.rebuildView();
          clearInterval(setupInterval);
          this.pollInterval = setupInterval;
        }
      }, 100);
    }
  }

  private defineAsmMode() {
    const asmMode = {
      start: [
        { regex: /;.*/, token: "comment" },
        { regex: /\b(?:mov|add|sub|imul|idiv|mul|div|and|or|xor|not|neg|inc|dec|cmp|test|jmp|je|jne|jz|jnz|jg|jl|jge|jle|call|ret|push|pop|leave|lea|nop|int|syscall|cld|std|rep|repe|repne)\b/i, token: "keyword" },
        { regex: /\b(?:rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|eax|ebx|ecx|edx|esi|edi|esp|ebp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh|r8|r9|r1[0-5]|r8d|r9d|r1[0-5]d|r8w|r9w|r1[0-5]w|r8b|r9b|r1[0-5]b)\b/i, token: "register" },
        { regex: /\b(?:byte|word|dword|qword|tword|ptr)?\s*\[.*?\]/i, token: "memory" },
        { regex: /\b[A-Z_][A-Z0-9_]*\b/, token: "constant" },
        { regex: /\.(?:text|data|bss|rodata|section|globl|extern|align|org|type|size|endp|proc|code|stack|model|assume|db|dw|dd|dq|dt|equ|define|segment|ends|include)/i, token: "directive" },
        { regex: /,/, token: "separator" },
        { regex: /^\s*[a-zA-Z_][a-zA-Z0-9_]*:/, token: "label" },
        { regex: /\b(?:0x[0-9A-Fa-f]+|(?:0[0-9A-Fa-f]*|[1-9][0-9A-Fa-f]*)h)\b/i, token: "hexadecimal" },
        { regex: /^\-?\d[\d_]*(?:\.\d[\d_]*)?(?:[Ee]\-?\d[\d_]*)?/, token: "decimal" },
      ]
    };

    CodeMirror.defineSimpleMode('asm', asmMode);
  }

  onunload() {
    if (CodeMirror.modes.hasOwnProperty("asm")) {
      delete CodeMirror.modes["asm"];
    }
    this.refresh();
    // Cleanup if necessary
  }

  refresh() {
    // console.log("Refreshing syntax highlighting");
    this.app.workspace.iterateCodeMirrors(cm => {
      cm.setOption("mode", cm.getOption("mode"));
    });
  }
}