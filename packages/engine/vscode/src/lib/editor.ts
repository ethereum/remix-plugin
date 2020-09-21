import { CommandPlugin, PluginOptions } from "@remixproject/engine-vscode";
import { editorProfile, IEditor, Annotation, HighlightPosition } from '@remixproject/plugin-api';
import { MethodApi } from '@remixproject/plugin-utils';
import { window, Range, TextEditorDecorationType, Position, languages, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity, TextEditor } from "vscode";

interface EditorOptions extends PluginOptions {
  language: string;
}
export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
  private decoration: TextEditorDecorationType;
  private diagnosticCollection: DiagnosticCollection;
  private editorOpts: EditorOptions;
  constructor(options: EditorOptions) {
    super(editorProfile);
    this.setOptions(options);
  }
  setOptions(options: EditorOptions) {
    this.editorOpts = options;
  }
  onActivation() {
    this.decoration = window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
    const { language } = this.editorOpts;
    this.diagnosticCollection = languages.createDiagnosticCollection(language);
  }
  onDeactivation() {
    this.decoration.dispose();
  }
  async highlight(position: HighlightPosition, filePath: string, hexColor: string): Promise<void> {
    const editors = window.visibleTextEditors;
    // Parse `filePath` to ensure if a valid file path was supplied
    const editor = editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path);
    if(editor) {
      const start: Position = new Position(position.start.line, position.start.column);
      const end: Position = new Position(position.end.line, position.end.column);
      const newDecoration = { range: new Range(start, end) };
      if (hexColor) {
        this.decoration = window.createTextEditorDecorationType({
          backgroundColor: hexColor,
          isWholeLine: true,
        });
      }
      return editor.setDecorations(this.decoration, [newDecoration]);
    } else {
      throw new Error(`Could not find file ${filePath}`);
    }
  }
  async discardHighlight(): Promise<void> {
    return this.decoration.dispose();
  }
  async discardHighlightAt(line: number, filePath: string): Promise<void> {
    return this.decoration.dispose();
  }
  private getEditor(filePath?: string): TextEditor {
    const editors = window.visibleTextEditors;
    return filePath ? editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path) : window.activeTextEditor
  }
  async addAnnotation(annotation: Annotation, filePath?: string): Promise<void> {
    // This function should append to existing map
    // Ref: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
    // const fileUri = window.activeTextEditor ? window.activeTextEditor.document.uri : undefined; // TODO: we might want to supply path to addAnnotation function
    const editor = this.getEditor(filePath);
    const canonicalFile: string = editor.document.uri.fsPath;
    const diagnosticMap: Map<string, Diagnostic[]> = new Map();
    const range = new Range(annotation.row - 1, annotation.column, annotation.row - 1, annotation.column);
    const diagnostics = diagnosticMap.get(canonicalFile) ? diagnosticMap.get(canonicalFile) : [];
    const diagnosticSeverity: Record<string, DiagnosticSeverity> = {
      'error': DiagnosticSeverity.Error,
      'warning': DiagnosticSeverity.Warning,
      'information': DiagnosticSeverity.Information
    };
    const severity = diagnosticSeverity[annotation.type];
    diagnostics.push(new Diagnostic(range, annotation.text, severity));
    diagnosticMap.set(canonicalFile, diagnostics);
    diagnosticMap.forEach((diags, file) => {
      this.diagnosticCollection.set(Uri.parse(file), diags);
    });
    return;
  }
  async clearAnnotations(): Promise<void> {
    return this.diagnosticCollection.clear();
  }
}