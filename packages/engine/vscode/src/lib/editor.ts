import { editorProfile, IEditor, Annotation, HighlightPosition } from '@remixproject/plugin-api';
import { MethodApi } from '@remixproject/plugin-utils';
import { window, Range, TextEditorDecorationType, Position, languages, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity, TextEditor } from "vscode";
import { CommandPlugin, CommandOptions } from "./command";

function getEditor(filePath?: string): TextEditor {
  const editors = window.visibleTextEditors;
  return filePath ? editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path) : window.activeTextEditor
}

export interface EditorOptions extends CommandOptions {
  language: string;
}

export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
  private decoration: TextEditorDecorationType;
  private diagnosticCollection: DiagnosticCollection;
  public options: EditorOptions;

  constructor(options: EditorOptions) {
    super(editorProfile);
    super.setOptions(options);
  }
  setOptions(options: EditorOptions) {
    super.setOptions(options);
  }
  onActivation() {
    this.decoration = window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
    this.diagnosticCollection = languages.createDiagnosticCollection(this.options.language);
  }
  onDeactivation() {
    this.decoration.dispose();
  }
  async highlight(position: HighlightPosition, filePath: string, hexColor: string): Promise<void> {
    const editors = window.visibleTextEditors;
    // Parse `filePath` to ensure if a valid file path was supplied
    const editor = editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path);
    if (editor) {
      const start: Position = new Position(position.start.line, position.start.column);
      const end: Position = new Position(position.end.line, position.end.column);
      const newDecoration = { range: new Range(start, end) };
      if (hexColor) {
        this.decoration = window.createTextEditorDecorationType({
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
    const diagnostics: Diagnostic[] = [];
    const range = new Range(annotation.row - 1, annotation.column, annotation.row - 1, annotation.column);
    const diagnosticSeverity: Record<string, DiagnosticSeverity> = {
      'error': DiagnosticSeverity.Error,
      'warning': DiagnosticSeverity.Warning,
      'information': DiagnosticSeverity.Information
    };
    const severity = diagnosticSeverity[annotation.type];
    const diagnostic = new Diagnostic(range, annotation.text, severity);
    diagnostics.push(diagnostic);
    this.diagnosticCollection.set(Uri.file(canonicalFile), diagnostics);
  }
  async clearAnnotations(): Promise<void> {
    return this.diagnosticCollection.clear();
  }
}