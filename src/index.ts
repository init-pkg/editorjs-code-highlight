import { icon } from "./icon";
import "./style.css";

import { API, BlockTool, SanitizerConfig } from "@editorjs/editorjs";
import {
  BlockToolConstructorOptions,
  MenuConfig,
} from "@editorjs/editorjs/types/tools";

import HighlightCode from "@init-kz/init-code-highlight-ts";

type EditorJsCodeHighlightData = {
  code?: string;
  language?: string;
  showlinenumbers?: boolean;
  showCopyButton?: boolean;
};

type EditorJsCodeHighlightConfig = {
  placeholder?: string;
  preserveBlank?: boolean;
};

type EditorJsCodeHighlightOptions = BlockToolConstructorOptions<
  EditorJsCodeHighlightData,
  EditorJsCodeHighlightConfig
>;

export default class EditorJsCodeHighlight implements BlockTool {
  sanitize?: SanitizerConfig | undefined;

  /**
   * Editor.js API instance
   */
  private api: API;

  /**
   * Stores current block data internally
   */
  private _data: EditorJsCodeHighlightData;

  private readOnly: boolean;

  private _CSS: Record<string, string> = {};

  private _element: HTMLElement | null = null;

  private editorInstance: HighlightCode | null = null;

  constructor({ api, data, readOnly }: EditorJsCodeHighlightOptions) {
    this.api = api;
    this._data = {
      code: data?.code || EditorJsCodeHighlight.DEFAULT_PLACEHOLDER,
      language: data?.language || "javascript",
      showlinenumbers: data?.showlinenumbers ?? true,
      showCopyButton: data?.showCopyButton ?? true,
    };

    this._CSS = {
      block: this.api.styles.block,
      wrapper: "ce-EditorJsCodeHighlight",
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    };

    this.readOnly = readOnly;
    this.data = data;
  }

  /**
   * Return Tool data
   */
  private get data(): EditorJsCodeHighlightData {
    return this._data;
  }

  /**
   * Return Tool data
   */
  private set data(data: EditorJsCodeHighlightData) {
    this._data = data;
  }

