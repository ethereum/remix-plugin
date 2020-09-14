import { CommandPlugin } from "@remixproject/engine-vscode";
import { Annotation, HighlightPosition } from '@remixproject/plugin-api';
import { window, Range, TextEditorDecorationType, Position, languages, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity, TextEditor } from "vscode";

const profile = {
  name: "editor",
  displayName: "Native Editor plugin for Remix vscode plugin",
  description: "Provides communication between vscode editor and remix-plugin",
  kind: "editor",
  permission: true,
  location: "sidePanel",
  documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: ["highlight", "discardHighlight", "addAnnotation", "clearAnnotations"],
};

export default class EditorPlugin extends CommandPlugin {
  private decoration: TextEditorDecorationType;
  private diagnosticCollection: DiagnosticCollection;
  constructor() {
    super(profile);
  }
  onActivation() {
    this.decoration = window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
    this.diagnosticCollection = languages.createDiagnosticCollection('solidity');
  }
  onDeactivation() {
    this.decoration.dispose();
  }
  highlight(position: HighlightPosition, filePath: string, hexColor: string): void {
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
  discardHighlight(): void {
    return this.decoration.dispose();
  }
  discardHighlightAt(line: number, filePath: string): void {}
  private getEditor(filePath?: string): TextEditor {
    const editors = window.visibleTextEditors;
    return filePath ? editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path) : window.activeTextEditor
  }
  addAnnotation(annotation: Annotation, filePath?: string): void {
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
  clearAnnotations(): void {
    return this.diagnosticCollection.clear();
  }
}