import { Annotation, editorProfile, HighlightPosition, IEditor } from '@remixproject/plugin-api';
import { MethodApi } from '@remixproject/plugin-utils';
import * as theia from '@theia/plugin';
import { CommandOptions, CommandPlugin } from "./command";

function getEditor(filePath?: string): theia.TextEditor {
  const editors = theia.window.visibleTextEditors;
  return filePath ? editors.find(editor => editor.document.uri.path === theia.Uri.parse(filePath).path) : theia.window.activeTextEditor
}

export interface EditorOptions extends CommandOptions {
  language: string;
}

export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
  private decoration: theia.TextEditorDecorationType;
  private diagnosticCollection: theia.DiagnosticCollection;
  public options: EditorOptions;

  constructor(options: EditorOptions) {
    super(editorProfile);
    super.setOptions(options);
  }
  setOptions(options: EditorOptions) {
    super.setOptions(options);
  }
  onActivation() {
    this.decoration = theia.window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
    this.diagnosticCollection = theia.languages.createDiagnosticCollection(this.options.language);
  }
  onDeactivation() {
    this.decoration.dispose();
  }
  async highlight(position: HighlightPosition, filePath: string, hexColor: string): Promise<void> {
    const editors = theia.window.visibleTextEditors;
    // Parse `filePath` to ensure if a valid file path was supplied
    const editor = editors.find(editor => editor.document.uri.path === theia.Uri.parse(filePath).path);
    if (editor) {
      const start: theia.Position = new theia.Position(position.start.line, position.start.column);
      const end: theia.Position = new theia.Position(position.end.line, position.end.column);
      const newDecoration = { range: new theia.Range(start, end) };
      if (hexColor) {
        this.decoration = theia.window.createTextEditorDecorationType({
          backgroundColor: hexColor,
          isWholeLine: true,
        });
      }
      editor.setDecorations(this.decoration, [newDecoration]);
    } else {
      throw new Error(`Could not find file ${filePath}`);
    }
  }
  async discardHighlight(): Promise<void> {
    return this.decoration.dispose();
  }
  /**
   * Alisas of  discardHighlight
   * Required to match the standard interface of editor
   */
  async discardHighlightAt(): Promise<void> {
    return this.decoration.dispose();
  }
  async addAnnotation(annotation: Annotation, filePath?: string): Promise<void> {
    // This function should append to existing map
    // Ref: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
    // const fileUri = window.activeTextEditor ? window.activeTextEditor.document.uri : undefined; // TODO: we might want to supply path to addAnnotation function
    const editor = getEditor(filePath);
    const canonicalFile: string = editor.document.uri.fsPath;
    const diagnostics: theia.Diagnostic[] = [];
    const range = new theia.Range(annotation.row - 1, annotation.column, annotation.row - 1, annotation.column);
    const diagnosticSeverity: Record<string, theia.DiagnosticSeverity> = {
      'error': theia.DiagnosticSeverity.Error,
      'warning': theia.DiagnosticSeverity.Warning,
      'information': theia.DiagnosticSeverity.Information
    };
    const severity = diagnosticSeverity[annotation.type];
    const diagnostic = new theia.Diagnostic(range, annotation.text, severity);
    diagnostics.push(diagnostic);
    this.diagnosticCollection.set(theia.Uri.file(canonicalFile), diagnostics);
  }
  async clearAnnotations(): Promise<void> {
    return this.diagnosticCollection.clear();
  }
}