  /**
   * Icon and title for displaying at the Toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: icon,
      title: "Code Highlight",
    };
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @return {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  protected onKeyUp(e: KeyboardEvent) {
    if (e.code !== "Backspace" && e.code !== "Delete") {
      return;
    }

    if (this._element) {
      const { textContent } = this._element;

      if (textContent === "") {
        this._element.innerHTML = "";
      }
    }
  }

  protected _updateEditorHeight(length: number) {
    let _height = length * 21 + 10;
    if (_height < 60) {
      _height = 60;
    }

    if (this._element) this._element.style.height = _height + "px";
  }

  _debounce(func: Function, timeout = 500) {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  private _toggleLineNumbers = () => {
    this.data.showlinenumbers = !this.data.showlinenumbers;

    this.editorInstance?.toggleLineNumbers();
  };

  private _updateLanguage = (lang: string) => {
    this.data.language = lang;

    const langDisplay = this._element?.querySelector(
      ".editorjs-code-highlight_LangDisplay"
    );

    if (langDisplay) {
      langDisplay.textContent = this.data.language;
    }

    this.editorInstance?.updateLanguage(this.data.language);
    console.log(this.editorInstance);
    setTimeout(() => {
      this.editorInstance?.highlight();
    }, 0);
  };

  save(_: HTMLElement) {
    let resp = {
      code:
        this.editorInstance?.getCode() ||
        EditorJsCodeHighlight.DEFAULT_PLACEHOLDER,
      language: this.data.language,
      showlinenumbers: this.data.showlinenumbers,
      showCopyButton: this.data.showCopyButton,
    };

    return resp;
  }

  renderSettings(): HTMLElement | MenuConfig {
    const settingsContainer = document.createElement("div");

    const toggleButton = document.createElement("div");
    const toggleButtonInner = document.createElement("div");
    toggleButton.classList.add("ce-popover-item");
    toggleButtonInner.classList.add("ce-popover-item__title");

    if (this.data.showlinenumbers) {
      toggleButtonInner.innerHTML = this.api.i18n.t("Hide Numbers");
    } else {
      toggleButtonInner.innerHTML = this.api.i18n.t("Show Numbers");
    }

    let string = `<div class="ce-popover-item__icon ce-popover-item__icon--tool">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M154.91,157.6a40,40,0,0,1-53.82-59.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M135.53,88.71a40,40,0,0,1,32.3,35.53" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M208.61,169.1C230.41,149.58,240,128,240,128S208,56,128,56a126,126,0,0,0-20.68,1.68" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M74,68.6C33.23,89.24,16,128,16,128s32,72,112,72a118.05,118.05,0,0,0,54-12.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
    </div>`;
    toggleButton.innerHTML = string;

    toggleButton.appendChild(toggleButtonInner);

    toggleButton.addEventListener("click", (e) => {
      (e.target as HTMLElement).classList.toggle(
        this._CSS.settingsButtonActive
      );
      this._toggleLineNumbers();
      if (this.data.showlinenumbers) {
        toggleButtonInner.innerHTML = this.api.i18n.t("Hide Numbers");
      } else {
        toggleButtonInner.innerHTML = this.api.i18n.t("Show Numbers");
      }
    });

    const languageEntryInputContainer = document.createElement("div");
    languageEntryInputContainer.classList.add(
      "editorjs-code-highlight_inputContainer"
    );

    let languageEntryInput = document.createElement("div");
    languageEntryInput.classList.add("editorjs-code-highlight_input");
    languageEntryInput.setAttribute("contenteditable", "true");
    languageEntryInput.setAttribute(
      "data-placeholder",
      this.api.i18n.t("Enter a language...")
    );

    let languageEntryInputButton = document.createElement("div");
    let string2 = `<div class="ce-popover-item__icon ce-popover-item__icon--tool">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M136,136a8,8,0,0,1,8,8,16,16,0,0,1-16,16,24,24,0,0,1-24-24,32,32,0,0,1,32-32,40,40,0,0,1,40,40,48,48,0,0,1-48,48,56,56,0,0,1-56-56,64,64,0,0,1,64-64,72,72,0,0,1,72,72,80,80,0,0,1-80,80,88,88,0,0,1-88-88,96,96,0,0,1,96-96A104,104,0,0,1,240,144" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
    </div>`;
    languageEntryInputButton.innerHTML = string2;
    languageEntryInputButton.classList.add(
      "editorjs-code-highlight_inputButton"
    );
    languageEntryInputButton.addEventListener("click", (event) => {
      let lang = languageEntryInput.textContent;
      if (lang && lang != "") {
        this._updateLanguage(lang);
      }
    });

    languageEntryInputContainer.appendChild(languageEntryInput);
    languageEntryInputContainer.appendChild(languageEntryInputButton);

    settingsContainer.appendChild(toggleButton);
    // settingsContainer.appendChild(languageSelectButton);
    settingsContainer.appendChild(languageEntryInputContainer);

    return settingsContainer;
  }

  render(): HTMLElement | Promise<HTMLElement> {
    this._element = document.createElement("div");
    this._element.classList.add("editorjs-code-highlight_Wrapper");
    let editorElem = document.createElement("div");
    editorElem.classList.add("editorjs-code-highlight_Editor");
    let langdisplay = document.createElement("div");
    langdisplay.classList.add("editorjs-code-highlight_LangDisplay");

    langdisplay.innerHTML = this.data.language || "javascript";

    this._element.appendChild(editorElem);
    this._element.appendChild(langdisplay);

    this.editorInstance = new HighlightCode(editorElem, {
      language: this.data.language,
      lineNumbers: this.data.showlinenumbers,
      readonly: this.readOnly,
      copyButton: this.data.showCopyButton,
    });

    this.editorInstance.onUpdate((code) => {
      let _length = code.split("\n").length;
      this._updateEditorHeight(_length);
      // this._debounce(() => this._updateEditorHeight(_length));
    });

    this.editorInstance.updateCode(
      this.data.code || EditorJsCodeHighlight.DEFAULT_PLACEHOLDER
    );

    return this._element;
  }

  static get DEFAULT_PLACEHOLDER() {
    return "// Hello";
  }

  static get enableLineBreaks() {
    return true;
  }
}
