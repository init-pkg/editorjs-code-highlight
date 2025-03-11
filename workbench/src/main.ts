import EditorJS from "@editorjs/editorjs";
import EditorJsCodeHighlight from "@init-kz/editorjs-code-highlight";
import "@init-kz/editorjs-code-highlight/index.css";

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (!app) return;

  const editor = new EditorJS({
    holder: app.id,
    placeholder: "Start typing here...",
    autofocus: true,
    data: {
      time: 1741694454226,
      blocks: [
        {
          id: "uXMjdK3_xm",
          type: "code",
          data: {
            code: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello World")\n  return nil\n}',
            language: "go",

            showCopyButton: true,
            showlinenumbers: true,
          },
        },
      ],

      version: "2.31.0-rc.7",
    },
    tools: {
      code: EditorJsCodeHighlight,
    },
  });

  document.getElementById("save")?.addEventListener("click", () => {
    editor.save().then(console.log);
  });
});
