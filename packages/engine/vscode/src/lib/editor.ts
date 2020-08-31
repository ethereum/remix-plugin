import { Annotation, RemixPosition } from "./type";
import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, Range, TextEditorDecorationType, Position, languages, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity } from "vscode";

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
    this.decoration = window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
    this.diagnosticCollection = languages.createDiagnosticCollection('solidity');
  }
  highlight(position: RemixPosition, filePath: string, hexColor: string): void {
    const editors = window.visibleTextEditors;
    // Parse `filePath` to ensure if a valid file path was supplied
    const editor = editors.filter(editor => editor.document.uri.path == Uri.parse(filePath).path)[0];
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
  }
  discardHighlight(): void {
    this.decoration.dispose();
    return;
  }
  discardHighlightAt(line: number, filePath: string): void {}
  addAnnotation(annotation: Annotation): void {
    // This function should append to existing map
    // Ref: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
    const fileUri = window.activeTextEditor ? window.activeTextEditor.document.uri : undefined; // TODO: we might want to supply path to addAnnotation function
    let diagnosticMap: Map<string, Diagnostic[]> = new Map();
    let canonicalFile = fileUri.toString();
    let range = new Range(annotation.row - 1, annotation.column, annotation.row - 1, annotation.column);
    let diagnostics = diagnosticMap.get(canonicalFile);
    if (!diagnostics) { diagnostics = []; }
    let svrt: DiagnosticSeverity = 0;
    switch (annotation.type) {
      case 'error':
        svrt = 0;
      case 'warning':
        svrt = 1;
      case 'information':
        svrt = 2;
    }
    diagnostics.push(new Diagnostic(range, annotation.text, svrt));
    diagnosticMap.set(canonicalFile, diagnostics);
    diagnosticMap.forEach((diags, file) => {
      this.diagnosticCollection.set(Uri.parse(file), diags);
    });
    return;
  }
  clearAnnotations(): void {
    this.diagnosticCollection.clear();
    return;
  }
}