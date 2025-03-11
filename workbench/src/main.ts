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
    tools: {
      code: EditorJsCodeHighlight,
    },
  });
});
