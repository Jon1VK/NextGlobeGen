#![feature(box_patterns)]

#[cfg(test)]
mod tests;

use rustc_hash::FxHashMap;
use serde::Serialize;
use serde_json::to_string;
use swc_core::{
    plugin::proxies::TransformPluginProgramMetadata, transform_common::output::experimental_emit,
};
use swc_ecma_ast::{
    AwaitExpr, CallExpr, Callee, Expr, Id, ImportDecl, ImportSpecifier, KeyValueProp, Lit, Module,
    ModuleDecl, ModuleExportName, ModuleItem, ObjectLit, Program, Prop, PropName, PropOrSpread,
    VarDeclarator,
};
use swc_ecma_visit::{VisitMut, VisitMutWith};
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn next_globe_gen_key_extractor(
    mut program: Program,
    _data: TransformPluginProgramMetadata,
) -> Program {
    let mut visitor = KeyExtractorVisitor::new();
    program.visit_mut_with(&mut visitor);
    let extracted_keys_string = to_string(&visitor.extracted_keys).unwrap();
    experimental_emit("extractedKeys".into(), extracted_keys_string);
    program
}

#[derive(Serialize)]
pub struct ExtractedKey {
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

pub struct KeyExtractorVisitor {
    translator_functions: FxHashMap<Id, usize>,
    translator_function_namespaces: FxHashMap<Id, Option<String>>,
    pub extracted_keys: Vec<ExtractedKey>,
}

impl Default for KeyExtractorVisitor {
    fn default() -> Self {
        Self::new()
    }
}

impl VisitMut for KeyExtractorVisitor {
    fn visit_mut_module(&mut self, module: &mut Module) {
        self.process_module(module);
        module.visit_mut_children_with(self);
    }

    fn visit_mut_var_declarator(&mut self, node: &mut VarDeclarator) {
        self.process_var_declarator(node);
        node.visit_mut_children_with(self);
    }

    fn visit_mut_call_expr(&mut self, node: &mut CallExpr) {
        self.process_call_expr(node);
        node.visit_mut_children_with(self);
    }
}

impl KeyExtractorVisitor {
    pub fn new() -> Self {
        Self {
            translator_functions: Default::default(),
            translator_function_namespaces: Default::default(),
            extracted_keys: Default::default(),
        }
    }

    fn process_module(&mut self, module: &Module) {
        for item in module.body.iter() {
            self.process_module_item(item);
        }
    }

    fn process_module_item(&mut self, item: &ModuleItem) {
        let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = item else {
            return;
        };
        self.process_import_decl(import);
    }

    fn process_import_decl(&mut self, node: &ImportDecl) {
        if node.src.value.to_string_lossy() != "next-globe-gen" {
            return;
        }
        for specifier in &node.specifiers {
            self.process_import_specifier(specifier);
        }
    }

    fn process_import_specifier(&mut self, node: &ImportSpecifier) {
        let ImportSpecifier::Named(named_specifier) = node else {
            return;
        };
        let function_identifier = named_specifier.local.to_id();
        let function_name = named_specifier
            .imported
            .as_ref()
            .and_then(|name| match name {
                ModuleExportName::Ident(ident) => Some(&ident.sym),
                ModuleExportName::Str(_) => None,
            })
            .unwrap_or(&named_specifier.local.sym);
        let namespace_arg_index = match function_name.as_ref() {
            "useTranslations" | "getTranslations" => 0,
            "createTranslator" => 1,
            _ => return,
        };
        self.translator_functions
            .insert(function_identifier, namespace_arg_index);
    }

    fn process_var_declarator(&mut self, node: &VarDeclarator) {
        let Some(name) = node.name.as_ident() else {
            return;
        };
        let Some(init) = node.init.as_deref() else {
            return;
        };
        let call = match init {
            Expr::Call(call) => call,
            Expr::Await(AwaitExpr {
                arg: box Expr::Call(call),
                ..
            }) => call,
            _ => return,
        };
        let Callee::Expr(box Expr::Ident(callee)) = &call.callee else {
            return;
        };
        let Some(&namespace_arg_index) = self.translator_functions.get(&callee.to_id()) else {
            return;
        };
        let namespace = call
            .args
            .get(namespace_arg_index)
            .and_then(|arg| Self::extract_static_string(&arg.expr));
        self.translator_function_namespaces
            .insert(name.to_id(), namespace);
    }

    fn process_call_expr(&mut self, call: &mut CallExpr) {
        let Callee::Expr(box Expr::Ident(ident)) = &call.callee else {
            return;
        };
        let Some(namespace) = self.translator_function_namespaces.get(&ident.to_id()) else {
            return;
        };
        let Some(ns_key) = call
            .args
            .first()
            .and_then(|arg| Self::extract_static_string(&arg.expr))
        else {
            return;
        };
        let key = namespace
            .as_ref()
            .map_or_else(|| ns_key.clone(), |ns| format!("{}{}{}", ns, ".", ns_key));
        let description = call
            .args
            .get(1)
            .and_then(|arg| Self::extract_static_description(&arg.expr));
        self.extracted_keys.push(ExtractedKey { key, description });
    }

    fn extract_static_string(expr: &Expr) -> Option<String> {
        match expr {
            Expr::Lit(Lit::Str(s)) => Some(s.value.to_string_lossy().into_owned()),
            Expr::Tpl(tpl) if tpl.quasis.len() == 1 && tpl.exprs.is_empty() => tpl.quasis[0]
                .cooked
                .as_ref()
                .map(|s| s.to_string_lossy().into_owned()),
            _ => None,
        }
    }

    fn extract_static_description(expr: &Expr) -> Option<String> {
        let Expr::Object(ObjectLit { props, .. }) = expr else {
            return None;
        };
        for prop in props {
            let PropOrSpread::Prop(prop) = prop else {
                continue;
            };
            let Prop::KeyValue(KeyValueProp { key, value }) = prop.as_ref() else {
                continue;
            };
            let is_description_key = match key {
                PropName::Ident(ident) => ident.sym.as_ref() == "_description",
                PropName::Str(s) => s.value == "_description",
                _ => false,
            };
            if !is_description_key {
                continue;
            };
            return Self::extract_static_string(value);
        }
        None
    }
}
